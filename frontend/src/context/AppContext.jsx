import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [activeCompany, setActiveCompany] = useState(
    JSON.parse(localStorage.getItem('activeCompany')) || null
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('activeCompany');
      setActiveCompany(null);
    }
  }, [token]);

  useEffect(() => {
    if (activeCompany) {
      localStorage.setItem('activeCompany', JSON.stringify(activeCompany));
    } else {
      localStorage.removeItem('activeCompany');
    }
  }, [activeCompany]);

  return (
    <AppContext.Provider value={{ token, setToken, activeCompany, setActiveCompany }}>
      {children}
    </AppContext.Provider>
  );
};