import React, { useContext, useState } from 'react';
import { AppContext } from './context/AppContext';
import Auth from './pages/Auth';
import CompanySelect from './pages/CompanySelect';
import Billing from './pages/Billing';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function AppContent() {
  const { token, activeCompany, setToken, setActiveCompany } = useContext(AppContext);
  const [currentView, setCurrentView] = useState('SalesVoucher'); // Active panel router tracking state

  // --- COMPREHENSIVE TALLY SHORTCUT MAP REGISTER ---
  const globalShortcutHandlers = {
    // 1. Global Navigation Shortcuts
    'F1': () => { setActiveCompany(null); alert('Navigating to: Company Selection Screen'); },
    'F2': () => alert('Action: Change Financial Year Dialog opened.'),
    'F3': () => alert(`Company Info for: ${activeCompany?.companyName || 'None'}`),
    'F4': () => alert('Calculator Panel Toggled.'),
    'F5': () => window.location.reload(),
    'ESC': () => { if(activeCompany) setActiveCompany(null); },
    'CTRL_Q': () => { setToken(null); alert('Logged out safely via shortcut.'); },
    
    // 2. Masters Creation Shortcuts
    'ALT_L': () => alert('Opening Master: Create Ledger form modal...'),
    'ALT_A': () => alert('Opening Master: Alter Ledger management grid...'),
    'ALT_G': () => alert('Opening Master: Create Account Group structure...'),
    'ALT_S': () => alert('Opening Master: Create Stock Item inventory panel...'),
    'ALT_U': () => alert('Opening Master: Unit of Measurement (UOM) Creation...'),

    // 3. Voucher Types Quick-Switch Keys
    'F6': () => { setCurrentView('ReceiptVoucher'); alert('Switched view to: Receipt Voucher Entry'); },
    'F7': () => { setCurrentView('JournalVoucher'); alert('Switched view to: Journal Voucher Entry'); },
    'F8': () => { setCurrentView('SalesVoucher'); alert('Switched view to: Sales Voucher Entry'); },
    'F9': () => { setCurrentView('PurchaseVoucher'); alert('Switched view to: Purchase Voucher Entry'); },
    
    // 4. Reports Shortcuts
    'ALT_B': () => alert('Displaying Report: Balance Sheet Summary Grid'),
    'ALT_P': () => alert('Displaying Report: Profit & Loss Statement Ledger'),
    'ALT_R': () => alert('Displaying Report: Inventory Stock Level Report')
  };

  useKeyboardShortcuts(globalShortcutHandlers, [token, activeCompany]);

  if (!token) return <Auth />;
  if (!activeCompany) return <CompanySelect />;

  return (
    <div className="tally-layout">
      {/* Sidebar Navigation Indicator HUD */}
      <div className="tally-sidebar">
        <h3>SmartERP Menu</h3>
        <p style={{ fontSize: '11px', color: '#8fa0a6' }}>Active Framework</p>
        <hr style={{ borderColor: '#34495e' }} />
        <ul style={{ listStyleType: 'none', padding: 0, fontSize: '13px', lineHeight: '2.2' }}>
          <li style={{ color: currentView === 'ReceiptVoucher' ? '#007acc' : '#fff' }}>[F6] Receipt Voucher</li>
          <li style={{ color: currentView === 'JournalVoucher' ? '#007acc' : '#fff' }}>[F7] Journal Voucher</li>
          <li style={{ color: currentView === 'SalesVoucher' ? '#007acc' : '#fff' }}>[F8] Sales Invoice entry</li>
          <li style={{ color: currentView === 'PurchaseVoucher' ? '#007acc' : '#fff' }}>[F9] Purchase Ledger</li>
        </ul>
        <div style={{ marginTop: '30px', fontSize: '11px', background: '#1a252c', padding: '10px', borderRadius: '4px' }}>
          <strong>Master Hotkeys:</strong><br/>
          Alt+L: New Ledger<br/>
          Alt+S: New Item
        </div>
      </div>
      
      <div className="tally-main">
        {currentView === 'SalesVoucher' ? (
          <Billing />
        ) : (
          <div style={{ padding: '40px', background: '#fff', border: '1px solid #ccc' }}>
            <h3>Selected Module View: <span style={{ color: '#007acc' }}>{currentView}</span></h3>
            <p>Ready to capture transactions. Press <strong>[F8]</strong> to return to the interactive Sales Billing Spreadsheet screen.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}