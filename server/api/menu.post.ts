import { getDb, getFullEventState, inferSubCat, type MenuSubCat } from '../utils/db'

const VALID_SUBCATS: MenuSubCat[] = ['rice', 'swallow', 'noodles', 'protein', 'sauce', 'other']

function normalizeSubCat(raw: unknown, name: string): MenuSubCat {
  const s = String(raw || '').toLowerCase() as MenuSubCat
  return VALID_SUBCATS.includes(s) ? s : inferSubCat(name)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDb()
  const now = Date.now()

  if (body.action === 'add_dish') {
    const name = String(body.name || '').trim()
    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'Dish name is required' })
    }
    const cat = body.cat === 'continental' ? 'continental' : 'nigerian'
    const subCat = normalizeSubCat(body.subCat, name)
    const imageMode = body.imageMode === 'placeholder' ? 'placeholder' : 'photo'
    const stock = Math.max(0, parseInt(String(body.stock), 10) || 100)
    const threshold = Math.max(1, parseInt(String(body.threshold), 10) || 10)
    const vendor = String(body.vendor || 'Renaissance Caterer').trim()
    const description = String(body.description || 'Freshly prepared event delicacy with rich accompaniments.').trim()
    const defaultImg = cat === 'nigerian'
      ? '/images/menu/jollof-rice.jpg'
      : '/images/menu/oriental-prawns.jpg'
    const id = `dish_${now}`

    db.prepare(`
      INSERT INTO menu_items (id, cat, sub_cat, name, description, vendor, image, image_mode, stock, initial_stock, threshold, manual_closed, popular, spicy, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `).run(
      id,
      cat,
      subCat,
      name,
      description,
      vendor,
      String(body.image || '').trim() || defaultImg,
      imageMode,
      stock,
      stock,
      threshold,
      body.popular ? 1 : 0,
      body.spicy ? 1 : 0,
      now
    )

    return { ok: true, state: getFullEventState() }
  }

  if (body.action === 'update_dish') {
    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(body.itemId) as any
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Dish not found' })
    }

    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : item.name
    const cat = body.cat === 'continental' || body.cat === 'nigerian' ? body.cat : item.cat
    const subCat = body.subCat ? normalizeSubCat(body.subCat, name) : (item.sub_cat || inferSubCat(name))
    const vendor = typeof body.vendor === 'string' && body.vendor.trim() ? body.vendor.trim() : item.vendor
    const description = typeof body.description === 'string' && body.description.trim() ? body.description.trim() : item.description
    const image = typeof body.image === 'string' && body.image.trim() ? body.image.trim() : item.image
    const imageMode = body.imageMode === 'placeholder' || body.imageMode === 'photo' ? body.imageMode : item.image_mode
    const stock = typeof body.stock === 'number' ? Math.max(0, body.stock) : Number(item.stock)
    const initialStock = Math.max(Number(item.initial_stock), stock)
    const threshold = typeof body.threshold === 'number' ? Math.max(1, body.threshold) : Number(item.threshold)
    const popular = typeof body.popular === 'boolean' ? (body.popular ? 1 : 0) : Number(item.popular)
    const spicy = typeof body.spicy === 'boolean' ? (body.spicy ? 1 : 0) : Number(item.spicy)

    db.prepare(`
      UPDATE menu_items
      SET cat = ?, sub_cat = ?, name = ?, description = ?, vendor = ?, image = ?, image_mode = ?,
          stock = ?, initial_stock = ?, threshold = ?, popular = ?, spicy = ?, updated_at = ?
      WHERE id = ?
    `).run(cat, subCat, name, description, vendor, image, imageMode, stock, initialStock, threshold, popular, spicy, now, body.itemId)

    return { ok: true, state: getFullEventState() }
  }

  if (body.action === 'toggle_image_mode') {
    const item = db.prepare('SELECT id, image_mode FROM menu_items WHERE id = ?').get(body.itemId) as any
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Dish not found' })
    }
    const nextMode = body.imageMode === 'placeholder' || body.imageMode === 'photo'
      ? body.imageMode
      : (item.image_mode === 'placeholder' ? 'photo' : 'placeholder')

    db.prepare('UPDATE menu_items SET image_mode = ?, updated_at = ? WHERE id = ?').run(nextMode, now, body.itemId)
    return { ok: true, state: getFullEventState() }
  }

  if (body.action === 'bulk_image_mode') {
    const nextMode = body.imageMode === 'placeholder' ? 'placeholder' : 'photo'
    db.prepare('UPDATE menu_items SET image_mode = ?, updated_at = ?').run(nextMode, now)
    return { ok: true, state: getFullEventState() }
  }

  if (body.action === 'update_stock') {
    const item = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(body.itemId) as any
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Dish not found' })
    }

    let nextStock = Number(item.stock)
    let nextInitial = Number(item.initial_stock)
    let nextThreshold = Number(item.threshold)
    let nextClosed = Number(item.manual_closed)

    if (typeof body.exactStock === 'number') {
      nextStock = Math.max(0, body.exactStock)
      if (nextStock > nextInitial) nextInitial = nextStock
    } else if (typeof body.delta === 'number') {
      nextStock = Math.max(0, nextStock + body.delta)
      if (nextStock > nextInitial) nextInitial = nextStock
    }

    if (typeof body.threshold === 'number') {
      nextThreshold = Math.max(0, body.threshold)
    }

    if (typeof body.manualClosed === 'boolean') {
      nextClosed = body.manualClosed ? 1 : 0
    }

    db.prepare(`
      UPDATE menu_items
      SET stock = ?, initial_stock = ?, threshold = ?, manual_closed = ?, updated_at = ?
      WHERE id = ?
    `).run(nextStock, nextInitial, nextThreshold, nextClosed, now, body.itemId)

    return { ok: true, state: getFullEventState() }
  }

  if (body.action === 'delete_dish') {
    const itemId = String(body.itemId || '').trim()
    if (!itemId) {
      throw createError({ statusCode: 400, statusMessage: 'Dish ID is required' })
    }

    const item = db.prepare('SELECT id FROM menu_items WHERE id = ?').get(itemId) as any
    if (!item) {
      throw createError({ statusCode: 404, statusMessage: 'Dish not found' })
    }

    db.prepare('DELETE FROM menu_items WHERE id = ?').run(itemId)
    return { ok: true, state: getFullEventState() }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid menu action' })
})
