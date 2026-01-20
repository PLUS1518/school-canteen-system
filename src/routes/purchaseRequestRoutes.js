const express = require('express');
const router = express.Router();
const purchaseRequestController = require('../controllers/purchaseRequestController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Повар создает заявку
router.post('/', verifyToken, checkRole('cook'), purchaseRequestController.createRequest);

// Повар смотрит свои заявки
router.get('/my', verifyToken, checkRole('cook'), purchaseRequestController.getMyRequests);

// Админ смотрит все заявки
router.get('/', verifyToken, checkRole('admin'), purchaseRequestController.getAllRequests);

// Админ согласовывает/отклоняет
router.patch('/:id/status', verifyToken, checkRole('admin'), purchaseRequestController.updateRequestStatus);

module.exports = router;