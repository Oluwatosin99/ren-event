import { getMysqlPool, getFullEventStateFromMysql } from '../utils/mysql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const pool = getMysqlPool()

  if (body.action === 'create_user') {
    const name = String(body.name || '').trim()
    const username = String(body.email || body.username || '').trim().toLowerCase()
    const plainPassword = String(body.password || 'renaissance123').trim()
    const passwordBase64 = Buffer.from(plainPassword, 'utf8').toString('base64')
    const role = ['admin', 'vendor', 'delivery', 'registrar', 'guest'].includes(body.role) ? body.role : 'guest'
    const department = String(body.department || 'Event Team').trim()

    if (!name || !username) {
      throw createError({ statusCode: 400, statusMessage: 'Name and email/username are required.' })
    }

    try {
      await pool.execute(
        `INSERT INTO users (name, username, password, role, department)
         VALUES (?, ?, ?, ?, ?)`,
        [name, username, passwordBase64, role, department]
      )
    } catch {
      throw createError({ statusCode: 409, statusMessage: 'A user with this email/username already exists.' })
    }

    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  if (body.action === 'update_role') {
    const id = Number(body.userId)
    const role = ['admin', 'vendor', 'delivery', 'registrar', 'guest'].includes(body.role) ? body.role : 'guest'
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, id])
    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  if (body.action === 'update_user') {
    const id = Number(body.userId)
    const name = String(body.name || '').trim()
    const username = String(body.email || body.username || '').trim().toLowerCase()
    const department = String(body.department || 'Event Operations').trim()
    const role = ['admin', 'vendor', 'delivery', 'registrar', 'guest'].includes(body.role) ? body.role : 'guest'
    const password = String(body.password || '').trim()

    if (!id || !name || !username) {
      throw createError({ statusCode: 400, statusMessage: 'User ID, name, and email/username are required.' })
    }

    try {
      if (password) {
        const encodedPw = Buffer.from(password, 'utf8').toString('base64')
        await pool.execute(
          'UPDATE users SET name = ?, username = ?, department = ?, role = ?, password = ? WHERE id = ?',
          [name, username, department, role, encodedPw, id]
        )
      } else {
        await pool.execute(
          'UPDATE users SET name = ?, username = ?, department = ?, role = ? WHERE id = ?',
          [name, username, department, role, id]
        )
      }
    } catch {
      throw createError({ statusCode: 409, statusMessage: 'Another user with this email/username already exists.' })
    }

    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  if (body.action === 'delete_user') {
    const id = Number(body.userId)
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'User ID is required.' })
    }
    await pool.execute('DELETE FROM users WHERE id = ?', [id])
    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid user management action' })
})
