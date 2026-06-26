const mongoose = require('mongoose');

const LedgerSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true, trim: true },
  group: { 
    type: String, 
    required: true, 
    enum: ['Sundry Debtors', 'Sundry Creditors', 'Sales Accounts', 'Purchase Accounts', 'Bank Accounts', 'Direct Expenses'] 
  },
  openingBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  gstin: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Ledger', LedgerSchema);