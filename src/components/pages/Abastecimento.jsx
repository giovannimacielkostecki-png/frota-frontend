// src/components/pages/Abastecimento.jsx
import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { abastecimentoAPI, veiculoAPI } from '../../api';
import { Card, CardHeader, Table, Btn, Input, Select, FormGrid, PageLoading } from '../ui';
import { fmt } from '../../utils';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function pilConsumo(v) {
  if (!v) return { label: '—', color: '#484f58' };
  if (v >= 2.8) return { label: `${v} km/L`, color: '#3fb950' };
  if (v >= 2.3) return { label: `${v} km/L`, color: '#f0a500' };
  return { label: `${v} km/L`, color: '#f85149' };
}

export default function Abastecimento() {
  const { data: veiculos }                  = useFetch(() => veiculoAPI.listar());
  const { data, loading, refetch }          = useFetch(() => abastecimentoAPI.listar({ limit: 30 }));
  const { data: resumo }                    = useFetch(() => abastecimentoAPI.resumo({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear() }));
  const { executar: criar, loading: saving} = useMutation(abastecimentoAPI.criar);

  const [form, setForm] = useState({
    veiculoId: '', data: new Date().toISOString().slice(0, 10),
    kmAtual: '', litros: '', valorTotal: '', posto: '',
    litrosArla: '', valorArla: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.veiculoId) { toast.error('Selecione um veículo'); return; }
    await criar({
      ...form,
      kmAtual: Number(form.kmAtual),
      litros: Number(form.litros),
      valorTotal: Number(form.valorTotal),
      litrosArla: form.litrosArla ? Number(form.litrosArla) : null,
      valorArla: form.valorArla ? Number(form.valorArla) : null,
    });
    toast.success('Abastecimento registrado!');
    setForm(p => ({ ...p, kmAtual: '', litros: '', valorTotal: '', posto: '', litrosArla: '', valorArla: '' }));
    refetch();
  }

  const columns = [
    { key: 'data',        label: 'Data',    render: r => fmt.data(r.data) },
    { key: 'veiculo',     label: 'Veículo', render: r => `${r.veiculo?.modelo} · ${r.veiculo?.placa}` },
    { key: 'kmAtual',     label: 'KM',      mono: true, render: r => fmt.km(r.kmAtual) },
    { key: 'litros',      label: 'Litros',  mono: true, render: r => `${fmt.numero(r.litros)} L` },
    { key: 'valorTotal',  label: 'Valor',   mono: true, render: r => fmt.moeda(r.valorTotal) },
    { key: 'litrosArla',  label: 'Arla',    mono: true, render: r => r.litrosArla ? `${fmt.numero(r.litrosArla)} L` : '—' },
    { key: 'consumoKmL',  label: 'Consumo', render: r => {
        const p = pilConsumo(r.consumoKmL);
        return <span style={{ color: p.color, fontFamily: "'DM Mono'" }}>{p.label}</span>;
    }},
    { key: 'posto',       label: 'Posto',   render: r => r.posto || '—' },
  ];

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Abastecimento</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* FORMULÁRIO */}
        <Card>
          <CardHeader icon="⛽" title="Registrar abastecimento" />
          <form onSubmit={handleSubmit} style={{ padding: 16 }}>
            <FormGrid>
              <Select label="Veículo" value={form.veiculoId} onChange={e => set('veiculoId', e.target.value)} required>
                <option value="">Selecione...</option>
                {(veiculos || []).map(v => <option key={v.id} value={v.id}>{v.modelo} · {v.placa}</option>)}
              </Select>
              <In
