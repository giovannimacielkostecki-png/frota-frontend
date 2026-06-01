// src/components/pages/Pneus.jsx
import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { pneuAPI, veiculoAPI } from '../../api';
import { Card, CardHeader, Table, StatCard, Btn, Input, Select } from '../ui';
import { fmt, statusPill } from '../../utils';
import toast from 'react-hot-toast';

function PosicaoPneu({ pneu }) {
  const colors = { BOM: '#3fb950', ATENCAO: '#f0a500', TROCAR: '#f85149', SUBSTITUIDO: '#484f58' };
  const c = colors[pneu?.status] || '#484f58';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 38, height: 72, background: '#1e2d45',
        border: `2px solid ${c}`, borderRadius: 7,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, color: c, fontFamily: "'DM Mono'", margin: '0 auto',
      }}>{pneu?.posicao || '—'}</div>
      {pneu && <div style={{ fontSize: 9, color: '#484f58', marginTop: 3 }}>{Math.round(pneu.kmRodado / 1000)}k km</div>}
    </div>
  );
}

export default function Pneus() {
  const { data: alertas, loading: la }  = useFetch(() => pneuAPI.alertas());
  const { data: veiculos }              = useFetch(() => veiculoAPI.listar());
  const [veicSel, setVeicSel]          = useState('');
  const { data: pneus, loading: lp, refetch } = useFetch(() => veicSel ? pneuAPI.porVeiculo(veicSel) : Promise.resolve({ data: [] }), [veicSel]);
  const { executar: rodizio, loading: saving } = useMutation(pneuAPI.registrarRodizio);
  const [form, setForm] = useState({ pneuId: '', posicaoNova: '', kmAtual: '' });
  const set = (k,v) => setForm(p => ({ ...p, [k]: v }));

  async function handleRodizio(e) {
    e.preventDefault();
    await rodizio({ ...form, kmAtual: Number(form.kmAtual) });
    toast.success('Rodízio registrado!');
    setForm({ pneuId: '', posicaoNova: '', kmAtual: '' });
    refetch();
  }

  const colAlerta = [
    { key: 'posicao',  label: 'Posição', mono: true },
    { key: 'veiculo',  label: 'Veículo', render: r => `${r.veiculo?.modelo} · ${r.veiculo?.placa}` },
    { key: 'kmRodado', label: 'KM rodado', mono: true, render: r => fmt.km(r.kmRodado) },
    { key: 'kmLimite', label: 'Limite', mono: true, render: r => fmt.km(r.kmLimite) },
    { key: 'status',   label: 'Status', render: r => { const s = statusPill(r.status); return <span style={{ background: s.bg, color: s.color, padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{s.label}</span>; } },
  ];

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Rodízio de Pneus</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Pneus para trocar" value={(alertas||[]).filter(p=>p.status==='TROCAR').length} color="#f85149" />
        <StatCard label="Em atenção"         value={(alertas||[]).filter(p=>p.status==='ATENCAO').length} color="#f0a500" />
        <StatCard label="Alertas totais"     value={(alertas||[]).length} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <CardHeader icon="🚛" title="Visualização por veículo" />
          <div style={{ padding: 16 }}>
            <Select label="Selecione o veículo" value={veicSel} onChange={e => setVeicSel(e.target.value)}>
              <option value="">Selecione...</option>
              {(veiculos||[]).map(v => <option key={v.id} value={v.id}>{v.modelo} · {v.placa}</option>)}
            </Select>
            {(pneus||[]).length > 0 && (
              <div style={{ marginTop: 20, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                {['D1','E1'].map(pos => {
                  const p = (pneus||[]).find(x => x.posicao === pos);
                  return <PosicaoPneu key={pos} pneu={p || { posicao: pos, status: 'BOM', kmRodado: 0 }} />;
                })}
                <div style={{ width: 1, background: '#30363d' }} />
                {['D2','E2','D3','E3'].map(pos => {
                  const p = (pneus||[]).find(x => x.posicao === pos);
                  return <PosicaoPneu key={pos} pneu={p || { posicao: pos, status: 'BOM', kmRodado: 0 }} />;
                })}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader icon="🔄" title="Registrar rodízio" />
          <form onSubmit={handleRodizio} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Select label="Pneu" value={form.pneuId} onChange={e => set('pneuId', e.target.value)} required>
              <option value="">Selecione...</option>
              {(pneus||[]).map(p => <option key={p.id} value={p.id}>{p.posicao} · {fmt.km(p.kmRodado)} rodados · {p.status}</option>)}
            </Select>
            <Input label="Nova posição" placeholder="Ex: E2" value={form.posicaoNova} onChange={e => set('posicaoNova', e.target.value.toUpperCase())} required />
            <Input label="KM atual do veículo" type="number" value={form.kmAtual} onChange={e => set('kmAtual', e.target.value)} required />
            <Btn type="submit" loading={saving} style={{ width: '100%', justifyContent: 'center' }}>Registrar rodízio</Btn>
          </form>
        </Card>
      </div>

      <Card>
        <CardHeader icon="⚠" title="Pneus que precisam de atenção" />
        <Table columns={colAlerta} rows={alertas||[]} loading={la} emptyText="Nenhum pneu em alerta — frota em bom estado!" />
      </Card>
    </div>
  );
}
