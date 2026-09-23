const { get, query, run } = require('../config/database');

const getAllUsers = (req, res, next) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT id, name, email, phone, role, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }
    sql += ' ORDER BY created_at DESC';

    const users = query(sql, params);
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

const getUserById = (req, res, next) => {
  try {
    const { id } = req.params;
    const user = get('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'farmer') {
      profile = get('SELECT * FROM farmer_profiles WHERE user_id = ?', [id]);
    } else if (user.role === 'buyer') {
      profile = get('SELECT * FROM buyer_profiles WHERE user_id = ?', [id]);
    }

    res.json({ success: true, user: { ...user, profile } });
  } catch (error) {
    next(error);
  }
};

const updateUser = (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    if (currentUserRole !== 'admin' && Number(id) !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this profile.' });
    }

    const { name, phone, state, district, market_apmc, company_name, delivery_address, village } = req.body;

    run(`
      UPDATE users 
      SET name = COALESCE(?, name), phone = COALESCE(?, phone)
      WHERE id = ?
    `, [name || null, phone || null, id]);

    const user = get('SELECT role FROM users WHERE id = ?', [id]);

    if (user.role === 'farmer') {
      run(`
        UPDATE farmer_profiles
        SET state = COALESCE(?, state), district = COALESCE(?, district),
            market_apmc = COALESCE(?, market_apmc), village = COALESCE(?, village)
        WHERE user_id = ?
      `, [state || null, district || null, market_apmc || null, village || null, id]);
    } else if (user.role === 'buyer') {
      run(`
        UPDATE buyer_profiles
        SET company_name = COALESCE(?, company_name), state = COALESCE(?, state),
            district = COALESCE(?, district), delivery_address = COALESCE(?, delivery_address)
        WHERE user_id = ?
      `, [company_name || null, state || null, district || null, delivery_address || null, id]);
    }

    res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser
};
