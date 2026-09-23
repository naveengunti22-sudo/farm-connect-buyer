const { get, query, run } = require('../config/database');

const getAllRequirements = (req, res, next) => {
  try {
    const { crop, state, district, buyer_id, status } = req.query;

    let sql = `
      SELECT r.*, u.name as buyer_name, u.phone as buyer_phone
      FROM requirements r
      JOIN users u ON r.buyer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (crop) {
      sql += ' AND LOWER(r.crop_name) LIKE LOWER(?)';
      params.push(`%${crop}%`);
    }
    if (state) {
      sql += ' AND LOWER(r.state) = LOWER(?)';
      params.push(state);
    }
    if (district) {
      sql += ' AND LOWER(r.district) = LOWER(?)';
      params.push(district);
    }
    if (buyer_id) {
      sql += ' AND r.buyer_id = ?';
      params.push(buyer_id);
    }
    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    } else {
      sql += " AND r.status IN ('OPEN', 'PARTIALLY_FULFILLED')";
    }

    sql += ' ORDER BY r.created_at DESC';

    const requirements = query(sql, params);

    res.json({
      success: true,
      count: requirements.length,
      requirements
    });
  } catch (error) {
    next(error);
  }
};

const getRequirementById = (req, res, next) => {
  try {
    const { id } = req.params;
    const reqRecord = get(`
      SELECT r.*, u.name as buyer_name, u.phone as buyer_phone, u.email as buyer_email
      FROM requirements r
      JOIN users u ON r.buyer_id = u.id
      WHERE r.id = ?
    `, [id]);

    if (!reqRecord) {
      return res.status(404).json({ success: false, message: 'Requirement not found.' });
    }

    res.json({
      success: true,
      requirement: reqRecord
    });
  } catch (error) {
    next(error);
  }
};

const createRequirement = (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const {
      crop_name,
      category_name,
      quantity_required,
      unit,
      required_quality,
      max_target_price,
      state,
      district,
      location,
      required_date,
      description
    } = req.body;

    if (!crop_name || !category_name || !quantity_required || !max_target_price || !state || !district) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: Crop, Category, Quantity Required, Target Price, State, and District are required.'
      });
    }

    const parsedQty = parseFloat(quantity_required);
    const parsedPrice = parseFloat(max_target_price);

    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity required must be a positive number.' });
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Target price must be a positive number.' });
    }

    const cropRecord = get('SELECT id FROM crops WHERE LOWER(name) = LOWER(?)', [crop_name.trim()]);
    const cropId = cropRecord ? cropRecord.id : null;

    const result = run(`
      INSERT INTO requirements (
        buyer_id, crop_id, crop_name, category_name,
        quantity_required, unit, required_quality, max_target_price,
        state, district, location, required_date, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')
    `, [
      buyerId,
      cropId,
      crop_name.trim(),
      category_name.trim(),
      parsedQty,
      unit || 'kg',
      required_quality || 'Grade A',
      parsedPrice,
      state.trim(),
      district.trim(),
      location || '',
      required_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      description || ''
    ]);

    const newReq = get('SELECT * FROM requirements WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Buyer requirement published! The smart matching engine will scan available supply.',
      requirement: newReq
    });
  } catch (error) {
    next(error);
  }
};

const updateRequirement = (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const reqRecord = get('SELECT * FROM requirements WHERE id = ?', [id]);
    if (!reqRecord) {
      return res.status(404).json({ success: false, message: 'Requirement not found.' });
    }

    if (userRole !== 'admin' && reqRecord.buyer_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only update your own demands.' });
    }

    const {
      quantity_required,
      max_target_price,
      required_quality,
      required_date,
      description,
      status
    } = req.body;

    run(`
      UPDATE requirements
      SET quantity_required = COALESCE(?, quantity_required),
          max_target_price = COALESCE(?, max_target_price),
          required_quality = COALESCE(?, required_quality),
          required_date = COALESCE(?, required_date),
          description = COALESCE(?, description),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      quantity_required ? parseFloat(quantity_required) : null,
      max_target_price ? parseFloat(max_target_price) : null,
      required_quality || null,
      required_date || null,
      description || null,
      status || null,
      id
    ]);

    const updated = get('SELECT * FROM requirements WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Requirement updated successfully.',
      requirement: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteRequirement = (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const reqRecord = get('SELECT * FROM requirements WHERE id = ?', [id]);
    if (!reqRecord) {
      return res.status(404).json({ success: false, message: 'Requirement not found.' });
    }

    if (userRole !== 'admin' && reqRecord.buyer_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized. You can only delete your own demands.' });
    }

    run('DELETE FROM requirements WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Requirement deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRequirements,
  getRequirementById,
  createRequirement,
  updateRequirement,
  deleteRequirement
};
