import { getMysqlPool, getFullEventStateFromMysql, getQuadForTable } from '../utils/mysql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const pool = getMysqlPool()

  if (body.action === 'update_layout') {
    // Safety Check: Ensure all orders are cleared before changing table/seat layout
    const [countRows] = await pool.query<any[]>('SELECT COUNT(*) as cnt FROM orders')
    const activeOrderCount = Number(countRows?.[0]?.cnt || 0)

    if (activeOrderCount > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `Safety Check: ${activeOrderCount} active order(s) exist. Please click "Clear All Orders" before editing tables and seats.`
      })
    }

    let totalTables = Math.max(1, Math.min(500, Number(body.totalTables) || 200))
    let seatsPerTable = Math.max(1, Math.min(30, Number(body.seatsPerTable) || 10))
    let totalExpected = totalTables * seatsPerTable
    let layoutJson = ''

    const tableRowsToCreate: Array<{ tableNo: number; seats: number }> = []

    if (Array.isArray(body.customTables) && body.customTables.length > 0) {
      const clean = body.customTables
        .map((t: any) => ({
          tableNo: Number(t.tableNo),
          seats: Math.max(1, Math.min(30, Number(t.seats) || 10))
        }))
        .filter((t: any) => Number.isFinite(t.tableNo) && t.tableNo > 0)
        .sort((a: any, b: any) => a.tableNo - b.tableNo)

      if (clean.length > 0) {
        totalTables = Math.max(...clean.map((t: any) => t.tableNo))
        seatsPerTable = Math.max(...clean.map((t: any) => t.seats))
        totalExpected = clean.reduce((sum: number, t: any) => sum + t.seats, 0)
        layoutJson = JSON.stringify(clean)
        tableRowsToCreate.push(...clean)
      }
    } else {
      for (let t = 1; t <= totalTables; t++) {
        tableRowsToCreate.push({ tableNo: t, seats: seatsPerTable })
      }
    }

    const pairs: Array<[string, string]> = [
      ['total_tables', String(totalTables)],
      ['seats_per_table', String(seatsPerTable)],
      ['total_expected', String(totalExpected)],
      ['table_layout_json', layoutJson]
    ]

    for (const [k, v] of pairs) {
      await pool.execute(
        `INSERT INTO event_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [k, v]
      )
    }

    // Rebuild `table_seating` table to match the new layout
    await pool.execute('DELETE FROM table_seating')
    const batchValues: any[] = []
    for (const row of tableRowsToCreate) {
      const quad = getQuadForTable(row.tableNo)
      for (let s = 1; s <= row.seats; s++) {
        batchValues.push([quad, row.tableNo, s, `Table ${row.tableNo}`, `Seat ${s}`, null, 'empty'])
      }
    }

    // Insert in chunks of 500 for fast execution on Hostinger MySQL
    const chunkSize = 500
    for (let i = 0; i < batchValues.length; i += chunkSize) {
      const chunk = batchValues.slice(i, i + chunkSize)
      const placeholders = chunk.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ')
      await pool.execute(
        `INSERT INTO table_seating (quad, table_number, seat_number, table_label, seat_label, order_id, seat_status) VALUES ${placeholders}`,
        chunk.flat()
      )
    }

    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid table layout action' })
})
