// src/components/pages/Dashboard.jsx
import { useFetch } from '../../hooks/useFetch';
import { dashboardAPI } from '../../api';
import { StatCard, Card, CardHeader, PageLoading } from '../ui';
import { fmt, corDias, diasRestantes } from '../../utils';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const CORES = ['#f0a500','#58a6ff','#bc8cff','#3fb950','#f85149'];

function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: '#8b949e', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 100 ? fmt.moeda(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { data: resumo,    loading: l1 } = useFetch(() => dashboardAPI.resumo());
  const { data: mensais,   loading: l2 } = useFetch(() => dashboardAPI.custosMensais(new Date().getFullYear()));
  const { data: porVeiculo,loading: l3 } = useFetch(() => dashboardAPI.custoPorVeiculo(new Date().getMonth() + 1, new Date().getFullYear()));
  const { data: vencimentos }            = useFetch(() => import('../../api').then(m => m.documentoAPI.listar({ dias: 30 })));

  // Processa dados mensais para o gráfico
  const dadosMensais = (() => {
    if (!mensais) return [];
    const agg = {};
    mensais.forEach(r => {
      const m = MESES[Number(r.mes) - 1];
      if (!agg[m]) agg[m] = { mes: m };
      agg[m][r.tipo] = (agg[m][r.tipo] || 0) + Number(r.total);
    });
    return Object.values(agg);
  })();

  // Dados para pizza
  const dadosPizza = (() => {
    if (!porVeiculo) return [];
    const totais = {};
    porVeiculo.forEach(v => {
      Object.entries(v.porTipo || {}).forEach(([tipo, val]) => {
        totais[tipo] = (totais[tipo] || 0) + val;
      });
    });
    return Object.entries(totais).map(([name, value]) => ({ name, value: Math.round(value) }));
  })();

  if (l1 && l2 && l3) return <PageLoading />;

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Dashboard</h2>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
  <StatCard label="Custo total do mês" value={fmt.moeda(resumo?.custos?.totalMes)} color="#f0a500" />

  <StatCard
    label="KM da frota no mês"
    value={resumo?.km?.kmMes ? `${resumo.km.kmMes.toLocaleString('pt-BR')} km` : '—'}
    color="#3fb950"
  />

  <StatCard label="Abastecimentos" value={resumo?.abastecimento?.quantidade ?? '—'} sub={fmt.moeda(resumo?.abastecimento?.totalValor)} />
  <StatCard label="Veículos ativos" value={resumo?.frota?.total ?? '—'} color="#58a6ff" />
  <StatCard label="Alertas ativos" value={resumo?.alertas?.total ?? '—'} color="#f85149"
    sub={`${resumo?.alertas?.multasAbertas ?? 0} multas · ${resumo?.alertas?.docVencendo7 ?? 0} vencimentos`} />
</div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <CardHeader icon="📊" title="Custos mensais 2025" />
          <div style={{ padding: 16, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMensais}>
                <XAxis dataKey="mes" tick={{ fill: '#484f58', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#484f58', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<TooltipCustom />} />
                <Bar dataKey="COMBUSTIVEL" name="Combustível" fill="#f0a500" radius={[4,4,0,0]} />
                <Bar dataKey="MANUTENCAO"  name="Manutenção"  fill="#58a6ff" radius={[4,4,0,0]} />
                <Bar dataKey="PNEU"        name="Pneus"       fill="#bc8cff" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader icon="🍩" title="Distribuição de custos" />
          <div style={{ padding: 16, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dadosPizza} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {dadosPizza.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt.moeda(v)} />
                <Legend formatter={(v) => <span style={{ fontSize: 11, color: '#8b949e' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Custo por veículo + Vencimentos próximos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <CardHeader icon="🚛" title="Custo por veículo — mês atual" />
          <div style={{ padding: 16, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(porVeiculo || []).slice(0, 6)} layout="vertical">
                <XAxis type="number" tick={{ fill: '#484f58', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="veiculo.placa" tick={{ fill: '#8b949e', fontSize: 10, fontFamily: "'DM Mono'" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip content={<TooltipCustom />} />
                <Bar dataKey="total" name="Total" fill="#f0a500" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader icon="📅" title="Vencimentos próximos" />
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {(vencimentos?.data || []).length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#484f58', fontSize: 12 }}>Nenhum vencimento próximo</div>
            ) : (vencimentos?.data || []).slice(0, 6).map((doc) => {
              const dias = diasRestantes(doc.dataVencimento);
              return (
                <div key={doc.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', borderBottom: '1px solid rgba(48,54,61,0.5)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{doc.tipo.replace('_', ' ')}</div>
                    <div style={{ fontSize: 11, color: '#484f58' }}>{doc.veiculo?.placa} · {doc.veiculo?.modelo}</div>
                  </div>
                  <div style={{ fontFamily: "'DM Mono'", fontSize: 13, fontWeight: 600, color: corDias(dias) }}>
                    {dias}d
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
