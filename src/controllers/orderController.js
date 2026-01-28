const Order = require('../models/Order');
const Meal = require('../models/Meal');
const User = require('../models/User');
const { sequelize } = require('../config/database');

const orderController = {
  // Создать новый заказ (ученик)
  createOrder: async (req, res) => {
    try {
      const { mealId, mealType, paymentMethod, quantity = 1, notes } = req.body;
      const userId = req.userId;

      // Валидация
      if (!mealId || !mealType || !paymentMethod) {
        return res.status(400).json({
          success: false,
          error: 'Укажите блюдо, тип питания и способ оплаты'
        });
      }

      // Проверяем существует ли блюдо
      const meal = await Meal.findByPk(mealId);
      if (!meal || !meal.isAvailable) {
        return res.status(404).json({
          success: false,
          error: 'Блюдо не найдено или недоступно'
        });
      }

      // Проверяем остатки
      if (meal.stock < quantity) {
        return res.status(400).json({
          success: false,
          error: `Недостаточно порций. Доступно: ${meal.stock}`
        });
      }

      // Проверяем баланс пользователя (если оплата по подписке)
      const user = await User.findByPk(userId);
      if (paymentMethod === 'subscription' && user.balance < meal.price * quantity) {
        return res.status(400).json({
          success: false,
          error: 'Недостаточно средств на балансе'
        });
      }

      // Создаем заказ
      const order = await Order.create({
        userId,
        mealId,
        date: new Date().toISOString().split('T')[0],
        mealType,
        paymentMethod,
        price: meal.price * quantity,
        quantity,
        notes,
        status: paymentMethod === 'subscription' ? 'paid' : 'pending'
      });

      // Обновляем остатки блюда
      await meal.update({ stock: meal.stock - quantity });

      // Если оплата по подписке - списываем с баланса
      if (paymentMethod === 'subscription') {
        await user.update({ 
          balance: user.balance - (meal.price * quantity) 
        });
      }

      // Получаем полные данные заказа для ответа
      const fullOrder = await Order.findByPk(order.id, {
        include: [
          { model: Meal, as: 'meal', attributes: ['id', 'name', 'description'] },
          { model: User, as: 'user', attributes: ['id', 'fullName', 'login'] }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Заказ создан успешно',
        order: fullOrder
      });

    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера при создании заказа'
      });
    }
  },

  // Получить мои заказы (ученик)
  getMyOrders: async (req, res) => {
    try {
      const userId = req.userId;
      const { date, status } = req.query;

      const where = { userId };
      if (date) where.date = date;
      if (status) where.status = status;

      const orders = await Order.findAll({
        where,
        include: [
          { 
            model: Meal, 
            as: 'meal', 
            attributes: ['id', 'name', 'description', 'price', 'category', 'imageUrl'] 
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        count: orders.length,
        orders
      });

    } catch (error) {
      console.error('Ошибка получения заказов:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  },

  // Отметить получение питания (ученик)
  markAsIssued: async (req, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.userId;

      const order = await Order.findOne({
        where: { id: orderId, userId }
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Заказ не найден'
        });
      }

      if (order.status !== 'paid') {
        return res.status(400).json({
          success: false,
          error: 'Заказ не оплачен'
        });
      }

      if (order.status === 'issued') {
        return res.status(400).json({
          success: false,
          error: 'Заказ уже получен'
        });
      }

      await order.update({
        status: 'issued',
        issuedAt: new Date()
      });

      res.json({
        success: true,
        message: 'Питание получено',
        order
      });

    } catch (error) {
      console.error('Ошибка отметки получения:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  },

  // Получить все заказы на дату (повар)
  getOrdersByDate: async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split('T')[0];

      const orders = await Order.findAll({
        where: { date: targetDate },
        include: [
          { 
            model: Meal, 
            as: 'meal', 
            attributes: ['id', 'name', 'category'] 
          },
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'fullName', 'class'] 
          }
        ],
        order: [['mealType', 'ASC'], ['createdAt', 'ASC']]
      });

      // Группируем по типу питания
      const groupedOrders = {
        breakfast: orders.filter(o => o.mealType === 'breakfast'),
        lunch: orders.filter(o => o.mealType === 'lunch')
      };

      // Статистика
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        paid: orders.filter(o => o.status === 'paid').length,
        issued: orders.filter(o => o.status === 'issued').length
      };

      res.json({
        success: true,
        date: targetDate,
        stats,
        orders: groupedOrders
      });

    } catch (error) {
      console.error('Ошибка получения заказов:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  },

  // Отметить выдачу питания (повар)
  markOrderAsIssuedByCook: async (req, res) => {
    try {
      const { orderId } = req.params;

      const order = await Order.findByPk(orderId, {
        include: [
          { model: Meal, as: 'meal' },
          { model: User, as: 'user' }
        ]
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Заказ не найден'
        });
      }

      if (order.status !== 'paid') {
        return res.status(400).json({
          success: false,
          error: 'Заказ не оплачен'
        });
      }

      await order.update({
        status: 'issued',
        issuedAt: new Date()
      });

      res.json({
        success: true,
        message: `Питание выдано ученику ${order.user.fullName}`,
        order
      });

    } catch (error) {
      console.error('Ошибка отметки выдачи:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  },

    // Статистика по заказам (админ)
  getOrderStats: async (req, res) => {
  try {
    // Простейшая статистика без сложных запросов
    const totalOrders = await Order.count();
    
    const todayOrders = await Order.count({
      where: { status: ['paid', 'issued'] }
    });
    
    // Простая сумма без group by
    const orders = await Order.findAll({
      where: { status: ['paid', 'issued'] },
      attributes: ['price']
    });
    
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.price || 0), 0);
    
    // Без сложных группировок
    const popularMeals = [];

    res.json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        totalRevenue,
        popularMeals
      }
    });

  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка сервера при получении статистики'
    });
  }
}
};


// В orderController.js
exports.generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    
    const orders = await Order.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['fullName', 'class'] },
        { model: Meal, as: 'meal', attributes: ['name', 'price', 'category'] }
      ]
    });
    
    // Простой отчёт
    const report = {
      period: { startDate, endDate },
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.price || 0), 0),
      byCategory: {},
      orders: orders.map(order => ({
        id: order.id,
        student: order.user.fullName,
        class: order.user.class,
        meal: order.meal.name,
        price: order.price,
        date: order.createdAt
      }))
    };
    
    // Группировка по категориям
    orders.forEach(order => {
      const category = order.meal.category;
      report.byCategory[category] = (report.byCategory[category] || 0) + 1;
    });
    
    res.json({ success: true, report });
  } catch (error) {
    console.error('Ошибка генерации отчёта:', error);
    res.status(500).json({ success: false, error: 'Ошибка генерации отчёта' });
  }
};



module.exports = orderController;