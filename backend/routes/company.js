const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');

// Inline token validation utility function
const getUserIdFromToken = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('No token, authorization denied');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.userId;
};

// Create Company (With max 5 limits check)
router.post('/', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const companyCount = await Company.countDocuments({ userId });
    
    if (companyCount >= 5) {
      return res.status(400).json({ message: 'Maximum limit of 5 companies reached.' });
    }

    const newCompany = new Company({ ...req.body, userId });
    await newCompany.save();
    res.status(201).json(newCompany);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Get User's Companies
router.get('/', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const companies = await Company.find({ userId });
    res.json(companies);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;