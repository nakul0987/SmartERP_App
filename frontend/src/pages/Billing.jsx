import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export default function Billing() {
  const { token, activeCompany } = useContext(AppContext);
  const [voucherNumber, setVoucherNumber] = useState('');
  const [partyLedgerId, setPartyLedgerId] = useState('');
  const [items, setItems] = useState([{ itemId: '', quantity: 1, rate: 0, amount: 0 }]);
  const [savedVoucherId, setSavedVoucherId] = useState(null);

  // Keyboard mapping strategy implementation
  const triggerPDFDownload = async () => {
    if (!savedVoucherId) return alert('Please enter and process a transaction entry first.');
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/vouchers/${savedVoucherId}/pdf`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice_${voucherNumber || 'Record'}.pdf`;
      link.click();
    } catch (err) { alert('PDF Engine processing mismatch.'); }
  };

  const handlePostVoucher = async () => {
    const totalAmount = items.reduce((acc, item) => acc + item.amount, 0);
    const cgst = totalAmount * 0.09;
    const sgst = totalAmount * 0.09;
    const grandTotal = totalAmount + cgst + sgst;

    try {
      const payload = {
        companyId: activeCompany._id,
        voucherType: 'Sales',
        voucherNumber,
        partyLedgerId,
        items,
        totalAmount,
        cgst,
        sgst,
        grandTotal
      };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/vouchers`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedVoucherId(res.data._id);
      alert('Voucher posted successfully! Press [CTRL + SHIFT + P] to print.');
    } catch (err) { alert('Error mapping voucher transaction data.'); }
  };

  // Bind specialized local view actions to your abstract keyboard driver hook
  useKeyboardShortcuts({
    'CTRL_SHIFT_P': triggerPDFDownload,
    'F1': () => alert('Help Menu shortcut triggered!'),
  }, [savedVoucherId, voucherNumber, partyLedgerId, items]);

  const updateItemField = (index, field, value) => {
    const nextItems = [...items];
    nextItems[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      nextItems[index].amount = nextItems[index].quantity * nextItems[index].rate;
    }
    setItems(nextItems);
  };

  return (
    <div style={{ background: '#fff', padding: '20px', border: '1px solid #bdc3c7' }}>
      <div style={{ display: 'flex', justifySelf: 'space-between', borderBottom: '2px solid #24333c', paddingBottom: '10px' }}>
        <h2>Accounting Voucher Creation (Sales Invoice)</h2>
        <h4 style={{ color: '#007acc' }}>Active Enterprise: {activeCompany?.companyName}</h4>
      </div>

      <div style={{ margin: '20px 0', display: 'flex', gap: '20px' }}>
        <div>
          <label>Voucher/Invoice No: </label>
          <input value={voucherNumber} onChange={e => setVoucherNumber(e.target.value)} style={{ padding: '4px' }} />
        </div>
        <div>
          <label>Party Ledger MongoDB ID: </label>
          <input value={partyLedgerId} onChange={e => setPartyLedgerId(e.target.value)} style={{ padding: '4px', width: '220px' }} />
        </div>
      </div>

      <table className="tally-table">
        <thead>
          <tr>
            <th>Particulars (Stock Item ID)</th>
            <th>Quantity</th>
            <th>Rate (INR)</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td><input value={item.itemId} onChange={e => updateItemField(idx, 'itemId', e.target.value)} style={{ width: '95%' }} /></td>
              <td><input type="number" value={item.quantity} onChange={e => updateItemField(idx, 'quantity', Number(e.target.value))} style={{ width: '80px' }} /></td>
              <td><input type="number" value={item.rate} onChange={e => updateItemField(idx, 'rate', Number(e.target.value))} style={{ width: '100px' }} /></td>
              <td>{item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => setItems([...items, { itemId: '', quantity: 1, rate: 0, amount: 0 }])} style={{ marginTop: '10px', padding: '5px' }}>
        + Add Row
      </button>

      <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '15px', textAlign: 'right' }}>
        <button onClick={handlePostVoucher} style={{ background: '#24333c', color: '#fff', padding: '10px 20px', border: 'none', cursor: 'pointer', marginRight: '10px' }}>
          Save Voucher (Enter)
        </button>
        <button onClick={triggerPDFDownload} disabled={!savedVoucherId} style={{ background: savedVoucherId ? '#007acc' : '#ccc', color: '#fff', padding: '10px 20px', border: 'none', cursor: savedVoucherId ? 'pointer' : 'not-allowed' }}>
          Download Bill PDF (Ctrl+Shift+P)
        </button>
      </div>
    </div>
  );
}