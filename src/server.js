const express = require('express');
const mealRoutes = require('./routes/mealRoutes');
const cors = require('cors');
require('dotenv').config();

// Импорт базы данных и моделей
const { sequelize } = require('./config/database');
const User = require('./models/User');

// Импорт роутов
const authRoutes = require('./routes/authRoutes');

const app = express();

// ======================
// Middleware
// ======================
app.use('/api/meals', mealRoutes);
app.use(cors());
app.use(express.json());

// Логгер запросов
app.use((req, res, next) => {
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  next();
});

// ======================
// Подключение роутов
// ======================
app.use('/api/auth', authRoutes);

// ======================
// Маршруты
// ======================

// Главная страница
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
      public: {
        health: 'GET /api/health',
        test: 'GET /api/test'
      }
    }
  });
});

// Проверка здоровья сервера
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'school-canteen-backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Тестовый маршрут
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

// Тест базы данных
app.get('/api/db-test', async (req, res) => {
  try {
    // Проверяем подключение к БД
    await sequelize.authenticate();
    
    // Синхронизируем модели (создаем таблицы если их нет)
    await sequelize.sync({ force: false });
    
    // Проверяем есть ли пользователи
    const userCount = await User.count();
    
    // Создаем тестового пользователя если база пустая
    if (userCount === 0) {
      await User.create({
        login: 'testuser',
        password: 'test123',
        role: 'student',
        fullName: 'Тестовый Пользователь'
      });
      console.log('✅ Создан тестовый пользователь');
    }
    
    // Получаем всех пользователей
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

// ======================
// Обработка ошибок
// ======================

// Обработка 404 ошибок
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Маршрут не найден',
    path: req.url,
    method: req.method
  });
});

// Обработка ошибок сервера
app.use((err, req, res, next) => {
  console.error('🔥 Ошибка сервера:', err);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
  });
});

// ======================
// Запуск сервера
// ======================
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Проверяем подключение к БД
    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных установлено');
    
    // Синхронизируем модели
    await sequelize.sync({ force: false });
    console.log('✅ Модели базы данных синхронизированы');
    
    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`
  ========================================
  🚀 ШКОЛЬНАЯ СТОЛОВАЯ - БЭКЕНД
  ========================================
  ✅ Сервер запущен успешно!
  📡 Порт: ${PORT}
  🌐 Режим: ${process.env.NODE_ENV}
  🔗 Локальная ссылка: http://localhost:${PORT}
  
  📋 Доступные маршруты:
  
  🔐 Аутентификация:
     • POST /api/auth/register  - Регистрация
     • POST /api/auth/login     - Авторизация
     • GET  /api/auth/profile   - Профиль (требует токен)
     • GET  /api/auth/users     - Все пользователи (только admin)
  
  🌐 Публичные:
     • GET  /                   - Главная страница
     • GET  /api/health         - Статус сервера
     • GET  /api/test           - Тестовый endpoint
     • GET  /api/db-test        - Тест базы данных
  
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