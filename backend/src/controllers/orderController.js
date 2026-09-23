const { get, query, run } = require('../config/database');

const getAllOrders = (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status } = req.query;

    let sql = `
      SELECT o.*,
             farmer.name as farmer_name, farmer.phone as farmer_phone,
             buyer.name as buyer_name, buyer.phone as buyer_phone
      FROM orders o
      JOIN users farmer ON o.farmer_id = farmer.id
      JOIN users buyer ON o.buyer_id = buyer.id
      WHERE 1=1
    `;
    const params = [];

    if (userRole === 'farmer') {
      sql += ' AND o.farmer_id = ?';
      params.push(userId);
    } else if (userRole === 'buyer') {
      sql += ' AND o.buyer_id = ?';
      params.push(userId);
    }

    if (status) {
      sql += ' AND o.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY o.created_at DESC';

    const orders = query(sql, params);

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = get(`
      SELECT o.*,
             farmer.name as farmer_name, farmer.phone as farmer_phone, farmer.email as farmer_email,
             buyer.name as buyer_name, buyer.phone as buyer_phone, buyer.email as buyer_email,
             l.variety, l.quality, l.market_apmc
      FROM orders o
      JOIN users farmer ON o.farmer_id = farmer.id
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN listings l ON o.listing_id = l.id
      WHERE o.id = ?
    `, [id]);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (userRole !== 'admin' && order.farmer_id !== userId && order.buyer_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status, delivery_pickup_info } = req.body;

    const order = get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (userRole !== 'admin' && order.farmer_id !== userId && order.buyer_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this order.' });
    }

    const allowedStatuses = ['CONFIRMED', 'PROCESSING', 'READY', 'SHIPPED/PICKUP', 'DELIVERED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status: ${status}. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    run(`
      UPDATE orders
      SET status = ?, delivery_pickup_info = COALESCE(?, delivery_pickup_info), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, delivery_pickup_info || null, id]);

    const updated = get('SELECT * FROM orders WHERE id = ?', [id]);
    res.json({
      success: true,
      message: `Order status updated to '${status}'.`,
      order: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
