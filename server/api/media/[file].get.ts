import { existsSync, readFileSync } from 'node:fs'
import { join, extname } from 'node:path'

const EXT_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif'
}

export default defineEventHandler((event) => {
  const file = String(getRouterParam(event, 'file') || '')
  if (!/^[a-zA-Z0-9._-]+$/.test(file)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid file name' })
  }

  const filePath = join(process.cwd(), '.data', 'uploads', 'menus', file)
  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'Uploaded image not found' })
  }

  const ext = extname(file).toLowerCase()
  setResponseHeader(event, 'Content-Type', EXT_MIME[ext] || 'application/octet-stream')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')
  return readFileSync(filePath)
})

