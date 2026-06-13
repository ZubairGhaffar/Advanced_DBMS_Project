import React, { createContext, useState, useEffect } from 'react';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const referenceID = localStorage.getItem('referenceID');
    if (token) setUser({ token, role, referenceID });
  }, []);

  const login = (token, role, referenceID) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('referenceID', referenceID);
    setUser({ token, role, referenceID });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('referenceID');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
