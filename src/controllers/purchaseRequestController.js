const PurchaseRequest = require('../models/PurchaseRequest');
const User = require('../models/User');


// Повар создает заявку
exports.createRequest = async (req, res) => {
  try {
    const { items, reason } = req.body;
    const chefId = req.userId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Необходимо указать минимум один товар' });
    }

    // Простой расчёт суммы
    const totalAmount = items.reduce((sum, item) => {
      return sum + (parseFloat(item.estimatedPrice) || 0) * (parseInt(item.quantity) || 0);
    }, 0);

    const request = await PurchaseRequest.create({
      chefId,
      items: JSON.stringify(items), // Убедитесь, что это JSON
      totalAmount,
      reason,
      status: 'pending'
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    console.error('Ошибка создания заявки:', error);
    res.status(500).json({ success: false, error: 'Внутренняя ошибка сервера' });
  }
};

// Повар видит свои заявки
exports.getMyRequests = async (req, res) => {
  try {
    const chefId = req.userId;
    const requests = await PurchaseRequest.findAll({
      where: { chefId },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Ошибка получения заявок:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

// Админ видит все заявки (с фильтрацией по статусу)
exports.getAllRequests = async (req, res) => {
  try {
    const { status } = req.query; // Например, /api/purchase-requests?status=pending
    const whereClause = status ? { status } : {};

    const requests = await PurchaseRequest.findAll({
      where: whereClause,
      include: [{ model: User, as: 'chef', attributes: ['id', 'fullName'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Ошибка получения заявок:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};

// Админ меняет статус заявки
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body; // status: 'approved' или 'rejected'
    const adminId = req.userId;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Некорректный статус' });
    }

    const request = await PurchaseRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Заявка не найдена' });
    }

    request.status = status;
    request.adminComment = adminComment || null;
    await request.save();

    res.json({ success: true, request });
  } catch (error) {
    console.error('Ошибка обновления заявки:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};