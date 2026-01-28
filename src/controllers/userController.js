const User = require('../models/User');

exports.updateBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;

    if (amount === undefined || amount === null) {
      return res.status(400).json({ 
        success: false, 
        error: 'Не указана сумма пополнения' 
      });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Сумма должна быть положительным числом' 
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Пользователь не найден' 
      });
    }

    const oldBalance = parseFloat(user.balance) || 0;
    const newBalance = oldBalance + numericAmount;
    
    user.balance = newBalance;
    await user.save();

    res.json({
      success: true,
      message: 'Баланс успешно пополнен',
      oldBalance,
      newBalance,
      added: numericAmount
    });

  } catch (error) {
    console.error('❌ Ошибка пополнения баланса:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка сервера' 
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'login', 'role', 'fullName', 'allergies', 'preferences', 'class', 'balance', 'createdAt']
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Ошибка получения профиля:', error);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
  }
};