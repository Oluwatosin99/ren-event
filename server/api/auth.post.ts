import { getMysqlPool, getFullEventStateFromMysql } from '../utils/mysql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const pool = getMysqlPool()

  // Guest ticket lookup by UUID in `registered_guests`
  if (body.action === 'guest_lookup') {
    const ticketId = String(body.ticketId || '').trim()
    const [rows] = await pool.query<any[]>(
      'SELECT * FROM registered_guests WHERE UPPER(uuid) = UPPER(?) LIMIT 1',
      [ticketId]
    )
    if (rows && rows.length > 0) {
      const att = rows[0]
      return {
        ok: true,
        found: true,
        role: 'guest' as const,
        attendee: {
          ticketId: att.uuid,
          name: att.name,
          type: att.guest_type || (att.is_vip ? 'VIP' : 'Pre-Registered'),
          table: 'Open Seating',
          seat: '-'
        }
      }
    }
    return {
      ok: true,
      found: false,
      role: 'guest' as const
    }
  }

  // Staff / Personnel / Vendor / Admin Login against MySQL `users` table (Base64 passwords)
  const username = String(body.email || body.username || '').trim().toLowerCase()
  const password = String(body.password || '').trim()

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email / Username and password are required.' })
  }

  const [rows] = await pool.query<any[]>(
    'SELECT * FROM users WHERE LOWER(username) = ? LIMIT 1',
    [username]
  )
  const user = rows?.[0]
  const personnelRoles = ['admin', 'vendor', 'delivery', 'registrar']

  if (!user || !personnelRoles.includes(user.role)) {
    throw createError({ statusCode: 401, statusMessage: 'Personnel account not found. Please check your credentials.' })
  }

  const encodedInput = Buffer.from(password, 'utf8').toString('base64')
  if (user.password !== encodedInput && user.password !== password) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid password for this personnel account.' })
  }

  return {
    ok: true,
    role: user.role as 'admin' | 'vendor' | 'delivery' | 'registrar',
    user: {
      id: Number(user.id),
      name: String(user.name),
      email: String(user.username),
      role: user.role as 'admin' | 'vendor' | 'delivery' | 'registrar',
      department: String(user.department || 'Event Operations')
    },
    state: await getFullEventStateFromMysql()
  }
})
