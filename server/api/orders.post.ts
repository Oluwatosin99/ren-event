import { getMysqlPool, getFullEventStateFromMysql, syncTableSeatingRow, formatTimeLabel } from '../utils/mysql'

function formatTableSeatOrderId(tableNum: number, seatNum: number) {
  const tPad = String(Math.max(1, tableNum)).padStart(2, '0')
  const sPad = String(Math.max(1, seatNum)).padStart(2, '0')
  return `REN-ORD-${tPad}${sPad}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const pool = getMysqlPool()

  const { guest, ticketId, table, seat, dishId, sides, proteins, idempotencyKey } = body

  if (!guest || !table || !seat || !dishId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please provide your Name, Table Number, Seat Number, and Meal selection.'
    })
  }

  const tableNumber = Math.max(1, parseInt(String(table).replace(/\D/g, ''), 10) || 1)
  const seatNumber = Math.max(1, parseInt(String(seat).replace(/\D/g, ''), 10) || 1)
  const cleanTable = `Table ${tableNumber}`
  const cleanSeat = `Seat ${seatNumber}`
  const orderId = formatTableSeatOrderId(tableNumber, seatNumber)
  const qrToken = orderId

  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    // 1. Strict one-order-per-Table-and-Seat check (no -2 suffix ever)
    const [existingRows] = await conn.query<any[]>(
      'SELECT id FROM orders WHERE (table_number = ? AND seat_number = ?) OR id = ? LIMIT 1',
      [tableNumber, seatNumber, orderId]
    )
    if (existingRows && existingRows.length > 0) {
      await conn.rollback()
      throw createError({
        statusCode: 409,
        statusMessage: `Someone has already ordered with these credentials (${cleanTable} • ${cleanSeat}). Kindly cross-check your Table Number and Seat Number and try again. Thank you, and enjoy the event!`,
        data: { code: 'ALREADY_ORDERED', table: cleanTable, seat: cleanSeat }
      })
    }

    // 2. Lock dish row & verify plate availability
    const [dishRows] = await conn.query<any[]>(
      'SELECT * FROM menus WHERE id = ? FOR UPDATE',
      [dishId]
    )
    const dish = dishRows?.[0]
    if (!dish) {
      await conn.rollback()
      throw createError({ statusCode: 404, statusMessage: 'Selected dish not found.' })
    }
    if (dish.manual_closed || Number(dish.plates_available) <= 0) {
      await conn.rollback()
      throw createError({
        statusCode: 409,
        statusMessage: `"${dish.name}" just ran out of plates (SOLD OUT). Please pick another available dish.`
      })
    }

    // 3. Decrement available plates automatically
    await conn.execute(
      'UPDATE menus SET plates_available = GREATEST(0, plates_available - 1) WHERE id = ?',
      [dish.id]
    )

    const cleanSides = Array.isArray(sides) && sides.length ? sides.slice(0, 2) : ['None']
    const cleanProteins = Array.isArray(proteins) && proteins.length ? proteins.slice(0, 2) : ['None']
    const categoryLabel = dish.category === 'nigerian' ? 'Nigerian Dishes' : 'Continental Dishes'

    // 4. Insert order into `orders`
    await conn.execute(
      `INSERT INTO orders
       (id, guest_name, ticket_uuid, table_no, seat_no, table_number, seat_number, category, dish_id, dish_name, sides_json, proteins_json, status, print_count, qr_token, idempotency_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unprocessed', 0, ?, ?)`,
      [
        orderId,
        String(guest).trim(),
        ticketId ? String(ticketId).trim() : null,
        cleanTable,
        cleanSeat,
        tableNumber,
        seatNumber,
        categoryLabel,
        dish.id,
        dish.name,
        JSON.stringify(cleanSides),
        JSON.stringify(cleanProteins),
        qrToken,
        idempotencyKey || null
      ]
    )

    await conn.commit()

    // 5. Sync Table & Seat Matrix (`table_seating`)
    await syncTableSeatingRow(pool, tableNumber, seatNumber, orderId, 'ordered')

    const now = Date.now()
    const createdOrder = {
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
      time: formatTimeLabel(now),
      createdAt: now,
      status: 'unprocessed' as const,
      printCount: 0,
      qrToken
    }

    return {
      ok: true,
      order: createdOrder,
      state: await getFullEventStateFromMysql()
    }
  } catch (err) {
    try { await conn.rollback() } catch {}
    throw err
  } finally {
    conn.release()
  }
})
