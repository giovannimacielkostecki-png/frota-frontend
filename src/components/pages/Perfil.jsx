import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function Perfil() {
  const { usuario } = useAuth();
  const [form, setForm] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' });
  const [salvando, setSalvando] = useState(false);

  const card = { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 24, marginBottom: 24 };
  const input = { width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, padding: '8px 12px', color: '#e6edf3', fontSize: 13, boxSizing: 'border-box' };
  const label = { fontSize: 12, color: '#8b949e', marginBottom: 4, display: 'block' };

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.novaSenha !== form.confirmar) {
      toast.error('As senhas não coincidem!');
      return;
    }
    if (form.novaSenha.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres!');
      return;
    }
    setSalvando(true);
    try {
      await api.put('/auth/trocar-senha', {
        senhaAtual: form.senhaAtual,
        novaSenha: form.novaSenha,
      });
      toast.success('Senha alterada com sucesso!');
      setForm({ senhaAtual: '', novaSenha: '', confirmar: '' });
    } catch {
      toast.error('Senha atual incorreta!');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <h2 style={{ color: '#e6edf3', marginBottom: 20 }}>👤 Meu Perfil</h2>

      {/* Info do usuário */}
      <div style={card}>
        <h3 style={{ color: '#f0a500', marginBottom: 16, fontSize: 14 }}>Informações</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <span style={label}>Nome</span>
            <span style={{ color: '#e6edf3', fontSize: 14 }}>{usuario?.nome}</span>
          </div>
          <div>
            <span style={label}>E-mail</span>
            <span style={{ color: '#e6edf3', fontSize: 14 }}>{usuario?.email}</span>
          </div>
          <div>
            <span style={label}>Perfil</span>
            <span style={{ background: 'rgba(240,165,0,0.15)', color: '#f0a500', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{usuario?.perfil}</span>
          </div>
        </div>
      </div>

      {/* Trocar senha */}
      <div style={card}>
        <h3 style={{ color: '#f0a500', marginBottom: 16, fontSize: 14 }}>Trocar Senha</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
            <div>
              <label style={label}>Senha Atual</label>
              <input style={input} type="password" value={form.senhaAtual} onChange={e => setForm({ ...form, senhaAtual: e.target.value })} required />
            </div>
            <div>
              <label style={label}>Nova Senha</label>
              <input style={input} type="password" value={form.novaSenha} onChange={e => setForm({ ...form, novaSenha: e.target.value })} required />
            </div>
            <div>
              <label style={label}>Confirmar Nova Senha</label>
              <input style={input} type="password" value={form.confirmar} onChange={e => setForm({ ...form, confirmar: e.target.value })} required />
            </div>
            <button type="submit" disabled={salvando} style={{ background: '#f0a500', color: '#000', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer', fontSize: 13, width: 'fit-content' }}>
              {salvando ? 'Salvando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
