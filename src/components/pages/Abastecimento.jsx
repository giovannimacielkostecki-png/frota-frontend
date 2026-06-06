// src/components/pages/Abastecimento.jsx
import { useState, useMemo } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { abastecimentoAPI, veiculoAPI } from '../../api';
import { Card, CardHeader, Table, Btn, Input, Select, FormGrid, PageLoading } from '../ui';
import DatePicker from '../ui/DatePicker';
import { fmt } from '../../utils';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function pilConsumo(v) {
  if (!v) return { label: '—', color: '#484f58' };
  if (v >= 2.8) return { label: `${v} km/L`, color: '#3fb950' };
  if (v >= 2.3) return { label: `${v} km/L`, color: '#f0a500' };
  return { label: `${v} km/L`, color: '#f85149' };
}

const FORM_VAZIO = {
  veiculoId: '', data: new Date().toLocaleDateString('en-CA'),
  kmAtual: '', litros: '', valorTotal: '', posto: '',
  litrosArla: '', valorArla: '',
};

export default function Abastecimento() {
  const { data: veiculos }                    = useFetch(() => veiculoAPI.listar());
  const { data, loading, refetch }            = useFetch(() => abastecimentoAPI.listar({ limit: 30 }));
  const { data: resumo }                      = useFetch(() => abastecimentoAPI.resumo({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear() }));
  const { executar: criar,     loading: saving }   = useMutation(abastecimentoAPI.criar);
  const { executar: atualizar, loading: updating } = useMutation(abastecimentoAPI.atualizar);
  const { executar: deletar,   loading: deleting } = useMutation(abastecimentoAPI.deletar);

  const veiculosAtivos = (veiculos || []).filter(v => v.ativo !== false);

  const [form,          setForm]          = useState(FORM_VAZIO);
  const [editando,      setEditando]      = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // KM mais alto registrado por veículo no histórico carregado
  const kmPorVeiculo = useMemo(() => {
    const registros = data?.registros || [];
    const mapa = {};
    registros.forEach(r => {
      const id = r.veiculoId;
      if (!mapa[id] || r.kmAtual > mapa[id].kmAtual) {
        mapa[id] = { kmAtual: r.kmAtual, placa: r.veiculo?.placa, motorista: r.veiculo?.motorista };
      }
    });
    return Object.values(mapa).sort((a, b) => (a.placa || '').localeCompare(b.placa || ''));
  }, [data]);

  function abrirEditar(r) {
    setEditando(r.id);
    setForm({
      veiculoId:  r.veiculoId,
      data:       new Date(r.data).toLocaleDateString('en-CA'),
      kmAtual:    r.kmAtual,
      litros:     r.litros,
      valorTotal: r.valorTotal,
      posto:      r.posto || '',
      litrosArla: r.litrosArla || '',
      valorArla:  r.valorArla  || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fecharForm() {
    setEditando(null);
    setForm(FORM_VAZIO);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.veiculoId) { toast.error('Selecione um veículo'); return; }
    const payload = {
      ...form,
      kmAtual:    Number(form.kmAtual),
      litros:     Number(form.litros),
      valorTotal: Number(form.valorTotal),
      litrosArla: form.litrosArla ? Number(form.litrosArla) : null,
      valorArla:  form.valorArla  ? Number(form.valorArla)  : null,
    };
    if (editando) {
      await atualizar(editando, payload);
      toast.success('Abastecimento atualizado!');
    } else {
      await criar(payload);
      toast.success('Abastecimento registrado!');
    }
    fecharForm();
    refetch();
  }

  async function handleDeletar(id) {
    await deletar(id);
    toast.success('Abastecimento excluído!');
    setConfirmDelete(null);
    refetch();
  }

  const btnEditar = {
    background: 'rgba(88,166,255,.15)', color: '#58a6ff',
    border: '1px solid rgba(88,166,255,.3)',
    borderRadius: 6, padding: '4px 10px',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
  };
  const btnExcluir = {
    background: 'rgba(248,81,73,.12)', color: '#f85149',
    border: '1px solid rgba(248,81,73,.25)',
    borderRadius: 6, padding: '4px 10px',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
  };
  const btnSim = {
    background: 'rgba(248,81,73,.2)', color: '#f85149',
    border: '1px solid rgba(248,81,73,.4)',
    borderRadius: 6, padding: '4px 8px',
    fontSize: 11, fontWeight: 700, cursor: 'pointer',
  };
  const btnNao = {
    background: 'rgba(139,148,158,.15)', color: '#8b949e',
    border: '1px solid rgba(139,148,158,.3)',
    borderRadius: 6, padding: '4px 8px',
    fontSize: 11, fontWeight: 700, cursor: 'pointer',
  };

  const columns = [
    { key: 'data',       label: 'Data',    render: r => fmt.data(r.data) },
    { key: 'veiculo',    label: 'Veículo', render: r => `${r.veiculo?.placa}${r.veiculo?.motorista ? ` · ${r.veiculo.motorista}` : ''}`.toUpperCase() },
    { key: 'kmAtual',    label: 'KM',      mono: true, render: r => fmt.km(r.kmAtual) },
    { key: 'litros',     label: 'Litros',  mono: true, render: r => `${fmt.numero(r.litros)} L` },
    { key: 'valorTotal', label: 'Valor',   mono: true, render: r => fmt.moeda(r.valorTotal) },
    { key: 'litrosArla', label: 'Arla',    mono: true, render: r => r.litrosArla ? `${fmt.numero(r.litrosArla)} L` : '—' },
    { key: 'consumoKmL', label: 'Consumo', render: r => {
        const p = pilConsumo(r.consumoKmL);
        return <span style={{ color: p.color, fontFamily: "'DM Mono'" }}>{p.label}</span>;
    }},
    { key: 'precoKm', label: 'R$/km', mono: true, render: r => {
        if (!r.consumoKmL || !r.litros || !r.valorTotal) return '—';
        const kmRodados = r.litros * r.consumoKmL;
        if (!kmRodados) return '—';
        return fmt.moeda(r.valorTotal / kmRodados);
    }},
    { key: 'posto', label: 'Posto', render: r => (r.posto || '—').toUpperCase() },
    {
      key: 'acoes', label: 'Ações',
      render: r => (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button style={btnEditar} onClick={() => abrirEditar(r)}>✏️ Editar</button>
          {confirmDelete === r.id ? (
            <>
              <span style={{ fontSize: 11, color: '#f85149', fontWeight: 600 }}>Confirmar?</span>
              <button style={btnSim} disabled={deleting} onClick={() => handleDeletar(r.id)}>Sim</button>
              <button style={btnNao} onClick={() => setConfirmDelete(null)}>Não</button>
            </>
          ) : (
            <button style={btnExcluir} onClick={() => setConfirmDelete(r.id)}>🗑️ Excluir</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Abastecimento</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <CardHeader icon="⛽" title={editando ? 'Editar abastecimento' : 'Registrar abastecimento'} />
          <form onSubmit={handleSubmit} style={{ padding: 16 }}>
            <FormGrid>
              <Select label="Veículo" value={form.veiculoId} onChange={e => set('veiculoId', e.target.value)} required>
                <option value="">Selecione...</option>
                {veiculosAtivos.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.placa}{v.motorista ? ` · ${v.motorista}` : ''}
                  </option>
                ))}
              </Select>
              <DatePicker label="Data" value={form.data} onChange={v => set('data', v)} />
              <Input label="KM atual" type="number" placeholder="142.800" value={form.kmAtual} onChange={e => set('kmAtual', e.target.value)} required />
              <Input label="Litros Diesel" type="number" step="0.01" placeholder="320" value={form.litros} onChange={e => set('litros', e.target.value)} required />
              <Input label="Valor total Diesel (R$)" type="number" step="0.01" placeholder="1920.00" value={form.valorTotal} onChange={e => set('valorTotal', e.target.value)} required />
              <Input label="Posto" placeholder="Nome do posto" value={form.posto} onChange={e => set('posto', e.target.value)} />
              <Input label="Litros Arla (opcional)" type="number" step="0.01" placeholder="0" value={form.litrosArla} onChange={e => set('litrosArla', e.target.value)} />
              <Input label="Valor Arla (R$) (opcional)" type="number" step="0.01" placeholder="0.00" value={form.valorArla} onChange={e => set('valorArla', e.target.value)} />
            </FormGrid>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Btn type="submit" loading={saving || updating} style={{ flex: 1, justifyContent: 'center' }}>
                {editando ? 'Atualizar' : 'Salvar abastecimento'}
              </Btn>
              {editando && (
                <Btn variant="secondary" onClick={fecharForm}>Cancelar</Btn>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader icon="📈" title="Consumo médio por veículo (km/L)" />
          <div style={{ padding: 16, height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(resumo || []).map(r => ({
                placa: r.veiculo?.placa,
                consumo: r.mediaConsumo,
              }))}>
                <XAxis dataKey="placa" tick={{ fill: '#484f58', fontSize: 10, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#484f58', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 4]} />
                <Tooltip formatter={v => [`${v} km/L`, 'Consumo']} contentStyle={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="consumo" radius={[5,5,0,0]} fill="#f0a500"
                  label={{ position: 'top', fill: '#8b949e', fontSize: 10, formatter: v => v ? `${v}` : '' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Card KM por veículo */}
      <Card style={{ marginBottom: 16 }}>
        <CardHeader icon="🛣️" title="KM atual por veículo (últimos 30 registros)" />
        <div style={{ padding: '0 16px 8px' }}>
          {kmPorVeiculo.length === 0 && (
            <p style={{ fontSize: 13, color: '#484f58', padding: '12px 0' }}>Nenhum registro encontrado.</p>
          )}
          {kmPorVeiculo.map((v, i) => (
            <div
              key={v.placa}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < kmPorVeiculo.length - 1 ? '1px solid #21262d' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 7px',
                  borderRadius: 4, background: 'rgba(88,166,255,.12)',
                  color: '#58a6ff', border: '1px solid rgba(88,166,255,.25)',
                  fontFamily: "'DM Mono'",
                }}>
                  {v.placa?.toUpperCase()}
                </span>
                {v.motorista && (
                  <span style={{ fontSize: 12, color: '#8b949e' }}>{v.motorista}</span>
                )}
              </div>
              <span style={{ fontFamily: "'DM Mono'", fontSize: 14, fontWeight: 600, color: '#3fb950' }}>
                {fmt.km(v.kmAtual)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader icon="🕐" title="Histórico de abastecimentos" />
        <Table columns={columns} rows={data?.registros || []} loading={loading} />
      </Card>
    </div>
  );
}
