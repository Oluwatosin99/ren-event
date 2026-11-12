import { getDb, getFullEventState } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDb()

  if (body.action === 'create_user') {
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || 'renaissance123').trim()
    const role = ['admin', 'vendor', 'guest'].includes(body.role) ? body.role : 'guest'
    const department = String(body.department || 'Event Team').trim()

    if (!name || !email) {
      throw createError({ statusCode: 400, statusMessage: 'Name and email are required.' })
    }

    try {
      db.prepare(`
        INSERT INTO users (name, email, password, role, department, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(name, email, password, role, department, Date.now())
    } catch {
      throw createError({ statusCode: 409, statusMessage: 'A user with this email already exists in the database.' })
    }

    return { ok: true, state: getFullEventState() }
  }

  if (body.action === 'update_role') {
    const id = Number(body.userId)
    const role = ['admin', 'vendor', 'guest'].includes(body.role) ? body.role : 'guest'
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id)
    return { ok: true, state: getFullEventState() }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid user management action' })
})

