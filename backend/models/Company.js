const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true, trim: true },
  address: { type: String, required: true },
  gstNumber: { type: String, required: true },
  financialYearStart: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);