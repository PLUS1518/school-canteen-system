const Feedback = require('../models/Feedback');
const Meal = require('../models/Meal');
const User = require('../models/User');

exports.createFeedback = async (req, res) => {
  try {
    const { mealId, rating, comment } = req.body;
    const userId = req.userId; // id из authMiddleware

    // Проверяем, существует ли блюдо
    const meal = await Meal.findByPk(mealId);
    if (!meal) {
      return res.status(404).json({ success: false, error: 'Блюдо не найдено' });
    }

    // Проверяем, не оставлял ли пользователь уже отзыв на это блюдо
    const existingFeedback = await Feedback.findOne({
      where: { userId, mealId }
    });
    if (existingFeedback) {
      return res.status(400).json({ success: false, error: 'Вы уже оставляли отзыв на это блюдо' });
    }

    // Создаем отзыв
    const feedback = await Feedback.create({
      userId,
      mealId,
      rating,
      comment
    });

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    console.error('Ошибка создания отзыва:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

exports.getFeedbacksByMeal = async (req, res) => {
  try {
    const { mealId } = req.params;

    const feedbacks = await Feedback.findAll({
      where: { mealId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'class']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, feedbacks });
  } catch (error) {
    console.error('Ошибка получения отзывов:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole; // роль из authMiddleware

    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Отзыв не найден' });
    }

    // Удалить может только админ или автор отзыва
    if (userRole !== 'admin' && feedback.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Нет прав для удаления' });
    }

    await feedback.destroy();
    res.json({ success: true, message: 'Отзыв удален' });
  } catch (error) {
    console.error('Ошибка удаления отзыва:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};