// src/context/RotasContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { rotaAPI } from '../api';

const RotasContext = createContext(null);

export function RotasProvider({ children }) {
  const [rotas, setRotas]       = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    rotaAPI.listar()
      .then(res => setRotas(res.data))
      .catch(() => setRotas([]))
      .finally(() => setCarregando(false));
  }, []);

  async function addRota(dados) {
    const res = await rotaAPI.criar(dados);
    setRotas(prev => [res.data, ...prev]);
    return res.data;
  }

  async function removeRota(id) {
    await rotaAPI.deletar(id);
    setRotas(prev => prev.filter(r => r.id !== id));
  }

  return (
    <RotasContext.Provider value={{ rotas, carregando, addRota, removeRota }}>
      {children}
    </RotasContext.Provider>
  );
}

export const useRotas = () => useContext(RotasContext);
