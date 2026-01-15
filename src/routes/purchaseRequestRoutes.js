const express = require('express');
const router = express.Router();
const purchaseRequestController = require('../controllers/purchaseRequestController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

// Повар создает заявку
router.post('/', authenticate, authorizeRoles(['cook']), purchaseRequestController.createRequest);
// Повар смотрит свои заявки
router.get('/my', authenticate, authorizeRoles(['cook']), purchaseRequestController.getMyRequests);
// Админ смотрит все заявки
router.get('/', authenticate, authorizeRoles(['admin']), purchaseRequestController.getAllRequests);
// Админ согласовывает/отклоняет
router.patch('/:id/status', authenticate, authorizeRoles(['admin']), purchaseRequestController.updateRequestStatus);

module.exports = router;