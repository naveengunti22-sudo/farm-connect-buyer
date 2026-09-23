const express = require('express');
const router = express.Router();

const { authenticateToken, requireRole, optionalAuth } = require('../middleware/authMiddleware');

const authController = require('../controllers/authController');
const listingController = require('../controllers/listingController');
const requirementController = require('../controllers/requirementController');
const matchController = require('../controllers/matchController');
const offerController = require('../controllers/offerController');
const orderController = require('../controllers/orderController');
const marketPriceController = require('../controllers/marketPriceController');
const chatController = require('../controllers/chatController');
const supportController = require('../controllers/supportController');
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const metadataController = require('../controllers/metadataController');

// 1. Health & Reference Data
router.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'FarmLink India Marketplace API',
    database: 'SQLite (node:sqlite ACID WAL)',
    timestamp: new Date().toISOString()
  });
});
router.get('/metadata/reference', metadataController.getReferenceData);

// 2. Authentication
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authenticateToken, authController.me);

// 3. Produce Listings (Farmer)
router.get('/listings', listingController.getAllListings);
router.get('/listings/:id', listingController.getListingById);
router.post('/listings', authenticateToken, requireRole('farmer', 'admin'), listingController.createListing);
router.patch('/listings/:id', authenticateToken, requireRole('farmer', 'admin'), listingController.updateListing);
router.delete('/listings/:id', authenticateToken, requireRole('farmer', 'admin'), listingController.deleteListing);

// 4. Buyer Requirements (Demands)
router.get('/requirements', requirementController.getAllRequirements);
router.get('/requirements/:id', requirementController.getRequirementById);
router.post('/requirements', authenticateToken, requireRole('buyer', 'admin'), requirementController.createRequirement);
router.patch('/requirements/:id', authenticateToken, requireRole('buyer', 'admin'), requirementController.updateRequirement);
router.delete('/requirements/:id', authenticateToken, requireRole('buyer', 'admin'), requirementController.deleteRequirement);

// 5. Smart Matching Engine & Supply Aggregator
router.get('/matches', optionalAuth, matchController.getMatches);

// 6. Offers & Negotiation
router.get('/offers', authenticateToken, offerController.getAllOffers);
router.get('/offers/:id', authenticateToken, offerController.getOfferById);
router.post('/offers', authenticateToken, requireRole('buyer', 'admin'), offerController.createOffer);
router.patch('/offers/:id', authenticateToken, offerController.updateOfferStatus);

// 7. Orders
router.get('/orders', authenticateToken, orderController.getAllOrders);
router.get('/orders/:id', authenticateToken, orderController.getOrderById);
router.patch('/orders/:id', authenticateToken, orderController.updateOrderStatus);

// 8. Market Prices (APMC Mandi Rates)
router.get('/market-prices', marketPriceController.getMarketPrices);
router.post('/market-prices', authenticateToken, requireRole('admin'), marketPriceController.createOrUpdateMarketPrice);

// 9. FarmLink AI Assistant
router.post('/chat', optionalAuth, chatController.handleChat);

// 10. Farmer Care & Support
router.get('/support', supportController.getSupportInfo);
router.post('/support', optionalAuth, supportController.submitSupportRequest);

// 11. Users & Admin
router.get('/users', authenticateToken, userController.getAllUsers);
router.get('/users/:id', authenticateToken, userController.getUserById);
router.patch('/users/:id', authenticateToken, userController.updateUser);
router.get('/admin/stats', authenticateToken, requireRole('admin'), adminController.getAdminStats);
router.post('/admin/crops', authenticateToken, requireRole('admin'), adminController.addCrop);
router.post('/admin/markets', authenticateToken, requireRole('admin'), adminController.addMarket);

module.exports = router;
