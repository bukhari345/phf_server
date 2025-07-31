const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  firstName: { type: DataTypes.STRING, allowNull: false },
  lastName: { type: DataTypes.STRING, allowNull: false },
  cnic: { type: DataTypes.STRING, unique: true, allowNull: false },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^\+92\d{10}$/,
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  profession: {
    type: DataTypes.ENUM('doctor', 'hakeem', 'pharmacist'),
    allowNull: false,
  },
  password: { type: DataTypes.STRING, allowNull: false },
});

module.exports = User;
