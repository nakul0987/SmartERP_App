const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Voucher = require('../models/Voucher');
const StockItem = require('../models/StockItem');
const Company = require('../models/Company');
const PDFDocument = require('pdfkit');

// Inline token verifier
const verifyToken = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Create Voucher & Update Stock Quantities
router.post('/', async (req, res) => {
  try {
    verifyToken(req);
    const { companyId, voucherType, partyLedgerId, items, totalAmount, cgst, sgst, grandTotal, voucherNumber } = req.body;

    const voucher = new Voucher({
      companyId, voucherType, voucherNumber, partyLedgerId, items, totalAmount, cgst, sgst, grandTotal
    });
    await voucher.save();

    for (let item of items) {
      const modifier = voucherType === 'Sales' ? -item.quantity : item.quantity;
      await StockItem.findByIdAndUpdate(item.itemId, {
        $inc: { currentQuantity: modifier }
      });
    }

    res.status(201).json(voucher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Download Tally-Inspired Invoice PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
      .populate('partyLedgerId')
      .populate('items.itemId');
      
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });

    const company = await Company.findById(voucher.companyId);

    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${voucher.voucherNumber}.pdf`);
    doc.pipe(res);

    // --- TALLY OUTER BORDER ---
    doc.rect(40, 40, 515, 750).stroke();

    // --- HEADER HEADER ---
    doc.fontSize(14).font('Helvetica-Bold').text(company?.companyName || 'TAX INVOICE', 50, 55, { align: 'center' });
    doc.fontSize(9).font('Helvetica').text(company?.address || '', 50, 75, { align: 'center' });
    doc.text(`GSTIN: ${company?.gstNumber || 'N/A'}`, 50, 90, { align: 'center' });
    
    // Divider line
    doc.moveTo(40, 110).lineTo(555, 110).stroke();

    // --- INVOICE DETAILS METADATA ---
    doc.font('Helvetica-Bold').text(`Invoice No: ${voucher.voucherNumber}`, 50, 120);
    doc.font('Helvetica').text(`Date: ${voucher.date.toLocaleDateString()}`, 400, 120);
    doc.font('Helvetica-Bold').text(`Buyer (Bill to): ${voucher.partyLedgerId?.name}`, 50, 145);
    doc.font('Helvetica').text(`Buyer GSTIN: ${voucher.partyLedgerId?.gstin || 'URD'}`, 50, 160);

    // Divider line before grid table
    doc.moveTo(40, 185).lineTo(555, 185).stroke();

    // --- TALLY TABLE HEADER COLUMNS ---
    doc.font('Helvetica-Bold');
    doc.text('Description of Goods', 50, 195);
    doc.text('Quantity', 300, 195, { width: 50, align: 'right' });
    doc.text('Rate', 370, 195, { width: 50, align: 'right' });
    doc.text('GST %', 440, 195, { width: 40, align: 'right' });
    doc.text('Amount', 495, 195, { width: 55, align: 'right' });

    // Table line
    doc.moveTo(40, 215).lineTo(555, 215).stroke();

    // --- INVOICE ITEMS BINDING LOOP ---
    let currentY = 225;
    doc.font('Helvetica');
    
    voucher.items.forEach((item) => {
      doc.text(item.itemId?.itemName || 'Stock Item', 50, currentY);
      doc.text(`${item.quantity} ${item.itemId?.unit || 'Nos'}`, 300, currentY, { width: 50, align: 'right' });
      doc.text(item.rate.toFixed(2), 370, currentY, { width: 50, align: 'right' });
      doc.text(`${item.itemId?.gstRate || 18}%`, 440, currentY, { width: 40, align: 'right' });
      doc.text(item.amount.toFixed(2), 495, currentY, { width: 55, align: 'right' });
      currentY += 20;
    });

    // Push calculation details lower grid base line
    doc.moveTo(40, 600).lineTo(555, 600).stroke();

    // --- TOTALS CALCULATIONS MATRIX PANEL ---
    let totalsY = 610;
    doc.text('Sub Total:', 380, totalsY, { align: 'right', width: 100 });
    doc.text(voucher.totalAmount.toFixed(2), 495, totalsY, { align: 'right', width: 55 });
    
    totalsY += 15;
    doc.text('CGST:', 380, totalsY, { align: 'right', width: 100 });
    doc.text(voucher.cgst.toFixed(2), 495, totalsY, { align: 'right', width: 55 });

    totalsY += 15;
    doc.text('SGST:', 380, totalsY, { align: 'right', width: 100 });
    doc.text(voucher.sgst.toFixed(2), 495, totalsY, { align: 'right', width: 55 });

    // Final border block before grand tally sum
    doc.moveTo(350, totalsY + 15).lineTo(555, totalsY + 15).stroke();
    
    totalsY += 20;
    doc.font('Helvetica-Bold');
    doc.text('Grand Total:', 380, totalsY, { align: 'right', width: 100 });
    doc.text(`INR ${voucher.grandTotal.toFixed(2)}`, 495, totalsY, { align: 'right', width: 55 });

    // --- FOOTER SIGNATURE BLOCK ---
    doc.moveTo(40, 710).lineTo(555, 710).stroke();
    doc.fontSize(8).font('Helvetica').text('Declaration: We declare that this invoice shows the actual price of the goods described.', 50, 720);
    
    doc.fontSize(9).font('Helvetica-Bold').text('For SmartERP Company', 400, 720, { align: 'center' });
    doc.font('Helvetica').text('Authorized Signatory', 400, 770, { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;