/* eslint-disable @typescript-eslint/no-use-before-define */
require('dotenv').config(); // 🟡 Always load env vars first

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const sequelize = require('./config/db');
const db = require('./models'); // Optional: only needed for syncing
const { upload } = require('./config/multerConfig');

// 🧩 Route imports
const authRoutes = require('./routes/authRoutes');
const cnicRoutes = require('./routes/cnicRoutes');
const domicileRoutes = require('./routes/domicileRoutes');
const phcRoutes = require('./routes/phcRoutes');
const pmdcRoutes = require('./routes/pmdcRoutes');

const app = express();

// 🌐 Middleware setup
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📁 Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🛣️ Register routes
app.use('/api/auth', authRoutes);
app.use('/api', cnicRoutes);
app.use('/api', domicileRoutes);
app.use('/api', phcRoutes);
app.use('/api', pmdcRoutes);

// ❗ Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// ❓ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found. Visit /api/docs for available endpoints.',
  });
});

// 🚀 Start server after DB connects
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected to Railway');

    // Optionally sync models
    // await db.sequelize.sync();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      printEndpoints();
    });
  } catch (err) {
    console.error('❌ DB Connection Failed:', err.message);
    printEndpoints(); // Still show endpoints on failure
  }
};

// 📄 Print available API endpoints
const printEndpoints = () => {
  console.log('='.repeat(70));
  console.log('📄 Available endpoints:');
  console.log('  CNIC Extraction:');
  console.log('    • POST /api/extract-cnic (file upload)');
  console.log('    • POST /api/extract-cnic-base64 (base64)');
  console.log('  Domicile Extraction:');
  console.log('    • POST /api/extract-domicile (file upload)');
  console.log('    • POST /api/extract-domicile-base64 (base64)');
  console.log('  PHC Extraction:');
  console.log('    • POST /api/extract-phc (file upload)');
  console.log('    • POST /api/extract-phc-base64 (base64)');
  console.log('  PMDC Extraction:');
  console.log('    • POST /api/extract-pmdc (file upload)');
  console.log('    • POST /api/extract-pmdc-base64 (base64)');
  console.log('='.repeat(70));
  console.log('✨ Support for CNIC, Domicile, PHC & PMDC documents!');
  console.log('🏥 New: Punjab Healthcare Commission Registration Certificates');
};

startServer();
