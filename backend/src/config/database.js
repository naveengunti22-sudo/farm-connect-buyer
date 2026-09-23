const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const {
  states,
  districts,
  markets,
  categories,
  crops,
  cropVarieties,
  sampleMarketPrices
} = require('../utils/seedData');

const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, '../../', process.env.DB_PATH)
  : path.resolve(__dirname, '../../farmlink.db');

const db = new DatabaseSync(dbPath);

// Enable foreign keys and WAL mode for high performance & reliability
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

function initDatabase() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('farmer', 'buyer', 'admin')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Farmer Profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS farmer_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      state TEXT,
      district TEXT,
      market_apmc TEXT,
      village TEXT,
      land_acres REAL DEFAULT 0,
      upi_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Buyer Profiles
  db.exec(`
    CREATE TABLE IF NOT EXISTS buyer_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_name TEXT,
      business_type TEXT,
      state TEXT,
      district TEXT,
      delivery_address TEXT,
      gst_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Reference Tables: States, Districts, Markets, Categories, Crops, Varieties
  db.exec(`
    CREATE TABLE IF NOT EXISTS states (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      code TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS districts (
      id INTEGER PRIMARY KEY,
      state_id INTEGER NOT NULL REFERENCES states(id),
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS markets (
      id INTEGER PRIMARY KEY,
      district_id INTEGER NOT NULL REFERENCES districts(id),
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS crops (
      id INTEGER PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      name TEXT NOT NULL,
      hindi_name TEXT,
      telugu_name TEXT,
      unit_default TEXT DEFAULT 'kg',
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS crop_varieties (
      id INTEGER PRIMARY KEY,
      crop_id INTEGER NOT NULL REFERENCES crops(id),
      name TEXT NOT NULL
    );
  `);

  // 5. Produce Listings (Farmer Listings)
  db.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_id INTEGER NOT NULL REFERENCES users(id),
      crop_id INTEGER REFERENCES crops(id),
      crop_name TEXT NOT NULL,
      category_name TEXT NOT NULL,
      variety TEXT,
      total_qty REAL NOT NULL CHECK(total_qty > 0),
      available_qty REAL NOT NULL CHECK(available_qty >= 0),
      reserved_qty REAL DEFAULT 0 CHECK(reserved_qty >= 0),
      confirmed_qty REAL DEFAULT 0 CHECK(confirmed_qty >= 0),
      unit TEXT NOT NULL DEFAULT 'kg',
      quality TEXT NOT NULL DEFAULT 'Grade A',
      expected_price REAL NOT NULL CHECK(expected_price > 0),
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      market_apmc TEXT NOT NULL,
      harvest_date TEXT,
      available_until TEXT,
      description TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'PARTIALLY_RESERVED', 'SOLD_OUT', 'INACTIVE')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Buyer Requirements (Demands)
  db.exec(`
    CREATE TABLE IF NOT EXISTS requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      buyer_id INTEGER NOT NULL REFERENCES users(id),
      crop_id INTEGER REFERENCES crops(id),
      crop_name TEXT NOT NULL,
      category_name TEXT NOT NULL,
      quantity_required REAL NOT NULL CHECK(quantity_required > 0),
      unit TEXT NOT NULL DEFAULT 'kg',
      required_quality TEXT NOT NULL DEFAULT 'Grade A',
      max_target_price REAL NOT NULL CHECK(max_target_price > 0),
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      location TEXT,
      required_date TEXT,
      description TEXT,
      status TEXT DEFAULT 'OPEN' CHECK(status IN ('OPEN', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CLOSED')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 7. Offers & Negotiation
  db.exec(`
    CREATE TABLE IF NOT EXISTS offers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requirement_id INTEGER REFERENCES requirements(id),
      listing_id INTEGER NOT NULL REFERENCES listings(id),
      farmer_id INTEGER NOT NULL REFERENCES users(id),
      buyer_id INTEGER NOT NULL REFERENCES users(id),
      quantity REAL NOT NULL CHECK(quantity > 0),
      unit TEXT NOT NULL DEFAULT 'kg',
      price_per_unit REAL NOT NULL CHECK(price_per_unit > 0),
      total_amount REAL NOT NULL CHECK(total_amount > 0),
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'COUNTERED', 'RESERVED', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'EXPIRED')),
      counter_by TEXT CHECK(counter_by IN ('farmer', 'buyer', NULL)),
      counter_price REAL,
      counter_qty REAL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 8. Offer History (Audit trail of counter-offers and status transitions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS offer_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
      actor_id INTEGER NOT NULL REFERENCES users(id),
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      price_per_unit REAL NOT NULL,
      quantity REAL NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 9. Reservations (Double-selling prevention)
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL REFERENCES listings(id),
      buyer_id INTEGER NOT NULL REFERENCES users(id),
      offer_id INTEGER UNIQUE NOT NULL REFERENCES offers(id),
      reserved_qty REAL NOT NULL CHECK(reserved_qty > 0),
      unit TEXT NOT NULL DEFAULT 'kg',
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'CONFIRMED', 'EXPIRED', 'RELEASED')),
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 10. Orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      offer_id INTEGER UNIQUE NOT NULL REFERENCES offers(id),
      listing_id INTEGER NOT NULL REFERENCES listings(id),
      farmer_id INTEGER NOT NULL REFERENCES users(id),
      buyer_id INTEGER NOT NULL REFERENCES users(id),
      crop_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      agreed_price REAL NOT NULL,
      total_amount REAL NOT NULL,
      farmer_location TEXT,
      buyer_location TEXT,
      delivery_pickup_info TEXT,
      status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK(status IN ('CONFIRMED', 'PROCESSING', 'READY', 'SHIPPED/PICKUP', 'DELIVERED', 'CANCELLED')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 11. Market Prices (APMC mandi benchmark prices)
  db.exec(`
    CREATE TABLE IF NOT EXISTS market_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      market TEXT NOT NULL,
      category TEXT NOT NULL,
      crop TEXT NOT NULL,
      variety TEXT,
      min_price REAL NOT NULL,
      max_price REAL NOT NULL,
      modal_price REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'kg',
      is_demo INTEGER NOT NULL DEFAULT 1,
      reported_date TEXT NOT NULL
    );
  `);

  // 12. Farmer Care Support Requests
  db.exec(`
    CREATE TABLE IF NOT EXISTS support_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      user_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      topic TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'CONTACTED', 'RESOLVED')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed reference data if not already present
  seedReferenceData();
  seedDemoUsersAndListings();
}

function seedReferenceData() {
  const stateCount = db.prepare('SELECT COUNT(*) as count FROM states').get().count;
  if (stateCount === 0) {
    const insertState = db.prepare('INSERT INTO states (id, name, code) VALUES (?, ?, ?)');
    for (const s of states) {
      insertState.run(s.id, s.name, s.code);
    }

    const insertDistrict = db.prepare('INSERT INTO districts (id, state_id, name) VALUES (?, ?, ?)');
    for (const d of districts) {
      insertDistrict.run(d.id, d.state_id, d.name);
    }

    const insertMarket = db.prepare('INSERT INTO markets (id, district_id, name) VALUES (?, ?, ?)');
    for (const m of markets) {
      insertMarket.run(m.id, m.district_id, m.name);
    }

    const insertCategory = db.prepare('INSERT INTO categories (id, name, description) VALUES (?, ?, ?)');
    for (const c of categories) {
      insertCategory.run(c.id, c.name, c.description);
    }

    const insertCrop = db.prepare('INSERT INTO crops (id, category_id, name, hindi_name, telugu_name, unit_default, icon) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const cr of crops) {
      insertCrop.run(cr.id, cr.category_id, cr.name, cr.hindi_name, cr.telugu_name, cr.unit_default, cr.icon);
    }

    const insertVariety = db.prepare('INSERT INTO crop_varieties (id, crop_id, name) VALUES (?, ?, ?)');
    for (const v of cropVarieties) {
      insertVariety.run(v.id, v.crop_id, v.name);
    }

    const insertPrice = db.prepare(`
      INSERT INTO market_prices (state, district, market, category, crop, variety, min_price, max_price, modal_price, unit, is_demo, reported_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);
    for (const p of sampleMarketPrices) {
      insertPrice.run(p.state, p.district, p.market, p.category, p.crop, p.variety, p.min_price, p.max_price, p.modal_price, p.unit, p.reported_date);
    }
  }
}

function seedDemoUsersAndListings() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const passwordHash = bcrypt.hashSync('Password123!', 10);
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Farmers
    const farmerA = insertUser.run('Ramesh Kumar (Farmer A)', 'farmer.ramesh@farmlink.in', '9848011111', passwordHash, 'farmer');
    const farmerB = insertUser.run('Balu Naik (Farmer B)', 'farmer.balu@farmlink.in', '9848022222', passwordHash, 'farmer');
    const farmerC = insertUser.run('Suresh Reddy (Farmer C)', 'farmer.suresh@farmlink.in', '9848033333', passwordHash, 'farmer');

    // Buyer
    const buyerA = insertUser.run('Ravi Agro Foods (Buyer A)', 'buyer.ravi@farmlink.in', '9848044444', passwordHash, 'buyer');
    const buyerB = insertUser.run('Deccan Retail Mart (Buyer B)', 'buyer.deccan@farmlink.in', '9848055555', passwordHash, 'buyer');

    // Admin
    insertUser.run('Farmlink Admin Sharma', 'admin@farmlink.in', '9848099999', passwordHash, 'admin');

    // Insert Farmer Profiles
    const insertFarmerProfile = db.prepare(`
      INSERT INTO farmer_profiles (user_id, state, district, market_apmc, village, land_acres)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertFarmerProfile.run(farmerA.lastInsertRowid, 'Telangana', 'Hyderabad', 'Bowenpally APMC Market', 'Medchal', 5.5);
    insertFarmerProfile.run(farmerB.lastInsertRowid, 'Telangana', 'Warangal', 'Enumamula APMC Market', 'Wardhannapet', 7.0);
    insertFarmerProfile.run(farmerC.lastInsertRowid, 'Telangana', 'Hyderabad', 'Bowenpally APMC Market', 'Shamshabad', 4.0);

    // Insert Buyer Profiles
    const insertBuyerProfile = db.prepare(`
      INSERT INTO buyer_profiles (user_id, company_name, business_type, state, district, delivery_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertBuyerProfile.run(buyerA.lastInsertRowid, 'Ravi Agro Foods Pvt Ltd', 'Wholesaler / Processor', 'Telangana', 'Hyderabad', 'Plot 42, IDA Kattedan, Hyderabad');
    insertBuyerProfile.run(buyerB.lastInsertRowid, 'Deccan Retail Chain', 'Supermarket Chain', 'Telangana', 'Hyderabad', 'Banjara Hills Main Road, Hyderabad');

    // Seed Listings according to the primary test case scenario:
    // Farmer A: Tomato 700 kg
    // Farmer B: Tomato 800 kg
    // Farmer C: Tomato 500 kg
    const insertListing = db.prepare(`
      INSERT INTO listings (
        farmer_id, crop_id, crop_name, category_name, variety,
        total_qty, available_qty, reserved_qty, confirmed_qty,
        unit, quality, expected_price, state, district, market_apmc,
        harvest_date, available_until, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertListing.run(
      farmerA.lastInsertRowid, 1, 'Tomato', 'Vegetables', 'Hybrid (Sahu / Shivam)',
      700, 700, 0, 0,
      'kg', 'Grade A', 24, 'Telangana', 'Hyderabad', 'Bowenpally APMC Market',
      '2026-09-22', '2026-10-05', 'Freshly harvested firm red tomatoes suitable for wholesale & retail', 'ACTIVE'
    );

    insertListing.run(
      farmerB.lastInsertRowid, 1, 'Tomato', 'Vegetables', 'Hybrid (Sahu / Shivam)',
      800, 800, 0, 0,
      'kg', 'Grade A', 23, 'Telangana', 'Warangal', 'Enumamula APMC Market',
      '2026-09-21', '2026-10-04', 'High quality premium vine ripe tomatoes grown with minimal pesticides', 'ACTIVE'
    );

    insertListing.run(
      farmerC.lastInsertRowid, 1, 'Tomato', 'Vegetables', 'Desi Country Tomato',
      500, 500, 0, 0,
      'kg', 'Grade A', 25, 'Telangana', 'Hyderabad', 'Bowenpally APMC Market',
      '2026-09-23', '2026-10-06', 'Juicy sour country tomatoes with great shelf life', 'ACTIVE'
    );

    // Also add another crop for variety (Onion and Turmeric)
    insertListing.run(
      farmerA.lastInsertRowid, 2, 'Onion', 'Vegetables', 'Nashik Red',
      1200, 1200, 0, 0,
      'kg', 'Grade A', 32, 'Telangana', 'Hyderabad', 'Bowenpally APMC Market',
      '2026-09-18', '2026-10-20', 'Dried cured medium-large red onions, clean skin', 'ACTIVE'
    );

    // Seed sample Buyer Requirement for 2,000 kg Tomato
    const insertReq = db.prepare(`
      INSERT INTO requirements (
        buyer_id, crop_id, crop_name, category_name,
        quantity_required, unit, required_quality, max_target_price,
        state, district, location, required_date, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertReq.run(
      buyerA.lastInsertRowid, 1, 'Tomato', 'Vegetables',
      2000, 'kg', 'Grade A', 26,
      'Telangana', 'Hyderabad', 'Kattedan Processing Yard, Hyderabad', '2026-10-01',
      'Immediate requirement of 2,000 kg Grade A tomatoes for sauce processing. Multiple farmer suppliers welcome.', 'OPEN'
    );
  }
}

// Database helper functions
const query = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
};

const get = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
};

const run = (sql, params = []) => {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
};

// Transaction wrapper for atomic database operations
const transaction = (fn) => {
  db.exec('BEGIN IMMEDIATE TRANSACTION;');
  try {
    const result = fn();
    db.exec('COMMIT;');
    return result;
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }
};

module.exports = {
  db,
  initDatabase,
  query,
  get,
  run,
  transaction
};
