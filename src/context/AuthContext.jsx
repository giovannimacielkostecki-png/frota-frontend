// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario]   = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('frota_token');
    const saved = localStorage.getItem('frota_usuario');
    if (token && saved) {
      setUsuario(JSON.parse(saved));
    }
    setCarregando(false);
  }, []);

  async function login(email, senha) {
    const { data } = await authAPI.login(email, senha);
    localStorage.setItem('frota_token', data.token);
    localStorage.setItem('frota_usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data.usuario;
  }

  function logout() {
    localStorage.removeItem('frota_token');
    localStorage.removeItem('frota_usuario');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
