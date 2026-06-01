// src/components/pages/Veiculos.jsx
import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { veiculoAPI } from '../../api';
import { Card, CardHeader, Table, StatCard, Btn, Input, Select, FormGrid } from '../ui';
import { fmt } from '../../utils';
import toast from 'react-hot-toast';

export default function Veiculos() {
  const { data, loading, refetch } = useFetch(() => veiculoAPI.listar());
  const { executar: criar, loading: saving } = useMutation(veiculoAPI.criar);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ placa:'', modelo:'', marca:'', ano: new Date().getFullYear(), renavam:'', chassi:'', kmAtual:0 });
  const set = (k,v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    await criar({ ...form, ano: Number(form.ano), kmAtual: Number(form.kmAtual) });
    toast.success('Veículo cadastrado!');
    setShowForm(false);
    setForm({ placa:'', modelo:'', marca:'', ano: new Date().getFullYear(), renavam:'', chassi:'', kmAtual:0 });
    refetch();
  }

  const columns = [
    { key: 'placa',   label: 'Placa',    mono: true },
    { key: 'modelo',  label: 'Modelo' },
    { key: 'marca',   label: 'Marca' },
    { key: 'ano',     label: 'Ano',      mono: true },
    { key: 'kmAtual', label: 'KM atual', mono: true, render: r => fmt.km(r.kmAtual) },
    { key: 'ativo',   label: 'Status',   render: r => <span style={{ background: r.ativo ? 'rgba(63,185,80,.15)' : 'rgba(248,81,73,.15)', color: r.ativo ? '#3fb950' : '#f85149', padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:600 }}>{r.ativo ? 'Ativo' : 'Inativo'}</span> },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Veículos</h2>
        <Btn onClick={() => setShowForm(!showForm)}>+ Novo veículo</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total de veículos" value={(data||[]).length} />
        <StatCard label="Ativos"    value={(data||[]).filter(v=>v.ativo).length}  color="#3fb950" />
        <StatCard label="Inativos"  value={(data||[]).filter(v=>!v.ativo).length} color="#f85149" />
      </div>
      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <CardHeader icon="➕" title="Cadastrar veículo" />
          <form onSubmit={handleSubmit} style={{ padding: 16 }}>
            <FormGrid>
              <Input label="Placa" value={form.placa} onChange={e => set('placa', e.target.value.toUpperCase())} placeholder="BRA2E19" required />
              <Input label="Modelo" value={form.modelo} onChange={e => set('modelo', e.target.value)} placeholder="FH 540" required />
              <Input label="Marca" value={form.marca} onChange={e => set('marca', e.target.value)} placeholder="Volvo" required />
              <Input label="Ano" type="number" value={form.ano} onChange={e => set('ano', e.target.value)} required />
              <Input label="RENAVAM" value={form.renavam} onChange={e => set('renavam', e.target.value)} required />
              <Input label="Chassi" value={form.chassi} onChange={e => set('chassi', e.target.value)} required />
              <Input label="KM atual" type="number" value={form.kmAtual} onChange={e => set('kmAtual', e.target.value)} />
            </FormGrid>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Btn type="submit" loading={saving}>Salvar</Btn>
              <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Btn>
            </div>
          </form>
        </Card>
      )}
      <Card>
        <CardHeader icon="🚛" title="Frota completa" />
        <Table columns={columns} rows={data||[]} loading={loading} />
      </Card>
    </div>
  );
}
