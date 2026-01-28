const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PurchaseRequest = sequelize.define('PurchaseRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chefId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidJSON(value) {
        try {
          if (typeof value === 'string') {
            const parsed = JSON.parse(value);
            if (!Array.isArray(parsed)) {
              throw new Error('Должен быть массив');
            }
          } else if (!Array.isArray(value)) {
            throw new Error('Должен быть массив');
          }
        } catch (error) {
          throw new Error('Items должен быть валидным JSON массивом');
        }
      }
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminComment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
    allowNull: false
  }
}, {
  tableName: 'purchase_requests',
  timestamps: true
});

// Ассоциации
PurchaseRequest.associate = function(models) {
  PurchaseRequest.belongsTo(models.User, {
    foreignKey: 'chefId',
    as: 'chef'
  });
};

module.exports = PurchaseRequest;