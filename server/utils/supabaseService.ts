import { getSupabase } from './supabase'
import { getFallbackMenuItems } from './seedMenuData'
import type { EventState, MenuItem, FoodOrder, GuestAttendee } from './db'

export async function fetchEventStateFromSupabase(): Promise<EventState | null> {
  const sb = getSupabase()
  if (!sb) return null

  try {
    // 1. Fetch menu items
    const { data: menuData, error: menuErr } = await sb
      .from('menu_items')
      .select('*')
      .order('id', { ascending: true })

    if (menuErr) {
      console.warn('[Supabase] Error reading menu_items:', menuErr.message)
      return null
    }

    let menuItems: MenuItem[] = (menuData || []).map(r => ({
      id: r.id,
      cat: r.cat,
      subCat: r.sub_cat || 'other',
      name: r.name,
      description: r.description || '',
      vendor: r.vendor || 'Renaissance Caterer',
      image: r.image,
      imageMode: r.image_mode || 'photo',
      stock: Number(r.stock ?? 0),
      initialStock: Number(r.initial_stock ?? r.stock ?? 0),
      threshold: Number(r.threshold ?? 10),
      manualClosed: Boolean(r.manual_closed),
      popular: Boolean(r.popular),
      spicy: Boolean(r.spicy)
    }))

    // If Supabase table is empty, auto-seed the dishes
    if (menuItems.length === 0) {
      const fallback = getFallbackMenuItems()
      const rowsToInsert = fallback.map(d => ({
        id: d.id,
        cat: d.cat,
        sub_cat: d.subCat,
        name: d.name,
        description: d.description,
        vendor: d.vendor,
        image: d.image,
        image_mode: d.imageMode,
        stock: d.stock,
        initial_stock: d.initialStock,
        threshold: d.threshold,
        manual_closed: d.manualClosed ? 1 : 0,
        popular: d.popular ? 1 : 0,
        spicy: d.spicy ? 1 : 0,
        updated_at: Date.now()
      }))
      await sb.from('menu_items').upsert(rowsToInsert)
      menuItems = fallback
    }

    // 2. Fetch orders
    const { data: ordersData } = await sb
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    const orders: FoodOrder[] = (ordersData || []).map(r => ({
      id: r.id,
      guest: r.guest_name,
      ticketId: r.ticket_id || undefined,
      table: r.table_no,
      seat: r.seat_no,
      category: r.category,
      dishId: r.dish_id,
      dish: r.dish_name,
      sides: typeof r.sides_json === 'string' ? JSON.parse(r.sides_json || '[]') : (r.sides_json || []),
      proteins: typeof r.proteins_json === 'string' ? JSON.parse(r.proteins_json || '[]') : (r.proteins_json || []),
      time: r.time_label || 'Just now',
      createdAt: Number(r.created_at || Date.now()),
      status: r.status || 'unprocessed',
      printCount: Number(r.print_count || 0),
      qrToken: r.qr_token,
      idempotencyKey: r.idempotency_key || undefined
    }))

    // 3. Fetch attendees
    const { data: attData } = await sb
      .from('attendees')
      .select('*')
      .order('created_at', { ascending: false })

    const attendees: GuestAttendee[] = (attData || []).map(r => ({
      ticketId: r.ticket_id,
      name: r.name,
      type: r.guest_type,
      sponsorStaffId: r.sponsor_staff_id || '',
      table: r.table_no,
      seat: r.seat_no,
      checkedIn: Boolean(r.checked_in),
      checkedInAt: r.checked_in_at || undefined
    }))

    // 4. Fetch settings
    const { data: settingsData } = await sb
      .from('event_settings')
      .select('*')

    const settings: Record<string, string> = {}
    for (const s of settingsData || []) {
      settings[s.key] = s.value
    }

    // 5. Fetch users
    const { data: usersData } = await sb
      .from('users')
      .select('id, name, email, role, department, created_at')
      .order('id', { ascending: true })

    const attChecked = attendees.filter(a => a.checkedIn).length
    const attPostReg = attendees.filter(a => a.type === 'On-Site Registered').length

    return {
      capacity: {
        totalExpected: Number(settings.total_expected || 2000),
        totalTables: Number(settings.total_tables || 200),
        seatsPerTable: Number(settings.seats_per_table || 10),
        checkedInCount: Number(settings.base_checked_in || 1414) + attChecked,
        postRegCount: Number(settings.base_post_reg || 52) + attPostReg,
        unclaimedSeatsReleased: settings.unclaimed_seats_released === '1',
        checkInWindow: settings.check_in_window || '2:00 PM – 2:45 PM'
      },
      menuItems,
      orders,
      attendees,
      users: usersData || [],
      metrics: {
        avgResponseMs: 12,
        totalProcessedLockOps: 1500
      }
    }
  } catch (err) {
    console.warn('[Supabase] Failed to fetch state, falling back to SQLite/seed:', err)
    return null
  }
}

