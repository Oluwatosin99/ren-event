import { mkdirSync, writeFileSync } from 'node:fs'
import { join, extname } from 'node:path'

const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ filename?: string; dataUrl?: string }>(event)
  const dataUrl = String(body?.dataUrl || '')
  const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/)

  if (!match) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid image format. Please upload PNG, JPG, WEBP, or GIF.'
    })
  }

  const mime = match[1].toLowerCase()
  const base64Data = match[2]
  const buffer = Buffer.from(base64Data, 'base64')

  if (buffer.length > 4 * 1024 * 1024) {
    throw createError({
      statusCode: 413,
      statusMessage: 'Image exceeds 4MB limit. Please choose a smaller picture.'
    })
  }

  const uploadDir = join(process.cwd(), '.data', 'uploads', 'menus')
  mkdirSync(uploadDir, { recursive: true })

  const rawBase = String(body?.filename || 'dish')
    .replace(extname(String(body?.filename || '')), '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36) || 'dish'

  const ext = MIME_EXT[mime] || '.jpg'
  const safeName = `${rawBase}-${Date.now()}${ext}`
  writeFileSync(join(uploadDir, safeName), buffer)

  return {
    ok: true,
    url: `/api/media/${safeName}`
  }
})

