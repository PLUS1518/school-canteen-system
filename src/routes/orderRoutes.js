const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Маршруты для ученика
router.post('/', authMiddleware.verifyToken, authMiddleware.checkRole('student'), orderController.createOrder);
router.get('/my', authMiddleware.verifyToken, authMiddleware.checkRole('student'), orderController.getMyOrders);
router.patch('/:orderId/receive', authMiddleware.verifyToken, authMiddleware.checkRole('student'), orderController.markAsIssued);

// Маршруты для повара
router.get('/cook/today', authMiddleware.verifyToken, authMiddleware.checkRole('cook', 'admin'), orderController.getOrdersByDate);
router.patch('/cook/:orderId/issue', authMiddleware.verifyToken, authMiddleware.checkRole('cook', 'admin'), orderController.markOrderAsIssuedByCook);

// Маршруты для админа
router.get('/admin/stats', authMiddleware.verifyToken, authMiddleware.checkRole('admin'), orderController.getOrderStats);

module.exports = router;