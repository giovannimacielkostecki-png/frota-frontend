// src/components/pages/Vencimentos.jsx
import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { documentoAPI, veiculoAPI } from '../../api';
import { Card, CardHeader, Table, StatCard, Btn, Input, Select, FormGrid } from '../ui';
import { fmt, diasRestantes, corDias } from '../../utils';
import toast from 'react-hot-toast';

const TIPOS = ['IPVA','LICENCIAMENTO','SEGURO_OBRIGATORIO','SEGURO_OPCIONAL','SINISTRO','OUTROS'];

export default function Vencimentos() {
  const { data, loading, refetch } = useFetch(() => documentoAPI.listar({ dias: 90 }));
  const { data: veiculos }         = useFetch(() => veiculoAPI.listar());
  const { executar: criar, loading: saving } = useMutation(documentoAPI.criar);
  const [form, setForm] = useState({ veiculoId: '', tipo: 'IPVA', dataVencimento: '', valor: '' });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const em7  = (data || []).filter(d => { const dias = diasRestantes(d.dataVencimento); return dias >= 0 && dias <= 7; });
  const em15 = (data || []).filter(d => { const dias = diasRestantes(d.dataVencimento); return dias > 7 && dias <= 15; });

  async function handleSubmit(e) {
    e.preventDefault();
    await criar({ ...form, valor: form.valor ? Number(form.valor) : undefined });
    toast.success('Documento cadastrado!');
    setForm({ veiculoId: '', tipo: 'IPVA', dataVencimento: '', valor: '' });
    refetch();
  }

  const columns = [
    { key: 'veiculo',    label: 'Veículo',    render: r => `${r.veiculo?.modelo} · ${r.veiculo?.placa}` },
    { key: 'tipo',       label: 'Documento',  render: r => <span style={{ background: 'rgba(88,166,255,.15)', color: '#58a6ff', padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{r.tipo.replace(/_/g,' ')}</span> },
    { key: 'vencimento', label: 'Vencimento', render: r => fmt.data(r.dataVencimento) },
    { key: 'dias',       label: 'Dias',       render: r => { const d = diasRestantes(r.dataVencimento); return <span style={{ fontFamily:"'DM Mono'", fontWeight: 600, color: corDias(d) }}>{d}d</span>; } },
    { key: 'valor',      label: 'Valor',      mono: true, render: r => fmt.moeda(r.valor) },
    { key: 'status',     label: 'Status',     render: r => { const d = diasRestantes(r.dataVencimento); const [bg, c, l] = d <= 7 ? ['rgba(248,81,73,.15)','#f85149','Urgente'] : d <= 15 ? ['rgba(240,165,0,.15)','#f0a500','Atenção'] : ['rgba(63,185,80,.15)','#3fb950','Ok']; return <span style={{ background: bg, color: c, padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:600 }}>{l}</span>; } },
  ];

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Vencimentos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Vence em 7 dias"  value={em7.length}             color="#f85149" />
        <StatCard label="Vence em 15 dias" value={em15.length}            color="#f0a500" />
        <StatCard label="Total próx. 90d"  value={(data||[]).length}      color="#58a6ff" />
        <StatCard label="Valor estimado"   value={fmt.moeda((data||[]).reduce((s,d)=>s+(d.valor||0),0))} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <CardHeader icon="➕" title="Adicionar documento" />
          <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Select label="Veículo" value={form.veiculoId} onChange={e => set('veiculoId', e.target.value)} required>
              <option value="">Selecione...</option>
              {(veiculos||[]).map(v => <option key={v.id} value={v.id}>{v.modelo} · {v.placa}</option>)}
            </Select>
            <Select label="Tipo" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              {TIPOS.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
            </Select>
            <Input label="Vencimento" type="date" value={form.dataVencimento} onChange={e => set('dataVencimento', e.target.value)} required />
            <Input label="Valor (R$)" type="number" step="0.01" placeholder="Opcional" value={form.valor} onChange={e => set('valor', e.target.value)} />
            <Btn type="submit" loading={saving} style={{ width: '100%', justifyContent: 'center' }}>Salvar</Btn>
          </form>
        </Card>
        <Card>
          <CardHeader icon="📅" title="Documentos próximos ao vencimento (90 dias)" />
          <Table columns={columns} rows={(data||[]).sort((a,b) => new Date(a.dataVencimento) - new Date(b.dataVencimento))} loading={loading} />
        </Card>
      </div>
    </div>
  );
}
