const mongoose = require('mongoose');

const StockItemSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  itemName: { type: String, required: true, trim: true },
  unit: { type: String, required: true, trim: true }, // e.g., Pcs, Box, Kg
  openingQuantity: { type: Number, default: 0 },
  currentQuantity: { type: Number, default: 0 },
  rate: { type: Number, required: true },
  gstRate: { type: Number, default: 18 }
}, { timestamps: true });

module.exports = mongoose.model('StockItem', StockItemSchema);