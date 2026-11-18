import { getDb, getFullEventState } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDb()

  const { getSupabase } = await import('../utils/supabase')
  const sb = getSupabase()

  if (body.action === 'update_layout') {
    // Safety Check: Ensure all orders are cleared before changing table/seat layout
    let activeOrderCount = 0
    if (sb) {
      const { count } = await sb.from('orders').select('*', { count: 'exact', head: true })
      activeOrderCount = count || 0
    } else {
      activeOrderCount = (db.prepare('SELECT COUNT(*) as cnt FROM orders').get() as { cnt: number }).cnt
    }

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
      }
    }

    const pairs: Array<[string, string]> = [
      ['total_tables', String(totalTables)],
      ['seats_per_table', String(seatsPerTable)],
      ['total_expected', String(totalExpected)],
      ['table_layout_json', layoutJson]
    ]

    if (sb) {
      for (const [key, value] of pairs) {
        await sb.from('event_settings').upsert({ key, value }, { onConflict: 'key' })
      }
    }

    const setStmt = db.prepare('INSERT OR REPLACE INTO event_settings (key, value) VALUES (?, ?)')
    for (const [key, value] of pairs) {
      setStmt.run(key, value)
    }

    if (sb) {
      const { fetchEventStateFromSupabase } = await import('../utils/supabaseService')
      const state = await fetchEventStateFromSupabase()
      if (state) return { ok: true, state }
    }

    return { ok: true, state: getFullEventState() }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid table layout action' })
})
