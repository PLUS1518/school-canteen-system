const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');





const Meal = sequelize.define('Meal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  category: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
    allowNull: false,
    defaultValue: 'lunch'
  },
  type: {
    type: DataTypes.ENUM('main', 'soup', 'salad', 'drink', 'dessert'),
    allowNull: false,
    defaultValue: 'main'
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ingredients: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  allergens: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'meals',
  timestamps: true
});

module.exports = Meal;