const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  voucherType: { type: String, required: true, enum: ['Sales', 'Purchase', 'Journal', 'Receipt'] },
  voucherNumber: { type: String, required: true },
  date: { type: Date, default: Date.now },
  partyLedgerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ledger', required: true },
  items: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'StockItem', required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Voucher', VoucherSchema);