-- =================================================================
-- RENAISSANCE EVENT PLATFORM — SUPABASE POSTGRES FULL SETUP SCRIPT
-- Copy and paste this whole script into Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Run
-- =================================================================

-- 1. DROP EXISTING CONFLICTING TABLES (OPTIONAL / CLEAN SETUP)
-- Uncomment if you want a complete fresh reset:
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS menu_items CASCADE;
-- DROP TABLE IF EXISTS attendees CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS event_settings CASCADE;

-- 2. CREATE TABLES
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'vendor', 'guest')),
  department TEXT NOT NULL DEFAULT 'Event Operations',
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendees (
  ticket_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  guest_type TEXT NOT NULL,
  sponsor_staff_id TEXT NOT NULL DEFAULT '',
  table_no TEXT NOT NULL,
  seat_no TEXT NOT NULL,
  checked_in INT NOT NULL DEFAULT 0,
  checked_in_at TEXT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  cat TEXT NOT NULL CHECK (cat IN ('nigerian', 'continental')),
  sub_cat TEXT NOT NULL DEFAULT 'other',
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  vendor TEXT NOT NULL,
  image TEXT NOT NULL,
  image_mode TEXT NOT NULL DEFAULT 'photo' CHECK (image_mode IN ('photo', 'placeholder')),
  stock INT NOT NULL DEFAULT 0,
  initial_stock INT NOT NULL DEFAULT 0,
  threshold INT NOT NULL DEFAULT 10,
  manual_closed INT NOT NULL DEFAULT 0,
  popular INT NOT NULL DEFAULT 0,
  spicy INT NOT NULL DEFAULT 0,
  updated_at BIGINT NOT NULL
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
  created_at BIGINT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('unprocessed', 'processed', 'delivered')),
  print_count INT NOT NULL DEFAULT 0,
  qr_token TEXT NOT NULL,
  idempotency_key TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS event_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 3. INDEXES FOR HIGH-SPEED CONCURRENT EVENT ACCESS
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table_seat ON orders(table_no, seat_no);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_cat ON menu_items(cat, sub_cat);

-- 4. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- Clean up any prior policies
DROP POLICY IF EXISTS "Public read for menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public modify for menu_items" ON menu_items;
DROP POLICY IF EXISTS "Public read for orders" ON orders;
DROP POLICY IF EXISTS "Public insert for orders" ON orders;
DROP POLICY IF EXISTS "Public update for orders" ON orders;
DROP POLICY IF EXISTS "Public read for attendees" ON attendees;
DROP POLICY IF EXISTS "Public modify for attendees" ON attendees;
DROP POLICY IF EXISTS "Public read for users" ON users;
DROP POLICY IF EXISTS "Public modify for users" ON users;
DROP POLICY IF EXISTS "Public read for event_settings" ON event_settings;
DROP POLICY IF EXISTS "Public modify for event_settings" ON event_settings;

-- Create Open Event Policies
CREATE POLICY "Public read for menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public modify for menu_items" ON menu_items FOR ALL USING (true);

CREATE POLICY "Public read for orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Public insert for orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update for orders" ON orders FOR UPDATE USING (true);

CREATE POLICY "Public read for attendees" ON attendees FOR SELECT USING (true);
CREATE POLICY "Public modify for attendees" ON attendees FOR ALL USING (true);

CREATE POLICY "Public read for users" ON users FOR SELECT USING (true);
CREATE POLICY "Public modify for users" ON users FOR ALL USING (true);

CREATE POLICY "Public read for event_settings" ON event_settings FOR SELECT USING (true);
CREATE POLICY "Public modify for event_settings" ON event_settings FOR ALL USING (true);

-- =================================================================
-- 5. SEED INITIAL DATA (USERS, SETTINGS, ATTENDEES, MENU DISHES)
-- =================================================================

-- Users (Tech Admin, Vendors, Guest)
INSERT INTO users (name, email, password, role, department, created_at)
VALUES
  ('Tech Admin (Ikedichi / Linus)', 'admin@renaissance.ng', 'admin123', 'admin', 'Reconstituted Tech Group', 1731456000000),
  ('Tajudeen (Builders Admin)', 'tajudeen@renaissance.ng', 'admin123', 'admin', 'Platform Engineering', 1731456000000),
  ('Lagos Royal Kitchens (Vendor)', 'vendor@renaissance.ng', 'vendor123', 'vendor', 'Food Vendor & Kitchen Ops', 1731456000000),
  ('Catering Focal Point', 'catering@renaissance.ng', 'vendor123', 'vendor', 'Catering & XP-80T Dispatch', 1731456000000),
  ('Oluwatosin Dawodu', 'guest@renaissance.ng', 'guest123', 'guest', 'Event Attendee', 1731456000000)
ON CONFLICT (email) DO NOTHING;

-- Event Settings
INSERT INTO event_settings (key, value)
VALUES
  ('total_expected', '2000'),
  ('total_tables', '200'),
  ('seats_per_table', '10'),
  ('base_checked_in', '1414'),
  ('base_post_reg', '52'),
  ('unclaimed_seats_released', '0'),
  ('check_in_window', '2:00 PM – 2:45 PM')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Attendees
INSERT INTO attendees (ticket_id, name, guest_type, sponsor_staff_id, table_no, seat_no, checked_in, checked_in_at, created_at)
VALUES
  ('REN-0842', 'Oluwatosin Dawodu', 'Pre-Registered (Yes)', 'REN-STF-014', 'Table 12', 'Seat 4', 1, '02:04 PM', 1731456000000),
  ('REN-0891', 'Ngozi Okafor', 'Pre-Registered (Yes)', 'REN-STF-102', 'Table 12', 'Seat 5', 1, '02:09 PM', 1731456000000),
  ('REN-0915', 'Tunde Bakare', 'Spouse / Plus-One', 'REN-STF-019', 'Table 14', 'Seat 2', 0, NULL, 1731456000000),
  ('REN-0950', 'Chidi Nwosu', 'Third-Party', 'REN-3P-044', 'Table 8', 'Seat 2', 1, '02:10 PM', 1731456000000),
  ('REN-1024', 'Amina Bello', 'On-Site Registered', 'REN-STF-088', 'Table 18', 'Seat 7', 1, '02:22 PM', 1731456000000)
ON CONFLICT (ticket_id) DO NOTHING;

-- Complete Menu Dishes (15 Nigerian + 16 Continental with photos)
INSERT INTO menu_items (id, cat, sub_cat, name, description, vendor, image, image_mode, stock, initial_stock, threshold, manual_closed, popular, spicy, updated_at)
VALUES
  -- Nigerian Dishes
  ('nig_1', 'nigerian', 'rice', 'Jollof Rice + Fried Rice', 'Smoky party firewood Jollof paired with rich Nigerian vegetable fried rice.', 'Lagos Royal Kitchens', '/images/menu/jollof-rice.jpg', 'photo', 180, 220, 10, 0, 1, 1, 1731456000000),
  ('nig_2', 'nigerian', 'rice', 'Jollof Rice + Coconut Rice', 'Classic smoky Jollof served alongside creamy aromatic coconut infused rice.', 'Lagos Royal Kitchens', '/images/menu/jollof-coconut.jpg', 'photo', 95, 120, 10, 0, 1, 0, 1731456000000),
  ('nig_3', 'nigerian', 'rice', 'Fried Rice + Coconut Rice', 'Savory Nigerian liver & sweetcorn fried rice paired with fragrant coconut rice.', 'Lagos Royal Kitchens', '/images/menu/coconut-rice.jpg', 'photo', 70, 90, 8, 0, 0, 0, 1731456000000),
  ('nig_4', 'nigerian', 'rice', 'Ofada Rice + Sauce', 'Local unpolished heritage Ofada rice with rich designer green pepper Ayamase sauce.', 'Iya Oyo Heritage Caterers', '/images/menu/ofada-rice.jpg', 'photo', 60, 100, 8, 0, 1, 1, 1731456000000),
  ('nig_5', 'nigerian', 'swallow', 'Afang Soup + Garri', 'Freshly pounded Afang & waterleaf simmered with periwinkles, stockfish & yellow Garri.', 'Calabar Pot Caterers', '/images/menu/afang-soup.jpg', 'photo', 65, 80, 5, 0, 0, 0, 1731456000000),
  ('nig_6', 'nigerian', 'swallow', 'Afang Soup + Semovita', 'Traditional rich Afang soup served with smooth, hot Semovita swallow.', 'Calabar Pot Caterers', '/images/menu/afang-soup.jpg', 'photo', 50, 60, 5, 0, 0, 0, 1731456000000),
  ('nig_7', 'nigerian', 'swallow', 'Afang Soup + Fufu', 'Authentic Efik Afang soup served with soft, traditional cassava Fufu.', 'Calabar Pot Caterers', '/images/menu/afang-soup.jpg', 'photo', 45, 50, 5, 0, 0, 0, 1731456000000),
  ('nig_8', 'nigerian', 'swallow', 'Egusi Soup + Garri', 'Toasted melon seed Egusi soup cooked with ugu leaves, stockfish & golden Eba (Garri).', 'Iya Oyo Heritage Caterers', '/images/menu/egusi-soup.jpg', 'photo', 80, 100, 8, 0, 1, 0, 1731456000000),
  ('nig_9', 'nigerian', 'swallow', 'Egusi Soup + Semovita', 'Rich slow-simmered Egusi melon soup paired with fluffy Semovita.', 'Iya Oyo Heritage Caterers', '/images/menu/egusi-soup.jpg', 'photo', 60, 75, 5, 0, 0, 0, 1731456000000),
  ('nig_10', 'nigerian', 'swallow', 'Egusi Soup + Fufu', 'Hearty Nigerian Egusi soup with leafy greens and soft Fufu swallow.', 'Iya Oyo Heritage Caterers', '/images/menu/egusi-soup.jpg', 'photo', 40, 50, 5, 0, 0, 0, 1731456000000),
  ('nig_11', 'nigerian', 'swallow', 'Native Soup (Banga) + Garri', 'Delta-style palm nut Banga soup infused with Beletete spice & yellow Garri.', 'Delta Spice Collective', '/images/menu/banga-soup.jpg', 'photo', 55, 70, 5, 0, 0, 0, 1731456000000),
  ('nig_12', 'nigerian', 'swallow', 'Native Soup (Banga) + Semo', 'Aromatic Niger-Delta Banga soup paired with smooth Semovita.', 'Delta Spice Collective', '/images/menu/banga-soup.jpg', 'photo', 45, 60, 5, 0, 0, 0, 1731456000000),
  ('nig_13', 'nigerian', 'swallow', 'Native Soup (Banga) + Fufu', 'Rich palm fruit Banga soup served hot with traditional Fufu.', 'Delta Spice Collective', '/images/menu/banga-soup.jpg', 'photo', 8, 45, 10, 0, 0, 0, 1731456000000),
  ('nig_14', 'nigerian', 'swallow', 'Gbegiri + Amala', 'Velvety slow-cooked honey bean Gbegiri soup with rich buka stew & hot dark Amala.', 'Iya Oyo Heritage Caterers', '/images/menu/amala-ewedu.jpg', 'photo', 90, 110, 10, 0, 1, 1, 1731456000000),
  ('nig_15', 'nigerian', 'swallow', 'Ewedu + Amala', 'Traditional smooth jute-leaf Ewedu & pepper stew paired with fluffy Amala.', 'Iya Oyo Heritage Caterers', '/images/menu/amala-ewedu.jpg', 'photo', 85, 100, 10, 0, 1, 0, 1731456000000),

  -- Continental Dishes
  ('cont_1', 'continental', 'rice', 'Oriental Fried Rice + Buttery Prawns', 'Wok-tossed basmati rice with sesame & scallions, topped with jumbo butter-poached prawns.', 'Victoria Island Bistro', '/images/menu/oriental-prawns.jpg', 'photo', 85, 100, 10, 0, 1, 0, 1731456000000),
  ('cont_2', 'continental', 'rice', 'Oriental Fried Rice + Garlic Butter Prawns', 'Fragrant Asian-style fried rice served with roasted garlic & herb king prawns.', 'Victoria Island Bistro', '/images/menu/prawns-curry.jpg', 'photo', 60, 80, 8, 0, 0, 0, 1731456000000),
  ('cont_3', 'continental', 'rice', 'Oriental Fried Rice + Beef Curry Sauce', 'Wok-seared Oriental basmati rice paired with tender prime beef strips in velvety curry.', 'Victoria Island Bistro', '/images/menu/beef-curry.jpg', 'photo', 75, 90, 8, 0, 0, 0, 1731456000000),
  ('cont_4', 'continental', 'rice', 'Oriental Fried Rice + Chicken Curry Sauce', 'Golden wok fried rice with supreme chicken breast simmered in aromatic golden curry.', 'Victoria Island Bistro', '/images/menu/chicken-curry.jpg', 'photo', 90, 110, 10, 0, 0, 0, 1731456000000),
  ('cont_5', 'continental', 'rice', 'Special Fried Rice + Buttery Prawns', 'Chef signature special basmati fried rice with pan-seared buttery tiger prawns.', 'Eko Continental Culinary', '/images/menu/fried-rice.jpg', 'photo', 55, 85, 8, 0, 0, 0, 1731456000000),
  ('cont_6', 'continental', 'rice', 'Special Fried Rice + Garlic Butter Prawns', 'Loaded special basmati rice paired with sizzling lemon-garlic butter prawns.', 'Eko Continental Culinary', '/images/menu/oriental-prawns.jpg', 'photo', 50, 70, 6, 0, 0, 0, 1731456000000),
  ('cont_7', 'continental', 'rice', 'Special Fried Rice + Beef Curry Sauce', 'Signature special fried rice served with slow-braised tenderloin beef curry.', 'Eko Continental Culinary', '/images/menu/beef-curry.jpg', 'photo', 65, 80, 8, 0, 0, 0, 1731456000000),
  ('cont_8', 'continental', 'rice', 'Special Fried Rice + Chicken Curry Sauce', 'Special vegetable & shrimp fried rice topped with rich coconut chicken curry.', 'Eko Continental Culinary', '/images/menu/chicken-curry.jpg', 'photo', 80, 95, 8, 0, 0, 0, 1731456000000),
  ('cont_9', 'continental', 'rice', 'Jambalaya Rice + Buttery Prawns', 'Cajun-spiced Creole Jambalaya rice with roasted peppers & buttery jumbo prawns.', 'Victoria Island Bistro', '/images/menu/jambalaya-rice.jpg', 'photo', 65, 80, 6, 0, 1, 1, 1731456000000),
  ('cont_10', 'continental', 'rice', 'Jambalaya Rice + Garlic Butter Prawns', 'Richly seasoned Jambalaya rice served with succulent garlic herb prawns.', 'Victoria Island Bistro', '/images/menu/jambalaya-rice.jpg', 'photo', 50, 65, 6, 0, 0, 0, 1731456000000),
  ('cont_11', 'continental', 'rice', 'Jambalaya Rice + Beef Curry Sauce', 'Spiced Creole Jambalaya rice paired with tender beef strips in savory curry sauce.', 'Victoria Island Bistro', '/images/menu/beef-curry.jpg', 'photo', 45, 60, 6, 0, 0, 1, 1731456000000),
  ('cont_12', 'continental', 'rice', 'Jambalaya Rice + Chicken Curry Sauce', 'Signature Jambalaya rice served with succulent spiced chicken curry sauce.', 'Victoria Island Bistro', '/images/menu/chicken-curry.jpg', 'photo', 55, 70, 6, 0, 0, 0, 1731456000000),
  ('cont_13', 'continental', 'noodles', 'Singapore Noodles + Buttery Prawns', 'Fine rice vermicelli stir-fried with curry spices, julienne veggies & buttery prawns.', 'Eko Continental Culinary', '/images/menu/singapore-noodles.jpg', 'photo', 55, 75, 8, 0, 1, 0, 1731456000000),
  ('cont_14', 'continental', 'noodles', 'Singapore Noodles + Garlic Butter Prawns', 'Golden wok Singapore noodles tossed with crispy vegetables & garlic butter prawns.', 'Eko Continental Culinary', '/images/menu/singapore-noodles.jpg', 'photo', 45, 65, 8, 0, 0, 0, 1731456000000),
  ('cont_15', 'continental', 'noodles', 'Singapore Noodles + Beef Curry Sauce', 'Stir-fried Singapore vermicelli noodles paired with slow-simmered beef curry sauce.', 'Eko Continental Culinary', '/images/menu/beef-curry.jpg', 'photo', 50, 70, 8, 0, 0, 0, 1731456000000),
  ('cont_16', 'continental', 'noodles', 'Singapore Noodles + Chicken Curry Sauce', 'Wok-fried Singapore vermicelli noodles accompanied by savory chicken curry.', 'Eko Continental Culinary', '/images/menu/chicken-curry.jpg', 'photo', 70, 85, 8, 0, 0, 0, 1731456000000)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  cat = EXCLUDED.cat,
  sub_cat = EXCLUDED.sub_cat;
