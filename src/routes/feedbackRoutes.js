const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Создание отзыва - только ученики
router.post(
  '/',
  authenticate,
  authorizeRoles(['student']),
  feedbackController.createFeedback
);

// Получение отзывов по блюду - публичный доступ
router.get('/meal/:mealId', feedbackController.getFeedbacksByMeal);

// Удаление отзыва - админ или автор
router.delete(
  '/:id',
  authenticate,
  feedbackController.deleteFeedback // Проверка прав внутри контроллера
);

module.exports = router;