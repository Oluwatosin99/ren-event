import mysql from 'mysql2/promise'
import type { EventState, FoodOrder, GuestAttendee, ImageDisplayMode, MenuItem, MenuSubCat } from './db'

let _pool: mysql.Pool | null = null

export function getMysqlConfig() {
  const cfg = useRuntimeConfig()
  return {
    host: String(cfg.mysqlHost || process.env.MYSQL_HOST || '127.0.0.1'),
    port: Number(cfg.mysqlPort || process.env.MYSQL_PORT || 3306),
    user: String(cfg.mysqlUser || process.env.MYSQL_USER || 'u930027423_RenGala'),
    password: String(cfg.mysqlPassword || process.env.MYSQL_PASSWORD || ''),
    database: String(cfg.mysqlDatabase || process.env.MYSQL_DATABASE || 'u930027423_Ren_Event')
  }
}

export function getMysqlPool(): mysql.Pool {
  if (_pool) return _pool
  const cfg = getMysqlConfig()
  _pool = mysql.createPool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 30000,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
  })
  return _pool
}

function isTransientMysqlError(err: any): boolean {
  const code = String(err?.code || '')
  return (
    code === 'ECONNRESET' ||
    code === 'PROTOCOL_CONNECTION_LOST' ||
    code === 'EPIPE' ||
    code === 'ETIMEDOUT' ||
    code === 'ECONNREFUSED'
  )
}

async function resetMysqlPool() {
  if (_pool) {
    const old = _pool
    _pool = null
    try { await old.end() } catch {}
  }
}

export async function withMysqlRetry<T>(fn: (pool: mysql.Pool) => Promise<T>): Promise<T> {
  try {
    return await fn(getMysqlPool())
  } catch (err: any) {
    if (isTransientMysqlError(err)) {
      await resetMysqlPool()
      return await fn(getMysqlPool())
    }
    throw err
  }
}

export function getQuadForTable(tableNumber: number): 'A' | 'B' | 'C' | 'D' {
  if (tableNumber <= 50) return 'A'
  if (tableNumber <= 100) return 'B'
  if (tableNumber <= 150) return 'C'
  return 'D'
}

export function formatTimeLabel(dt: any): string {
  if (!dt) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return String(dt)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function parseJsonArray(val: any): string[] {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export async function syncTableSeatingRow(
  pool: mysql.Pool,
  tableNumber: number,
  seatNumber: number,
  orderId: string | null,
  seatStatus: 'empty' | 'ordered' | 'processed' | 'served'
) {
  const quad = getQuadForTable(tableNumber)
  await pool.execute(
    `INSERT INTO table_seating (quad, table_number, seat_number, table_label, seat_label, order_id, seat_status)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       quad = VALUES(quad),
       order_id = VALUES(order_id),
       seat_status = VALUES(seat_status)`,
    [quad, tableNumber, seatNumber, `Table ${tableNumber}`, `Seat ${seatNumber}`, orderId, seatStatus]
  )
}

let _cachedState: EventState | null = null
let _cachedStateAt = 0
const STATE_CACHE_TTL_MS = 2000

export function invalidateMysqlStateCache() {
  _cachedState = null
  _cachedStateAt = 0
}

export async function getFullEventStateFromMysql(useCache = false): Promise<EventState> {
  if (useCache && _cachedState && Date.now() - _cachedStateAt < STATE_CACHE_TTL_MS) {
    return _cachedState
  }

  const startMs = Date.now()
  const [results] = await withMysqlRetry(async (pool) => {
    return await pool.query<any[]>(
      `SELECT setting_key, setting_value FROM event_settings;
       SELECT * FROM menus ORDER BY updated_at DESC, id ASC;
       SELECT * FROM orders ORDER BY created_at DESC;
       SELECT * FROM registered_guests ORDER BY admitted_at DESC, created_at DESC LIMIT 1000;
       SELECT id, name, username, password, role, department, created_at FROM users ORDER BY id ASC;`
    )
  })

  const settingsRows = (results?.[0] || []) as any[]
  const menuRows = (results?.[1] || []) as any[]
  const orderRows = (results?.[2] || []) as any[]
  const regRows = (results?.[3] || []) as any[]
  const userRows = (results?.[4] || []) as any[]

  const settings: Record<string, string> = {}
  for (const r of settingsRows || []) {
    settings[r.setting_key] = r.setting_value
  }

  const menuItems: MenuItem[] = (menuRows || []).map((r: any) => ({
    id: String(r.id),
    cat: (r.category === 'continental' ? 'continental' : 'nigerian') as 'nigerian' | 'continental',
    subCat: (r.sub_category || 'other') as MenuSubCat,
    name: String(r.name),
    description: String(r.description || ''),
    vendor: String(r.vendor || 'RenGala Caterer'),
    image: String(r.image_url || '/images/menu/jollof-rice.jpg'),
    imageMode: (r.image_mode === 'placeholder' ? 'placeholder' : 'photo') as ImageDisplayMode,
    stock: Number(r.plates_available ?? 0),
    initialStock: Number(r.initial_plates ?? 100),
    threshold: Number(r.low_alert_threshold ?? 10),
    manualClosed: Boolean(r.manual_closed),
    popular: false,
    spicy: false
  }))

  const orders: FoodOrder[] = (orderRows || []).map((r: any) => ({
    id: String(r.id),
    guest: String(r.guest_name),
    ticketId: r.ticket_uuid || undefined,
    table: String(r.table_no),
    seat: String(r.seat_no),
    category: (r.category === 'Continental Dishes' ? 'Continental Dishes' : 'Nigerian Dishes') as 'Nigerian Dishes' | 'Continental Dishes',
    dishId: String(r.dish_id),
    dish: String(r.dish_name),
    sides: parseJsonArray(r.sides_json),
    proteins: parseJsonArray(r.proteins_json),
    time: formatTimeLabel(r.created_at),
    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
    status: (r.status || 'unprocessed') as 'unprocessed' | 'processed' | 'delivered',
    printCount: Number(r.print_count || 0),
    qrToken: String(r.qr_token || r.id),
    idempotencyKey: r.idempotency_key || undefined,
    servedBy: r.served_by || undefined,
    servedAt: r.served_at ? new Date(r.served_at).getTime() : undefined
  }))

  const attendees: GuestAttendee[] = (regRows || []).map((r: any) => ({
    ticketId: String(r.uuid),
    name: String(r.name),
    type: (r.guest_type || (r.is_vip ? 'VIP' : 'Pre-Registered (Yes)')) as any,
    sponsorStaffId: '',
    table: 'Open Seating',
    seat: '-',
    checkedIn: r.admissionstatus === 'admitted',
    checkedInAt: r.admitted_at ? formatTimeLabel(r.admitted_at) : undefined,
    phone: r.phone || undefined,
    email: r.email || undefined,
    admittedBy: r.admitted_by || undefined,
    isVip: Boolean(r.is_vip) || String(r.name || '').toUpperCase().startsWith('VIP')
  }))

  const checkedInCount = attendees.filter(a => a.checkedIn).length
  const postRegCount = attendees.filter(a => a.type === 'On-Site Registered').length

  const users = (userRows || []).map((u: any) => ({
    id: Number(u.id),
    name: String(u.name),
    email: String(u.username),
    passwordBase64: String(u.password || ''),
    role: u.role,
    department: String(u.department || 'Event Operations'),
    created_at: u.created_at ? new Date(u.created_at).getTime() : Date.now()
  }))

  const state: EventState = {
    capacity: {
      totalExpected: Number(settings.total_expected || 2000),
      totalTables: Number(settings.total_tables || 200),
      seatsPerTable: Number(settings.seats_per_table || 10),
      checkedInCount,
      postRegCount,
      unclaimedSeatsReleased: settings.unclaimed_seats_released === '1',
      checkInWindow: settings.check_in_window || '2:00 PM – 2:45 PM'
    },
    menuItems,
    orders,
    attendees,
    users,
    metrics: {
      avgResponseMs: Math.max(1, Date.now() - startMs),
      totalProcessedLockOps: orders.length
    }
  }

  _cachedState = state
  _cachedStateAt = Date.now()
  return state
}
