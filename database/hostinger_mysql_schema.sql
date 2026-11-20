-- ============================================================================
-- RenGala — Hostinger MySQL Database Schema & Sample Seed Data
-- Target Database: u930027423_Ren_Event
-- How to run: Open Hostinger phpMyAdmin -> Select `u930027423_Ren_Event`
--             -> Click the "SQL" tab -> Paste this entire script -> Click "Go"
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. REGISTERED GUESTS (Matches the blue Excel / Forms AccessData headers)
--    Exact blue-table columns: uuid, name, admissionstatus, admitted_at, admitted_by, created_at
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `registered_guests` (
  `uuid` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `admissionstatus` ENUM('unadmitted', 'admitted') NOT NULL DEFAULT 'unadmitted',
  `admitted_at` DATETIME NULL DEFAULT NULL,
  `admitted_by` VARCHAR(150) NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `phone` VARCHAR(50) NULL DEFAULT NULL,
  `guest_type` VARCHAR(80) NOT NULL DEFAULT 'Pre-Registered',
  `is_vip` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`uuid`),
  INDEX `idx_reg_status` (`admissionstatus`),
  INDEX `idx_reg_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. USERS (Personnel accounts — passwords stored as Base64)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(180) NOT NULL,
  `username` VARCHAR(180) NOT NULL,
  `password` VARCHAR(255) NOT NULL COMMENT 'Base64-encoded password',
  `role` ENUM('admin', 'vendor', 'registrar', 'delivery', 'guest') NOT NULL DEFAULT 'guest',
  `department` VARCHAR(150) NOT NULL DEFAULT 'Event Operations',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. MENUS (Matches the Menu Uploader headers + automatic plate counter)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `menus` (
  `id` VARCHAR(80) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('nigerian', 'continental') NOT NULL DEFAULT 'nigerian',
  `sub_category` VARCHAR(60) NULL DEFAULT 'other',
  `vendor` VARCHAR(180) NOT NULL DEFAULT 'RenGala Caterer',
  `description` TEXT NULL,
  `image_url` VARCHAR(500) NULL DEFAULT '/images/menu/jollof-rice.jpg',
  `image_mode` ENUM('photo', 'placeholder') NOT NULL DEFAULT 'photo',
  `plates_available` INT NOT NULL DEFAULT 100,
  `initial_plates` INT NOT NULL DEFAULT 100,
  `low_alert_threshold` INT NOT NULL DEFAULT 10,
  `manual_closed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_menus_cat` (`category`),
  INDEX `idx_menus_stock` (`plates_available`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. ADMITTED GUESTS (Populated after front-gate QR scan or on-site admission)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admitted_guests` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guest_uuid` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `guest_type` VARCHAR(80) NOT NULL DEFAULT 'Pre-Registered',
  `is_vip` TINYINT(1) NOT NULL DEFAULT 0,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `phone` VARCHAR(50) NULL DEFAULT NULL,
  `admission_method` ENUM('qr_scan', 'on_site') NOT NULL DEFAULT 'qr_scan',
  `admitted_by` VARCHAR(150) NOT NULL,
  `admitted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admitted_uuid` (`guest_uuid`),
  INDEX `idx_admitted_by` (`admitted_by`),
  INDEX `idx_admitted_at` (`admitted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. ORDERS (All food orders with Table+Seat ID e.g. REN-ORD-0615 & status)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(40) NOT NULL COMMENT 'Format: REN-ORD-{TABLE}{SEAT}, e.g. REN-ORD-0615',
  `guest_name` VARCHAR(255) NOT NULL,
  `ticket_uuid` VARCHAR(100) NULL DEFAULT NULL,
  `table_no` VARCHAR(30) NOT NULL,
  `seat_no` VARCHAR(30) NOT NULL,
  `table_number` INT NOT NULL,
  `seat_number` INT NOT NULL,
  `category` VARCHAR(80) NOT NULL,
  `dish_id` VARCHAR(80) NOT NULL,
  `dish_name` VARCHAR(255) NOT NULL,
  `sides_json` JSON NULL,
  `proteins_json` JSON NULL,
  `status` ENUM('unprocessed', 'processed', 'delivered') NOT NULL DEFAULT 'unprocessed',
  `print_count` INT NOT NULL DEFAULT 0,
  `qr_token` VARCHAR(60) NOT NULL,
  `served_by` VARCHAR(150) NULL DEFAULT NULL,
  `served_at` DATETIME NULL DEFAULT NULL,
  `idempotency_key` VARCHAR(180) NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_orders_table_seat` (`table_number`, `seat_number`),
  UNIQUE KEY `uq_orders_qr_token` (`qr_token`),
  INDEX `idx_orders_status` (`status`),
  INDEX `idx_orders_served_by` (`served_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. TABLE & SEAT TRACKING MATRIX (Admin Order Matrix & Layout Editor source)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `table_seating` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `quad` ENUM('A', 'B', 'C', 'D') NOT NULL DEFAULT 'A',
  `table_number` INT NOT NULL,
  `seat_number` INT NOT NULL,
  `table_label` VARCHAR(30) NOT NULL,
  `seat_label` VARCHAR(30) NOT NULL,
  `order_id` VARCHAR(40) NULL DEFAULT NULL,
  `seat_status` ENUM('empty', 'ordered', 'processed', 'served') NOT NULL DEFAULT 'empty',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_seating_table_seat` (`table_number`, `seat_number`),
  INDEX `idx_seating_quad` (`quad`),
  INDEX `idx_seating_status` (`seat_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. DELIVERY AUDIT LOGS (Tracks who performed every delivery / print action)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `delivery_audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` VARCHAR(40) NOT NULL,
  `qr_token` VARCHAR(60) NOT NULL,
  `guest_name` VARCHAR(255) NOT NULL,
  `table_no` VARCHAR(30) NOT NULL,
  `seat_no` VARCHAR(30) NOT NULL,
  `dish_name` VARCHAR(255) NOT NULL,
  `action` ENUM('scan_delivery', 'manual_mark_served', 'print_receipt', 'reprint_receipt') NOT NULL,
  `performed_by` VARCHAR(150) NOT NULL,
  `performed_role` VARCHAR(40) NOT NULL DEFAULT 'delivery',
  `notes` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audit_order` (`order_id`),
  INDEX `idx_audit_actor` (`performed_by`),
  INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. ORDER QR SCANS (QR code scanner telemetry for menu order receipts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_qr_scans` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` VARCHAR(40) NULL DEFAULT NULL,
  `qr_code_value` VARCHAR(120) NOT NULL,
  `table_no` VARCHAR(30) NULL DEFAULT NULL,
  `seat_no` VARCHAR(30) NULL DEFAULT NULL,
  `guest_name` VARCHAR(255) NULL DEFAULT NULL,
  `scanned_by` VARCHAR(150) NOT NULL,
  `scan_result` ENUM('matched_delivered', 'already_delivered', 'not_found') NOT NULL,
  `scanned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_qr_order` (`order_id`),
  INDEX `idx_qr_scanner` (`scanned_by`),
  INDEX `idx_qr_time` (`scanned_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. EVENT SETTINGS (Stores layout config: total_tables, seats_per_table, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `event_settings` (
  `setting_key` VARCHAR(80) NOT NULL,
  `setting_value` VARCHAR(255) NOT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SAMPLE SEED DATA (Safe to re-run with INSERT IGNORE)
-- ============================================================================

-- Event Settings
INSERT IGNORE INTO `event_settings` (`setting_key`, `setting_value`) VALUES
('total_tables', '200'),
('seats_per_table', '10'),
('total_expected', '2000');

-- Users (Passwords stored as Base64:
--   admin123    -> YWRtaW4xMjM=
--   vendor123   -> dmVuZG9yMTIz
--   gate123     -> Z2F0ZTEyMw==
--   delivery123 -> ZGVsaXZlcnkxMjM=
-- )
INSERT IGNORE INTO `users` (`name`, `username`, `password`, `role`, `department`) VALUES
('Tech Admin (Ikedichi / Linus)', 'admin@renaissance.ng', 'YWRtaW4xMjM=', 'admin', 'Reconstituted Tech Group'),
('Tajudeen (Builders Admin)', 'tajudeen@renaissance.ng', 'YWRtaW4xMjM=', 'admin', 'Platform Engineering'),
('Lagos Royal Kitchens (Vendor)', 'vendor@renaissance.ng', 'dmVuZG9yMTIz', 'vendor', 'Food Vendor & Kitchen Ops'),
('Catering Focal Point', 'catering@renaissance.ng', 'dmVuZG9yMTIz', 'vendor', 'Catering & XP-80T Dispatch'),
('Kitchen Printer Station 1', 'kitchen1@renaissance.ng', 'dmVuZG9yMTIz', 'vendor', 'Receipt Printing Station 1'),
('Kitchen Printer Station 2', 'kitchen2@renaissance.ng', 'dmVuZG9yMTIz', 'vendor', 'Receipt Printing Station 2'),
('Gate Officer — Chinedu', 'gate1@renaissance.ng', 'Z2F0ZTEyMw==', 'registrar', 'Gate & Admission'),
('Gate Officer — Zainab', 'gate2@renaissance.ng', 'Z2F0ZTEyMw==', 'registrar', 'Gate & Admission'),
('Numbere Tamunoemi', 'delivery@renaissance.ng', 'ZGVsaXZlcnkxMjM=', 'delivery', 'Food Delivery Ops'),
('Maduabuchi Ogu', 'maduabuchi@renaissance.ng', 'ZGVsaXZlcnkxMjM=', 'delivery', 'Food Delivery Ops'),
('UI-SCiN-Sampling-Agent', 'sampling@renaissance.ng', 'ZGVsaXZlcnkxMjM=', 'delivery', 'Food Delivery Ops'),
('UI-SCiN-Nadrr-Server', 'nadrr@renaissance.ng', 'ZGVsaXZlcnkxMjM=', 'delivery', 'Food Delivery Ops'),
('Taiwo Balogun', 'taiwo@renaissance.ng', 'ZGVsaXZlcnkxMjM=', 'delivery', 'Food Delivery Ops'),
('Chiamaka Okonjo', 'chiamaka@renaissance.ng', 'ZGVsaXZlcnkxMjM=', 'delivery', 'Food Delivery Ops'),
('General Food Server', 'server@renaissance.ng', 'ZGVsaXZlcnkxMjM=', 'delivery', 'Food Delivery Ops');

-- Sample Registered Guests (Matching the exact blue Excel table structure)
INSERT IGNORE INTO `registered_guests` (`uuid`, `name`, `admissionstatus`, `admitted_at`, `admitted_by`, `created_at`, `guest_type`, `is_vip`) VALUES
('3ac85c9f-f082-4877-be2c-cd5bf103433a', 'VIP-Ikechukwu Ekwueme', 'admitted', '2026-11-20 14:05:00', 'Gate Officer — Chinedu', '2025-12-03 15:01:15', 'VIP', 1),
('3ac85c9f-f082-4877-be2c-cd5bf103433a-plus1', 'VIP-Ekwueme', 'unadmitted', NULL, NULL, '2025-12-03 15:01:15', 'VIP Plus-One', 1),
('16f0889e-4057-4806-a9c1-026dff88ce7d', 'VIP-Akinwami Fajola', 'unadmitted', NULL, NULL, '2025-12-03 15:01:15', 'VIP', 1),
('16f0889e-4057-4806-a9c1-026dff88ce7d-plus1', 'VIP-Mrs. Olamide Fajola', 'unadmitted', NULL, NULL, '2025-12-03 15:01:15', 'VIP Plus-One', 1),
('9430b667-655c-4d63-9b9f-50769438f6cc', 'VIP-Osita Nnajiofor', 'unadmitted', NULL, NULL, '2025-12-03 15:01:15', 'VIP', 1);

-- Sample Admitted Guest (from initial gate scan)
INSERT IGNORE INTO `admitted_guests` (`guest_uuid`, `name`, `guest_type`, `is_vip`, `admission_method`, `admitted_by`, `admitted_at`) VALUES
('3ac85c9f-f082-4877-be2c-cd5bf103433a', 'VIP-Ikechukwu Ekwueme', 'VIP', 1, 'qr_scan', 'Gate Officer — Chinedu', '2026-11-20 14:05:00');

-- Sample Menu Items
INSERT IGNORE INTO `menus` (`id`, `name`, `category`, `sub_category`, `vendor`, `description`, `image_url`, `image_mode`, `plates_available`, `initial_plates`, `low_alert_threshold`) VALUES
('nig_1', 'Jollof Rice + Fried Rice', 'nigerian', 'rice', 'Lagos Royal Kitchens', 'Signature smoky party jollof paired with savoury fried rice.', '/images/menu/jollof-rice.jpg', 'photo', 180, 180, 15),
('nig_2', 'Jollof Rice + Coconut Rice', 'nigerian', 'rice', 'Lagos Royal Kitchens', 'Firewood jollof combined with rich aromatic coconut rice.', '/images/menu/jollof-coconut.jpg', 'photo', 150, 150, 15),
('nig_3', 'Ofada Rice + Ayamase Sauce', 'nigerian', 'rice', 'Iya Oyo Heritage Caterers', 'Local unpolished Ofada rice served with green pepper Ayamase sauce.', '/images/menu/ofada-rice.jpg', 'photo', 120, 120, 12),
('nig_4', 'Afang Soup + Pounded Yam', 'nigerian', 'swallow', 'Calabar Pot Caterers', 'Rich leafy Afang soup loaded with assorted meats and stockfish.', '/images/menu/afang-soup.jpg', 'photo', 110, 110, 10),
('cont_1', 'Oriental Fried Rice + Prawns', 'continental', 'rice', 'Continental Executive Chefs', 'Wok-tossed oriental fried rice with garlic butter jumbo prawns.', '/images/menu/oriental-prawns.jpg', 'photo', 140, 140, 12),
('cont_2', 'Jambalaya Rice + Grilled Chicken', 'continental', 'rice', 'Continental Executive Chefs', 'Spiced Cajun jambalaya rice topped with herb-marinated grilled chicken.', '/images/menu/jambalaya-rice.jpg', 'photo', 130, 130, 12),
('cont_3', 'Singapore Noodles + Chicken Curry', 'continental', 'noodles', 'Continental Executive Chefs', 'Stir-fried vermicelli noodles with aromatic chicken curry.', '/images/menu/singapore-noodles.jpg', 'photo', 100, 100, 10);

-- Sample Order (Table 6, Seat 15 -> REN-ORD-0615)
INSERT IGNORE INTO `orders` (`id`, `guest_name`, `ticket_uuid`, `table_no`, `seat_no`, `table_number`, `seat_number`, `category`, `dish_id`, `dish_name`, `sides_json`, `proteins_json`, `status`, `print_count`, `qr_token`, `served_by`, `served_at`) VALUES
('REN-ORD-0615', 'VIP-Ikechukwu Ekwueme', '3ac85c9f-f082-4877-be2c-cd5bf103433a', 'Table 6', 'Seat 15', 6, 15, 'Nigerian Dishes', 'nig_1', 'Jollof Rice + Fried Rice', '["Plantain", "Moi Moi"]', '["Chicken", "Fish"]', 'delivered', 1, 'REN-ORD-0615', 'Chiamaka Okonjo', NOW());

-- Sample Table Seating Row synced with Order REN-ORD-0615
INSERT IGNORE INTO `table_seating` (`quad`, `table_number`, `seat_number`, `table_label`, `seat_label`, `order_id`, `seat_status`) VALUES
('A', 6, 15, 'Table 6', 'Seat 15', 'REN-ORD-0615', 'served');

-- Sample Delivery Audit Log
INSERT IGNORE INTO `delivery_audit_logs` (`order_id`, `qr_token`, `guest_name`, `table_no`, `seat_no`, `dish_name`, `action`, `performed_by`, `performed_role`, `notes`) VALUES
('REN-ORD-0615', 'REN-ORD-0615', 'VIP-Ikechukwu Ekwueme', 'Table 6', 'Seat 15', 'Jollof Rice + Fried Rice', 'scan_delivery', 'Chiamaka Okonjo', 'delivery', 'Receipt QR verified and meal delivered at Table 6 Seat 15');

-- Sample Order QR Scan Log
INSERT IGNORE INTO `order_qr_scans` (`order_id`, `qr_code_value`, `table_no`, `seat_no`, `guest_name`, `scanned_by`, `scan_result`) VALUES
('REN-ORD-0615', 'REN-ORD-0615', 'Table 6', 'Seat 15', 'VIP-Ikechukwu Ekwueme', 'Chiamaka Okonjo', 'matched_delivered');

SET FOREIGN_KEY_CHECKS = 1;
