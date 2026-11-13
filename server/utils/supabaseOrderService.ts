import { getSupabase } from './supabase'
import type { FoodOrder, EventState } from './db'

export async function submitOrderToSupabase(payload: {
  guest: string
  ticketId?: string
  table: string
  seat: string
  dishId: string
  sides: string[]
  proteins: string[]
  idempotencyKey?: string
  devOverride?: boolean
}): Promise<{ ok: boolean; order: FoodOrder } | { ok: false; alreadyOrdered?: boolean; error: string; order?: FoodOrder }> {
  const sb = getSupabase()
  if (!sb) return { ok: false, error: 'Database connection offline' }

  const cleanTable = payload.table.startsWith('Table') ? payload.table : `Table ${payload.table}`
  const cleanSeat = payload.seat.startsWith('Seat') ? payload.seat : `Seat ${payload.seat}`
  const shortT = cleanTable.replace(/\D/g, '') || '1'
  const shortS = cleanSeat.replace(/\D/g, '') || '1'
  const now = Date.now()
  const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // 1. One meal per seat check (unless devOverride is active)
  if (!payload.devOverride) {
    const { data: existingSeat } = await sb
      .from('orders')
      .select('*')
      .eq('table_no', cleanTable)
      .eq('seat_no', cleanSeat)
      .order('created_at', { ascending: false })
      .limit(1)

    if (existingSeat && existingSeat.length > 0) {
      const ex = existingSeat[0]
      const orderObj: FoodOrder = {
        id: ex.id,
        guest: ex.guest_name,
        ticketId: ex.ticket_id || undefined,
        table: ex.table_no,
        seat: ex.seat_no,
        category: ex.category,
        dishId: ex.dish_id,
        dish: ex.dish_name,
        sides: typeof ex.sides_json === 'string' ? JSON.parse(ex.sides_json || '[]') : ex.sides_json,
        proteins: typeof ex.proteins_json === 'string' ? JSON.parse(ex.proteins_json || '[]') : ex.proteins_json,
        time: ex.time_label || 'Just now',
        createdAt: Number(ex.created_at || now),
        status: ex.status || 'unprocessed',
        printCount: Number(ex.print_count || 0),
        qrToken: ex.qr_token
      }
      return {
        ok: false,
        alreadyOrdered: true,
        order: orderObj,
        error: `A meal has already been ordered for ${cleanTable} • ${cleanSeat}.`
      }
    }
  }

  // 2. Fetch dish details & stock check
  const { data: dishRows, error: dishErr } = await sb
    .from('menu_items')
    .select('*')
    .eq('id', payload.dishId)
    .limit(1)

  if (dishErr || !dishRows || dishRows.length === 0) {
    return { ok: false, error: 'Selected dish not found.' }
  }

  const dish = dishRows[0]
  if (dish.manual_closed || Number(dish.stock) <= 0) {
    return {
      ok: false,
      error: `"${dish.name}" just ran out of plates (SOLD OUT). Please pick another available dish.`
    }
  }

  // 3. Decrement stock
  await sb
    .from('menu_items')
    .update({ stock: Math.max(0, Number(dish.stock) - 1), updated_at: now })
    .eq('id', dish.id)

  // 4. Generate Order ID
  const { count } = await sb.from('orders').select('*', { count: 'exact', head: true })
  const orderNum = 1115 + (count || 0)
  const orderId = `ORD-${orderNum}`
  const qrToken = `REN-${orderId}-T${shortT}S${shortS}`
  const cleanSides = payload.sides.length ? payload.sides.slice(0, 2) : ['None']
  const cleanProteins = payload.proteins.length ? payload.proteins.slice(0, 2) : ['None']
  const categoryLabel = dish.cat === 'nigerian' ? 'Nigerian Dishes' : 'Continental Dishes'

  // 5. Insert order row
  const { error: insErr } = await sb.from('orders').insert({
    id: orderId,
    guest_name: payload.guest.trim(),
    ticket_id: payload.ticketId?.trim() || null,
    table_no: cleanTable,
    seat_no: cleanSeat,
    category: categoryLabel,
    dish_id: dish.id,
    dish_name: dish.name,
    sides_json: JSON.stringify(cleanSides),
    proteins_json: JSON.stringify(cleanProteins),
    time_label: timeLabel,
    created_at: now,
    status: 'unprocessed',
    print_count: 0,
    qr_token: qrToken,
    idempotency_key: payload.idempotencyKey || null
  })

  if (insErr) {
    return { ok: false, error: insErr.message }
  }

  const createdOrder: FoodOrder = {
    id: orderId,
    guest: payload.guest.trim(),
    ticketId: payload.ticketId?.trim() || undefined,
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

  return { ok: true, order: createdOrder }
}

