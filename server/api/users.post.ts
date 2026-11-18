import { getDb, getFullEventState } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDb()

  if (body.action === 'create_user') {
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || 'renaissance123').trim()
    const role = ['admin', 'vendor', 'delivery', 'registrar', 'guest'].includes(body.role) ? body.role : 'guest'
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
    const role = ['admin', 'vendor', 'delivery', 'registrar', 'guest'].includes(body.role) ? body.role : 'guest'
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id)
    return { ok: true, state: getFullEventState() }
  }

  if (body.action === 'update_user') {
    const id = Number(body.userId)
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const department = String(body.department || 'Event Operations').trim()
    const role = ['admin', 'vendor', 'delivery', 'registrar', 'guest'].includes(body.role) ? body.role : 'guest'
    const password = String(body.password || '').trim()

    if (!id || !name || !email) {
      throw createError({ statusCode: 400, statusMessage: 'User ID, name, and email are required.' })
    }

    try {
      if (password) {
        db.prepare('UPDATE users SET name = ?, email = ?, department = ?, role = ?, password = ? WHERE id = ?')
          .run(name, email, department, role, password, id)
      } else {
        db.prepare('UPDATE users SET name = ?, email = ?, department = ?, role = ? WHERE id = ?')
          .run(name, email, department, role, id)
      }
    } catch {
      throw createError({ statusCode: 409, statusMessage: 'Another user with this email already exists.' })
    }

    return { ok: true, state: getFullEventState() }
  }

  if (body.action === 'delete_user') {
    const id = Number(body.userId)
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required.' })
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(id)
    return { ok: true, state: getFullEventState() }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid user management action' })
})

