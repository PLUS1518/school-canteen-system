const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    // ИСПРАВЛЕНО: используем decoded.userId и decoded.role как в auth.js
    req.userId = decoded.userId;   // <-- было decoded.id
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Требуется аутентификация' });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    next();
  };
};

module.exports = { authenticate, authorizeRoles };