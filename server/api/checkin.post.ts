import { getDb, getFullEventState } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDb()
  const now = Date.now()
  const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (body.action === 'scan_qr') {
    const code = String(body.code || '').trim().toUpperCase()
    const admittedBy = String(body.admittedBy || 'Gate Personnel').trim()
    let attendee = db.prepare('SELECT * FROM attendees WHERE UPPER(ticket_id) = ?').get(code) as any

    if (!attendee && body.simulateMode === 'valid') {
      const randomNum = Math.floor(1000 + Math.random() * 8999)
      const tableNum = Math.floor(1 + Math.random() * 60)
      const seatNum = Math.floor(1 + Math.random() * 10)
      const sampleGuests = [
        { name: 'Ngozi Okafor', type: 'Pre-Registered (Yes)', sponsor: 'REN-STF-102', isVip: 0 },
        { name: 'Brossa Adewale (VIP)', type: 'VIP', sponsor: 'REN-VIP-001', isVip: 1 },
        { name: 'Tajudeen Lawal', type: 'Pre-Registered (Yes)', sponsor: 'REN-STF-019', isVip: 0 },
        { name: 'Paul Ekong', type: 'Third-Party', sponsor: 'REN-3P-011', isVip: 0 }
      ]
      const pick = sampleGuests[Math.floor(Math.random() * sampleGuests.length)]
      const ticketId = `REN-${randomNum}`
      const tableNo = `Table ${tableNum}`
      const seatNo = `Seat ${seatNum}`

      db.prepare(`
        INSERT INTO attendees (ticket_id, name, guest_type, sponsor_staff_id, table_no, seat_no, checked_in, checked_in_at, phone, email, admitted_by, is_vip, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, '', '', ?, ?, ?)
      `).run(ticketId, pick.name, pick.type, pick.sponsor, tableNo, seatNo, timeLabel, admittedBy, pick.isVip, now)

      return {
        ok: true,
        status: 'verified',
        attendee: {
          ticketId,
          name: pick.name,
          type: pick.type,
          sponsorStaffId: pick.sponsor,
          table: tableNo,
          seat: seatNo,
          checkedIn: true,
          checkedInAt: timeLabel,
          admittedBy,
          isVip: Boolean(pick.isVip)
        },
        state: getFullEventState()
      }
    }

    if (attendee) {
      if (!attendee.checked_in) {
        db.prepare('UPDATE attendees SET checked_in = 1, checked_in_at = ?, admitted_by = ? WHERE ticket_id = ?').run(timeLabel, admittedBy, attendee.ticket_id)
      }
      return {
        ok: true,
        status: 'verified',
        attendee: {
          ticketId: attendee.ticket_id,
          name: attendee.name,
          type: attendee.guest_type,
          sponsorStaffId: attendee.sponsor_staff_id,
          table: attendee.table_no,
          seat: attendee.seat_no,
          checkedIn: true,
          checkedInAt: attendee.checked_in_at || timeLabel,
          phone: attendee.phone || undefined,
          email: attendee.email || undefined,
          admittedBy: attendee.admitted_by || admittedBy,
          isVip: Boolean(attendee.is_vip) || attendee.guest_type === 'VIP'
        },
        state: getFullEventState()
      }
    }

    return {
      ok: false,
      status: 'unregistered',
      message: 'Unregistered arrival or missing QR tag. Assign Table & Seat via Manual Admission.',
      state: getFullEventState()
    }
  }

  if (body.action === 'post_register') {
    const name = String(body.name || '').trim()
    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'Guest full name is required for manual admission.' })
    }
    const phone = String(body.phone || '').trim()
    const email = String(body.email || '').trim()
    const admittedBy = String(body.admittedBy || 'Gate Personnel').trim()
    const isVip = Boolean(body.isVip) || body.guestType === 'VIP'
    const guestType = isVip ? 'VIP' : (body.guestType || 'On-Site Registered')
    const sponsor = String(body.sponsor || 'On-Site Verification').trim()
    const table = String(body.table || 'Table 14')
    const seat = String(body.seat || 'Seat 6')
    const tableNo = table.startsWith('Table') ? table : `Table ${table}`
    const seatNo = seat.startsWith('Seat') ? seat : `Seat ${seat}`
    const ticketId = `REN-W${Math.floor(100 + Math.random() * 899)}`

    db.prepare(`
      INSERT INTO attendees (ticket_id, name, guest_type, sponsor_staff_id, table_no, seat_no, checked_in, checked_in_at, phone, email, admitted_by, is_vip, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
    `).run(ticketId, name, guestType, sponsor, tableNo, seatNo, timeLabel, phone, email, admittedBy, isVip ? 1 : 0, now)

    return {
      ok: true,
      attendee: {
        ticketId,
        name,
        type: guestType,
        sponsorStaffId: sponsor,
        table: tableNo,
        seat: seatNo,
        checkedIn: true,
        checkedInAt: timeLabel,
        phone,
        email,
        admittedBy,
        isVip
      },
      state: getFullEventState()
    }
  }

  if (body.action === 'toggle_seat_release') {
    const row = db.prepare("SELECT value FROM event_settings WHERE key = 'unclaimed_seats_released'").get() as { value: string } | undefined
    const nextVal = row?.value === '1' ? '0' : '1'
    db.prepare("INSERT OR REPLACE INTO event_settings (key, value) VALUES ('unclaimed_seats_released', ?)").run(nextVal)
    return { ok: true, state: getFullEventState() }
  }

  throw createError({ statusCode: 400, statusMessage: 'Invalid check-in action' })
})
