const Meal = require('../models/Meal');

const mealController = {
  // Получить все блюда (с фильтрацией)
  getAllMeals: async (req, res) => {
    try {
      const { category, type, available } = req.query;
      const where = {};
      
      if (category) where.category = category;
      if (type) where.type = type;
      if (available !== undefined) where.isAvailable = available === 'true';
      
      const meals = await Meal.findAll({ where });
      
      res.json({
        success: true,
        count: meals.length,
        meals
      });
    } catch (error) {
      console.error('Ошибка получения блюд:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  },
  
  // Получить одно блюдо по ID
  getMealById: async (req, res) => {
    try {
      const { id } = req.params;
      const meal = await Meal.findByPk(id);
      
      if (!meal) {
        return res.status(404).json({
          success: false,
          error: 'Блюдо не найдено'
        });
      }
      
      res.json({
        success: true,
        meal
      });
    } catch (error) {
      console.error('Ошибка получения блюда:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  },
  
  // Создать новое блюдо (только для повара/админа)
  createMeal: async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        category,
        type,
        calories,
        ingredients,
        allergens,
        stock,
        imageUrl
      } = req.body;
      
      if (!name || !price) {
        return res.status(400).json({
          success: false,
          error: 'Заполните название и цену'
        });
      }
      
      const meal = await Meal.create({
        name,
        description: description || '',
        price: parseFloat(price),
        category: category || 'lunch',
        type: type || 'main',
        calories: calories || null,
        ingredients: ingredients || '',
        allergens: allergens || '',
        stock: stock || 100,
        imageUrl: imageUrl || '',
        isAvailable: true
      });
      
      res.status(201).json({
        success: true,
        message: 'Блюдо создано',
        meal
      });
    } catch (error) {
      console.error('Ошибка создания блюда:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  },
  
  // Обновить блюдо (только для повара/админа)
  updateMeal: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const meal = await Meal.findByPk(id);
      if (!meal) {
        return res.status(404).json({
          success: false,
          error: 'Блюдо не найдено'
        });
      }
      
      await meal.update(updates);
      
      res.json({
        success: true,
        message: 'Блюдо обновлено',
        meal
      });
    } catch (error) {
      console.error('Ошибка обновления блюда:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  },
  
  // Удалить блюдо (только для админа)
  deleteMeal: async (req, res) => {
    try {
      const { id } = req.params;
      
      const meal = await Meal.findByPk(id);
      if (!meal) {
        return res.status(404).json({
          success: false,
          error: 'Блюдо не найдено'
        });
      }
      
      await meal.destroy();
      
      res.json({
        success: true,
        message: 'Блюдо удалено'
      });
    } catch (error) {
      console.error('Ошибка удаления блюда:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  },
  
  // Получить меню на сегодня (для учеников)
  getTodayMenu: async (req, res) => {
    try {
      // Пока просто возвращаем все доступные блюда
      // Позже можно добавить логику для разных дней
      const meals = await Meal.findAll({
        where: { isAvailable: true },
        attributes: ['id', 'name', 'description', 'price', 'category', 'type', 'calories', 'allergens']
      });
      
      // Группируем по категориям
      const menuByCategory = {
        breakfast: meals.filter(m => m.category === 'breakfast'),
        lunch: meals.filter(m => m.category === 'lunch'),
        dinner: meals.filter(m => m.category === 'dinner'),
        snack: meals.filter(m => m.category === 'snack')
      };
      
      res.json({
        success: true,
        date: new Date().toISOString().split('T')[0],
        menu: menuByCategory
      });
    } catch (error) {
      console.error('Ошибка получения меню:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  }
};

module.exports = mealController;