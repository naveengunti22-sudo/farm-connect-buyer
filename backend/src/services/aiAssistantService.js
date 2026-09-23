const { query, get } = require('../config/database');

class AIAssistantService {
  /**
   * Process user chat query with context awareness and live marketplace database lookup
   */
  async processMessage({ message, userContext = {} }) {
    const text = (message || '').trim().toLowerCase();
    const state = userContext.state || null;
    const district = userContext.district || null;
    const role = userContext.role || 'farmer';

    // 1. Detect location mentions in query
    const detectedLocation = this.extractLocation(text) || district || state || 'Telangana';

    // 2. Detect crop mentions in query
    const detectedCrop = this.extractCrop(text);

    // 3. Match queries
    // Query Type A: "Who is buying [crop] near [location]?" or Buyer Demand Query
    if (text.includes('who is buying') || text.includes('buyer') || text.includes('demand') || text.includes('buying')) {
      return this.handleBuyerQuery(detectedCrop, detectedLocation);
    }

    // Query Type B: "Where can I buy [crop]?" or Farmer Produce Listings Query
    if (text.includes('where can i buy') || text.includes('who is selling') || text.includes('farmer') || text.includes('available produce') || text.includes('find tomato') || text.includes('find produce')) {
      return this.handleFarmerQuery(detectedCrop, detectedLocation);
    }

    // Query Type C: Market Price / APMC Mandi Price Questions
    if (text.includes('price') || text.includes('rate') || text.includes('mandi') || text.includes('apmc') || text.includes('modal')) {
      return this.handlePriceQuery(detectedCrop, detectedLocation);
    }

    // Query Type D: Smart Match & Supply Aggregation Explanation
    if (text.includes('match') || text.includes('how matching works') || text.includes('smart match') || text.includes('combine')) {
      return this.handleMatchingExplanation();
    }

    // Query Type E: Negotiation Advice
    if (text.includes('negotiat') || text.includes('counter') || text.includes('bargain') || text.includes('offer')) {
      return this.handleNegotiationAdvice(detectedCrop, detectedLocation);
    }

    // Query Type F: Farmer Care / Support
    if (text.includes('support') || text.includes('help') || text.includes('call') || text.includes('care') || text.includes('contact')) {
      return {
        reply: `📞 **FarmLink Farmer Care Hotline**: Call toll-free at **1800-FARMLINK (+91 1800 327 654)**.\n\nOur agricultural support officers can assist you with posting produce, understanding offers, and navigation. Note that customer support cannot sell produce on your behalf—your explicit confirmation is always required!`,
        suggestions: [
          'Who is buying tomatoes near Hyderabad?',
          'What is the mandi price of Turmeric?',
          'How does partial quantity matching work?'
        ],
        assistantType: 'Rule-Based FarmLink Assistant'
      };
    }

    // Default contextual answer
    return {
      reply: `Namaste! I am your **FarmLink AI Assistant** (connected to real-time marketplace data across all Indian states and APMCs).\n\nYou can ask me:\n• *"Who is buying tomatoes near Hyderabad?"*\n• *"What is the market price of Onion in Nashik?"*\n• *"Who has Grade A wheat available?"*\n• *"How does partial quantity combination work?"*\n• *"Tips for negotiating my offer price"*`,
      suggestions: [
        'Who is buying tomatoes near Hyderabad?',
        'Current market price of Turmeric',
        'How does smart matching work?'
      ],
      assistantType: 'Rule-Based FarmLink Assistant'
    };
  }

  handleBuyerQuery(crop, location) {
    let sql = `
      SELECT r.*, u.name as buyer_name, u.phone as buyer_phone
      FROM requirements r
      JOIN users u ON r.buyer_id = u.id
      WHERE r.status IN ('OPEN', 'PARTIALLY_FULFILLED')
    `;
    const params = [];

    if (crop) {
      sql += ' AND LOWER(r.crop_name) LIKE LOWER(?)';
      params.push(`%${crop}%`);
    }
    if (location) {
      sql += ' AND (LOWER(r.district) LIKE LOWER(?) OR LOWER(r.state) LIKE LOWER(?) OR LOWER(r.location) LIKE LOWER(?))';
      params.push(`%${location}%`, `%${location}%`, `%${location}%`);
    }

    sql += ' ORDER BY r.quantity_required DESC LIMIT 5';
    const buyers = query(sql, params);

    if (buyers.length === 0) {
      return {
        reply: `Currently, there are no open buyer demands matching ${crop ? `**${crop}**` : 'crops'} in **${location}**. However, you can publish your produce on FarmLink, and our Smart Matching engine will immediately alert buyers when demands are posted!`,
        suggestions: ['Publish Produce', 'Check Market Prices', 'Who is buying Onion?'],
        assistantType: 'Rule-Based FarmLink Assistant'
      };
    }

    let response = `Found **${buyers.length} verified buyer requirement(s)** ${crop ? `for **${crop}**` : ''} in/near **${location}**:\n\n`;
    buyers.forEach((b, i) => {
      response += `${i + 1}. **${b.buyer_name}** is buying **${b.quantity_required} ${b.unit} of ${b.crop_name}** (${b.required_quality})\n`;
      response += `   • Target Price: **₹${b.max_target_price}/${b.unit}**\n`;
      response += `   • Delivery Point: ${b.location || b.district}, ${b.state}\n`;
      response += `   • Required By: ${b.required_date || 'Immediate'}\n\n`;
    });

    response += `💡 *Tip: You can submit an offer directly to these buyers from your Produce Listings or Smart Matches page.*`;

    return {
      reply: response,
      data: buyers,
      suggestions: ['How to send an offer?', 'Check modal mandi price', 'Publish new produce'],
      assistantType: 'Rule-Based FarmLink Assistant'
    };
  }

  handleFarmerQuery(crop, location) {
    let sql = `
      SELECT l.*, u.name as farmer_name
      FROM listings l
      JOIN users u ON l.farmer_id = u.id
      WHERE l.status IN ('ACTIVE', 'PARTIALLY_RESERVED') AND l.available_qty > 0
    `;
    const params = [];

    if (crop) {
      sql += ' AND LOWER(l.crop_name) LIKE LOWER(?)';
      params.push(`%${crop}%`);
    }
    if (location) {
      sql += ' AND (LOWER(l.district) LIKE LOWER(?) OR LOWER(l.state) LIKE LOWER(?) OR LOWER(l.market_apmc) LIKE LOWER(?))';
      params.push(`%${location}%`, `%${location}%`, `%${location}%`);
    }

    sql += ' ORDER BY l.expected_price ASC LIMIT 5';
    const listings = query(sql, params);

    if (listings.length === 0) {
      return {
        reply: `Currently, no active farmer listings were found ${crop ? `for **${crop}**` : ''} in **${location}**. You can post a Buyer Requirement to attract farmers from surrounding districts!`,
        suggestions: ['Publish Requirement', 'Check All India Listings', 'Contact Farmer Care'],
        assistantType: 'Rule-Based FarmLink Assistant'
      };
    }

    let response = `Found **${listings.length} verified farmer listing(s)** ${crop ? `for **${crop}**` : ''} in/near **${location}**:\n\n`;
    listings.forEach((l, i) => {
      response += `${i + 1}. **${l.farmer_name}**: **${l.available_qty} ${l.unit}** available (Total: ${l.total_qty} ${l.unit})\n`;
      response += `   • Expected Price: **₹${l.expected_price}/${l.unit}** | Quality: ${l.quality}\n`;
      response += `   • APMC Yard: ${l.market_apmc}, ${l.district}\n\n`;
    });

    response += `💡 *FarmLink enables partial supply aggregation: You can combine supply from multiple farmers to meet your total volume requirements.*`;

    return {
      reply: response,
      data: listings,
      suggestions: ['How does multi-farmer supply aggregation work?', 'Post Buyer Demand'],
      assistantType: 'Rule-Based FarmLink Assistant'
    };
  }

  handlePriceQuery(crop, location) {
    let sql = 'SELECT * FROM market_prices WHERE 1=1';
    const params = [];

    if (crop) {
      sql += ' AND LOWER(crop) LIKE LOWER(?)';
      params.push(`%${crop}%`);
    }
    if (location) {
      sql += ' AND (LOWER(district) LIKE LOWER(?) OR LOWER(state) LIKE LOWER(?) OR LOWER(market) LIKE LOWER(?))';
      params.push(`%${location}%`, `%${location}%`, `%${location}%`);
    }

    sql += ' LIMIT 5';
    let prices = query(sql, params);

    // Fallback if no specific price matched
    if (prices.length === 0 && crop) {
      prices = query('SELECT * FROM market_prices WHERE LOWER(crop) LIKE LOWER(?) LIMIT 3', [`%${crop}%`]);
    }

    if (prices.length === 0) {
      return {
        reply: `No market price records found for ${crop || 'the specified crop'} in ${location}. You can visit the **/market-prices** page to browse benchmark prices across all APMC mandis.`,
        suggestions: ['Go to Market Prices', 'Who is buying Tomato?', 'Help me negotiate'],
        assistantType: 'Rule-Based FarmLink Assistant'
      };
    }

    let response = `📊 **APMC Mandi Benchmark Prices** (Sample Benchmark Data):\n\n`;
    prices.forEach((p, i) => {
      response += `${i + 1}. **${p.crop}** (${p.variety || 'Standard'}) at **${p.market}** (${p.district}, ${p.state}):\n`;
      response += `   • Modal (Avg) Price: **₹${p.modal_price}/${p.unit}**\n`;
      response += `   • Price Band: Min ₹${p.min_price} – Max ₹${p.max_price} per ${p.unit}\n`;
      response += `   • Reported Date: ${p.reported_date}\n\n`;
    });

    response += `ℹ️ *Note: These are verified mandi benchmark sample rates. External live Agmarknet API integration is supported.*`;

    return {
      reply: response,
      data: prices,
      suggestions: ['Help me negotiate', 'Who is buying this crop?'],
      assistantType: 'Rule-Based FarmLink Assistant'
    };
  }

  handleMatchingExplanation() {
    return {
      reply: `🌾 **How FarmLink Smart Matching & Partial Supply Works**:\n\n` +
        `1. **Multi-Factor Score (0–100%)**:\n` +
        `   • Crop Compatibility (35% weight)\n` +
        `   • Price Alignment against target budget (25% weight)\n` +
        `   • Geographic proximity by APMC/District/State (20% weight)\n` +
        `   • Quality grading standard (10% weight)\n` +
        `   • Harvest date availability (10% weight)\n\n` +
        `2. **Partial Quantity Aggregation**:\n` +
        `   • If a buyer needs 2,000 kg and no single farmer has 2,000 kg, FarmLink intelligently aggregates supply (e.g. Farmer A 700 kg + Farmer B 800 kg + Farmer C 500 kg = 2,000 kg).\n\n` +
        `3. **Double-Selling Prevention**:\n` +
        `   • When an offer is accepted, the system atomically reserves the quantity with a 24h lock. No other buyer can reserve that same stock!`,
      suggestions: ['Test 2,000 kg Tomato aggregation', 'Check my smart matches', 'Call Farmer Care'],
      assistantType: 'Rule-Based FarmLink Assistant'
    };
  }

  handleNegotiationAdvice(crop, location) {
    return {
      reply: `🤝 **FarmLink Negotiation Guidance**:\n\n` +
        `1. **Check Mandi Benchmarks**: Always consult modal APMC rates on **/market-prices** before agreeing to prices.\n` +
        `2. **Counter Offers**: In FarmLink, you never have to outright reject. Submit a Counter-Offer specifying your counter price and available quantity.\n` +
        `3. **Volume Discounts**: For bulk buyers ordering over 1,000 kg, offering a ₹1–₹2/kg buffer often speeds up 100% reservation confirmation.\n` +
        `4. **Quality Justification**: If your produce is Grade A or organic certified, specify it in your listing to justify a premium above mandi modal price.`,
      suggestions: ['What is the mandi price of Tomato?', 'View pending offers'],
      assistantType: 'Rule-Based FarmLink Assistant'
    };
  }

  extractLocation(text) {
    const locations = [
      'hyderabad', 'warangal', 'nizamabad', 'khammam', 'karimnagar',
      'guntur', 'krishna', 'kurnool', 'chittoor',
      'nashik', 'pune', 'nagpur', 'solapur',
      'bengaluru', 'kolar', 'belagavi', 'dharwad',
      'chennai', 'coimbatore', 'madurai',
      'ludhiana', 'amritsar',
      'varanasi', 'agra',
      'telangana', 'andhra pradesh', 'maharashtra', 'karnataka', 'tamil nadu', 'punjab', 'uttar pradesh'
    ];

    for (const loc of locations) {
      if (text.includes(loc)) {
        return loc.charAt(0).toUpperCase() + loc.slice(1);
      }
    }
    return null;
  }

  extractCrop(text) {
    const crops = [
      'tomato', 'onion', 'potato', 'mango', 'banana', 'rice', 'wheat',
      'maize', 'jowar', 'bajra', 'ragi', 'foxtail', 'red gram', 'tur',
      'green gram', 'moong', 'groundnut', 'sesame', 'chilli', 'turmeric', 'cotton'
    ];

    for (const c of crops) {
      if (text.includes(c)) {
        if (c === 'tur') return 'Red Gram (Tur / Arhar)';
        if (c === 'moong') return 'Green Gram (Moong)';
        return c.charAt(0).toUpperCase() + c.slice(1);
      }
    }
    return null;
  }
}

module.exports = new AIAssistantService();
