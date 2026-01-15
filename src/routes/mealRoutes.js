const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const authMiddleware = require('../middleware/auth');

// Публичные маршруты (доступны всем)
router.get('/', mealController.getAllMeals);
router.get('/today', mealController.getTodayMenu);
router.get('/:id', mealController.getMealById);

// Защищенные маршруты (только для повара и админа)
router.post('/', authMiddleware.verifyToken, authMiddleware.checkRole('cook', 'admin'), mealController.createMeal);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.checkRole('cook', 'admin'), mealController.updateMeal);

// Только для админа
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.checkRole('admin'), mealController.deleteMeal);

module.exports = router;