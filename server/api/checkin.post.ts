import crypto from 'node:crypto'
import { getMysqlPool, getFullEventStateFromMysql, formatTimeLabel } from '../utils/mysql'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const pool = getMysqlPool()
  const nowLabel = formatTimeLabel(new Date())

  // 1. Front-Gate QR Scan against `registered_guests` -> logs into `admitted_guests`
  if (body.action === 'scan_qr') {
    const code = String(body.code || '').trim()
    const admittedBy = String(body.admittedBy || 'Gate Personnel').trim()

    const [rows] = await pool.query<any[]>(
      'SELECT * FROM registered_guests WHERE UPPER(uuid) = UPPER(?) LIMIT 1',
      [code]
    )
    const guest = rows?.[0]

    if (guest) {
      const isVip = Boolean(guest.is_vip) || String(guest.name || '').toUpperCase().startsWith('VIP')
      const guestType = guest.guest_type || (isVip ? 'VIP' : 'Pre-Registered')

      if (guest.admissionstatus !== 'admitted') {
        await pool.execute(
          `UPDATE registered_guests
           SET admissionstatus = 'admitted', admitted_at = NOW(), admitted_by = ?
           WHERE uuid = ?`,
          [admittedBy, guest.uuid]
        )
      }

      // Record in `admitted_guests` table (idempotent via UNIQUE guest_uuid)
      await pool.execute(
        `INSERT IGNORE INTO admitted_guests
         (guest_uuid, name, guest_type, is_vip, email, phone, admission_method, admitted_by, admitted_at)
         VALUES (?, ?, ?, ?, ?, ?, 'qr_scan', ?, NOW())`,
        [guest.uuid, guest.name, guestType, isVip ? 1 : 0, guest.email || null, guest.phone || null, admittedBy]
      )

      return {
        ok: true,
        status: 'verified',
        attendee: {
          ticketId: guest.uuid,
          name: guest.name,
          type: guestType,
          sponsorStaffId: '',
          table: 'Open Seating',
          seat: '-',
          checkedIn: true,
          checkedInAt: guest.admitted_at ? formatTimeLabel(guest.admitted_at) : nowLabel,
          phone: guest.phone || undefined,
          email: guest.email || undefined,
          admittedBy: guest.admitted_by || admittedBy,
          isVip
        },
        state: await getFullEventStateFromMysql()
      }
    }

    return {
      ok: false,
      status: 'unregistered',
      message: 'Unregistered arrival or missing QR tag. Please complete On-Site Registration.',
      state: await getFullEventStateFromMysql()
    }
  }

  // 2. On-Site Walk-In Guest Registration -> inserts into `registered_guests` AND `admitted_guests`
  if (body.action === 'post_register') {
    const name = String(body.name || '').trim()
    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'Guest full name is required for on-site admission.' })
    }
    const phone = String(body.phone || '').trim()
    const email = String(body.email || '').trim()
    const admittedBy = String(body.admittedBy || 'Gate Personnel').trim()
    const isVip = Boolean(body.isVip) || body.guestType === 'VIP'
    const guestType = isVip ? 'VIP' : (body.guestType || 'On-Site Registered')
    const uuid = crypto.randomUUID()

    await pool.execute(
      `INSERT INTO registered_guests
       (uuid, name, admissionstatus, admitted_at, admitted_by, email, phone, guest_type, is_vip)
       VALUES (?, ?, 'admitted', NOW(), ?, ?, ?, ?, ?)`,
      [uuid, name, admittedBy, email || null, phone || null, guestType, isVip ? 1 : 0]
    )

    await pool.execute(
      `INSERT INTO admitted_guests
       (guest_uuid, name, guest_type, is_vip, email, phone, admission_method, admitted_by, admitted_at)
       VALUES (?, ?, ?, ?, ?, ?, 'on_site', ?, NOW())`,
      [uuid, name, guestType, isVip ? 1 : 0, email || null, phone || null, admittedBy]
    )

    return {
      ok: true,
      attendee: {
        ticketId: uuid,
        name,
        type: guestType,
        sponsorStaffId: '',
        table: 'Open Seating',
        seat: '-',
        checkedIn: true,
        checkedInAt: nowLabel,
        phone: phone || undefined,
        email: email || undefined,
        admittedBy,
        isVip
      },
      state: await getFullEventStateFromMysql()
    }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid gate action' })
})
