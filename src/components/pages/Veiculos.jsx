// src/components/pages/Veiculos.jsx
import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { veiculoAPI } from '../../api';
import { Card, CardHeader, Table, StatCard, Btn, Input, FormGrid } from '../ui';
import { fmt } from '../../utils';
import toast from 'react-hot-toast';

const FORM_VAZIO = {
  placa: '', modelo: '', marca: '',
  ano: new Date().getFullYear(),
  renavam: '', kmAtual: 0, motorista: '',
};

export default function Veiculos() {
  const { data, loading, refetch } = useFetch(() => veiculoAPI.listar());
  const { executar: criar,     loading: saving }   = useMutation(veiculoAPI.criar);
  const { executar: atualizar, loading: updating } = useMutation(veiculoAPI.atualizar);
  const { executar: desativar, loading: deleting } = useMutation(veiculoAPI.desativar);

  const [showForm,       setShowForm]       = useState(false);
  const [editando,       setEditando]       = useState(null);
  const [confirmDelete,  setConfirmDelete]  = useState(null);
  const [form,           setForm]           = useState(FORM_VAZIO);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Apenas veículos ativos aparecem na tabela. Os inativos continuam no banco,
  // só ficam ocultos aqui. Para voltar a mostrar todos, troque por (data || []).
  const veiculosVisiveis = (data || []).filter(v => v.ativo);

  function abrirNovo() {
    setEditando(null);
    setForm(FORM_VAZIO);
    setShowForm(true);
  }

  function abrirEditar(veiculo) {
    setEditando(veiculo.id);
    setForm({
      placa:     veiculo.placa,
      modelo:    veiculo.modelo,
      marca:     veiculo.marca,
      ano:       veiculo.ano,
      renavam:   veiculo.renavam,
      kmAtual:   veiculo.kmAtual,
      motorista: veiculo.motorista || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fecharForm() {
    setShowForm(false);
    setEditando(null);
    setForm(FORM_VAZIO);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, ano: Number(form.ano), kmAtual: Number(form.kmAtual) };
    if (editando) {
      await atualizar(editando, payload);
      toast.success('Veículo atualizado!');
    } else {
      await criar(payload);
      toast.success('Veículo cadastrado!');
    }
    fecharForm();
    refetch();
  }

  async function handleDesativar(id) {
    await desativar(id);
    toast.success('Veículo desativado!');
    setConfirmDelete(null);
    refetch();
  }

  const btnEditar = {
    background: 'rgba(88,166,255,.15)',
    color: '#58a6ff',
    border: '1px solid rgba(88,166,255,.3)',
    borderRadius: 6, padding: '4px 10px',
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
  };
  const btnExcluir = {
    background: 'rgba(248,81,73,.12)',
    color: '#f85149',
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
    { key: 'placa',     label: 'Placa',     mono: true },
    { key: 'modelo',    label: 'Modelo' },
    { key: 'marca',     label: 'Marca' },
    { key: 'ano',       label: 'Ano',       mono: true },
    { key: 'motorista', label: 'Motorista', render: r => r.motorista || '—' },
    { key: 'kmAtual',   label: 'KM atual',  mono: true, render: r => fmt.km(r.kmAtual) },
    {
      key: 'ativo', label: 'Status',
      render: r => (
        <span style={{
          background: r.ativo ? 'rgba(63,185,80,.15)' : 'rgba(248,81,73,.15)',
          color: r.ativo ? '#3fb950' : '#f85149',
          padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600,
        }}>
          {r.ativo ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      key: 'acoes', label: 'Ações',
      render: r => (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button style={btnEditar} onClick={() => abrirEditar(r)}>✏️ Editar</button>
          {confirmDelete === r.id ? (
            <>
              <span style={{ fontSize: 11, color: '#f85149', fontWeight: 600 }}>Confirmar?</span>
              <button style={btnSim} disabled={deleting} onClick={() => handleDesativar(r.id)}>Sim</button>
              <button style={btnNao} onClick={() => setConfirmDelete(null)}>Não</button>
            </>
          ) : (
            <button style={btnExcluir} onClick={() => setConfirmDelete(r.id)}>🗑️ Desativar</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Veículos</h2>
        <Btn onClick={abrirNovo}>+ Novo veículo</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total de veículos" value={(data || []).length} />
        <StatCard label="Ativos"   value={(data || []).filter(v => v.ativo).length}  color="#3fb950" />
        <StatCard label="Inativos" value={(data || []).filter(v => !v.ativo).length} color="#f85149" />
      </div>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <CardHeader icon={editando ? '✏️' : '➕'} title={editando ? 'Editar veículo' : 'Cadastrar veículo'} />
          <form onSubmit={handleSubmit} style={{ padding: 16 }}>
            <FormGrid>
              <Input label="Placa"     value={form.placa}     onChange={e => set('placa', e.target.value.toUpperCase())} placeholder="BRA2E19" required />
              <Input label="Modelo"    value={form.modelo}    onChange={e => set('modelo', e.target.value)}    placeholder="FH 540"      required />
              <Input label="Marca"     value={form.marca}     onChange={e => set('marca', e.target.value)}     placeholder="Volvo"       required />
              <Input label="Ano"       type="number" value={form.ano}       onChange={e => set('ano', e.target.value)}       required />
              <Input label="RENAVAM"   value={form.renavam}   onChange={e => set('renavam', e.target.value)}   required />
              <Input label="KM atual"  type="number" value={form.kmAtual}   onChange={e => set('kmAtual', e.target.value)} />
              <Input label="Motorista" value={form.motorista} onChange={e => set('motorista', e.target.value)} placeholder="Nome do motorista" />
            </FormGrid>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Btn type="submit" loading={saving || updating}>{editando ? 'Atualizar' : 'Salvar'}</Btn>
              <Btn variant="secondary" onClick={fecharForm}>Cancelar</Btn>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader icon="🚛" title="Frota ativa" />
        <Table columns={columns} rows={veiculosVisiveis} loading={loading} />
      </Card>
    </div>
  );
}
