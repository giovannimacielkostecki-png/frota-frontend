// src/components/pages/Multas.jsx
import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { multaAPI, veiculoAPI } from '../../api';
import { Card, CardHeader, Table, StatCard, Btn, Input } from '../ui';
import { fmt, statusPill } from '../../utils';
import toast from 'react-hot-toast';

export default function Multas() {
  const { data, loading, refetch } = useFetch(() => multaAPI.listar());
  const [placa, setPlaca]          = useState('');
  const [consultaRes, setConsulta] = useState(null);
  const { executar: consultar, loading: consultando } = useMutation(multaAPI.consultarPlaca);
  const { executar: pagar }                           = useMutation(multaAPI.registrarPagamento);

  const abertas = (data || []).filter(m => m.status === 'ABERTA');
  const totalAberto = abertas.reduce((s, m) => s + m.valor, 0);

  async function handleConsultar(e) {
    e.preventDefault();
    const res = await consultar(placa.toUpperCase());
    setConsulta(res);
  }

  async function handlePagar(id) {
    await pagar(id);
    toast.success('Multa registrada como paga!');
    refetch();
  }

  const columns = [
    { key: 'numeroAuto',   label: 'Auto',     mono: true },
    { key: 'placa',        label: 'Placa',    render: r => <span style={{ fontFamily: "'DM Mono'" }}>{r.veiculo?.placa}</span> },
    { key: 'descricao',    label: 'Infração' },
    { key: 'dataInfracao', label: 'Data',     render: r => fmt.data(r.dataInfracao) },
    { key: 'valor',        label: 'Valor',    mono: true, render: r => fmt.moeda(r.valor) },
    { key: 'vencimento',   label: 'Vencimento', render: r => <span style={{ color: new Date(r.dataVencimento) < new Date() ? '#f85149' : '#e6edf3' }}>{fmt.data(r.dataVencimento)}</span> },
    { key: 'status',       label: 'Status',   render: r => { const s = statusPill(r.status); return <span style={{ background: s.bg, color: s.color, padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{s.label}</span>; } },
    { key: 'acao',         label: '',         render: r => r.status === 'ABERTA' ? <Btn variant="secondary" onClick={() => handlePagar(r.id)} style={{ fontSize: 11, padding: '4px 10px' }}>Pagar</Btn> : null },
  ];

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Multas</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Multas em aberto"  value={abertas.length}    color="#f85149" />
        <StatCard label="Valor total aberto" value={fmt.moeda(totalAberto)} color="#f0a500" />
        <StatCard label="Pagas em 2025"    value={(data || []).filter(m => m.status === 'PAGA').length} color="#3fb950" />
      </div>
      <Card style={{ marginBottom: 16 }}>
        <CardHeader icon="🔍" title="Consultar multas por placa" />
        <form onSubmit={handleConsultar} style={{ padding: 16, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <Input label="Placa" value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())} placeholder="BRA2E19" style={{ width: 180 }} required />
          <Btn type="submit" loading={consultando}>Consultar DETRAN</Btn>
        </form>
        {consultaRes && (
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 8, padding: '12px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#f85149', marginBottom: 6 }}>
                {consultaRes.multasLocais?.length + (consultaRes.multasExternas?.length || 0)} infração(ões) encontrada(s) para {consultaRes.placa}
              </div>
              {consultaRes.multasExternas?.map((m, i) => (
                <div key={i} style={{ fontSize: 12, color: '#8b949e' }}>{m.descricao} · {fmt.moeda(m.valor)}</div>
              ))}
            </div>
          </div>
        )}
      </Card>
      <Card>
        <CardHeader icon="📋" title="Todas as multas" />
        <Table columns={columns} rows={data || []} loading={loading} />
      </Card>
    </div>
  );
}
