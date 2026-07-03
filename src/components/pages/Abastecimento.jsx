// src/components/pages/Abastecimento.jsx
import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { abastecimentoAPI, veiculoAPI } from '../../api';
import { Card, CardHeader, Table, Btn, Input, Select, FormGrid } from '../ui';
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
  veiculoId: '',
  data: new Date().toLocaleDateString('en-CA'),
  kmAtual: '',
  litros: '',
  valorTotal: '',
  pedagio: '',
  posto: '',
  litrosArla: '',
  valorArla: '',
};

export default function Abastecimento() {
  const { data: veiculos } = useFetch(() => veiculoAPI.listar());
  const { data, loading, refetch } = useFetch(() => abastecimentoAPI.listar({ limit: 200 }));
  const { data: resumo } = useFetch(() =>
    abastecimentoAPI.resumo({
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear(),
    })
  );

  const { executar: criar, loading: saving } = useMutation(abastecimentoAPI.criar);
  const { executar: atualizar, loading: updating } = useMutation(abastecimentoAPI.atualizar);
  const { executar: deletar, loading: deleting } = useMutation(abastecimentoAPI.deletar);

  const veiculosAtivos = (veiculos || []).filter((v) => v.ativo !== false);

  const [form, setForm] = useState(FORM_VAZIO);
  const [editando, setEditando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filtroVeiculo, setFiltroVeiculo] = useState('');

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  function abrirEditar(r) {
    setEditando(r.id);
    setForm({
      veiculoId: r.veiculoId,
      data: new Date(r.data).toLocaleDateString('en-CA'),
      kmAtual: r.kmAtual,
      litros: r.litros,
      valorTotal: r.valorTotal,
      pedagio: r.pedagio || '',
      posto: r.posto || '',
      litrosArla: r.litrosArla || '',
      valorArla: r.valorArla || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fecharForm() {
    setEditando(null);
    setForm(FORM_VAZIO);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.veiculoId) {
      toast.error('Selecione um veículo');
      return;
    }

    const payload = {
      ...form,
      kmAtual: Number(form.kmAtual),
      litros: Number(form.litros),
      valorTotal: Number(form.valorTotal),
      pedagio: form.pedagio ? Number(form.pedagio) : 0,
      litrosArla: form.litrosArla ? Number(form.litrosArla) : null,
      valorArla: form.valorArla ? Number(form.valorArla) : null,
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

  const linhasFiltradas = (data?.registros || []).filter((r) => {
    if (!filtroVeiculo) return true;
    return String(r.veiculoId) === String(filtroVeiculo);
  });

  const btnEditar = {
    background: 'rgba(88,166,255,.15)',
    color: '#58a6ff',
    border: '1px solid rgba(88,166,255,.3)',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  };

  const btnExcluir = {
    background: 'rgba(248,81,73,.12)',
    color: '#f85149',
    border: '1px solid rgba(248,81,73,.25)',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  };

  const btnSim = {
    background: 'rgba(248,81,73,.2)',
    color: '#f85149',
    border: '1px solid rgba(248,81,73,.4)',
    borderRadius: 6,
    padding: '4px 8px',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
  };

  const btnNao = {
    background: 'rgba(139,148,158,.15)',
    color: '#8b949e',
    border: '1px solid rgba(139,148,158,.3)',
    borderRadius: 6,
    padding: '4px 8px',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
  };

  const columns = [
    {
      key: 'data',
      label: 'Data',
      render: (r) => fmt.data(r.data),
    },
    {
      key: 'veiculo',
      label: 'Veículo',
      render: (r) =>
        `${r.veiculo?.placa}${r.veiculo?.motorista ? ` · ${r.veiculo.motorista}` : ''}`.toUpperCase(),
    },
    {
      key: 'kmRodado',
      label: 'KM rodado',
      mono: true,
      render: (r) => {
        if (!r.kmAnterior || r.kmAtual - r.kmAnterior <= 0) return '—';
        return fmt.km(r.kmAtual - r.kmAnterior);
      },
    },
    {
      key: 'litros',
      label: 'Litros',
      mono: true,
      render: (r) => `${fmt.numero(r.litros)} L`,
    },
    {
      key: 'valorTotal',
      label: 'Diesel',
      mono: true,
      render: (r) => fmt.moeda(r.valorTotal),
    },
    {
      key: 'pedagio',
      label: 'Pedágio',
      mono: true,
      render: (r) => (r.pedagio ? fmt.moeda(r.pedagio) : '—'),
    },
    {
      key: 'totalGasto',
      label: 'Total',
      mono: true,
      render: (r) => {
        const total = (Number(r.valorTotal) || 0) + (Number(r.pedagio) || 0);
        return fmt.moeda(total);
      },
    },
    {
      key: 'litrosArla',
      label: 'Arla',
      mono: true,
      render: (r) => (r.litrosArla ? `${fmt.numero(r.litrosArla)} L` : '—'),
    },
    {
      key: 'consumoKmL',
      label: 'Consumo',
      render: (r) => {
        const p = pilConsumo(r.consumoKmL);
        return <span style={{ color: p.color, fontFamily: "'DM Mono'" }}>{p.label}</span>;
      },
    },
    {
      key: 'precoKm',
      label: 'R$/km',
      mono: true,
      render: (r) => {
        if (!r.consumoKmL || !r.litros) return '—';

        const kmRodados = r.litros * r.consumoKmL;
        if (!kmRodados) return '—';

        const totalGasto = (Number(r.valorTotal) || 0) + (Number(r.pedagio) || 0);

        return fmt.moeda(totalGasto / kmRodados);
      },
    },
    {
      key: 'posto',
      label: 'Posto',
      render: (r) => (r.posto || '—').toUpperCase(),
    },
    {
      key: 'acoes',
      label: 'Ações',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button style={btnEditar} onClick={() => abrirEditar(r)}>
            ✏️ Editar
          </button>

          {confirmDelete === r.id ? (
            <>
              <span style={{ fontSize: 11, color: '#f85149', fontWeight: 600 }}>Confirmar?</span>
              <button style={btnSim} disabled={deleting} onClick={() => handleDeletar(r.id)}>
                Sim
              </button>
              <button style={btnNao} onClick={() => setConfirmDelete(null)}>
                Não
              </button>
            </>
          ) : (
            <button style={btnExcluir} onClick={() => setConfirmDelete(r.id)}>
              🗑️ Excluir
            </button>
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
              <Select label="Veículo" value={form.veiculoId} onChange={(e) => set('veiculoId', e.target.value)} required>
                <option value="">Selecione...</option>
                {veiculosAtivos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa}
                    {v.motorista ? ` · ${v.motorista}` : ''}
                  </option>
                ))}
              </Select>

              <DatePicker label="Data" value={form.data} onChange={(v) => set('data', v)} />

              <Input
                label="KM atual"
                type="number"
                placeholder="142.800"
                value={form.kmAtual}
                onChange={(e) => set('kmAtual', e.target.value)}
                required
              />

              <Input
                label="Litros Diesel"
                type="number"
                step="0.01"
                placeholder="320"
                value={form.litros}
                onChange={(e) => set('litros', e.target.value)}
                required
              />

              <Input
                label="Valor total Diesel (R$)"
                type="number"
                step="0.01"
                placeholder="1920.00"
                value={form.valorTotal}
                onChange={(e) => set('valorTotal', e.target.value)}
                required
              />

              <Input
                label="Pedágio (R$)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.pedagio}
                onChange={(e) => set('pedagio', e.target.value)}
              />

              <Input label="Posto" placeholder="Nome do posto" value={form.posto} onChange={(e) => set('posto', e.target.value)} />

              <Input
                label="Litros Arla (opcional)"
                type="number"
                step="0.01"
                placeholder="0"
                value={form.litrosArla}
                onChange={(e) => set('litrosArla', e.target.value)}
              />

              <Input
                label="Valor Arla (R$) (opcional)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.valorArla}
                onChange={(e) => set('valorArla', e.target.value)}
              />
            </FormGrid>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Btn type="submit" loading={saving || updating} style={{ flex: 1, justifyContent: 'center' }}>
                {editando ? 'Atualizar' : 'Salvar abastecimento'}
              </Btn>

              {editando && (
                <Btn variant="secondary" onClick={fecharForm}>
                  Cancelar
                </Btn>
              )}
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader icon="📈" title="Consumo médio por veículo (km/L)" />

         <div style={{ padding: 16, height: 300 }}>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={(resumo || []).map((r) => ({
        nome: `${r.veiculo?.placa || ''}\n${r.veiculo?.motorista || 'SEM MOTORISTA'}`.toUpperCase(),
        consumo: r.mediaConsumo,
      }))}
      margin={{
        top: 20,
        right: 10,
        left: 0,
        bottom: 45,
      }}
    >
      <XAxis
        dataKey="nome"
        interval={0}
        height={65}
        tick={{
          fill: '#484f58',
          fontSize: 10,
          fontFamily: "'DM Mono'",
        }}
        tickFormatter={(value) => value.replace('\n', ' ')}
        axisLine={false}
        tickLine={false}
      />

      <YAxis
        tick={{ fill: '#484f58', fontSize: 10 }}
        axisLine={false}
        tickLine={false}
        domain={[0, 4]}
      />

      <Tooltip
        formatter={(v) => [`${v} km/L`, 'Consumo']}
        labelFormatter={(label) => label.replace('\n', ' - ')}
        contentStyle={{
          background: '#21262d',
          border: '1px solid #30363d',
          borderRadius: 8,
          fontSize: 12,
        }}
      />

      <Bar
        dataKey="consumo"
        radius={[5, 5, 0, 0]}
        fill="#f0a500"
        label={{
          position: 'top',
          fill: '#8b949e',
          fontSize: 10,
          formatter: (v) => (v ? `${v}` : ''),
        }}
      />
    </BarChart>
  </ResponsiveContainer>
</div>
      <Card>
        <CardHeader icon="🕐" title="Histórico de abastecimentos" />

        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid #30363d',
            display: 'flex',
            gap: 12,
            alignItems: 'end',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ width: 320 }}>
            <Select label="Filtrar por placa" value={filtroVeiculo} onChange={(e) => setFiltroVeiculo(e.target.value)}>
              <option value="">Todas as placas</option>
              {veiculosAtivos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa}
                  {v.motorista ? ` · ${v.motorista}` : ''}
                </option>
              ))}
            </Select>
          </div>

          {filtroVeiculo && (
            <Btn variant="secondary" onClick={() => setFiltroVeiculo('')}>
              Limpar filtro
            </Btn>
          )}
        </div>

        <Table columns={columns} rows={linhasFiltradas} loading={loading} />
      </Card>
    </div>
  );
}
