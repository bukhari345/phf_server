require('dotenv').config(); // 🟡 Always load this first
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const db = require('./models'); // If you're syncing models, otherwise optional

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Start server after DB connects
sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL Connected to Railway');

    // Optionally sync models
    // db.sequelize.sync();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB Connection Failed:', err.message);
  });
