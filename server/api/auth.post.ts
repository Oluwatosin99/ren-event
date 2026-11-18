import { getDb, getFullEventState } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDb()

  // Guest ticket lookup by Ticket ID (Pre-registered "Yes" guests or On-Site Registered)
  if (body.action === 'guest_lookup') {
    const ticketId = String(body.ticketId || '').trim().toUpperCase()
    const attendee = db.prepare('SELECT * FROM attendees WHERE UPPER(ticket_id) = ?').get(ticketId) as any
    if (attendee) {
      return {
        ok: true,
        found: true,
        role: 'guest' as const,
        attendee: {
          ticketId: attendee.ticket_id,
          name: attendee.name,
          type: attendee.guest_type,
          table: attendee.table_no,
          seat: attendee.seat_no
        }
      }
    }
    return {
      ok: true,
      found: false,
      role: 'guest' as const
    }
  }

  // Staff / Personnel / Vendor / Admin Login against SQLite `users` table
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '').trim()

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required.' })
  }

  const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = ?').get(email) as any
  const personnelRoles = ['admin', 'vendor', 'delivery', 'registrar']

  if (!user || !personnelRoles.includes(user.role)) {
    throw createError({ statusCode: 401, statusMessage: 'Personnel account not found. Please check your credentials.' })
  }

  if (user.password !== password) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid password for this personnel account.' })
  }

  return {
    ok: true,
    role: user.role as 'admin' | 'vendor' | 'delivery' | 'registrar',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'vendor' | 'delivery' | 'registrar',
      department: user.department
    },
    state: getFullEventState()
  }
})

