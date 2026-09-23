const { get, query, run, transaction } = require('../config/database');
const reservationService = require('../services/reservationService');

const getAllOffers = (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status } = req.query;

    let sql = `
      SELECT o.*, 
             l.crop_name, l.variety, l.quality, l.expected_price, l.unit,
             l.state as farmer_state, l.district as farmer_district, l.market_apmc,
             farmer.name as farmer_name, farmer.phone as farmer_phone,
             buyer.name as buyer_name, buyer.phone as buyer_phone,
             r.status as reservation_status, r.expires_at as reservation_expires_at
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      JOIN users farmer ON o.farmer_id = farmer.id
      JOIN users buyer ON o.buyer_id = buyer.id
      LEFT JOIN reservations r ON o.id = r.offer_id AND r.status = 'ACTIVE'
      WHERE 1=1
    `;
    const params = [];

    if (userRole === 'farmer') {
      sql += ' AND o.farmer_id = ?';
      params.push(userId);
    } else if (userRole === 'buyer') {
      sql += ' AND o.buyer_id = ?';
      params.push(userId);
    } // Admin gets all

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY o.updated_at DESC';

    const offers = query(sql, params).map(o => {
      const history = query(`
        SELECT oh.*, u.name as actor_name 
        FROM offer_history oh
        JOIN users u ON oh.actor_id = u.id
        WHERE oh.offer_id = ?
        ORDER BY oh.created_at ASC
      `, [o.id]);
      return { ...o, history };
    });

    res.json({
      success: true,
      count: offers.length,
      offers
    });
  } catch (error) {
    next(error);
  }
};

const getOfferById = (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const offer = get(`
      SELECT o.*, 
             l.crop_name, l.variety, l.quality, l.expected_price, l.unit,
             l.state as farmer_state, l.district as farmer_district, l.market_apmc,
             farmer.name as farmer_name, farmer.phone as farmer_phone,
             buyer.name as buyer_name, buyer.phone as buyer_phone,
             r.id as reservation_id, r.status as reservation_status, r.expires_at as reservation_expires_at
      FROM offers o
      JOIN listings l ON o.listing_id = l.id
      JOIN users farmer ON o.farmer_id = farmer.id
      JOIN users buyer ON o.buyer_id = buyer.id
      LEFT JOIN reservations r ON o.id = r.offer_id AND r.status = 'ACTIVE'
      WHERE o.id = ?
    `, [id]);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    if (userRole !== 'admin' && offer.farmer_id !== userId && offer.buyer_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this offer.' });
    }

    const history = query(`
      SELECT oh.*, u.name as actor_name 
      FROM offer_history oh
      JOIN users u ON oh.actor_id = u.id
      WHERE oh.offer_id = ?
      ORDER BY oh.created_at ASC
    `, [id]);

    res.json({
      success: true,
      offer: { ...offer, history }
    });
  } catch (error) {
    next(error);
  }
};

const createOffer = (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { listing_id, requirement_id, quantity, price_per_unit, notes } = req.body;

    if (!listing_id || !quantity || !price_per_unit) {
      return res.status(400).json({
        success: false,
        message: 'Listing ID, quantity, and price per unit are required.'
      });
    }

    const parsedQty = parseFloat(quantity);
    const parsedPrice = parseFloat(price_per_unit);

    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than zero.' });
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Price per unit must be greater than zero.' });
    }

    const listing = get('SELECT * FROM listings WHERE id = ?', [listing_id]);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Produce listing not found.' });
    }

    if (listing.farmer_id === buyerId) {
      return res.status(400).json({ success: false, message: 'You cannot submit an offer on your own produce listing.' });
    }

    const available = Number(
      Math.max(0, listing.total_qty - (listing.reserved_qty + listing.confirmed_qty)).toFixed(2)
    );

    if (parsedQty > available) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${parsedQty} ${listing.unit}) exceeds currently available stock (${available} ${listing.unit}).`
      });
    }

    const totalAmount = Number((parsedQty * parsedPrice).toFixed(2));

    const newOffer = transaction(() => {
      const offerResult = run(`
        INSERT INTO offers (
          requirement_id, listing_id, farmer_id, buyer_id,
          quantity, unit, price_per_unit, total_amount, status, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
      `, [
        requirement_id || null,
        listing.id,
        listing.farmer_id,
        buyerId,
        parsedQty,
        listing.unit,
        parsedPrice,
        totalAmount,
        notes || ''
      ]);

      const offerId = offerResult.lastInsertRowid;

      run(`
        INSERT INTO offer_history (offer_id, actor_id, actor_role, action, price_per_unit, quantity, notes)
        VALUES (?, ?, 'buyer', 'CREATED', ?, ?, ?)
      `, [offerId, buyerId, parsedPrice, parsedQty, notes || 'Initial offer created by buyer']);

      return get('SELECT * FROM offers WHERE id = ?', [offerId]);
    });

    res.status(201).json({
      success: true,
      message: 'Offer sent to farmer successfully! Farmer will review and accept, counter, or reject.',
      offer: newOffer
    });
  } catch (error) {
    next(error);
  }
};

const updateOfferStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { action, counter_price, counter_qty, notes } = req.body;

    const offer = get('SELECT * FROM offers WHERE id = ?', [id]);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    if (userRole !== 'admin' && offer.farmer_id !== userId && offer.buyer_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this offer.' });
    }

    switch (action) {
      case 'accept': {
        // Farmer accepting buyer offer OR buyer accepting farmer counter offer
        if (offer.status === 'CONFIRMED') {
          return res.status(400).json({ success: false, message: 'Offer is already confirmed into an order.' });
        }

        // Determine effective price and quantity
        const effectivePrice = offer.counter_price || offer.price_per_unit;
        const effectiveQty = offer.counter_qty || offer.quantity;

        // Atomically lock & reserve quantity
        const reserveResult = reservationService.reserveQuantity(
          offer.listing_id,
          offer.buyer_id,
          offer.id,
          effectiveQty
        );

        run(`
          INSERT INTO offer_history (offer_id, actor_id, actor_role, action, price_per_unit, quantity, notes)
          VALUES (?, ?, ?, 'ACCEPTED', ?, ?, ?)
        `, [offer.id, userId, userRole, effectivePrice, effectiveQty, notes || 'Offer accepted; quantity atomically reserved for 24 hours.']);

        const updated = get('SELECT * FROM offers WHERE id = ?', [id]);
        return res.json({
          success: true,
          message: `Offer accepted! ${effectiveQty} ${offer.unit} successfully reserved. Buyer has 24 hours to make final confirmation.`,
          offer: updated,
          reservation: reserveResult
        });
      }

      case 'counter': {
        if (['CONFIRMED', 'CANCELLED', 'EXPIRED'].includes(offer.status)) {
          return res.status(400).json({ success: false, message: `Cannot counter an offer with status ${offer.status}.` });
        }

        const newPrice = parseFloat(counter_price);
        const newQty = counter_qty ? parseFloat(counter_qty) : offer.quantity;

        if (isNaN(newPrice) || newPrice <= 0) {
          return res.status(400).json({ success: false, message: 'Valid counter price is required.' });
        }
        if (isNaN(newQty) || newQty <= 0) {
          return res.status(400).json({ success: false, message: 'Valid counter quantity is required.' });
        }

        // If previously reserved, release reservation while under counter negotiation
        if (offer.status === 'RESERVED') {
          reservationService.releaseReservation(offer.id, 'countered');
        }

        const newTotal = Number((newPrice * newQty).toFixed(2));

        transaction(() => {
          run(`
            UPDATE offers 
            SET status = 'COUNTERED', counter_by = ?, counter_price = ?, counter_qty = ?, 
                price_per_unit = ?, quantity = ?, total_amount = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, [userRole, newPrice, newQty, newPrice, newQty, newTotal, notes || '', id]);

          run(`
            INSERT INTO offer_history (offer_id, actor_id, actor_role, action, price_per_unit, quantity, notes)
            VALUES (?, ?, ?, 'COUNTERED', ?, ?, ?)
          `, [id, userId, userRole, newPrice, newQty, notes || `Counter offer of ₹${newPrice}/${offer.unit} for ${newQty} ${offer.unit}`]);
        });

        const updated = get('SELECT * FROM offers WHERE id = ?', [id]);
        return res.json({
          success: true,
          message: 'Counter offer proposed successfully!',
          offer: updated
        });
      }

      case 'reject': {
        // Release reservation if active
        if (offer.status === 'RESERVED') {
          reservationService.releaseReservation(offer.id, 'rejected');
        }

        transaction(() => {
          run(`
            UPDATE offers 
            SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
          `, [id]);

          run(`
            INSERT INTO offer_history (offer_id, actor_id, actor_role, action, price_per_unit, quantity, notes)
            VALUES (?, ?, ?, 'REJECTED', ?, ?, ?)
          `, [id, userId, userRole, offer.price_per_unit, offer.quantity, notes || 'Offer declined']);
        });

        const updated = get('SELECT * FROM offers WHERE id = ?', [id]);
        return res.json({
          success: true,
          message: 'Offer rejected.',
          offer: updated
        });
      }

      case 'cancel': {
        if (offer.status === 'RESERVED') {
          reservationService.releaseReservation(offer.id, 'cancelled');
        }

        transaction(() => {
          run(`
            UPDATE offers 
            SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
          `, [id]);

          run(`
            INSERT INTO offer_history (offer_id, actor_id, actor_role, action, price_per_unit, quantity, notes)
            VALUES (?, ?, ?, 'CANCELLED', ?, ?, ?)
          `, [id, userId, userRole, offer.price_per_unit, offer.quantity, notes || 'Offer cancelled by user']);
        });

        const updated = get('SELECT * FROM offers WHERE id = ?', [id]);
        return res.json({
          success: true,
          message: 'Offer cancelled.',
          offer: updated
        });
      }

      case 'confirm': {
        // Must be in RESERVED state (or accepted)
        if (offer.status !== 'RESERVED') {
          // Attempt auto-reserve first if still pending
          if (offer.status === 'PENDING' || offer.status === 'COUNTERED') {
            reservationService.reserveQuantity(offer.listing_id, offer.buyer_id, offer.id, offer.quantity);
          } else {
            return res.status(400).json({
              success: false,
              message: `Offer cannot be confirmed from status ${offer.status}. Must be RESERVED or PENDING.`
            });
          }
        }

        // Finalize transaction: confirm reservation & create Order
        const orderResult = transaction(() => {
          reservationService.confirmReservation(offer.id);

          const listing = get('SELECT * FROM listings WHERE id = ?', [offer.listing_id]);
          const farmerProfile = get('SELECT * FROM farmer_profiles WHERE user_id = ?', [offer.farmer_id]);
          const buyerProfile = get('SELECT * FROM buyer_profiles WHERE user_id = ?', [offer.buyer_id]);

          const orderNum = `ORD-${Date.now().toString().slice(-6)}-${offer.id}`;
          const farmerLoc = `${listing.market_apmc}, ${listing.district}, ${listing.state}`;
          const buyerLoc = buyerProfile 
            ? `${buyerProfile.delivery_address || ''}, ${buyerProfile.district || ''}, ${buyerProfile.state || ''}`
            : 'Buyer Designated Warehouse';

          const createOrderRes = run(`
            INSERT INTO orders (
              order_number, offer_id, listing_id, farmer_id, buyer_id,
              crop_name, quantity, unit, agreed_price, total_amount,
              farmer_location, buyer_location, delivery_pickup_info, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')
          `, [
            orderNum,
            offer.id,
            offer.listing_id,
            offer.farmer_id,
            offer.buyer_id,
            listing.crop_name,
            offer.quantity,
            offer.unit,
            offer.price_per_unit,
            offer.total_amount,
            farmerLoc,
            buyerLoc,
            notes || 'Standard Mandi Yard Pickup / Farm Delivery arranged.',
          ]);

          run(`
            INSERT INTO offer_history (offer_id, actor_id, actor_role, action, price_per_unit, quantity, notes)
            VALUES (?, ?, ?, 'CONFIRMED', ?, ?, ?)
          `, [id, userId, userRole, offer.price_per_unit, offer.quantity, `Confirmed into Order #${orderNum}`]);

          // If requirement exists, check if fulfilled
          if (offer.requirement_id) {
            const reqRecord = get('SELECT * FROM requirements WHERE id = ?', [offer.requirement_id]);
            if (reqRecord) {
              const totalConfirmedForReq = query(`
                SELECT SUM(quantity) as sum_qty 
                FROM orders o 
                JOIN offers off ON o.offer_id = off.id 
                WHERE off.requirement_id = ?
              `, [offer.requirement_id])[0].sum_qty || 0;

              const reqStatus = totalConfirmedForReq >= reqRecord.quantity_required ? 'FULFILLED' : 'PARTIALLY_FULFILLED';
              run('UPDATE requirements SET status = ? WHERE id = ?', [reqStatus, offer.requirement_id]);
            }
          }

          return get('SELECT * FROM orders WHERE id = ?', [createOrderRes.lastInsertRowid]);
        });

        const updated = get('SELECT * FROM offers WHERE id = ?', [id]);
        return res.json({
          success: true,
          message: `Congratulations! Order #${orderResult.order_number} confirmed successfully. Double-selling permanently locked.`,
          offer: updated,
          order: orderResult
        });
      }

      default:
        return res.status(400).json({ success: false, message: `Unknown action: ${action}. Allowed: accept, counter, reject, cancel, confirm.` });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOffers,
  getOfferById,
  createOffer,
  updateOfferStatus
};
