const marketPriceService = require('../services/marketPriceService');
const { run, get } = require('../config/database');

const getMarketPrices = async (req, res, next) => {
  try {
    const result = await marketPriceService.getMarketPrices(req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

const createOrUpdateMarketPrice = (req, res, next) => {
  try {
    const { state, district, market, category, crop, variety, min_price, max_price, modal_price, unit } = req.body;

    if (!state || !district || !market || !category || !crop || !min_price || !max_price || !modal_price) {
      return res.status(400).json({
        success: false,
        message: 'All fields (State, District, Market, Category, Crop, Min/Max/Modal prices) are required.'
      });
    }

    const today = new Date().toISOString().split('T')[0];

    const result = run(`
      INSERT INTO market_prices (state, district, market, category, crop, variety, min_price, max_price, modal_price, unit, is_demo, reported_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `, [
      state, district, market, category, crop, variety || 'Standard',
      parseFloat(min_price), parseFloat(max_price), parseFloat(modal_price), unit || 'kg', today
    ]);

    const record = get('SELECT * FROM market_prices WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Mandi benchmark price recorded.',
      priceRecord: record
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMarketPrices,
  createOrUpdateMarketPrice
};
