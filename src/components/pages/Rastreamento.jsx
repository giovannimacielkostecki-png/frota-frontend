// src/components/pages/Rastreamento.jsx
import { useEffect, useRef, useState } from 'react';
import { useFetch, useMutation } from '../../hooks/useFetch';
import { rastreamentoAPI } from '../../api';
import { Card, CardHeader, StatCard, Table, Btn, Spinner } from '../ui';
import { fmt } from '../../utils';
import toast from 'react-hot-toast';

export default function Rastreamento() {
  const mapRef   = useRef(null);
  const leafRef  = useRef(null);
  const markersRef = useRef({});
  const [mapReady, setMapReady] = useState(false);

  const { data, loading, refetch } = useFetch(() => rastreamentoAPI.posicaoAtual());
  const { executar: sincronizar, loading: sincing } = useMutation(rastreamentoAPI.sincronizar);

  // Inicia mapa Leaflet
  useEffect(() => {
    if (!mapRef.current || leafRef.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, { center: [-23.5505, -46.6333], zoom: 6 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);
    leafRef.current = map;
    setMapReady(true);

    return () => { map.remove(); leafRef.current = null; };
  }, []);

  // Atualiza marcadores quando dados chegam
  useEffect(() => {
    const L = window.L;
    if (!leafRef.current || !L || !data) return;

    data.forEach(({ veiculo, posicao }) => {
      if (!posicao) return;
      const { latitude, longitude, velocidade } = posicao;
      const cor = velocidade > 0 ? '#f0a500' : '#484f58';
      const icon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:${cor};border:2px solid #0d1117;border-radius:50%;${velocidade > 0 ? 'box-shadow:0 0 0 4px rgba(240,165,0,0.25)' : ''}"></div>`,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      if (markersRef.current[veiculo.id]) {
        markersRef.current[veiculo.id]
          .setLatLng([latitude, longitude])
          .setIcon(icon)
          .setPopupContent(`<div style="font-family:'DM Sans';font-size:12px;background:#161b22;color:#e6edf3;padding:8px;border-radius:6px"><b style="color:#f0a500">${veiculo.placa}</b><br/>${veiculo.modelo}<br/>${velocidade} km/h</div>`);
      } else {
        markersRef.current[veiculo.id] = L.marker([latitude, longitude], { icon })
          .addTo(leafRef.current)
          .bindPopup(`<div style="font-family:'DM Sans';font-size:12px;background:#161b22;color:#e6edf3;padding:8px;border-radius:6px"><b style="color:#f0a500">${veiculo.placa}</b><br/>${veiculo.modelo}<br/>${velocidade} km/h</div>`);
      }
    });
  }, [data, mapReady]);

  // Auto-refresh a cada 30s
  useEffect(() => {
    const id = setInterval(refetch, 30000);
    return () => clearInterval(id);
  }, [refetch]);

  async function handleSincronizar() {
    await sincronizar();
    toast.success('Sincronizado com GPS!');
    refetch();
  }

  const emRota  = (data||[]).filter(d => d.posicao?.velocidade > 0);
  const parados = (data||[]).filter(d => d.posicao?.velocidade === 0);

  const columns = [
    { key: 'placa',      label: 'Placa',     render: r => <span style={{ fontFamily:"'DM Mono'" }}>{r.veiculo?.placa}</span> },
    { key: 'modelo',     label: 'Veículo',   render: r => r.veiculo?.modelo },
    { key: 'velocidade', label: 'Velocidade',mono: true, render: r => r.posicao ? `${r.posicao.velocidade} km/h` : '—' },
    { key: 'ignicao',    label: 'Ignição',   render: r => r.posicao?.ignicao ? <span style={{ color: '#3fb950' }}>● Ligada</span> : <span style={{ color: '#484f58' }}>● Desligada</span> },
    { key: 'hodometro',  label: 'Hodômetro', mono: true, render: r => fmt.km(r.posicao?.hodometro) },
    { key: 'atualizado', label: 'Atualizado',render: r => fmt.dataHora(r.posicao?.criadoEm) },
    { key: 'status',     label: 'Status',    render: r => r.posicao?.velocidade > 0
        ? <span style={{ background:'rgba(63,185,80,.15)', color:'#3fb950', padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:600 }}>Em rota</span>
        : <span style={{ background:'rgba(72,79,88,.2)', color:'#8b949e', padding:'2px 9px', borderRadius:99, fontSize:11, fontWeight:600 }}>Parado</span>
    },
  ];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Rastreador ao vivo</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#484f58' }}>Atualiza a cada 30s</span>
          <Btn variant="secondary" loading={sincing} onClick={handleSincronizar} style={{ fontSize: 12 }}>
            🔄 Sincronizar GPS
          </Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard label="Em rota"   value={emRota.length}  color="#3fb950" />
        <StatCard label="Parados"   value={parados.length} color="#f0a500" />
        <StatCard label="Total rastreados" value={(data||[]).length} />
      </div>

      <Card style={{ marginBottom: 16 }}>
        <CardHeader icon="🗺️" title="Mapa ao vivo">
          {loading && <Spinner size={14} />}
        </CardHeader>
        <div
          ref={mapRef}
          style={{ height: 380, width: '100%', borderRadius: '0 0 10px 10px', overflow: 'hidden' }}
        />
      </Card>

      <Card>
        <CardHeader icon="📋" title="Posições atuais" />
        <Table columns={columns} rows={data||[]} loading={loading} emptyText="Nenhum veículo rastreado — sincronize o GPS" />
      </Card>
    </div>
  );
}
