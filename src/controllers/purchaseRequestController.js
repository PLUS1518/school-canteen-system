const PurchaseRequest = require('../models/PurchaseRequest');
const User = require('../models/User');


// Повар создает заявку
exports.createRequest = async (req, res) => {
  try {
    console.log('📝 Получены данные заявки:', req.body);
    
    const { items, reason } = req.body;
    const chefId = req.userId;

    // Валидация
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Необходимо указать минимум один товар' 
      });
    }

    // Проверяем структуру каждого item
    const validatedItems = items.map((item, index) => {
      if (!item.productName || !item.quantity || !item.unit) {
        throw new Error(`Товар #${index+1} должен содержать productName, quantity и unit`);
      }
      
      return {
        productName: String(item.productName),
        quantity: parseInt(item.quantity) || 1,
        unit: String(item.unit),
        estimatedPrice: parseFloat(item.estimatedPrice) || 0
      };
    });

    // Рассчитываем сумму
    const totalAmount = validatedItems.reduce((sum, item) => {
      return sum + (item.estimatedPrice * item.quantity);
    }, 0);

    console.log('💰 Рассчитанная сумма:', totalAmount);

    // Создаём заявку - передаем массив напрямую, Sequelize сам сериализует
    const request = await PurchaseRequest.create({
      chefId,
      items: validatedItems, // Массив, не строка!
      totalAmount,
      reason: reason || '',
      status: 'pending'
    });

    res.status(201).json({ 
      success: true, 
      request: request.toJSON()
    });

  } catch (error) {
    console.error('❌ Ошибка создания заявки:', error.message);
    
    if (error.message.includes('Товар #')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Внутренняя ошибка сервера',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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