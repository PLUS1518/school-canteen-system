const jwt = require('jsonwebtoken');

// Единый middleware для ВСЕХ роутов
module.exports = {
  // Простая проверка токена
  verifyToken: (req, res, next) => {
    try {
      // Вариант 1: "Bearer TOKEN" в заголовке Authorization
      let token = req.header('Authorization')?.replace('Bearer ', '');
      
      // Вариант 2: токен в заголовке authorization
      if (!token) {
        token = req.headers['authorization']?.split(' ')[1];
      }
      
      if (!token) {
        return res.status(401).json({ success: false, error: 'Токен не предоставлен' });
      }
      
      // Декодируем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Устанавливаем данные пользователя
      req.userId = decoded.userId || decoded.id;
      req.userRole = decoded.role;
      
      next();
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Неверный токен' });
    }
  },
  
  // Проверка роли
  checkRole: (...allowedRoles) => {
    return (req, res, next) => {
      if (!req.userRole) {
        return res.status(401).json({ success: false, error: 'Роль не определена' });
      }
      
      // Проверяем, есть ли роль пользователя в списке разрешённых
      if (!allowedRoles.includes(req.userRole)) {
        return res.status(403).json({ 
          success: false, 
          error: `Доступ запрещен. Требуется роль: ${allowedRoles.join(', ')}` 
        });
      }
      
      next();
    };
  }
};