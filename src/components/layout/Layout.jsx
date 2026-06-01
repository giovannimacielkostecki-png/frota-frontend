// src/components/layout/Layout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';



const linkBase = {
  display: 'flex', alignItems: 'center', gap: 9,
  padding: '8px 10px', borderRadius: 7,
  fontSize: 13, color: '#8b949e',
  textDecoration: 'none',
  marginBottom: 1, transition: 'all 0.15s',
};

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const NAV = [
    { grupo: 'Principal', itens: [
      { to: '/dashboard',     icon: '⬡', label: 'Dashboard' },
      { to: '/rastreamento',  icon: '📍', label: 'Rastreador ao vivo' },
    ]},
    { grupo: 'Operações', itens: [
      { to: '/abastecimento', icon: '⛽', label: 'Abastecimento' },
      { to: '/pneus',         icon: '○', label: 'Pneus' },
      { to: '/frete',         icon: '🧮', label: 'Cálculo de frete' },
    ]},
    { grupo: 'Gestão', itens: [
      { to: '/veiculos',      icon: '🚛', label: 'Veículos' },
      { to: '/custos',        icon: '📊', label: 'Custos' },
      { to: '/multas',        icon: '⚠', label: 'Multas' },
      { to: '/vencimentos',   icon: '📅', label: 'Vencimentos' },
      ...(usuario?.perfil === 'ADMIN' ? [{ to: '/usuarios', icon: '👥', label: 'Usuários' }] : []),
    ]},
  ];

  function handleLogout() {
    logout();
    toast.success('Sessão encerrada');
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <aside style={{
        width: 220, minWidth: 220,
        background: '#161b22',
        borderRight: '1px solid #30363d',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #30363d' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#f0a500', letterSpacing: '0.02em' }}>
            ⬡ FrotaPRO
          </div>
          <div style={{ fontSize: 10, color: '#484f58', fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
            sistema de gestão v1.0
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '10px 8px', flex: 1, overflowY: 'auto' }}>
          {NAV.map((grupo) => (
            <div key={grupo.grupo}>
              <div style={{
                fontSize: 10, fontWeight: 600, color: '#484f58',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                padding: '10px 10px 4px',
              }}>{grupo.grupo}</div>
              {grupo.itens.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    ...linkBase,
                    background: isActive ? 'rgba(240,165,0,0.12)' : 'transparent',
                    color: isActive ? '#f0a500' : '#8b949e',
                  })}
                  onMouseEnter={e => { if (!e.currentTarget.className.includes('active')) { e.currentTarget.style.background = '#21262d'; e.currentTarget.style.color = '#e6edf3'; }}}
                  onMouseLeave={e => { if (!e.currentTarget.getAttribute('aria-current')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8b949e'; }}}
                >
                  <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

       {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #30363d' }}>
          <NavLink to="/perfil" style={{ fontSize: 12, fontWeight: 500, color: '#e6edf3', textDecoration: 'none', display: 'block', marginBottom: 2 }}>
            {usuario?.nome}
          </NavLink>
          <div style={{ fontSize: 11, color: '#484f58', marginBottom: 8 }}>{usuario?.perfil}</div>
          <button onClick={handleLogout} style={{
            background: 'transparent', border: '1px solid #30363d',
            borderRadius: 6, padding: '5px 10px', fontSize: 11,
            color: '#8b949e', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>Sair</button>
        </div>
      </aside>
      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
