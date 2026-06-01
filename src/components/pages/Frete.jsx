// src/components/pages/Frete.jsx
import { useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { freteAPI, veiculoAPI } from '../../api';
import { Card, CardHeader, Table, Btn, Input, Select, FormGrid, PageLoading } from '../ui';
import { fmt, statusPill } from '../../utils';
import toast from 'react-hot-toast';

export default function Frete() {
  const { data: veiculos }                = useFetch(() => veiculoAPI.listar());
  const { data: fretes, loading, refetch} = useFetch(() => freteAPI.listar({ limit: 20 }));
  const { executar: calcular, loading: calcing } = useMutation(freteAPI.calcular);
  const { executar: salvar,   loading: saving  } = useMutation(freteAPI.salvar);

  const [form, setForm] = useState({
    veiculoId: '', origem: 'São Paulo, SP', destino: 'Curitiba, PR',
    distanciaKm: 408, pesoCarga: 25,
    precoDiesel: 6.0, consumoKmL: 2.8,
    custoPedagio: 320, custoDiaria: 250, margemLucro: 20,
  });
  const [resultado, setResultado] = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleCalcular(e) {
    e.preventDefault();
    const res = await calcular({
      distanciaKm: Number(form.distanciaKm),
      precoDiesel:  Number(form.precoDiesel),
      consumoKmL:   Number(form.consumoKmL),
      pedagio:      Number(form.custoPedagio),
      diariaMot:    Number(form.custoDiaria),
      margemLucro:  Number(form.margemLucro),
      pesoCarga:    Number(form.pesoCarga),
    });
    setResultado(res);
  }

  async function handleSalvar() {
    if (!form.veiculoId) { toast.error('Selecione um veículo para salvar'); return; }
    await salvar({
      ...form,
      distanciaKm: Number(form.distanciaKm), pesoCarga: Number(form.pesoCarga),
      precoDiesel:  Number(form.precoDiesel), consumoKmL: Number(form.consumoKmL),
      custoPedagio: Number(form.custoPedagio), custoDiaria: Number(form.custoDiaria),
      margemLucro:  Number(form.margemLucro),
    });
    toast.success('Frete salvo com sucesso!');
    refetch();
  }

  const columns = [
    { key: 'rota',      label: 'Rota',     render: r => `${r.origem} → ${r.destino}` },
    { key: 'veiculo',   label: 'Veículo',  render: r => r.veiculo?.placa },
    { key: 'distancia', label: 'Distância',mono: true, render: r => fmt.km(r.distanciaKm) },
    { key: 'valor',     label: 'Valor',    mono: true, render: r => fmt.moeda(r.valorFrete) },
    { key: 'margem',    label: 'Margem',   render: r => <span style={{ color: r.margemLucro >= 20 ? '#3fb950' : '#f0a500', fontFamily: "'DM Mono'" }}>{r.margemLucro}%</span> },
    { key: 'status',    label: 'Status',   render: r => { const s = statusPill(r.status); return <span style={{ background: s.bg, color: s.color, padding: '2px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>{s.label}</span>; }},
    { key: 'data',      label: 'Data',     render: r => fmt.data(r.criadoEm) },
  ];

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Cálculo de frete</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* FORMULÁRIO */}
        <Card>
          <CardHeader icon="🧮" title="Parâmetros do frete" />
          <form onSubmit={handleCalcular} style={{ padding: 16 }}>
            <FormGrid>
              <Input label="Origem"  value={form.origem}  onChange={e => set('origem', e.target.value)}  required />
              <Input label="Destino" value={form.destino} onChange={e => set('destino', e.target.value)} required />
              <Input label="Distância (km)" type="number" value={form.distanciaKm} onChange={e => set('distanciaKm', e.target.value)} required />
              <Input label="Peso da carga (ton)" type="number" value={form.pesoCarga} onChange={e => set('pesoCarga', e.target.value)} />
              <Input label="Preço diesel (R$/L)" type="number" step="0.01" value={form.precoDiesel} onChange={e => set('precoDiesel', e.target.value)} required />
              <Input label="Consumo médio (km/L)" type="number" step="0.1" value={form.consumoKmL} onChange={e => set('consumoKmL', e.target.value)} required />
              <Input label="Pedágio estimado (R$)" type="number" value={form.custoPedagio} onChange={e => set('custoPedagio', e.target.value)} />
              <Input label="Diária motorista (R$)" type="number" value={form.custoDiaria} onChange={e => set('custoDiaria', e.target.value)} />
              <Input label="Margem de lucro (%)" type="number" value={form.margemLucro} onChange={e => set('margemLucro', e.target.value)} required />
            </FormGrid>
            <Btn type="submit" loading={calcing} style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
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
                  <div style={{ fontSize: 11, color: '#484f58', marginBottom: 4 }}>Valor sugerido do frete</div>
                  <div style={{ fontSize: 32, fontWeight: 600, fontFamily: "'DM Mono'", color: '#f0a500' }}>
                    {fmt.moeda(resultado.valorFrete)}
                  </div>
                  {resultado.valorPorTonelada && (
                    <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>
                      {fmt.moeda(resultado.valorPorTonelada)} por tonelada
                    </div>
                  )}
                </div>

                <div style={{ background: '#21262d', borderRadius: 8, padding: 14, marginBottom: 16 }}>
                  {[
                    ['Combustível', resultado.custoCombustivel],
                    ['Pedágio',     resultado.custoPedagio],
                    ['Motorista',   resultado.custoDiaria],
                    ['Depreciação', resultado.custoDepreciacao],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e', marginBottom: 6 }}>
                      <span>{k}</span>
                      <span style={{ fontFamily: "'DM Mono'" }}>{fmt.moeda(v)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #30363d', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#8b949e' }}>Custo total</span>
                    <span style={{ fontFamily: "'DM Mono'", color: '#e6edf3' }}>{fmt.moeda(resultado.custoTotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
                    <span style={{ color: '#8b949e' }}>Lucro ({form.margemLucro}%)</span>
                    <span style={{ fontFamily: "'DM Mono'", color: '#3fb950' }}>{fmt.moeda(resultado.valorFrete - resultado.custoTotal)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Select label="Vincular veículo" value={form.veiculoId} onChange={e => set('veiculoId', e.target.value)} style={{ flex: 1 }}>
                    <option value="">Selecione para salvar...</option>
                    {(veiculos || []).map(v => <option key={v.id} value={v.id}>{v.modelo} · {v.placa}</option>)}
                  </Select>
                  <Btn variant="primary" loading={saving} onClick={handleSalvar} style={{ marginTop: 20, whiteSpace: 'nowrap' }}>
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
