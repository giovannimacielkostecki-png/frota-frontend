// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RotasProvider } from './context/RotasContext';   // ← NOVO
import Layout from './components/layout/Layout';
import Login from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import Veiculos from './components/pages/Veiculos';
import Abastecimento from './components/pages/Abastecimento';
import Pneus from './components/pages/Pneus';
import Custos from './components/pages/Custos';
import Multas from './components/pages/Multas';
import Vencimentos from './components/pages/Vencimentos';
import Frete from './components/pages/Frete';
import Rotas from './components/pages/Rotas';             // ← NOVO
import Rastreamento from './components/pages/Rastreamento';
import Usuarios from './components/pages/Usuarios';
import { Spinner } from './components/ui';
import Perfil from './components/pages/Perfil';

function Privado({ children }) {
  const { usuario, carregando } = useAuth();
  if (carregando) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><Spinner size={36} /></div>;
  if (!usuario)   return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <RotasProvider>                                      {/* ← NOVO */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Privado><Layout /></Privado>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"      element={<Dashboard />} />
            <Route path="veiculos"       element={<Veiculos />} />
            <Route path="abastecimento"  element={<Abastecimento />} />
            <Route path="pneus"          element={<Pneus />} />
            <Route path="rotas"          element={<Rotas />} />      {/* ← NOVO */}
            <Route path="custos"         element={<Custos />} />
            <Route path="multas"         element={<Multas />} />
            <Route path="vencimentos"    element={<Vencimentos />} />
            <Route path="frete"          element={<Frete />} />
            <Route path="rastreamento"   element={<Rastreamento />} />
            <Route path="usuarios"       element={<Usuarios />} />
            <Route path="perfil"         element={<Perfil />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </RotasProvider>                                     {/* ← NOVO */}
    </AuthProvider>
  );
}
