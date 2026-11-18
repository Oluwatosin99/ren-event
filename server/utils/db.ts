import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

export type UserRole = 'admin' | 'vendor' | 'delivery' | 'registrar' | 'guest'

export interface DbUser {
  id: number
  name: string
  email: string
  password: string
  role: UserRole
  department: string
  created_at: number
}

export type MenuSubCat = 'rice' | 'swallow' | 'noodles' | 'protein' | 'sauce' | 'other'
export type ImageDisplayMode = 'photo' | 'placeholder'

export interface MenuItem {
  id: string
  cat: 'nigerian' | 'continental'
  subCat: MenuSubCat
  name: string
  description: string
  vendor: string
  image: string
  imageMode: ImageDisplayMode
  stock: number
  initialStock: number
  threshold: number
  manualClosed: boolean
  popular: boolean
  spicy: boolean
}

export function inferSubCat(name: string): MenuSubCat {
  const n = name.toLowerCase()
  if (n.includes('noodle')) return 'noodles'
  if (n.includes('soup') || n.includes('amala') || n.includes('garri') || n.includes('semo') || n.includes('fufu') || n.includes('eba') || n.includes('gbegiri') || n.includes('ewedu')) {
    return 'swallow'
  }
  if (n.includes('rice') || n.includes('jambalaya') || n.includes('jollof') || n.includes('ofada') || n.includes('coconut')) {
    return 'rice'
  }
  if (n.includes('prawn') || n.includes('chicken') || n.includes('beef') || n.includes('fish') || n.includes('snail') || n.includes('suya')) {
    return 'protein'
  }
  if (n.includes('sauce') || n.includes('curry') || n.includes('stew') || n.includes('salad') || n.includes('plantain') || n.includes('moi')) {
    return 'sauce'
  }
  return 'other'
}

export interface FoodOrder {
  id: string
  guest: string
  ticketId?: string
  table: string
  seat: string
  category: 'Nigerian Dishes' | 'Continental Dishes'
  dishId: string
  dish: string
  sides: string[]
  proteins: string[]
  time: string
  createdAt: number
  status: 'unprocessed' | 'processed' | 'delivered'
  printCount: number
  qrToken: string
  idempotencyKey?: string
  servedBy?: string
  servedAt?: number
}

export interface GuestAttendee {
  ticketId: string
  name: string
  type: 'Pre-Registered (Yes)' | 'Spouse / Plus-One' | 'Third-Party' | 'On-Site Registered' | 'VIP'
  sponsorStaffId: string
  table: string
  seat: string
  checkedIn: boolean
  checkedInAt?: string
  phone?: string
  email?: string
  admittedBy?: string
  isVip?: boolean
}

export interface EventState {
  capacity: {
    totalExpected: number
    totalTables: number
    seatsPerTable: number
    checkedInCount: number
    postRegCount: number
    unclaimedSeatsReleased: boolean
    checkInWindow: string
  }
  menuItems: MenuItem[]
  orders: FoodOrder[]
  attendees: GuestAttendee[]
  users: Omit<DbUser, 'password'>[]
  metrics: {
    avgResponseMs: number
    totalProcessedLockOps: number
  }
}

let dbInstance: DatabaseSync | null = null
let lastResponseMs = 4
let totalLockOps = 1472

export function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance

  const dataDir = join(process.cwd(), '.data')
  mkdirSync(dataDir, { recursive: true })
  const dbPath = join(dataDir, 'renaissance-event.sqlite')

  const db = new DatabaseSync(dbPath)
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;
  `)

  initSchemaAndSeed(db)
  dbInstance = db
  return db
}

function initSchemaAndSeed(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'vendor', 'delivery', 'registrar', 'guest')),
      department TEXT NOT NULL DEFAULT 'Event Operations',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendees (
      ticket_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      guest_type TEXT NOT NULL,
      sponsor_staff_id TEXT NOT NULL DEFAULT '',
      table_no TEXT NOT NULL,
      seat_no TEXT NOT NULL,
      checked_in INTEGER NOT NULL DEFAULT 0,
      checked_in_at TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      cat TEXT NOT NULL CHECK(cat IN ('nigerian', 'continental')),
      sub_cat TEXT NOT NULL DEFAULT 'other',
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      vendor TEXT NOT NULL,
      image TEXT NOT NULL,
      image_mode TEXT NOT NULL DEFAULT 'photo' CHECK(image_mode IN ('photo', 'placeholder')),
      stock INTEGER NOT NULL DEFAULT 0,
      initial_stock INTEGER NOT NULL DEFAULT 0,
      threshold INTEGER NOT NULL DEFAULT 10,
      manual_closed INTEGER NOT NULL DEFAULT 0,
      popular INTEGER NOT NULL DEFAULT 0,
      spicy INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      guest_name TEXT NOT NULL,
      ticket_id TEXT,
      table_no TEXT NOT NULL,
      seat_no TEXT NOT NULL,
      category TEXT NOT NULL,
      dish_id TEXT NOT NULL,
      dish_name TEXT NOT NULL,
      sides_json TEXT NOT NULL,
      proteins_json TEXT NOT NULL,
      time_label TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('unprocessed', 'processed', 'delivered')),
      print_count INTEGER NOT NULL DEFAULT 0,
      qr_token TEXT NOT NULL,
      idempotency_key TEXT UNIQUE
    );

    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_table_seat ON orders(table_no, seat_no);
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

    CREATE TABLE IF NOT EXISTS event_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  // Migrate existing `users` table if its CHECK constraint predates 'delivery' / 'registrar'
  const usersSchemaRow = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").get() as { sql?: string } | undefined
  if (usersSchemaRow?.sql && !usersSchemaRow.sql.includes("'registrar'")) {
    db.exec(`
      CREATE TABLE users_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'vendor', 'delivery', 'registrar', 'guest')),
        department TEXT NOT NULL DEFAULT 'Event Operations',
        created_at INTEGER NOT NULL
      );
      INSERT INTO users_new (id, name, email, password, role, department, created_at)
      SELECT id, name, email, password, role, department, created_at FROM users;
      DROP TABLE users;
      ALTER TABLE users_new RENAME TO users;
    `)
  }

  // Seed default personnel users if missing
  const nowUserSeed = Date.now()
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password, role, department, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  insertUser.run('Tech Admin (Ikedichi / Linus)', 'admin@renaissance.ng', 'admin123', 'admin', 'Reconstituted Tech Group', nowUserSeed)
  insertUser.run('Tajudeen (Builders Admin)', 'tajudeen@renaissance.ng', 'admin123', 'admin', 'Platform Engineering', nowUserSeed)
  insertUser.run('Lagos Royal Kitchens (Vendor)', 'vendor@renaissance.ng', 'vendor123', 'vendor', 'Food Vendor & Kitchen Ops', nowUserSeed)
  insertUser.run('Catering Focal Point', 'catering@renaissance.ng', 'vendor123', 'vendor', 'Catering & XP-80T Dispatch', nowUserSeed)
  insertUser.run('Gate Officer — Chinedu', 'gate1@renaissance.ng', 'gate123', 'registrar', 'Gate & Admission', nowUserSeed)
  insertUser.run('Gate Officer — Zainab', 'gate2@renaissance.ng', 'gate123', 'registrar', 'Gate & Admission', nowUserSeed)
  insertUser.run('Numbere Tamunoemi (Delivery)', 'delivery@renaissance.ng', 'delivery123', 'delivery', 'Food Delivery Ops', nowUserSeed)
  insertUser.run('Oluwatosin Dawodu', 'guest@renaissance.ng', 'guest123', 'guest', 'Event Attendee', nowUserSeed)

  // Seed settings if empty
  const settingsCount = (db.prepare('SELECT COUNT(*) as cnt FROM event_settings').get() as { cnt: number }).cnt
  if (settingsCount === 0) {
    const setStmt = db.prepare('INSERT OR REPLACE INTO event_settings (key, value) VALUES (?, ?)')
    setStmt.run('total_expected', '2000')
    setStmt.run('total_tables', '200')
    setStmt.run('seats_per_table', '10')
    setStmt.run('base_checked_in', '1414')
    setStmt.run('base_post_reg', '52')
    setStmt.run('unclaimed_seats_released', '0')
    setStmt.run('check_in_window', '2:00 PM – 2:45 PM')
  }

  // Seed attendees if empty
  const attendeeCount = (db.prepare('SELECT COUNT(*) as cnt FROM attendees').get() as { cnt: number }).cnt
  if (attendeeCount === 0) {
    const now = Date.now()
    const insAtt = db.prepare(`
      INSERT INTO attendees (ticket_id, name, guest_type, sponsor_staff_id, table_no, seat_no, checked_in, checked_in_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    insAtt.run('REN-0842', 'Oluwatosin Dawodu', 'Pre-Registered (Yes)', 'REN-STF-014', 'Table 12', 'Seat 4', 1, '02:04 PM', now - 1000 * 60 * 30)
    insAtt.run('REN-0891', 'Ngozi Okafor', 'Pre-Registered (Yes)', 'REN-STF-102', 'Table 12', 'Seat 5', 1, '02:09 PM', now - 1000 * 60 * 25)
    insAtt.run('REN-0915', 'Tunde Bakare', 'Spouse / Plus-One', 'REN-STF-019', 'Table 14', 'Seat 2', 0, null, now - 1000 * 60 * 20)
    insAtt.run('REN-0950', 'Chidi Nwosu', 'Third-Party', 'REN-3P-044', 'Table 8', 'Seat 2', 1, '02:10 PM', now - 1000 * 60 * 15)
    insAtt.run('REN-1024', 'Amina Bello', 'On-Site Registered', 'REN-STF-088', 'Table 18', 'Seat 7', 1, '02:22 PM', now - 1000 * 60 * 5)
  }

  // Safe schema migration for existing SQLite databases
  const attCols = (db.prepare('PRAGMA table_info(attendees)').all() as Array<{ name: string }>).map(c => c.name)
  if (!attCols.includes('phone')) {
    db.exec(`ALTER TABLE attendees ADD COLUMN phone TEXT NOT NULL DEFAULT ''`)
  }
  if (!attCols.includes('email')) {
    db.exec(`ALTER TABLE attendees ADD COLUMN email TEXT NOT NULL DEFAULT ''`)
  }
  if (!attCols.includes('admitted_by')) {
    db.exec(`ALTER TABLE attendees ADD COLUMN admitted_by TEXT NOT NULL DEFAULT ''`)
  }
  if (!attCols.includes('is_vip')) {
    db.exec(`ALTER TABLE attendees ADD COLUMN is_vip INTEGER NOT NULL DEFAULT 0`)
  }

  const orderCols = (db.prepare('PRAGMA table_info(orders)').all() as Array<{ name: string }>).map(c => c.name)
  if (!orderCols.includes('served_by')) {
    db.exec(`ALTER TABLE orders ADD COLUMN served_by TEXT NOT NULL DEFAULT ''`)
  }
  if (!orderCols.includes('served_at')) {
    db.exec(`ALTER TABLE orders ADD COLUMN served_at INTEGER DEFAULT NULL`)
  }

  const menuCols = (db.prepare('PRAGMA table_info(menu_items)').all() as Array<{ name: string }>).map(c => c.name)
  if (!menuCols.includes('sub_cat')) {
    db.exec(`ALTER TABLE menu_items ADD COLUMN sub_cat TEXT NOT NULL DEFAULT 'other'`)
  }
  if (!menuCols.includes('image_mode')) {
    db.exec(`ALTER TABLE menu_items ADD COLUMN image_mode TEXT NOT NULL DEFAULT 'photo'`)
  }

  // Backfill sub_cat on previously uploaded custom dishes (e.g. Peppered Snail -> protein)
  const otherRows = db.prepare(`SELECT id, name FROM menu_items WHERE sub_cat = 'other'`).all() as Array<{ id: string; name: string }>
  for (const o of otherRows) {
    const inferred = inferSubCat(o.name)
    if (inferred !== 'other') {
      db.prepare('UPDATE menu_items SET sub_cat = ? WHERE id = ?').run(inferred, o.id)
    }
  }

  // Seed & sync curated Form Menu items (15 Nigerian + 16 Continental) with verified local dish photos
  const nowMenu = Date.now()
  type SeedMenuRow = [string, 'nigerian' | 'continental', MenuSubCat, string, string, string, string, number, number, number, number, number, number]
  const seedMenu: SeedMenuRow[] = [
    // Nigerian Meal Preferences (15 form options)
    ['nig_1', 'nigerian', 'rice', 'Jollof Rice + Fried Rice', 'Smoky party firewood Jollof paired with rich Nigerian vegetable fried rice.', 'Lagos Royal Kitchens', '/images/menu/jollof-rice.jpg', 180, 220, 10, 0, 1, 1],
    ['nig_2', 'nigerian', 'rice', 'Jollof Rice + Coconut Rice', 'Classic smoky Jollof served alongside creamy aromatic coconut infused rice.', 'Lagos Royal Kitchens', '/images/menu/jollof-coconut.jpg', 95, 120, 10, 0, 1, 0],
    ['nig_3', 'nigerian', 'rice', 'Fried Rice + Coconut Rice', 'Savory Nigerian liver & sweetcorn fried rice paired with fragrant coconut rice.', 'Lagos Royal Kitchens', '/images/menu/coconut-rice.jpg', 70, 90, 8, 0, 0, 0],
    ['nig_4', 'nigerian', 'rice', 'Ofada Rice + Sauce', 'Local unpolished heritage Ofada rice with rich designer green pepper Ayamase sauce.', 'Iya Oyo Heritage Caterers', '/images/menu/ofada-rice.jpg', 60, 100, 8, 0, 1, 1],
    ['nig_5', 'nigerian', 'swallow', 'Afang Soup + Garri', 'Freshly pounded Afang & waterleaf simmered with periwinkles, stockfish & yellow Garri.', 'Calabar Pot Caterers', '/images/menu/afang-soup.jpg', 65, 80, 5, 0, 0, 0],
    ['nig_6', 'nigerian', 'swallow', 'Afang Soup + Semovita', 'Traditional rich Afang soup served with smooth, hot Semovita swallow.', 'Calabar Pot Caterers', '/images/menu/afang-soup.jpg', 50, 60, 5, 0, 0, 0],
    ['nig_7', 'nigerian', 'swallow', 'Afang Soup + Fufu', 'Authentic Efik Afang soup served with soft, traditional cassava Fufu.', 'Calabar Pot Caterers', '/images/menu/afang-soup.jpg', 45, 50, 5, 0, 0, 0],
    ['nig_8', 'nigerian', 'swallow', 'Egusi Soup + Garri', 'Toasted melon seed Egusi soup cooked with ugu leaves, stockfish & golden Eba (Garri).', 'Iya Oyo Heritage Caterers', '/images/menu/egusi-soup.jpg', 80, 100, 8, 0, 1, 0],
    ['nig_9', 'nigerian', 'swallow', 'Egusi Soup + Semovita', 'Rich slow-simmered Egusi melon soup paired with fluffy Semovita.', 'Iya Oyo Heritage Caterers', '/images/menu/egusi-soup.jpg', 60, 75, 5, 0, 0, 0],
    ['nig_10', 'nigerian', 'swallow', 'Egusi Soup + Fufu', 'Hearty Nigerian Egusi soup with leafy greens and soft Fufu swallow.', 'Iya Oyo Heritage Caterers', '/images/menu/egusi-soup.jpg', 40, 50, 5, 0, 0, 0],
    ['nig_11', 'nigerian', 'swallow', 'Native Soup (Banga) + Garri', 'Delta-style palm nut Banga soup infused with Beletete spice & yellow Garri.', 'Delta Spice Collective', '/images/menu/banga-soup.jpg', 55, 70, 5, 0, 0, 0],
    ['nig_12', 'nigerian', 'swallow', 'Native Soup (Banga) + Semo', 'Aromatic Niger-Delta Banga soup paired with smooth Semovita.', 'Delta Spice Collective', '/images/menu/banga-soup.jpg', 45, 60, 5, 0, 0, 0],
    ['nig_13', 'nigerian', 'swallow', 'Native Soup (Banga) + Fufu', 'Rich palm fruit Banga soup served hot with traditional Fufu.', 'Delta Spice Collective', '/images/menu/banga-soup.jpg', 8, 45, 10, 0, 0, 0],
    ['nig_14', 'nigerian', 'swallow', 'Gbegiri + Amala', 'Velvety slow-cooked honey bean Gbegiri soup with rich buka stew & hot dark Amala.', 'Iya Oyo Heritage Caterers', '/images/menu/amala-ewedu.jpg', 90, 110, 10, 0, 1, 1],
    ['nig_15', 'nigerian', 'swallow', 'Ewedu + Amala', 'Traditional smooth jute-leaf Ewedu & pepper stew paired with fluffy Amala.', 'Iya Oyo Heritage Caterers', '/images/menu/amala-ewedu.jpg', 85, 100, 10, 0, 1, 0],

    // Continental Meal Preferences (16 form options)
    ['cont_1', 'continental', 'rice', 'Oriental Fried Rice + Buttery Prawns', 'Wok-tossed basmati rice with sesame & scallions, topped with jumbo butter-poached prawns.', 'Victoria Island Bistro', '/images/menu/oriental-prawns.jpg', 85, 100, 10, 0, 1, 0],
    ['cont_2', 'continental', 'rice', 'Oriental Fried Rice + Garlic Butter Prawns', 'Fragrant Asian-style fried rice served with roasted garlic & herb king prawns.', 'Victoria Island Bistro', '/images/menu/prawns-curry.jpg', 60, 80, 8, 0, 0, 0],
    ['cont_3', 'continental', 'rice', 'Oriental Fried Rice + Beef Curry Sauce', 'Wok-seared Oriental basmati rice paired with tender prime beef strips in velvety curry.', 'Victoria Island Bistro', '/images/menu/beef-curry.jpg', 75, 90, 8, 0, 0, 0],
    ['cont_4', 'continental', 'rice', 'Oriental Fried Rice + Chicken Curry Sauce', 'Golden wok fried rice with supreme chicken breast simmered in aromatic golden curry.', 'Victoria Island Bistro', '/images/menu/chicken-curry.jpg', 90, 110, 10, 0, 0, 0],
    ['cont_5', 'continental', 'rice', 'Special Fried Rice + Buttery Prawns', 'Chef signature special basmati fried rice with pan-seared buttery tiger prawns.', 'Eko Continental Culinary', '/images/menu/fried-rice.jpg', 55, 85, 8, 0, 0, 0],
    ['cont_6', 'continental', 'rice', 'Special Fried Rice + Garlic Butter Prawns', 'Loaded special basmati rice paired with sizzling lemon-garlic butter prawns.', 'Eko Continental Culinary', '/images/menu/oriental-prawns.jpg', 50, 70, 6, 0, 0, 0],
    ['cont_7', 'continental', 'rice', 'Special Fried Rice + Beef Curry Sauce', 'Signature special fried rice served with slow-braised tenderloin beef curry.', 'Eko Continental Culinary', '/images/menu/beef-curry.jpg', 65, 80, 8, 0, 0, 0],
    ['cont_8', 'continental', 'rice', 'Special Fried Rice + Chicken Curry Sauce', 'Special vegetable & shrimp fried rice topped with rich coconut chicken curry.', 'Eko Continental Culinary', '/images/menu/chicken-curry.jpg', 80, 95, 8, 0, 0, 0],
    ['cont_9', 'continental', 'rice', 'Jambalaya Rice + Buttery Prawns', 'Cajun-spiced Creole Jambalaya rice with roasted peppers & buttery jumbo prawns.', 'Victoria Island Bistro', '/images/menu/jambalaya-rice.jpg', 65, 80, 6, 0, 1, 1],
    ['cont_10', 'continental', 'rice', 'Jambalaya Rice + Garlic Butter Prawns', 'Richly seasoned Jambalaya rice served with succulent garlic herb prawns.', 'Victoria Island Bistro', '/images/menu/jambalaya-rice.jpg', 50, 65, 6, 0, 0, 0],
    ['cont_11', 'continental', 'rice', 'Jambalaya Rice + Beef Curry Sauce', 'Spiced Creole Jambalaya rice paired with tender beef strips in savory curry sauce.', 'Victoria Island Bistro', '/images/menu/beef-curry.jpg', 45, 60, 6, 0, 0, 1],
    ['cont_12', 'continental', 'rice', 'Jambalaya Rice + Chicken Curry Sauce', 'Signature Jambalaya rice served with succulent spiced chicken curry sauce.', 'Victoria Island Bistro', '/images/menu/chicken-curry.jpg', 55, 70, 6, 0, 0, 0],
    ['cont_13', 'continental', 'noodles', 'Singapore Noodles + Buttery Prawns', 'Fine rice vermicelli stir-fried with curry spices, julienne veggies & buttery prawns.', 'Eko Continental Culinary', '/images/menu/singapore-noodles.jpg', 55, 75, 8, 0, 1, 0],
    ['cont_14', 'continental', 'noodles', 'Singapore Noodles + Garlic Butter Prawns', 'Golden wok Singapore noodles tossed with crispy vegetables & garlic butter prawns.', 'Eko Continental Culinary', '/images/menu/singapore-noodles.jpg', 45, 65, 8, 0, 0, 0],
    ['cont_15', 'continental', 'noodles', 'Singapore Noodles + Beef Curry Sauce', 'Stir-fried Singapore vermicelli noodles paired with slow-simmered beef curry sauce.', 'Eko Continental Culinary', '/images/menu/beef-curry.jpg', 50, 70, 8, 0, 0, 0],
    ['cont_16', 'continental', 'noodles', 'Singapore Noodles + Chicken Curry Sauce', 'Wok-fried Singapore vermicelli noodles accompanied by savory chicken curry.', 'Eko Continental Culinary', '/images/menu/chicken-curry.jpg', 70, 85, 8, 0, 0, 0]
  ]

  const existingRows = db.prepare('SELECT id, image FROM menu_items').all() as Array<{ id: string; image: string }>
  const existingMap = new Map(existingRows.map(r => [r.id, r.image]))

  const insMenu = db.prepare(`
    INSERT INTO menu_items (id, cat, sub_cat, name, description, vendor, image, image_mode, stock, initial_stock, threshold, manual_closed, popular, spicy, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'photo', ?, ?, ?, ?, ?, ?, ?)
  `)
  const fixLegacySeedImg = db.prepare(`
    UPDATE menu_items SET sub_cat = ?, name = ?, description = ?, image = ?, updated_at = ?
    WHERE id = ?
  `)

  for (const row of seedMenu) {
    const [id, cat, subCat, name, description, vendor, image, stock, initialStock, threshold, manualClosed, popular, spicy] = row
    if (!existingMap.has(id)) {
      insMenu.run(id, cat, subCat, name, description, vendor, image, stock, initialStock, threshold, manualClosed, popular, spicy, nowMenu)
    } else {
      const curImg = existingMap.get(id) || ''
      // Replace legacy broken/off-topic Unsplash URLs with verified local photos while keeping any user-uploaded custom photo
      if (curImg.includes('images.unsplash.com')) {
        fixLegacySeedImg.run(subCat, name, description, image, nowMenu, id)
      } else {
        db.prepare(`UPDATE menu_items SET sub_cat = ? WHERE id = ? AND sub_cat = 'other'`).run(subCat, id)
      }
    }
  }

  // Seed orders if empty
  const orderCount = (db.prepare('SELECT COUNT(*) as cnt FROM orders').get() as { cnt: number }).cnt
  if (orderCount === 0) {
    const now = Date.now()
    const insOrd = db.prepare(`
      INSERT INTO orders (id, guest_name, ticket_id, table_no, seat_no, category, dish_id, dish_name, sides_json, proteins_json, time_label, created_at, status, print_count, qr_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    insOrd.run('ORD-1114', 'Oluwatosin Dawodu', 'REN-0842', 'Table 12', 'Seat 4', 'Nigerian Dishes', 'nig_1', 'Jollof Rice + Fried Rice', JSON.stringify(['Moi Moi', 'Plantain']), JSON.stringify(['Chicken', 'Fish']), '02:18 PM', now - 1000 * 60 * 14, 'processed', 1, 'REN-ORD-1114-T12S4')
    insOrd.run('ORD-1113', 'Chidi Nwosu', 'REN-0950', 'Table 8', 'Seat 2', 'Continental Dishes', 'cont_1', 'Oriental Fried Rice + Buttery Prawns', JSON.stringify(['Salad']), JSON.stringify(['Beef']), '02:16 PM', now - 1000 * 60 * 16, 'unprocessed', 0, 'REN-ORD-1113-T8S2')
    insOrd.run('ORD-1112', 'Funke Akindele', 'REN-0710', 'Table 3', 'Seat 9', 'Nigerian Dishes', 'nig_14', 'Gbegiri + Ewedu + Hot Amala', JSON.stringify(['Plantain']), JSON.stringify(['Beef', 'Fish']), '02:11 PM', now - 1000 * 60 * 21, 'delivered', 1, 'REN-ORD-1112-T3S9')
    insOrd.run('ORD-1111', 'Ibrahim Musa', 'REN-0620', 'Table 19', 'Seat 1', 'Continental Dishes', 'cont_12', 'Singapore Noodles + Chicken Curry Sauce', JSON.stringify(['Moi Moi', 'Salad']), JSON.stringify(['Chicken']), '02:05 PM', now - 1000 * 60 * 27, 'processed', 1, 'REN-ORD-1111-T19S1')
    insOrd.run('ORD-1110', 'Ngozi Okafor', 'REN-0891', 'Table 12', 'Seat 5', 'Nigerian Dishes', 'nig_8', 'Egusi Soup + Eba (Garri)', JSON.stringify(['Plantain']), JSON.stringify(['Chicken', 'Beef']), '02:02 PM', now - 1000 * 60 * 30, 'unprocessed', 0, 'REN-ORD-1110-T12S5')
  }
}

export function setTimingMetric(ms: number) {
  lastResponseMs = Math.max(1, ms)
  totalLockOps++
}

export function getFullEventState(): EventState {
  const db = getDb()

  const settingsRows = db.prepare('SELECT key, value FROM event_settings').all() as Array<{ key: string; value: string }>
  const settings: Record<string, string> = {}
  for (const r of settingsRows) settings[r.key] = r.value

  const attChecked = (db.prepare('SELECT COUNT(*) as cnt FROM attendees WHERE checked_in = 1').get() as { cnt: number }).cnt
  const attPostReg = (db.prepare("SELECT COUNT(*) as cnt FROM attendees WHERE guest_type = 'On-Site Registered'").get() as { cnt: number }).cnt

  const menuRows = db.prepare(`
    SELECT * FROM menu_items
    ORDER BY
      CASE WHEN id LIKE 'dish_%' THEN 0 ELSE 1 END,
      CASE WHEN id LIKE 'dish_%' THEN updated_at ELSE 0 END DESC,
      CAST(SUBSTR(id, INSTR(id, '_') + 1) AS INTEGER) ASC,
      id ASC
  `).all() as any[]
  const menuItems: MenuItem[] = menuRows.map(r => ({
    id: r.id,
    cat: r.cat,
    subCat: (r.sub_cat || inferSubCat(r.name)) as MenuSubCat,
    name: r.name,
    description: r.description,
    vendor: r.vendor,
    image: r.image,
    imageMode: (r.image_mode === 'placeholder' ? 'placeholder' : 'photo') as ImageDisplayMode,
    stock: Number(r.stock),
    initialStock: Number(r.initial_stock),
    threshold: Number(r.threshold),
    manualClosed: Boolean(r.manual_closed),
    popular: Boolean(r.popular),
    spicy: Boolean(r.spicy)
  }))

  const orderRows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[]
  const orders: FoodOrder[] = orderRows.map(r => ({
    id: r.id,
    guest: r.guest_name,
    ticketId: r.ticket_id || undefined,
    table: r.table_no,
    seat: r.seat_no,
    category: r.category,
    dishId: r.dish_id,
    dish: r.dish_name,
    sides: JSON.parse(r.sides_json),
    proteins: JSON.parse(r.proteins_json),
    time: r.time_label,
    createdAt: Number(r.created_at),
    status: r.status,
    printCount: Number(r.print_count),
    qrToken: r.qr_token,
    idempotencyKey: r.idempotency_key || undefined,
    servedBy: r.served_by || undefined,
    servedAt: r.served_at ? Number(r.served_at) : undefined
  }))

  const attRows = db.prepare('SELECT * FROM attendees ORDER BY created_at DESC').all() as any[]
  const attendees: GuestAttendee[] = attRows.map(r => ({
    ticketId: r.ticket_id,
    name: r.name,
    type: r.guest_type,
    sponsorStaffId: r.sponsor_staff_id,
    table: r.table_no,
    seat: r.seat_no,
    checkedIn: Boolean(r.checked_in),
    checkedInAt: r.checked_in_at || undefined,
    phone: r.phone || undefined,
    email: r.email || undefined,
    admittedBy: r.admitted_by || undefined,
    isVip: Boolean(r.is_vip) || r.guest_type === 'VIP'
  }))

  const userRows = db.prepare('SELECT id, name, email, role, department, created_at FROM users ORDER BY id ASC').all() as any[]

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
    users: userRows,
    metrics: {
      avgResponseMs: lastResponseMs,
      totalProcessedLockOps: totalLockOps
    }
  }
}

