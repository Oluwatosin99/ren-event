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

  const tPad = String(Math.max(1, parseInt(shortT, 10) || 1)).padStart(2, '0')
  const sPad = String(Math.max(1, parseInt(shortS, 10) || 1)).padStart(2, '0')
  const orderId = `REN-ORD-${tPad}${sPad}`

  // 1. Strictly one meal per Table + Seat (never allow duplicate seat orders or -2 suffixes)
  const { data: existingSeat } = await sb
    .from('orders')
    .select('id, table_no, seat_no')
    .or(`and(table_no.eq.${cleanTable},seat_no.eq.${cleanSeat}),id.eq.${orderId}`)
    .limit(1)

  if (existingSeat && existingSeat.length > 0) {
    return {
      ok: false,
      alreadyOrdered: true,
      error: `Someone has already ordered with these credentials (${cleanTable} • ${cleanSeat}). Kindly cross-check your Table Number and Seat Number and try again. Thank you, and enjoy the event!`
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

  // 4. Attach QR token directly to the Table+Seat Order ID
  const qrToken = orderId
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

