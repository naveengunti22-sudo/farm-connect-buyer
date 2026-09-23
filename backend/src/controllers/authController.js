const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, query, run, transaction } = require('../config/database');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const register = (req, res, next) => {
  try {
    const { name, email, phone, password, role, state, district, market_apmc, company_name } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, phone, password, and role are required.' });
    }

    if (!['farmer', 'buyer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be farmer, buyer, or admin.' });
    }

    const existingUser = get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const user = transaction(() => {
      const result = run(`
        INSERT INTO users (name, email, phone, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
      `, [name.trim(), email.toLowerCase().trim(), phone.trim(), passwordHash, role]);

      const userId = result.lastInsertRowid;

      if (role === 'farmer') {
        run(`
          INSERT INTO farmer_profiles (user_id, state, district, market_apmc)
          VALUES (?, ?, ?, ?)
        `, [userId, state || 'Telangana', district || 'Hyderabad', market_apmc || 'Bowenpally APMC Market']);
      } else if (role === 'buyer') {
        run(`
          INSERT INTO buyer_profiles (user_id, company_name, state, district, delivery_address)
          VALUES (?, ?, ?, ?, ?)
        `, [userId, company_name || name, state || 'Telangana', district || 'Hyderabad', 'Main Market']);
      }

      return get('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [userId]);
    });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to FarmLink India.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

const login = (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    let profile = null;
    if (user.role === 'farmer') {
      profile = get('SELECT * FROM farmer_profiles WHERE user_id = ?', [user.id]);
    } else if (user.role === 'buyer') {
      profile = get('SELECT * FROM buyer_profiles WHERE user_id = ?', [user.id]);
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile
    };

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

const me = (req, res, next) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'farmer') {
      profile = get('SELECT * FROM farmer_profiles WHERE user_id = ?', [user.id]);
    } else if (user.role === 'buyer') {
      profile = get('SELECT * FROM buyer_profiles WHERE user_id = ?', [user.id]);
    }

    res.json({
      success: true,
      user: {
        ...user,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
};

module.exports = {
  register,
  login,
  me,
  logout
};
