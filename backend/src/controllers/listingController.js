const { get, query, run, transaction } = require('../config/database');
const reservationService = require('../services/reservationService');

const getAllListings = (req, res, next) => {
  try {
    const { crop, state, district, farmer_id, status } = req.query;

    let sql = `
      SELECT l.*, u.name as farmer_name, u.phone as farmer_phone
      FROM listings l
      JOIN users u ON l.farmer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (crop) {
      sql += ' AND LOWER(l.crop_name) LIKE LOWER(?)';
      params.push(`%${crop}%`);
    }
    if (state) {
      sql += ' AND LOWER(l.state) = LOWER(?)';
      params.push(state);
    }
    if (district) {
      sql += ' AND LOWER(l.district) = LOWER(?)';
      params.push(district);
    }
    if (farmer_id) {
      sql += ' AND l.farmer_id = ?';
      params.push(farmer_id);
    }
    if (status) {
      sql += ' AND l.status = ?';
      params.push(status);
    } else {
      // By default show active or partially reserved listings
      sql += " AND l.status IN ('ACTIVE', 'PARTIALLY_RESERVED')";
    }

    sql += ' ORDER BY l.created_at DESC';

    const listings = query(sql, params).map(l => ({
      ...l,
      available_qty: Number(Math.max(0, l.total_qty - (l.reserved_qty + l.confirmed_qty)).toFixed(2))
    }));

    res.json({
      success: true,
      count: listings.length,
      listings
    });
  } catch (error) {
    next(error);
  }
};

const getListingById = (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = get(`
      SELECT l.*, u.name as farmer_name, u.phone as farmer_phone, u.email as farmer_email
      FROM listings l
      JOIN users u ON l.farmer_id = u.id
      WHERE l.id = ?
    `, [id]);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Produce listing not found.' });
    }

    const calculatedAvailable = Number(
      Math.max(0, listing.total_qty - (listing.reserved_qty + listing.confirmed_qty)).toFixed(2)
    );

    res.json({
      success: true,
      listing: {
        ...listing,
        available_qty: calculatedAvailable
      }
    });
  } catch (error) {
    next(error);
  }
};

const createListing = (req, res, next) => {
  try {
    const farmerId = req.user.id;
    const {
      crop_name,
      category_name,
      variety,
      total_qty,
      unit,
      quality,
      expected_price,
      state,
      district,
      market_apmc,
      harvest_date,
      available_until,
      description,
      image_url
    } = req.body;

    if (!crop_name || !category_name || !total_qty || !expected_price || !state || !district || !market_apmc) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: Crop, Category, Total Quantity, Expected Price, State, District, and APMC Market are required.'
      });
    }

    const parsedQty = parseFloat(total_qty);
    const parsedPrice = parseFloat(expected_price);

    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({ success: false, message: 'Total quantity must be a positive number.' });
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Expected price must be a positive number.' });
    }

    // Lookup crop_id if exists
    const cropRecord = get('SELECT id FROM crops WHERE LOWER(name) = LOWER(?)', [crop_name.trim()]);
    const cropId = cropRecord ? cropRecord.id : null;

    const result = run(`
      INSERT INTO listings (
        farmer_id, crop_id, crop_name, category_name, variety,
        total_qty, available_qty, reserved_qty, confirmed_qty,
        unit, quality, expected_price, state, district, market_apmc,
        harvest_date, available_until, description, image_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `, [
      farmerId,
      cropId,
      crop_name.trim(),
      category_name.trim(),
      variety || 'Standard',
      parsedQty,
      parsedQty,
      unit || 'kg',
      quality || 'Grade A',
      parsedPrice,
      state.trim(),
      district.trim(),
      market_apmc.trim(),
      harvest_date || new Date().toISOString().split('T')[0],
      available_until || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      description || '',
      image_url || null
    ]);

    const newListing = get('SELECT * FROM listings WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Produce listed successfully on FarmLink marketplace!',
      listing: newListing
    });
  } catch (error) {
    next(error);
  }
};

const updateListing = (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const listing = get('SELECT * FROM listings WHERE id = ?', [id]);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (userRole !== 'admin' && listing.farmer_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only update your own listings.' });
    }

    const {
      expected_price,
      total_qty,
      quality,
      variety,
      available_until,
      description,
      status
    } = req.body;

    transaction(() => {
      let newTotal = listing.total_qty;
      if (total_qty !== undefined) {
        newTotal = parseFloat(total_qty);
        if (isNaN(newTotal) || newTotal < (listing.reserved_qty + listing.confirmed_qty)) {
          const err = new Error(
            `Total quantity cannot be reduced below committed quantities (Reserved: ${listing.reserved_qty}, Confirmed: ${listing.confirmed_qty}).`
          );
          err.statusCode = 400;
          throw err;
        }
      }

      const newAvailable = Number(
        Math.max(0, newTotal - (listing.reserved_qty + listing.confirmed_qty)).toFixed(2)
      );

      let newStatus = status || listing.status;
      if (newAvailable <= 0 && listing.reserved_qty > 0) {
        newStatus = 'PARTIALLY_RESERVED';
      } else if (newAvailable <= 0 && listing.confirmed_qty >= newTotal) {
        newStatus = 'SOLD_OUT';
      }

      run(`
        UPDATE listings 
        SET total_qty = ?, available_qty = ?, expected_price = COALESCE(?, expected_price),
            quality = COALESCE(?, quality), variety = COALESCE(?, variety),
            available_until = COALESCE(?, available_until), description = COALESCE(?, description),
            status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        newTotal,
        newAvailable,
        expected_price ? parseFloat(expected_price) : null,
        quality || null,
        variety || null,
        available_until || null,
        description || null,
        newStatus,
        id
      ]);
    });

    const updatedListing = get('SELECT * FROM listings WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Listing updated successfully.',
      listing: updatedListing
    });
  } catch (error) {
    next(error);
  }
};

const deleteListing = (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const listing = get('SELECT * FROM listings WHERE id = ?', [id]);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (userRole !== 'admin' && listing.farmer_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only delete your own listings.' });
    }

    if (listing.reserved_qty > 0 || listing.confirmed_qty > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete listing. It has active commitments (${listing.reserved_qty} reserved, ${listing.confirmed_qty} confirmed). You can set status to INACTIVE instead.`
      });
    }

    run('DELETE FROM listings WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Listing deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
};
