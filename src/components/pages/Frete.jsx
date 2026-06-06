// src/components/pages/Frete.jsx
import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { freteAPI, veiculoAPI } from '../../api';
import { Card, CardHeader, Table, Btn, Input, Select, FormGrid } from '../ui';
import { fmt, statusPill } from '../../utils';
import toast from 'react-hot-toast';

export default function Frete() {
  const { data: veiculos }                       = useFetch(() => veiculoAPI.listar());
  const { data: fretes, loading, refetch }       = useFetch(() => freteAPI.listar({ limit: 20 }));
  const { executar: salvar, loading: saving }    = useMutation(freteAPI.salvar);

  const [form, setForm] = useState({
    veiculoId:    '',
    motorista:    '',
    origem:       '',
    destino:      '',
    distanciaKm:  '',
    custoPedagio: '',
    custoDiaria:  360.31,
    custoKm:      3.213,
    manutencaoKm: 0.40,
  });
  const [resultado, setResultado] = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  function handleVeiculo(id) {
    set('veiculoId', id);
    const v = (veiculos || []).find(v => String(v.id) === String(id));
    if (v?.motorista) set('motorista', v.motorista);
  }

  function calcular(e) {
    e.preventDefault();
    const dist     = Number(form.distanciaKm);
    const combustivel = dist * Number(form.custoKm);
    const pedagio     = Number(form.custoPedagio) || 0;
    const diaria      = Number(form.custoDiaria)  || 0;
    const manutencao  = dist * Number(form.manutencaoKm);
    const total       = combustivel + pedagio + diaria + manutencao;
    setResultado({ combustivel, pedagio, diaria, manutencao, total, dist });
  }

  async function handleSalvar() {
    if (!form.veiculoId) { toast.error('Selecione um veículo para salvar'); return; }
    if (!resultado)      { toast.error('Calcule o frete primeiro'); return; }
    const dist = Number(form.distanciaKm);
    await salvar({
      veiculoId:    Number(form.veiculoId),
      origem:       form.origem,
      destino:      form.destino,
      distanciaKm:  dist,
      precoDiesel:  Number(form.custoKm),
      consumoKmL:   1,
      pedagio:      Number(form.custoPedagio) || 0,
      diariaMot:    Number(form.custoDiaria)  || 0,
      margemLucro:  0,
      custoCombustivel: resultado.combustivel,
      custoPedagio:     resultado.pedagio,
      custoDiaria:      resultado.diaria,
      custoDepreciacao: resultado.manutencao,
      custoTotal:       resultado.total,
      valorFrete:       resultado.total,
    });
    toast.success('Frete salvo!');
    refetch();
  }

  const columns = [
    { key: 'rota',      label: 'Rota',      render: r => `${r.origem} → ${r.destino}` },
    { key: 'veiculo',   label: 'Veículo',   render: r => r.veiculo?.placa || '—' },
    { key: 'distancia', label: 'Distância', mono: true, render: r => fmt.km(r.distanciaKm) },
    { key: 'valor',     label: 'Custo',     mono: true, render: r => fmt.moeda(r.valorFrete) },
    { key: 'custokm',   label: 'R$/km',     mono: true, render: r => r.distanciaKm ? fmt.moeda(r.valorFrete / r.distanciaKm) : '—' },
    { key: 'status',    label: 'Status',    render: r => { const s = statusPill(r.status); return <span style={{ background: s.bg, color: s.color, padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{s.label}</span>; }},
    { key: 'data',      label: 'Data',      render: r => fmt.data(r.criadoEm) },
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

        {/* FORMULÁRIO */}
        <Card>
          <CardHeader icon="🧮" title="Parâmetros do frete" />
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
            </FormGrid>
            <Btn type="submit" loading={false} style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
              Calcular frete
            </Btn>
          </form>
        </Card>

        {/* RESULTADO */}
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
                  {row('Combustível', resultado.combustivel)}
                  {row('Pedágio',     resultado.pedagio)}
                  {row('Diária motorista', resultado.diaria)}
                  {row('Manutenção',  resultado.manutencao)}
                  <div style={{ borderTop: '1px solid #30363d', paddingTop: 8, marginTop: 4 }}>
                    {row('Total', resultado.total, '#f0a500')}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn variant="primary" loading={saving} onClick={handleSalvar} style={{ width: '100%', justifyContent: 'center' }}>
                    Salvar frete
                  </Btn>
                </div>
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
