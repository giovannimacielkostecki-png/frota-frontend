
// src/context/RotasContext.jsx
import { createContext, useContext, useState } from 'react';

const RotasContext = createContext(null);

export function RotasProvider({ children }) {
  const [rotas, setRotas] = useState([]);

  function addRota(rota) {
    const nova = { ...rota, id: Date.now() };
    setRotas(prev => [...prev, nova]);
    return nova;
  }

  function removeRota(id) {
    setRotas(prev => prev.filter(r => r.id !== id));
  }

  return (
    <RotasContext.Provider value={{ rotas, addRota, removeRota }}>
      {children}
    </RotasContext.Provider>
  );
}

export const useRotas = () => useContext(RotasContext);
