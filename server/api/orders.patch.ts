import { getDb, getFullEventState } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDb()

  // Scan QR code or Order ID to mark as Delivered
  if (body.action === 'scan_delivery') {
    const tokenOrId = String(body.query || '').trim().toUpperCase()
    const order = db.prepare('SELECT * FROM orders WHERE UPPER(id) = ? OR UPPER(qr_token) = ?').get(tokenOrId, tokenOrId) as any
    if (!order) {
      throw createError({
        statusCode: 404,
        statusMessage: `No order matching QR / Ticket "${body.query}" was found.`
      })
    }
    db.prepare("UPDATE orders SET status = 'delivered' WHERE id = ?").run(order.id)
    return {
      ok: true,
      order: { id: order.id, status: 'delivered' },
      state: getFullEventState()
    }
  }

  // Batch print unprocessed orders
  if (body.action === 'batch_print') {
    const ids: string[] = Array.isArray(body.orderIds) ? body.orderIds : []
    db.exec('BEGIN IMMEDIATE')
    try {
      const stmt = db.prepare(`
        UPDATE orders
        SET status = CASE WHEN status = 'unprocessed' THEN 'processed' ELSE status END,
            print_count = print_count + 1
        WHERE id = ?
      `)
      for (const id of ids) stmt.run(id)
      db.exec('COMMIT')
    } catch (err) {
      db.exec('ROLLBACK')
      throw err
    }
    return { ok: true, updated: ids, state: getFullEventState() }
  }

  const { orderId, status, printTicket } = body
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  let nextStatus = order.status
  let nextPrintCount = Number(order.print_count || 0)

  if (status && ['unprocessed', 'processed', 'delivered'].includes(status)) {
    nextStatus = status
  }
  if (printTicket) {
    if (nextStatus === 'unprocessed') {
      nextStatus = 'processed'
    }
    nextPrintCount += 1
  }

  db.prepare('UPDATE orders SET status = ?, print_count = ? WHERE id = ?').run(nextStatus, nextPrintCount, orderId)

  return {
    ok: true,
    order: { id: orderId, status: nextStatus, printCount: nextPrintCount },
    state: getFullEventState()
  }
})
