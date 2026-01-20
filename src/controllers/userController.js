exports.updateBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    user.balance = (parseFloat(user.balance) || 0) + parseFloat(amount);
    await user.save();
    
    res.json({ success: true, balance: user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка обновления баланса' });
  }
};