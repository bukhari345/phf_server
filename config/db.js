require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.LOCAL_DB_NAME,
  process.env.LOCAL_DB_USER,
  process.env.LOCAL_DB_PASSWORD,
  {
    host: process.env.LOCAL_DB_HOST,
    port: process.env.LOCAL_DB_PORT,
    dialect: process.env.LOCAL_DB_DIALECT,
    logging: false,
  },
);

module.exports = sequelize;
