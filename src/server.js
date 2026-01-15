const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/database');
require('dotenv').config();

// Импорт моделей
const User = require('./models/User');
const Meal = require('./models/Meal');
const Order = require('./models/Order');
const Feedback = require('./models/Feedback');
const PurchaseRequest = require('./models/PurchaseRequest');

// Импорт роутов (ВНИМАНИЕ: Убедитесь, что файл userRoutes.js существует. Если нет, удалите эту строку.)
const authRoutes = require('./routes/authRoutes');
const mealRoutes = require('./routes/mealRoutes');
const orderRoutes = require('./routes/orderRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const purchaseRequestRoutes = require('./routes/purchaseRequestRoutes');

const app = express();

// Настройка связей между моделями
if (typeof User.setupAssociations === 'function') {
  User.setupAssociations();
}

Meal.hasMany(Order, { foreignKey: 'mealId', as: 'orders' });
Order.belongsTo(Meal, { foreignKey: 'mealId', as: 'meal' });

Meal.hasMany(Feedback, { foreignKey: 'mealId', as: 'feedbacks' });
Feedback.belongsTo(Meal, { foreignKey: 'mealId', as: 'meal' });

User.hasMany(Feedback, { foreignKey: 'userId', as: 'feedbacks' });
Feedback.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(PurchaseRequest, { foreignKey: 'chefId', as: 'purchaseRequests' });
PurchaseRequest.belongsTo(User, { foreignKey: 'chefId', as: 'chef' });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логгер запросов
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  next();
});

// Подключение маршрутов
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/purchase-requests', purchaseRequestRoutes);

// Тестовый маршрут для отладки
app.post('/api/debug', (req, res) => {
  console.log('DEBUG body:', req.body);
  res.json({ body: req.body, message: 'Test successful' });
});

// Основные маршруты
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Сервер школьной столовой работает!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile (требует токен)',
        users: 'GET /api/auth/users (только admin)'
      },
      meals: {
        getAll: 'GET /api/meals',
        getToday: 'GET /api/meals/today',
        getById: 'GET /api/meals/:id',
        create: 'POST /api/meals (только cook/admin)',
        update: 'PUT /api/meals/:id (только cook/admin)',
        delete: 'DELETE /api/meals/:id (только admin)'
      },
      orders: {
        create: 'POST /api/orders (только student)',
        myOrders: 'GET /api/orders/my (только student)',
        receive: 'PATCH /api/orders/:orderId/receive (только student)',
        cookToday: 'GET /api/orders/cook/today (только cook/admin)',
        cookIssue: 'PATCH /api/orders/cook/:orderId/issue (только cook/admin)',
        adminStats: 'GET /api/orders/admin/stats (только admin)'
      },
      feedback: {
        create: 'POST /api/feedback (только student)',
        getByMeal: 'GET /api/feedback/meal/:mealId',
        delete: 'DELETE /api/feedback/:id (админ или автор)'
      },
      purchase: {
        create: 'POST /api/purchase-requests (только cook)',
        myRequests: 'GET /api/purchase-requests/my (только cook)',
        getAll: 'GET /api/purchase-requests (только admin)',
        updateStatus: 'PATCH /api/purchase-requests/:id/status (только admin)'
      },
      public: {
        health: 'GET /api/health',
        test: 'GET /api/test',
        dbTest: 'GET /api/db-test'
      }
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'school-canteen-backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Тестовый эндпоинт работает!',
    data: {
      server: 'Express',
      database: 'SQLite',
      version: '1.0.0'
    }
  });
});

app.get('/api/db-test', async (req, res) => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    
    const userCount = await User.count();
    
    if (userCount === 0) {
      await User.create({
        login: 'testuser',
        password: 'test123',
        role: 'student',
        fullName: 'Тестовый Пользователь'
      });
      console.log('✅ Создан тестовый пользователь');
    }
    
    const users = await User.findAll({
      attributes: ['id', 'login', 'role', 'fullName', 'createdAt']
    });
    
    res.json({
      success: true,
      message: 'База данных работает!',
      database: 'SQLite',
      connection: 'OK',
      usersCount: userCount,
      users: users
    });
    
  } catch (error) {
    console.error('❌ Ошибка базы данных:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка базы данных',
      message: error.message
    });
  }
});

// Обработка ошибок
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Маршрут не найден',
    path: req.url,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Ошибка сервера:', err);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных установлено');
    
    await sequelize.sync({ force: false });
    console.log('✅ Модели базы данных синхронизированы');
    
    app.listen(PORT, () => {
      console.log(`
  ========================================
  🚀 ШКОЛЬНАЯ СТОЛОВАЯ - БЭКЕНД
  ========================================
  ✅ Сервер запущен успешно!
  📡 Порт: ${PORT}
  🌐 Режим: ${process.env.NODE_ENV}
  🔗 Локальная ссылка: http://localhost:${PORT}
  
  ⏰ ${new Date().toLocaleString()}
  ========================================
      `);
    });
    
  } catch (error) {
    console.error('❌ Не удалось запустить сервер:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;