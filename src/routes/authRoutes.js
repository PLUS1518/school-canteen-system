const express = require('express');
const router = express.Router();

// Импортируем контроллеры и middleware
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Публичные маршруты
router.post('/register', authController.register);
router.post('/login', authController.login);

// Защищенные маршруты
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);
router.get('/users', authMiddleware.verifyToken, authMiddleware.checkRole('admin'), authController.getAllUsers);

module.exports = router;