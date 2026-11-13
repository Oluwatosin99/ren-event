import { getDb, getFullEventState, setTimingMetric } from '../utils/db'
import { getSupabase } from '../utils/supabase'
import { submitOrderToSupabase } from '../utils/supabaseOrderService'
import { fetchEventStateFromSupabase } from '../utils/supabaseService'

function mapOrderRow(r: any) {
  return {
    id: r.id,
    guest: r.guest_name,
    ticketId: r.ticket_id || undefined,
    table: r.table_no,
    seat: r.seat_no,
    category: r.category,
    dishId: r.dish_id,
    dish: r.dish_name,
    sides: JSON.parse(r.sides_json),
    proteins: JSON.parse(r.proteins_json),
    time: r.time_label,
    createdAt: Number(r.created_at),
    status: r.status,
    printCount: Number(r.print_count),
    qrToken: r.qr_token
  }
}

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const body = await readBody(event)
  const db = getDb()

  // High-concurrency burst simulation for Admin Stress Test
  if (body.action === 'simulate_burst') {
    const count = Math.min(Number(body.count) || 25, 100)
    const sampleNames = [
      'Adebayo Oke', 'Zainab Aliyu', 'Emeka Obi', 'Kemi Adeyemi', 'Tosin Williams',
      'Boma Peters', 'Halima Sadiq', 'Segun Lawal', 'Nneka Eze', 'Damilola Ajayi'
    ]
    let created = 0

    db.exec('BEGIN IMMEDIATE')
    try {
      const availDishes = db.prepare('SELECT * FROM menu_items WHERE stock > 0 AND manual_closed = 0').all() as any[]
      const currentOrdTotal = (db.prepare('SELECT COUNT(*) as cnt FROM orders').get() as { cnt: number }).cnt
      const decStmt = db.prepare('UPDATE menu_items SET stock = stock - 1, updated_at = ? WHERE id = ? AND stock > 0')
      const insStmt = db.prepare(`
        INSERT INTO orders (id, guest_name, ticket_id, table_no, seat_no, category, dish_id, dish_name, sides_json, proteins_json, time_label, created_at, status, print_count, qr_token)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unprocessed', 0, ?)
      `)

      const now = Date.now()
      const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      for (let i = 0; i < count; i++) {
        const usable = availDishes.filter(d => d.stock > 0)
        if (usable.length === 0) break
        const dish = usable[Math.floor(Math.random() * usable.length)]
        dish.stock--
        decStmt.run(now, dish.id)

        const ordNum = 1115 + currentOrdTotal + i
        const tableNum = Math.floor(Math.random() * 150) + 1
        const seatNum = Math.floor(Math.random() * 10) + 1
        const ordId = `ORD-${ordNum}`

        insStmt.run(
          ordId,
          `${sampleNames[i % sampleNames.length]} #${i + 1}`,
          `REN-B${100 + i}`,
          `Table ${tableNum}`,
          `Seat ${seatNum}`,
          dish.cat === 'nigerian' ? 'Nigerian Dishes' : 'Continental Dishes',
          dish.id,
          dish.name,
          JSON.stringify(['Plantain', 'Moi Moi'].slice(0, (i % 2) + 1)),
          JSON.stringify(['Chicken', 'Fish'].slice(0, (i % 2) + 1)),
          timeLabel,
          now + i,
          `REN-${ordId}-T${tableNum}S${seatNum}`
        )
        created++
      }
      db.exec('COMMIT')
    } catch (err) {
      db.exec('ROLLBACK')
      throw err
    }

    setTimingMetric(Date.now() - startTime)
    return { ok: true, burstCreated: created, state: getFullEventState() }
  }

  const { guest, ticketId, table, seat, dishId, sides, proteins, idempotencyKey } = body

  if (!guest || !table || !seat || !dishId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide your Name, Table Number, Seat Number, and Meal selection.'
    })
  }

  // Deduplication check for slow mobile networks
  if (idempotencyKey) {
    const existing = db.prepare('SELECT * FROM orders WHERE idempotency_key = ?').get(idempotencyKey) as any
    if (existing) {
      return {
        ok: true,
        deduplicated: true,
        order: {
          id: existing.id,
          guest: existing.guest_name,
          ticketId: existing.ticket_id,
          table: existing.table_no,
          seat: existing.seat_no,
          category: existing.category,
          dishId: existing.dish_id,
          dish: existing.dish_name,
          sides: JSON.parse(existing.sides_json),
          proteins: JSON.parse(existing.proteins_json),
          time: existing.time_label,
          createdAt: existing.created_at,
          status: existing.status,
          printCount: existing.print_count,
          qrToken: existing.qr_token
        },
        state: getFullEventState()
      }
    }
  }

  const cleanTable = String(table).startsWith('Table') ? String(table) : `Table ${table}`
  const cleanSeat = String(seat).startsWith('Seat') ? String(seat) : `Seat ${seat}`
  const shortT = cleanTable.replace(/\D/g, '') || '1'
  const shortS = cleanSeat.replace(/\D/g, '') || '1'
  const now = Date.now()
  const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const devOverride = body.devOverride === true

  // ONLINE SUPABASE PRIMARY PATH (e.g. on Netlify)
  const sb = getSupabase()
  if (sb) {
    const onlineResult = await submitOrderToSupabase({
      guest: String(guest).trim(),
      ticketId: ticketId ? String(ticketId).trim() : undefined,
      table: cleanTable,
      seat: cleanSeat,
      dishId,
      sides: Array.isArray(sides) ? sides : [],
      proteins: Array.isArray(proteins) ? proteins : [],
      idempotencyKey,
      devOverride
    })

    if (!onlineResult.ok) {
      if (onlineResult.alreadyOrdered && onlineResult.order) {
        throw createError({
          statusCode: 409,
          statusMessage: onlineResult.error,
          data: { code: 'ALREADY_ORDERED', order: onlineResult.order }
        })
      }
      throw createError({
        statusCode: 409,
        statusMessage: onlineResult.error
      })
    }

    const onlineState = await fetchEventStateFromSupabase()
    setTimingMetric(Date.now() - startTime)
    return {
      ok: true,
      order: onlineResult.order,
      state: onlineState || getFullEventState()
    }
  }

  let createdOrder: any = null

  // Atomic SQLite write transaction for 2,000+ concurrent orders
  db.exec('BEGIN IMMEDIATE')
  try {
    // One meal per Table + Seat (bypassed only by the dev-mode override)
    if (!devOverride) {
      const seatOrder = db.prepare(
        'SELECT * FROM orders WHERE table_no = ? AND seat_no = ? ORDER BY created_at DESC LIMIT 1'
      ).get(cleanTable, cleanSeat) as any
      if (seatOrder) {
        throw createError({
          statusCode: 409,
          statusMessage: `A meal has already been ordered for ${cleanTable} • ${cleanSeat}.`,
          data: { code: 'ALREADY_ORDERED', order: mapOrderRow(seatOrder) }
        })
      }
    }

    const dish = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(dishId) as any
    if (!dish) {
      db.exec('ROLLBACK')
      throw createError({ statusCode: 404, statusMessage: 'Selected dish not found.' })
    }
    if (dish.manual_closed || dish.stock <= 0) {
      db.exec('ROLLBACK')
      throw createError({
        statusCode: 409,
        statusMessage: `"${dish.name}" just ran out of plates (SOLD OUT). Please pick another available dish.`
      })
    }

    db.prepare('UPDATE menu_items SET stock = stock - 1, updated_at = ? WHERE id = ?').run(now, dish.id)
    const countRow = db.prepare('SELECT COUNT(*) as cnt FROM orders').get() as { cnt: number }
    const orderNum = 1115 + countRow.cnt
    const orderId = `ORD-${orderNum}`
    const qrToken = `REN-${orderId}-T${shortT}S${shortS}`
    const cleanSides = Array.isArray(sides) && sides.length ? sides.slice(0, 2) : ['None']
    const cleanProteins = Array.isArray(proteins) && proteins.length ? proteins.slice(0, 2) : ['None']
    const categoryLabel = dish.cat === 'nigerian' ? 'Nigerian Dishes' : 'Continental Dishes'

    db.prepare(`
      INSERT INTO orders (id, guest_name, ticket_id, table_no, seat_no, category, dish_id, dish_name, sides_json, proteins_json, time_label, created_at, status, print_count, qr_token, idempotency_key)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unprocessed', 0, ?, ?)
    `).run(
      orderId,
      String(guest).trim(),
      ticketId ? String(ticketId).trim() : null,
      cleanTable,
      cleanSeat,
      categoryLabel,
      dish.id,
      dish.name,
      JSON.stringify(cleanSides),
      JSON.stringify(cleanProteins),
      timeLabel,
      now,
      qrToken,
      idempotencyKey || null
    )

    createdOrder = {
      id: orderId,
      guest: String(guest).trim(),
      ticketId: ticketId ? String(ticketId).trim() : undefined,
      table: cleanTable,
      seat: cleanSeat,
      category: categoryLabel,
      dishId: dish.id,
      dish: dish.name,
      sides: cleanSides,
      proteins: cleanProteins,
      time: timeLabel,
      createdAt: now,
      status: 'unprocessed',
      printCount: 0,
      qrToken
    }

    db.exec('COMMIT')
  } catch (err) {
    try { db.exec('ROLLBACK') } catch {}
    throw err
  }

  setTimingMetric(Date.now() - startTime)
  return {
    ok: true,
    order: createdOrder,
    state: getFullEventState()
  }
})
