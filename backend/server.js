const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./db');

const app = express();

// Initialize Database connection
connectDB();

// Global parsing and security adjustments
app.use(cors());
app.use(express.json());

// Flat API endpoint routing mounts
app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/company'));
app.use('/api/vouchers', require('./routes/vouchers'));

// Basic error capture fallback
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`SmartERP server running securely on port ${PORT}`));