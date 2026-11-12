import { getDb, getFullEventState } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const db = getDb()
  const now = Date.now()
  const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (body.action === 'scan_qr') {
    const code = String(body.code || '').trim().toUpperCase()
    let attendee = db.prepare('SELECT * FROM attendees WHERE UPPER(ticket_id) = ?').get(code) as any

    if (!attendee && body.simulateMode === 'valid') {
      const randomNum = Math.floor(1000 + Math.random() * 8999)
      const tableNum = Math.floor(1 + Math.random() * 60)
      const seatNum = Math.floor(1 + Math.random() * 10)
      const sampleGuests = [
        { name: 'Ngozi Okafor', type: 'Pre-Registered (Yes)', sponsor: 'REN-STF-102' },
        { name: 'Brossa Adewale (Plus-One)', type: 'Spouse / Plus-One', sponsor: 'REN-STF-055' },
        { name: 'Tajudeen Lawal', type: 'Pre-Registered (Yes)', sponsor: 'REN-STF-019' },
        { name: 'Paul Ekong', type: 'Third-Party', sponsor: 'REN-3P-011' }
      ]
      const pick = sampleGuests[Math.floor(Math.random() * sampleGuests.length)]
      const ticketId = `REN-${randomNum}`
      const tableNo = `Table ${tableNum}`
      const seatNo = `Seat ${seatNum}`

      db.prepare(`
        INSERT INTO attendees (ticket_id, name, guest_type, sponsor_staff_id, table_no, seat_no, checked_in, checked_in_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).run(ticketId, pick.name, pick.type, pick.sponsor, tableNo, seatNo, timeLabel, now)

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
          checkedInAt: timeLabel
        },
        state: getFullEventState()
      }
    }

    if (attendee) {
      if (!attendee.checked_in) {
        db.prepare('UPDATE attendees SET checked_in = 1, checked_in_at = ? WHERE ticket_id = ?').run(timeLabel, attendee.ticket_id)
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
          checkedInAt: attendee.checked_in_at || timeLabel
        },
        state: getFullEventState()
      }
    }

    return {
      ok: false,
      status: 'unregistered',
      message: 'Unregistered arrival or missing QR tag. Assign Table & Seat via On-Site Registration.',
      state: getFullEventState()
    }
  }

  if (body.action === 'post_register') {
    const name = String(body.name || '').trim()
    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'Guest full name is required for on-site registration.' })
    }
    const sponsor = String(body.sponsor || 'On-Site Verification').trim()
    const table = String(body.table || 'Table 14')
    const seat = String(body.seat || 'Seat 6')
    const tableNo = table.startsWith('Table') ? table : `Table ${table}`
    const seatNo = seat.startsWith('Seat') ? seat : `Seat ${seat}`
    const ticketId = `REN-W${Math.floor(100 + Math.random() * 899)}`

    db.prepare(`
      INSERT INTO attendees (ticket_id, name, guest_type, sponsor_staff_id, table_no, seat_no, checked_in, checked_in_at, created_at)
      VALUES (?, ?, 'On-Site Registered', ?, ?, ?, 1, ?, ?)
    `).run(ticketId, name, sponsor, tableNo, seatNo, timeLabel, now)

    return {
      ok: true,
      attendee: {
        ticketId,
        name,
        type: 'On-Site Registered',
        sponsorStaffId: sponsor,
        table: tableNo,
        seat: seatNo,
        checkedIn: true,
        checkedInAt: timeLabel
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
