import { getMysqlPool, getFullEventStateFromMysql, syncTableSeatingRow } from '../utils/mysql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const pool = getMysqlPool()

  // 1. Scan Receipt QR code or Order ID to mark as Delivered + log to `delivery_audit_logs` & `order_qr_scans`
  if (body.action === 'scan_delivery') {
    const tokenOrId = String(body.query || '').trim().toUpperCase()
    const serverName = String(body.serverName || 'Food Server').trim()

    const [rows] = await pool.query<any[]>(
      'SELECT * FROM orders WHERE UPPER(id) = ? OR UPPER(qr_token) = ? LIMIT 1',
      [tokenOrId, tokenOrId]
    )
    const ord = rows?.[0]

    if (!ord) {
      await pool.execute(
        `INSERT INTO order_qr_scans (order_id, qr_code_value, scanned_by, scan_result)
         VALUES (NULL, ?, ?, 'not_found')`,
        [tokenOrId, serverName]
      )
      throw createError({
        statusCode: 404,
        statusMessage: `No order matching QR / Ticket "${body.query}" was found.`
      })
    }

    const wasAlreadyDelivered = ord.status === 'delivered'

    await pool.execute(
      `UPDATE orders
       SET status = 'delivered', served_by = ?, served_at = NOW()
       WHERE id = ?`,
      [serverName, ord.id]
    )

    // Update `table_seating` matrix to 'served'
    await syncTableSeatingRow(pool, Number(ord.table_number), Number(ord.seat_number), ord.id, 'served')

    // Log into `order_qr_scans`
    await pool.execute(
      `INSERT INTO order_qr_scans (order_id, qr_code_value, table_no, seat_no, guest_name, scanned_by, scan_result)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ord.id,
        tokenOrId,
        ord.table_no,
        ord.seat_no,
        ord.guest_name,
        serverName,
        wasAlreadyDelivered ? 'already_delivered' : 'matched_delivered'
      ]
    )

    // Log into `delivery_audit_logs`
    await pool.execute(
      `INSERT INTO delivery_audit_logs (order_id, qr_token, guest_name, table_no, seat_no, dish_name, action, performed_by, performed_role, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'scan_delivery', ?, 'delivery', ?)`,
      [
        ord.id,
        ord.qr_token || ord.id,
        ord.guest_name,
        ord.table_no,
        ord.seat_no,
        ord.dish_name,
        serverName,
        `Marked delivered via QR/ID scan (${tokenOrId})`
      ]
    )

    return {
      ok: true,
      order: {
        id: ord.id,
        guest: ord.guest_name,
        table: ord.table_no,
        seat: ord.seat_no,
        dish: ord.dish_name,
        status: 'delivered',
        servedBy: serverName,
        servedAt: Date.now()
      },
      state: await getFullEventStateFromMysql()
    }
  }

  // 2. Clear all orders (Safety check before editing table layout)
  if (body.action === 'clear_all_orders') {
    await pool.execute('DELETE FROM orders')
    await pool.execute("UPDATE table_seating SET order_id = NULL, seat_status = 'empty'")
    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  // 3. Batch print unprocessed orders
  if (body.action === 'batch_print') {
    const ids: string[] = Array.isArray(body.orderIds) ? body.orderIds : []
    const actor = String(body.performedBy || 'Kitchen Printer').trim()

    for (const id of ids) {
      const [rows] = await pool.query<any[]>('SELECT * FROM orders WHERE id = ? LIMIT 1', [id])
      const ord = rows?.[0]
      if (!ord) continue
      const nextStatus = ord.status === 'unprocessed' ? 'processed' : ord.status
      await pool.execute(
        'UPDATE orders SET status = ?, print_count = print_count + 1 WHERE id = ?',
        [nextStatus, ord.id]
      )
      if (nextStatus === 'processed') {
        await syncTableSeatingRow(pool, Number(ord.table_number), Number(ord.seat_number), ord.id, 'processed')
      }
      await pool.execute(
        `INSERT INTO delivery_audit_logs (order_id, qr_token, guest_name, table_no, seat_no, dish_name, action, performed_by, performed_role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'vendor')`,
        [
          ord.id,
          ord.qr_token || ord.id,
          ord.guest_name,
          ord.table_no,
          ord.seat_no,
          ord.dish_name,
          Number(ord.print_count) > 0 ? 'reprint_receipt' : 'print_receipt',
          actor
        ]
      )
    }

    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  // 4. Single Order Print / Status Update
  const orderId = String(body.orderId || '').trim()
  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'orderId is required' })
  }

  const [rows] = await pool.query<any[]>('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId])
  const ord = rows?.[0]
  if (!ord) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  const actor = String(body.performedBy || body.serverName || 'Kitchen Staff').trim()

  if (body.action === 'print' || body.printTicket === true) {
    const nextStatus = ord.status === 'unprocessed' ? 'processed' : ord.status
    await pool.execute(
      'UPDATE orders SET status = ?, print_count = print_count + 1 WHERE id = ?',
      [nextStatus, ord.id]
    )
    if (nextStatus === 'processed') {
      await syncTableSeatingRow(pool, Number(ord.table_number), Number(ord.seat_number), ord.id, 'processed')
    }
    await pool.execute(
      `INSERT INTO delivery_audit_logs (order_id, qr_token, guest_name, table_no, seat_no, dish_name, action, performed_by, performed_role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'vendor')`,
      [
        ord.id,
        ord.qr_token || ord.id,
        ord.guest_name,
        ord.table_no,
        ord.seat_no,
        ord.dish_name,
        Number(ord.print_count) > 0 ? 'reprint_receipt' : 'print_receipt',
        actor
      ]
    )
    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  if (body.status && ['unprocessed', 'processed', 'delivered'].includes(body.status)) {
    const nextStatus = body.status as 'unprocessed' | 'processed' | 'delivered'
    if (nextStatus === 'delivered') {
      await pool.execute(
        "UPDATE orders SET status = 'delivered', served_by = ?, served_at = NOW() WHERE id = ?",
        [actor, ord.id]
      )
      await syncTableSeatingRow(pool, Number(ord.table_number), Number(ord.seat_number), ord.id, 'served')
      await pool.execute(
        `INSERT INTO delivery_audit_logs (order_id, qr_token, guest_name, table_no, seat_no, dish_name, action, performed_by, performed_role)
         VALUES (?, ?, ?, ?, ?, ?, 'manual_mark_served', ?, 'admin')`,
        [ord.id, ord.qr_token || ord.id, ord.guest_name, ord.table_no, ord.seat_no, ord.dish_name, actor]
      )
    } else {
      await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [nextStatus, ord.id])
      await syncTableSeatingRow(
        pool,
        Number(ord.table_number),
        Number(ord.seat_number),
        ord.id,
        nextStatus === 'processed' ? 'processed' : 'ordered'
      )
    }
    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid order update action' })
})
