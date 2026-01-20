// Экспортируем единый middleware для всего проекта
const { verifyToken, checkRole } = require('./auth');

module.exports = {
  authenticate: verifyToken,        // алиас для совместимости
  authorizeRoles: checkRole,        // алиас для совместимости
  verifyToken,
  checkRole
};