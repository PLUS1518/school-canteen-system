const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authController = {
  // Регистрация
  register: async (req, res) => {
    try {
      const { login, password, role, fullName, allergies, preferences, class: userClass } = req.body;
      
      // Валидация
      if (!login || !password || !fullName) {
        return res.status(400).json({
          success: false,
          error: 'Заполните обязательные поля: логин, пароль и ФИО'
        });
      }
      
      // Проверка на существующего пользователя
      const existingUser = await User.findOne({ where: { login } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Пользователь с таким логином уже существует'
        });
      }
      
      // Создание пользователя
      const user = await User.create({
        login,
        password,
        role: role || 'student',
        fullName,
        allergies: allergies || '',
        preferences: preferences || '',
        class: userClass || '',
        balance: 0.00
      });
      
      // Создание токена
      const token = jwt.sign(
        { userId: user.id, role: user.role, login: user.login },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      // Ответ без пароля
      const userResponse = user.toJSON();
      delete userResponse.password;
      
      res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        user: userResponse,
        token
      });
      
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера при регистрации'
      });
    }
  },
  
  // Авторизация
  login: async (req, res) => {
    try {
      const { login, password } = req.body;
      
      if (!login || !password) {
        return res.status(400).json({
          success: false,
          error: 'Введите логин и пароль'
        });
      }
      
      // Поиск пользователя
      const user = await User.findOne({ where: { login } });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Неверный логин или пароль'
        });
      }
      
      // Проверка пароля
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Неверный логин или пароль'
        });
      }
      
      // Создание токена
      const token = jwt.sign(
        { userId: user.id, role: user.role, login: user.login },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      // Ответ без пароля
      const userResponse = user.toJSON();
      delete userResponse.password;
      
      res.json({
        success: true,
        message: 'Авторизация успешна',
        user: userResponse,
        token
      });
      
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера при авторизации'
      });
    }
  },
  
  // Получение профиля
  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Пользователь не найден'
        });
      }
      
      res.json({
        success: true,
        user
      });
      
    } catch (error) {
      console.error('Ошибка получения профиля:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  },
  
  // Получение всех пользователей (только для админа)
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });
      
      res.json({
        success: true,
        count: users.length,
        users
      });
      
    } catch (error) {
      console.error('Ошибка получения пользователей:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера'
      });
    }
  }
};

module.exports = authController;