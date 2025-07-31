const sequelize = require('../config/db');
const User = require('./User');

sequelize.sync()
  .then(() => console.log('Database synced'))
  .catch((err) => console.log(err));

module.exports = { sequelize, User };
