const { get, query, run } = require('../config/database');

const getAdminStats = (req, res, next) => {
  try {
    const totalFarmers = get("SELECT COUNT(*) as count FROM users WHERE role = 'farmer'").count;
    const totalBuyers = get("SELECT COUNT(*) as count FROM users WHERE role = 'buyer'").count;
    const activeListings = get("SELECT COUNT(*) as count FROM listings WHERE status IN ('ACTIVE', 'PARTIALLY_RESERVED')").count;
    const activeRequirements = get("SELECT COUNT(*) as count FROM requirements WHERE status IN ('OPEN', 'PARTIALLY_FULFILLED')").count;
    const totalOffers = get("SELECT COUNT(*) as count FROM offers").count;
    const pendingOffers = get("SELECT COUNT(*) as count FROM offers WHERE status = 'PENDING'").count;
    const activeReservations = get("SELECT COUNT(*) as count FROM reservations WHERE status = 'ACTIVE'").count;
    const totalOrders = get("SELECT COUNT(*) as count FROM orders").count;
    const confirmedOrders = get("SELECT COUNT(*) as count FROM orders WHERE status = 'CONFIRMED'").count;
    const marketPriceRecords = get("SELECT COUNT(*) as count FROM market_prices").count;
    const supportPending = get("SELECT COUNT(*) as count FROM support_requests WHERE status = 'PENDING'").count;

    // Recent activity
    const recentOrders = query(`
      SELECT o.*, farmer.name as farmer_name, buyer.name as buyer_name
      FROM orders o
      JOIN users farmer ON o.farmer_id = farmer.id
      JOIN users buyer ON o.buyer_id = buyer.id
      ORDER BY o.created_at DESC LIMIT 5
    `);

    const recentOffers = query(`
      SELECT off.*, l.crop_name, farmer.name as farmer_name, buyer.name as buyer_name
      FROM offers off
      JOIN listings l ON off.listing_id = l.id
      JOIN users farmer ON off.farmer_id = farmer.id
      JOIN users buyer ON off.buyer_id = buyer.id
      ORDER BY off.created_at DESC LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        totalFarmers,
        totalBuyers,
        activeListings,
        activeRequirements,
        totalOffers,
        pendingOffers,
        activeReservations,
        totalOrders,
        confirmedOrders,
        marketPriceRecords,
        supportPending
      },
      recentOrders,
      recentOffers
    });
  } catch (error) {
    next(error);
  }
};

const addCrop = (req, res, next) => {
  try {
    const { category_id, name, hindi_name, telugu_name, unit_default, icon } = req.body;
    if (!category_id || !name) {
      return res.status(400).json({ success: false, message: 'Category ID and crop name are required.' });
    }

    const result = run(`
      INSERT INTO crops (category_id, name, hindi_name, telugu_name, unit_default, icon)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [category_id, name.trim(), hindi_name || null, telugu_name || null, unit_default || 'kg', icon || '🌾']);

    const newCrop = get('SELECT * FROM crops WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, crop: newCrop });
  } catch (error) {
    next(error);
  }
};

const addMarket = (req, res, next) => {
  try {
    const { district_id, name } = req.body;
    if (!district_id || !name) {
      return res.status(400).json({ success: false, message: 'District ID and market name are required.' });
    }

    const result = run('INSERT INTO markets (district_id, name) VALUES (?, ?)', [district_id, name.trim()]);
    const newMarket = get('SELECT * FROM markets WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, market: newMarket });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  addCrop,
  addMarket
};
