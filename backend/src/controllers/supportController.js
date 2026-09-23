const { query, run, get } = require('../config/database');

const getSupportInfo = (req, res) => {
  res.json({
    success: true,
    hotline: {
      phone: '+91 1800 327 654',
      display: '1800-FARMLINK (+91 1800 327 654)',
      availability: '24/7 Toll-Free Farmer Care Support',
      languages: ['English', 'हिन्दी (Hindi)', 'తెలుగు (Telugu)', 'தமிழ் (Tamil)', 'ಕನ್ನಡ (Kannada)', 'मराठी (Marathi)']
    },
    safeguard: {
      title: 'Farmer Confirmation Guarantee',
      notice: 'FarmLink Farmer Care representatives can assist you in navigating the platform, posting produce, or understanding mandi prices. However, customer support representatives cannot sell produce on your behalf or accept offers. Explicit farmer confirmation is always strictly required for all sales and reservations.'
    },
    topics: [
      {
        id: 'post-produce',
        title: 'How to Post Produce',
        summary: 'Learn how to list your harvest, set expected price per kg or quintal, choose your APMC market yard, and specify quality grades.',
        steps: [
          'Log in to your Farmer account and click "Publish Produce".',
          'Select your Crop (e.g., Tomato, Onion) and Variety.',
          'Enter total quantity harvested and your expected price.',
          'Choose your APMC mandi yard and district for local discovery.',
          'Click "Publish Produce". Your produce is immediately searchable and submitted to the Smart Matching Engine!'
        ]
      },
      {
        id: 'find-buyers',
        title: 'How to Find Buyers & Smart Matches',
        summary: 'Understand how FarmLink automatically scores matching buyers and combines demands.',
        steps: [
          'Visit the "Smart Matches" page from your navigation bar.',
          'Browse open buyer requirements for your crop.',
          'Check the Match Score % (Crop, Price, Location, Quality).',
          'Click "View Buyer Demand" to see delivery requirements and submit your produce offer.'
        ]
      },
      {
        id: 'understand-offers',
        title: 'How to Understand Offers & Counter-Offers',
        summary: 'Never accept an unfavorable price. Review incoming buyer offers, counter with your target rate, or accept to trigger atomic reservation.',
        steps: [
          'Go to the "Offers" tab to view incoming bids from buyers.',
          'Review the offered quantity and price per unit.',
          'If acceptable: Click "Accept Offer". The system will automatically reserve that exact quantity with a 24-hour guarantee.',
          'If price is too low: Click "Counter Offer", type your preferred price/quantity, and submit back to the buyer.',
          'If completely unacceptable: Click "Reject Offer".'
        ]
      },
      {
        id: 'smart-matching',
        title: 'How Smart Matching & Supply Aggregation Works',
        summary: 'Learn how multiple small farmers can combine supply to fulfill large institutional buyers.',
        steps: [
          'Institutional buyers (e.g. food processors) often require large quantities like 2,000 kg.',
          'FarmLink aggregates supply across multiple local farmers (e.g. 700 kg + 800 kg + 500 kg = 2,000 kg).',
          'Each farmer receives an individual offer for their exact available quantity at their agreed price.',
          'Double-selling is strictly prevented through real-time transactional locks.'
        ]
      },
      {
        id: 'market-prices',
        title: 'How to Check APMC Mandi Benchmark Prices',
        summary: 'Access verified mandi benchmark rates across Telangana, Andhra Pradesh, Maharashtra, Karnataka, and all of India.',
        steps: [
          'Navigate to "/market-prices" in the top menu.',
          'Select your State, District, and local APMC Mandi Yard.',
          'Compare the Minimum, Maximum, and Modal (Average) prices before quoting your produce.'
        ]
      },
      {
        id: 'track-orders',
        title: 'How to Track Orders & Delivery',
        summary: 'Follow your produce from confirmation to mandi yard handover and delivery.',
        steps: [
          'Once an offer is confirmed, an Order record is automatically created.',
          'Follow the stage progression: CONFIRMED → PROCESSING → READY → SHIPPED/PICKUP → DELIVERED.',
          'Exchange mandi yard pickup details directly with the verified buyer.'
        ]
      }
    ]
  });
};

const submitSupportRequest = (req, res, next) => {
  try {
    const { user_name, phone, topic, message } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!user_name || !phone || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone number, and topic are required to request a support callback.'
      });
    }

    const result = run(`
      INSERT INTO support_requests (user_id, user_name, phone, topic, message, status)
      VALUES (?, ?, ?, ?, ?, 'PENDING')
    `, [userId, user_name.trim(), phone.trim(), topic.trim(), message || 'Callback requested']);

    const newReq = get('SELECT * FROM support_requests WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Support callback request submitted! A FarmLink field officer will call your phone shortly.',
      supportRequest: newReq
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSupportInfo,
  submitSupportRequest
};
