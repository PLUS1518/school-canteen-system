const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = {
  // Проверка токена
  verifyToken: (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Токен не предоставлен'
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Неверный токен'
      });
    }
  },
  
  // Проверка роли
  checkRole: (...roles) => {
    return (req, res, next) => {
      if (!req.userRole) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не авторизован'
        });
      }
      
      if (!roles.includes(req.userRole)) {
        return res.status(403).json({
          success: false,
          error: 'Недостаточно прав'
        });
      }
      
      next();
    };
  }
};

module.exports = authMiddleware;