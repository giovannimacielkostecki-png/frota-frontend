// src/components/pages/Custos.jsx
import { useFetch } from '../../hooks/useFetch';
import { dashboardAPI, custoAPI } from '../../api';
import { Card, CardHeader, Table, StatCard, PageLoading } from '../ui';
import { fmt } from '../../utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function Custos() {
  const { data: porVeiculo, loading: l1 } = useFetch(() => dashboardAPI.custoPorVeiculo(new Date().getMonth()+1, new Date().getFullYear()));
  const { data: mensais,    loading: l2 } = useFetch(() => dashboardAPI.custosMensais(new Date().getFullYear()));
  const { data: lista,      loading: l3 } = useFetch(() => custoAPI.listar({ limit: 30 }));

  const dadosMensais = (() => {
    if (!mensais) return [];
    const agg = {};
    mensais.forEach(r => {
      const m = MESES[Number(r.mes)-1];
      if (!agg[m]) agg[m] = { mes: m, total: 0 };
      agg[m].total += Number(r.total);
      agg[m][r.tipo] = Number(r.total);
    });
    return Object.values(agg);
  })();

  const totalMes = (porVeiculo||[]).reduce((s,v) => s + v.total, 0);

  const columns = [
    { key: 'data',       label: 'Data',    render: r => fmt.data(r.data) },
    { key: 'veiculo',    label: 'Veículo', render: r => r.veiculo?.placa },
    { key: 'tipo',       label: 'Tipo',    render: r => <span style={{ background:'rgba(88,166,255,.1)', color:'#58a6ff', padding:'2px 8px', borderRadius:99, fontSize:11 }}>{r.tipo}</span> },
    { key: 'descricao',  label: 'Descrição' },
    { key: 'valor',      label: 'Valor',   mono: true, render: r => fmt.moeda(r.valor) },
    { key: 'fornecedor', label: 'Fornecedor', render: r => r.fornecedor || '—' },
  ];

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Custos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total do mês" value={fmt.moeda(totalMes)} color="#f0a500" />
        <StatCard label="Combustível"  value={fmt.moeda((porVeiculo||[]).reduce((s,v)=>s+(v.porTipo?.COMBUSTIVEL||0),0))} color="#58a6ff" />
        <StatCard label="Manutenção"   value={fmt.moeda((porVeiculo||[]).reduce((s,v)=>s+(v.porTipo?.MANUTENCAO||0),0))} color="#bc8cff" />
        <StatCard label="Pneus"        value={fmt.moeda((porVeiculo||[]).reduce((s,v)=>s+(v.porTipo?.PNEU||0),0))} color="#3fb950" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <CardHeader icon="📊" title="Custo por veículo — mês" />
          <div style={{ padding: 16, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(porVeiculo||[]).slice(0,6)} layout="vertical">
                <XAxis type="number" tick={{ fill:'#484f58', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`R$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="veiculo.placa" tick={{ fill:'#8b949e', fontSize:10, fontFamily:"'DM Mono'" }} axisLine={false} tickLine={false} width={68} />
                <Tooltip formatter={v=>fmt.moeda(v)} contentStyle={{ background:'#21262d', border:'1px solid #30363d', borderRadius:8, fontSize:12 }} />
                <Bar dataKey="total" name="Total" fill="#f0a500" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader icon="📈" title="Evolução anual" />
          <div style={{ padding: 16, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosMensais}>
                <XAxis dataKey="mes" tick={{ fill:'#484f58', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#484f58', fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`R$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v=>fmt.moeda(v)} contentStyle={{ background:'#21262d', border:'1px solid #30363d', borderRadius:8, fontSize:12 }} />
                <Line type="monotone" dataKey="total" stroke="#f0a500" strokeWidth={2} dot={{ fill:'#f0a500', r:3 }} name="Total" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader icon="🕐" title="Lançamentos recentes" />
        <Table columns={columns} rows={lista || []} loading={l3} />
      </Card>
    </div>
  );
}
