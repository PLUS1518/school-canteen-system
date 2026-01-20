const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Создание отзыва - только ученики
router.post('/', verifyToken, checkRole('student'), feedbackController.createFeedback);

// Получение отзывов по блюду - публичный доступ
router.get('/meal/:mealId', feedbackController.getFeedbacksByMeal);

// Удаление отзыва - админ или автор (проверка внутри контроллера)
router.delete('/:id', verifyToken, feedbackController.deleteFeedback);

module.exports = router;