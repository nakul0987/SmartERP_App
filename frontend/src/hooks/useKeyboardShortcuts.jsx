import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcutMap, dependencies = []) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Allow natural typing inside form input fields
      if (
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        e.target.tagName === 'SELECT'
      ) {
        // Exception: Let Escape drop focus or run actions
        if (e.key !== 'Escape') return;
      }

      let keyCombo = [];

      if (e.ctrlKey) keyCombo.push('CTRL');
      if (e.altKey) keyCombo.push('ALT');
      if (e.shiftKey) keyCombo.push('SHIFT');

      // Catch standard function keys (F1-F12) or letter key names
      if (e.key.startsWith('F') && !isNaN(e.key.substring(1))) {
        keyCombo.push(e.key);
      } else if (e.key === 'Escape') {
        keyCombo.push('ESC');
      } else if (e.key === 'Enter') {
        keyCombo.push('ENTER');
      } else if (e.key === 'Tab') {
        keyCombo.push('TAB');
      } else if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
        keyCombo.push(e.key.toUpperCase());
      }

      const triggeredAction = keyCombo.join('_');

      if (shortcutMap[triggeredAction]) {
        e.preventDefault(); // Terminate default browser print/save popups
        shortcutMap[triggeredAction](e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutMap, ...dependencies]);
};