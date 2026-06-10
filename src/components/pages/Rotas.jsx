
// src/components/pages/Rotas.jsx
import { useState } from 'react';
import { Card, CardHeader, Table, Btn, Input, FormGrid } from '../ui';
import toast from 'react-hot-toast';

export default function Rotas() {
  const [rotas, setRotas] = useState([]);
  const [form, setForm]   = useState({ origem: '', destino: '', kmEstimado: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function handleSalvar(e) {
    e.preventDefault();
    if (!form.origem || !form.destino || !form.kmEstimado) {
      toast.error('Preencha todos os campos');
      return;
    }
    const nova = {
      id:          Date.now(),
      origem:      form.origem.trim(),
      destino:     form.destino.trim(),
      kmEstimado:  Number(form.kmEstimado),
    };
    setRotas(prev => [...prev, nova]);
    setForm({ origem: '', destino: '', kmEstimado: '' });
    toast.success('Rota cadastrada!');
  }

  function handleDeletar(id) {
    setRotas(prev => prev.filter(r => r.id !== id));
    setConfirmDelete(null);
    toast.success('Rota excluída!');
  }

  const btnExcluir = { background: 'rgba(248,81,73,.12)',   color: '#f85149', border: '1px solid rgba(248,81,73,.25)', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
  const btnSim     = { background: 'rgba(248,81,73,.2)',    color: '#f85149', border: '1px solid rgba(248,81,73,.4)',  borderRadius: 6, padding: '4px 8px',  fontSize: 11, fontWeight: 700, cursor: 'pointer' };
  const btnNao     = { background: 'rgba(139,148,158,.15)', color: '#8b949e', border: '1px solid rgba(139,148,158,.3)',borderRadius: 6, padding: '4px 8px',  fontSize: 11, fontWeight: 700, cursor: 'pointer' };

  const columns = [
    { key: 'origem',      label: 'Origem',       render: r => r.origem },
    { key: 'destino',     label: 'Destino',      render: r => r.destino },
    { key: 'kmEstimado',  label: 'KM estimado',  mono: true, render: r => `${r.kmEstimado.toLocaleString('pt-BR')} km` },
    { key: 'acoes',       label: 'Ações',        render: r => (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {confirmDelete === r.id ? (
          <>
            <span style={{ fontSize: 11, color: '#f85149', fontWeight: 600 }}>Confirmar?</span>
            <button style={btnSim} onClick={() => handleDeletar(r.id)}>Sim</button>
            <button style={btnNao} onClick={() => setConfirmDelete(null)}>Não</button>
          </>
        ) : (
          <button style={btnExcluir} onClick={() => setConfirmDelete(r.id)}>🗑️ Excluir</button>
        )}
      </div>
    )},
  ];

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Rotas</h2>

      <Card style={{ marginBottom: 16 }}>
        <CardHeader icon="🗺️" title="Cadastrar nova rota" />
        <form onSubmit={handleSalvar} style={{ padding: 16 }}>
          <FormGrid>
            <Input
              label="Origem"
              value={form.origem}
              onChange={e => set('origem', e.target.value)}
              placeholder="ex: Fernandópolis"
              required
            />
            <Input
              label="Destino"
              value={form.destino}
              onChange={e => set('destino', e.target.value)}
              placeholder="ex: São Paulo"
              required
            />
            <Input
              label="KM estimado"
              type="number"
              value={form.kmEstimado}
              onChange={e => set('kmEstimado', e.target.value)}
              placeholder="590"
              required
            />
          </FormGrid>
          <div style={{ marginTop: 12 }}>
            <Btn type="submit">Salvar rota</Btn>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader icon="📋" title="Rotas cadastradas" />
        <Table columns={columns} rows={rotas} />
      </Card>
    </div>
  );
}
