const express = require('express');
const router = express.Router(); // <-- ЭТОЙ СТРОКИ НЕ БЫЛО!
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// Получение профиля
router.get('/profile', verifyToken, userController.getProfile);

// Пополнение баланса
router.patch('/balance', verifyToken, userController.updateBalance);

module.exports = router;