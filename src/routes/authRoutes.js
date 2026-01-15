const express = require('express');
const router = express.Router();

// ДОБАВЬ ТУТ:
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Публичные маршруты
router.post('/register', authController.register);
router.post('/login', authController.login);

// Защищенные маршруты
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);
router.get('/users', authMiddleware.verifyToken, authMiddleware.checkRole('admin'), authController.getAllUsers);

module.exports = router;