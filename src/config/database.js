const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log,
});

const databaseConfig = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
    }
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  }
};

const env = process.env.NODE_ENV || 'development';
const config = databaseConfig[env];

console.log(`📊 Режим базы данных: ${env}`);
console.log(`💾 Хранилище: ${config.storage}`);

module.exports = { sequelize, config };