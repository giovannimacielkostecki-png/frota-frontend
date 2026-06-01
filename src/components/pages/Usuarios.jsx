import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function Usuarios() {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'MOTORISTA' });
  const [salvando, setSalvando] = useState(false);

  if (usuario?.perfil !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const { data } = await api.get('/usuarios');
      setUsuarios(data);
    } catch {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await api.post('/auth/cadastrar', form);
      toast.success('Usuário criado!');
      setForm({ nome: '', email: '', senha: '', perfil: 'MOTORISTA' });
      carregar();
    } catch {
      toast.error('Erro ao criar usuário');
    } finally {
      setSalvando(false);
    }
  }

  async function desativar(id) {
    if (!confirm('Desativar este usuário?')) return;
    try {
      await api.patch(`/usuarios/${id}/desativar`);
      toast.success('Usuário desativado');
      carregar();
    } catch {
      toast.error('Erro ao desativar');
    }
  }

  const card = { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 20, marginBottom: 24 };
  const input = { width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '8px 12px', color: '#e6edf3', fontSize: 13, boxSizing: 'border-box' };
  const label = { fontSize: 12, color: '#8b949e', marginBottom: 4, display: 'block' };

  return (
    <div>
      <h2 style={{ color: '#e6edf3', marginBottom: 20 }}>👥 Usuários</h2>

      {/* Formulário de cadastro */}
      <div style={card}>
        <h3 style={{ color: '#f0a500', marginBottom: 16, fontSize: 14 }}>Novo Usuário</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={label}>Nome</label>
              <input style={input} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div>
              <label style={label}>E-mail</label>
              <input style={input} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label style={label}>Senha</label>
              <input style={input} type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required />
            </div>
            <div>
              <label style={label}>Perfil</label>
              <select style={input} value={form.perfil} onChange={e => setForm({ ...form, perfil: e.target.value })}>
                <option value="ADMIN">Admin</option>
                <option value="GESTOR">Gestor</option>
                <option value="MOTORISTA">Motorista</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={salvando} style={{ background: '#f0a500', color: '#000', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {salvando ? 'Salvando...' : 'Criar Usuário'}
          </button>
        </form>
      </div>

      {/* Lista de usuários */}
      <div style={card}>
        <h3 style={{ color: '#f0a500', marginBottom: 16, fontSize: 14 }}>Usuários Cadastrados</h3>
        {loading ? <p style={{ color: '#8b949e' }}>Carregando...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #30363d' }}>
                {['Nome', 'E-mail', 'Perfil', 'Status', 'Ação'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#8b949e', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '10px 12px', color: '#e6edf3' }}>{u.nome}</td>
                  <td style={{ padding: '10px 12px', color: '#8b949e' }}>{u.email}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: u.perfil === 'ADMIN' ? 'rgba(240,165,0,0.15)' : '#21262d', color: u.perfil === 'ADMIN' ? '#f0a500' : '#8b949e', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{u.perfil}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ color: u.ativo ? '#3fb950' : '#f85149', fontSize: 12 }}>{u.ativo ? 'Ativo' : 'Inativo'}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {u.id !== usuario.id && u.ativo && (
                      <button onClick={() => desativar(u.id)} style={{ background: 'transparent', border: '1px solid #f85149', color: '#f85149', borderRadius: 4, padding: '3px 8px', fontSize: 11, cursor: 'pointer' }}>Desativar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
