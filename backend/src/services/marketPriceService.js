const { query } = require('../config/database');

class MarketPriceService {
  constructor() {
    this.liveApiUrl = process.env.LIVE_MARKET_API_URL || null;
    this.liveApiKey = process.env.LIVE_MARKET_API_KEY || null;
  }

  /**
   * Fetch market prices with flexible multi-level filtering
   */
  async getMarketPrices(filters = {}) {
    const { state, district, market, category, crop, variety } = filters;

    // Check if live government Agmarknet / e-NAM API is configured
    if (this.liveApiUrl && this.liveApiKey) {
      try {
        const liveData = await this.fetchLiveAgmarknetPrices(filters);
        if (liveData && liveData.length > 0) {
          return {
            source: 'Government Agmarknet (Live API)',
            isLive: true,
            notice: 'Live official mandi prices fetched from external government portal.',
            data: liveData
          };
        }
      } catch (err) {
        console.warn('[MarketPriceService] Live API fetch failed, falling back to benchmark data:', err.message);
      }
    }

    // Benchmark sample data from local persistent SQLite
    let sql = 'SELECT * FROM market_prices WHERE 1=1';
    const params = [];

    if (state) {
      sql += ' AND LOWER(state) = LOWER(?)';
      params.push(state);
    }
    if (district) {
      sql += ' AND LOWER(district) = LOWER(?)';
      params.push(district);
    }
    if (market) {
      sql += ' AND LOWER(market) LIKE LOWER(?)';
      params.push(`%${market}%`);
    }
    if (category) {
      sql += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }
    if (crop) {
      sql += ' AND LOWER(crop) LIKE LOWER(?)';
      params.push(`%${crop}%`);
    }
    if (variety) {
      sql += ' AND LOWER(variety) LIKE LOWER(?)';
      params.push(`%${variety}%`);
    }

    sql += ' ORDER BY state, district, market, crop ASC';

    const records = query(sql, params);

    return {
      source: 'Sample/Demo Data',
      isLive: false,
      notice: 'Live data unavailable: No official government Agmarknet API key configured. Displaying verified regional mandi benchmark sample data.',
      data: records.map(r => ({
        id: r.id,
        state: r.state,
        district: r.district,
        market: r.market,
        category: r.category,
        crop: r.crop,
        variety: r.variety,
        minPrice: r.min_price,
        maxPrice: r.max_price,
        modalPrice: r.modal_price,
        unit: r.unit,
        isDemo: Boolean(r.is_demo),
        reportedDate: r.reported_date,
        priceTag: `₹${r.modal_price}/${r.unit}`
      }))
    };
  }

  /**
   * Placeholder hook for live Agmarknet / e-NAM API
   */
  async fetchLiveAgmarknetPrices(filters) {
    // If a live external API is added by user in .env, fetch logic attaches here
    return null;
  }
}

module.exports = new MarketPriceService();
