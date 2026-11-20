import { getMysqlPool, getFullEventStateFromMysql } from '../utils/mysql'
import type { MenuSubCat } from '../utils/db'

const VALID_SUBCATS: MenuSubCat[] = ['rice', 'swallow', 'noodles', 'protein', 'sauce', 'other']

function normalizeSubCat(raw: unknown): MenuSubCat {
  const s = String(raw || '').trim().toLowerCase()
  if (!s || s === 'none' || s === 'general' || s === 'other') return 'other'
  if (VALID_SUBCATS.includes(s as MenuSubCat)) return s as MenuSubCat
  if (s.includes('rice')) return 'rice'
  if (s.includes('swallow') || s.includes('soup')) return 'swallow'
  if (s.includes('noodle') || s.includes('pasta')) return 'noodles'
  if (s.includes('protein') || s.includes('grill') || s.includes('meat') || s.includes('fish') || s.includes('chicken')) return 'protein'
  if (s.includes('sauce') || s.includes('curry') || s.includes('stew')) return 'sauce'
  return 'other'
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const pool = getMysqlPool()
  const now = Date.now()

  if (body.action === 'add_dish') {
    const name = String(body.name || '').trim()
    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'Dish name is required' })
    }
    const category = body.cat === 'continental' ? 'continental' : 'nigerian'
    const subCategory = normalizeSubCat(body.subCat)
    const imageMode = body.imageMode === 'placeholder' ? 'placeholder' : 'photo'
    const plates = Math.max(0, parseInt(String(body.stock), 10) || 100)
    const threshold = Math.max(1, parseInt(String(body.threshold), 10) || 10)
    const vendor = String(body.vendor || 'RenGala Caterer').trim()
    const description = String(body.description || 'Freshly prepared event delicacy with rich accompaniments.').trim()
    const defaultImg = category === 'nigerian'
      ? '/images/menu/jollof-rice.jpg'
      : '/images/menu/oriental-prawns.jpg'
    const imageUrl = String(body.image || '').trim() || defaultImg
    const id = `dish_${now}`

    await pool.execute(
      `INSERT INTO menus
       (id, name, category, sub_category, vendor, description, image_url, image_mode, plates_available, initial_plates, low_alert_threshold, manual_closed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [id, name, category, subCategory, vendor, description, imageUrl, imageMode, plates, plates, threshold]
    )

    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  if (body.action === 'update_dish') {
    const [rows] = await pool.query<any[]>('SELECT * FROM menus WHERE id = ? LIMIT 1', [body.itemId])
    const item = rows?.[0]
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Dish not found' })
    }

    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : item.name
    const category = body.cat === 'continental' || body.cat === 'nigerian' ? body.cat : item.category
    const subCategory = body.subCat !== undefined ? normalizeSubCat(body.subCat) : (item.sub_category || 'other')
    const vendor = typeof body.vendor === 'string' && body.vendor.trim() ? body.vendor.trim() : item.vendor
    const description = typeof body.description === 'string' ? body.description.trim() : item.description
    const imageUrl = typeof body.image === 'string' && body.image.trim() ? body.image.trim() : item.image_url
    const imageMode = body.imageMode === 'placeholder' || body.imageMode === 'photo' ? body.imageMode : item.image_mode
    const plates = typeof body.stock === 'number' ? Math.max(0, body.stock) : Number(item.plates_available)
    const initialPlates = Math.max(Number(item.initial_plates), plates)
    const threshold = typeof body.threshold === 'number' ? Math.max(1, body.threshold) : Number(item.low_alert_threshold)

    await pool.execute(
      `UPDATE menus
       SET name = ?, category = ?, sub_category = ?, vendor = ?, description = ?, image_url = ?, image_mode = ?,
           plates_available = ?, initial_plates = ?, low_alert_threshold = ?
       WHERE id = ?`,
      [name, category, subCategory, vendor, description, imageUrl, imageMode, plates, initialPlates, threshold, body.itemId]
    )

    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  if (body.action === 'toggle_image_mode') {
    const [rows] = await pool.query<any[]>('SELECT id, image_mode FROM menus WHERE id = ? LIMIT 1', [body.itemId])
    const item = rows?.[0]
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Dish not found' })
    }
    const nextMode = body.imageMode === 'placeholder' || body.imageMode === 'photo'
      ? body.imageMode
      : (item.image_mode === 'placeholder' ? 'photo' : 'placeholder')

    await pool.execute('UPDATE menus SET image_mode = ? WHERE id = ?', [nextMode, body.itemId])
    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  if (body.action === 'bulk_image_mode') {
    const nextMode = body.imageMode === 'placeholder' ? 'placeholder' : 'photo'
    await pool.execute('UPDATE menus SET image_mode = ?', [nextMode])
    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  if (body.action === 'update_stock') {
    const [rows] = await pool.query<any[]>('SELECT * FROM menus WHERE id = ? LIMIT 1', [body.itemId])
    const item = rows?.[0]
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Dish not found' })
    }

    let nextPlates = Number(item.plates_available)
    let nextInitial = Number(item.initial_plates)
    let nextThreshold = Number(item.low_alert_threshold)
    let nextClosed = Number(item.manual_closed)

    if (typeof body.exactStock === 'number') {
      nextPlates = Math.max(0, body.exactStock)
      if (nextPlates > nextInitial) nextInitial = nextPlates
    } else if (typeof body.delta === 'number') {
      nextPlates = Math.max(0, nextPlates + body.delta)
      if (nextPlates > nextInitial) nextInitial = nextPlates
    }

    if (typeof body.threshold === 'number') {
      nextThreshold = Math.max(0, body.threshold)
    }

    if (typeof body.manualClosed === 'boolean') {
      nextClosed = body.manualClosed ? 1 : 0
    }

    await pool.execute(
      `UPDATE menus
       SET plates_available = ?, initial_plates = ?, low_alert_threshold = ?, manual_closed = ?
       WHERE id = ?`,
      [nextPlates, nextInitial, nextThreshold, nextClosed, body.itemId]
    )

    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  if (body.action === 'delete_dish') {
    const itemId = String(body.itemId || '').trim()
    if (!itemId) {
      throw createError({ statusCode: 400, statusMessage: 'Dish ID is required' })
    }
    await pool.execute('DELETE FROM menus WHERE id = ?', [itemId])
    return { ok: true, state: await getFullEventStateFromMysql() }
  }

  if (body.action === 'bulk_import') {
    const items = Array.isArray(body.items) ? body.items : []
    if (items.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No menu items found in uploaded file.' })
    }

    let importedCount = 0
    for (let idx = 0; idx < items.length; idx++) {
      const raw = items[idx]
      const name = String(raw.name || '').trim()
      if (!name) continue
      const catRaw = String(raw.cat || raw.category || '').trim().toLowerCase()
      const category = catRaw.includes('cont') ? 'continental' : 'nigerian'
      const subCategory = normalizeSubCat(raw.subCat ?? raw.sub_category ?? raw.subcategory)
      const vendor = String(raw.vendor || 'RenGala Caterer').trim() || 'RenGala Caterer'
      const description = String(raw.description || '').trim() || 'Freshly prepared event delicacy with rich accompaniments.'
      const parsedStock = parseInt(String(raw.stock ?? raw.plates ?? ''), 10)
      const plates = Number.isFinite(parsedStock) && parsedStock >= 0 ? parsedStock : 100
      const parsedThreshold = parseInt(String(raw.threshold ?? ''), 10)
      const threshold = Number.isFinite(parsedThreshold) && parsedThreshold >= 1 ? parsedThreshold : 10
      const imageMode = raw.image ? 'photo' : 'placeholder'
      const defaultImg = category === 'nigerian' ? '/images/menu/jollof-rice.jpg' : '/images/menu/oriental-prawns.jpg'
      const imageUrl = String(raw.image || '').trim() || defaultImg
      const id = `dish_${now}_${idx}`

      await pool.execute(
        `INSERT INTO menus
         (id, name, category, sub_category, vendor, description, image_url, image_mode, plates_available, initial_plates, low_alert_threshold, manual_closed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [id, name, category, subCategory, vendor, description, imageUrl, imageMode, plates, plates, threshold]
      )
      importedCount++
    }

    if (importedCount === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No valid rows with a dish Name were found in the file.' })
    }

    return { ok: true, importedCount, state: await getFullEventStateFromMysql() }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid menu action' })
})
