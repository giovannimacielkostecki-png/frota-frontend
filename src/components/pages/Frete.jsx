// src/components/pages/Frete.jsx
import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { freteAPI, veiculoAPI } from '../../api';
import { Card, CardHeader, Table, Btn, Input, Select, FormGrid } from '../ui';
import { fmt } from '../../utils';
import toast from 'react-hot-toast';

export default function Frete() {
  const { data: veiculos }                    = useFetch(() => veiculoAPI.listar());
  const { data: fretes, loading, refetch }    = useFetch(() => freteAPI.listar({ limit: 20 }));
  const { executar: salvar,  loading: saving  } = useMutation(freteAPI.salvar);
  const { executar: deletar, loading: deleting} = useMutation(freteAPI.deletar);

  const FORM_VAZIO = {
    veiculoId: '', motorista: '', origem: '', destino: '',
    distanciaKm: '', custoPedagio: '',
    custoDiaria: 360.31, custoKm: 3.213, manutencaoKm: 0.40,
    custoArlaKm: 0.10,
  };

  const [form,          setForm]          = useState(FORM_VAZIO);
  const [resultado,     setResultado]     = useState(null);
  const [editandoId,    setEditandoId]    = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function handleVeiculo(id) {
    set('veiculoId', id);
    const v = (veiculos || []).find(v => String(v.id) === String(id));
    if (v?.motorista) set('motorista', v.motorista);
  }

  function abrirEditar(r) {
    setEditandoId(r.id);
    setForm({
      veiculoId:    r.veiculoId,
      motorista:    r.veiculo?.motorista || '',
      origem:       r.origem,
      destino:      r.destino,
      distanciaKm:  r.distanciaKm,
      custoPedagio: r.custoPedagio || '',
      custoDiaria:  r.custoDiaria  || 360.31,
      custoKm:      3.213,
      manutencaoKm: r.distanciaKm ? parseFloat((r.custoDepreciacao / r.distanciaKm).toFixed(4)) : 0.40,
      custoArlaKm:  r.custoArla && r.distanciaKm ? parseFloat((r.custoArla / r.distanciaKm).toFixed(4)) : 0.10,
    });
    setResultado(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fecharEditar() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setResultado(null);
  }

  function calcular(e) {
    e.preventDefault();
    const dist        = Number(form.distanciaKm);
    const combustivel = dist * Number(form.custoKm);
    const pedagio     = Number(form.custoPedagio) || 0;
    const diaria      = Number(form.custoDiaria)  || 0;
    const manutencao  = dist * Number(form.manutencaoKm);
    const arla        = dist * Number(form.custoArlaKm);
    const total       = combustivel + pedagio + diaria + manutencao + arla;
    setResultado({ combustivel, pedagio, diaria, manutencao, arla, total, dist });
  }

  async function handleSalvar() {
    if (!form.veiculoId) { toast.error('Selecione um veículo'); return; }
    if (!resultado)      { toast.error('Calcule o frete primeiro'); return; }
    const payload = {
      veiculoId:         Number(form.veiculoId),
      origem:            form.origem,
      destino:           form.destino,
      distanciaKm:       Number(form.distanciaKm),
      precoDiesel:       Number(form.custoKm),
      consumoKmL:        1,
      pedagio:           Number(form.custoPedagio)  || 0,
      diariaMot:         Number(form.custoDiaria)   || 0,
      margemLucro:       0,
      custoArlaKm:       Number(form.custoArlaKm)   || 0,
      custoManutencaoKm: Number(form.manutencaoKm)  || 0,
    };
    if (editandoId) {
      await freteAPI.atualizar(editandoId, payload);
      toast.success('Frete atualizado!');
      fecharEditar();
    } else {
      await salvar(payload);
      toast.success('Frete salvo!');
      setResultado(null);
    }
    refetch();
  }

  async function handleDeletar(id) {
    await deletar(id);
    toast.success('Frete excluído!');
    setConfirmDelete(null);
    refetch();
  }

  const btnEditar  = { background: 'rgba(88,166,255,.15)',  color: '#58a6ff', border: '1px solid rgba(88,166,255,.3)',  borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
  const btnExcluir = { background: 'rgba(248,81,73,.12)',   color: '#f85149', border: '1px solid rgba(248,81,73,.25)', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
  const btnSim     = { background: 'rgba(248,81,73,.2)',    color: '#f85149', border: '1px solid rgba(248,81,73,.4)',  borderRadius: 6, padding: '4px 8px',  fontSize: 11, fontWeight: 700, cursor: 'pointer' };
  const btnNao     = { background: 'rgba(139,148,158,.15)', color: '#8b949e', border: '1px solid rgba(139,148,158,.3)',borderRadius: 6, padding: '4px 8px',  fontSize: 11, fontWeight: 700, cursor: 'pointer' };

  const columns = [
    { key: 'rota',      label: 'Rota',      render: r => `${r.origem} → ${r.destino}` },
    { key: 'veiculo',   label: 'Veículo',   render: r => r.veiculo?.placa || '—' },
    { key: 'distancia', label: 'Distância', mono: true, render: r => fmt.km(r.distanciaKm) },
    { key: 'valor',     label: 'Custo',     mono: true, render: r => fmt.moeda(r.valorFrete) },
    { key: 'custokm',   label: 'R$/km',     mono: true, render: r => r.distanciaKm ? fmt.moeda(r.valorFrete / r.distanciaKm) : '—' },
    { key: 'data',      label: 'Data',      render: r => fmt.data(r.criadoEm) },
    { key: 'acoes',     label: 'Ações',     render: r => (
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
    )},
  ];

  const row = (label, value, color) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
      <span style={{ color: '#8b949e' }}>{label}</span>
      <span style={{ fontFamily: "'DM Mono'", color: color || '#e6edf3' }}>{fmt.moeda(value)}</span>
    </div>
  );

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Cálculo de frete</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <CardHeader icon="🧮" title={editandoId ? 'Editar frete' : 'Parâmetros do frete'} />
          <form onSubmit={calcular} style={{ padding: 16 }}>
            <FormGrid>
              <Select label="Veículo" value={form.veiculoId} onChange={e => handleVeiculo(e.target.value)} required>
                <option value="">Selecione...</option>
                {(veiculos || []).filter(v => v.ativo !== false).map(v => (
                  <option key={v.id} value={v.id}>{v.placa}{v.motorista ? ` · ${v.motorista}` : ''}</option>
                ))}
              </Select>
              <Input label="Motorista" value={form.motorista} onChange={e => set('motorista', e.target.value)} placeholder="Nome do motorista" />
              <Input label="Origem"  value={form.origem}  onChange={e => set('origem',  e.target.value)} placeholder="ex: São Paulo, SP" required />
              <Input label="Destino" value={form.destino} onChange={e => set('destino', e.target.value)} placeholder="ex: Campinas, SP"  required />
              <Input label="Distância (km)" type="number" value={form.distanciaKm} onChange={e => set('distanciaKm', e.target.value)} placeholder="338" required />
              <Input label="Pedágio (R$)" type="number" step="0.01" value={form.custoPedagio} onChange={e => set('custoPedagio', e.target.value)} placeholder="404.10" />
              <Input label="Diária motorista (R$)" type="number" step="0.01" value={form.custoDiaria} onChange={e => set('custoDiaria', e.target.value)} />
              <Input label="Custo combustível (R$/km)" type="number" step="0.001" value={form.custoKm} onChange={e => set('custoKm', e.target.value)} />
              <Input label="Manutenção (R$/km)" type="number" step="0.01" value={form.manutencaoKm} onChange={e => set('manutencaoKm', e.target.value)} />
              <Input label="Arla 32 (R$/km)" type="number" step="0.001" value={form.custoArlaKm} onChange={e => set('custoArlaKm', e.target.value)} />
            </FormGrid>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <Btn type="submit" style={{ flex: 1, justifyContent: 'center' }}>Calcular frete</Btn>
              {editandoId && <Btn variant="secondary" onClick={fecharEditar}>Cancelar</Btn>}
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader icon="💰" title="Resultado do cálculo" />
          <div style={{ padding: 16 }}>
            {!resultado ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#484f58', fontSize: 13 }}>
                Preencha os parâmetros e clique em calcular
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: '#484f58', marginBottom: 4 }}>Custo total da viagem</div>
                  <div style={{ fontSize: 32, fontWeight: 600, fontFamily: "'DM Mono'", color: '#f0a500' }}>
                    {fmt.moeda(resultado.total)}
                  </div>
                  <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>
                    {fmt.moeda(resultado.total / resultado.dist)} por km
                  </div>
                </div>
                <div style={{ background: '#21262d', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                  {row('Combustível',      resultado.combustivel)}
                  {row('Pedágio',          resultado.pedagio)}
                  {row('Diária motorista', resultado.diaria)}
                  {row('Manutenção',       resultado.manutencao)}
                  {row('Arla 32',          resultado.arla)}
                  <div style={{ borderTop: '1px solid #30363d', paddingTop: 8, marginTop: 4 }}>
                    {row('Total', resultado.total, '#f0a500')}
                  </div>
                </div>
                <Btn variant="primary" loading={saving} onClick={handleSalvar} style={{ width: '100%', justifyContent: 'center' }}>
                  {editandoId ? 'Atualizar frete' : 'Salvar frete'}
                </Btn>
              </>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader icon="🕐" title="Fretes recentes" />
        <Table columns={columns} rows={fretes || []} loading={loading} />
      </Card>
    </div>
  );
}
