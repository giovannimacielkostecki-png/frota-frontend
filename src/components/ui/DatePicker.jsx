// src/components/ui/DatePicker.jsx
import { useState, useRef, useEffect } from 'react';

const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const DIAS  = ['D','S','T','Q','Q','S','S'];

function parseISO(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function formatBR(s) {
  const d = parseISO(s);
  if (!d) return '';
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

const navBtn = {
  background: '#21262d', border: '1px solid #30363d', borderRadius: 6,
  color: '#e6edf3', width: 26, height: 26, fontSize: 14, cursor: 'pointer', lineHeight: 1,
};
const linkBtn = {
  background: 'none', border: 'none', color: '#f0a500',
  fontSize: 12, fontWeight: 600, cursor: 'pointer',
};

export default function DatePicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = parseISO(value);
  const [view, setView] = useState(selected || new Date());
  const ref = useRef(null);

  useEffect(() => { if (selected) setView(selected); }, [value]);

  useEffect(() => {
    function onClickOut(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, [open]);

  const hoje = new Date();
  const ano = view.getFullYear();
  const mes = view.getMonth();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  const celulas = [];
  for (let i = 0; i < primeiroDia; i++) celulas.push(null);
  for (let d = 1; d <= diasNoMes; d++) celulas.push(d);

  const ehSelecionado = (d) => selected && selected.getFullYear() === ano && selected.getMonth() === mes && selected.getDate() === d;
  const ehHoje = (d) => hoje.getFullYear() === ano && hoje.getMonth() === mes && hoje.getDate() === d;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, position: 'relative' }} ref={ref}>
      {label && <label style={{ fontSize: 11, color: '#484f58', fontWeight: 500 }}>{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          background: '#21262d',
          border: `1px solid ${open ? '#f0a500' : '#30363d'}`,
          borderRadius: 7, padding: '8px 12px',
          color: value ? '#e6edf3' : '#484f58',
          fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          textAlign: 'left', cursor: 'pointer', width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <span>{value ? formatBR(value) : 'Selecione a data'}</span>
        <span style={{ color: '#f0a500' }}>📅</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 6, zIndex: 50,
          background: '#161b22', border: '1px solid #30363d', borderRadius: 10,
          padding: 12, width: 260, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', textTransform: 'capitalize' }}>
              {MESES[mes]} de {ano}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="button" onClick={() => setView(new Date(ano, mes - 1, 1))} style={navBtn}>‹</button>
              <button type="button" onClick={() => setView(new Date(ano, mes + 1, 1))} style={navBtn}>›</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
            {DIAS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, color: '#484f58', fontWeight: 600, padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {celulas.map((d, i) => d === null ? (
              <div key={i} />
            ) : (
              <button
                key={i}
                type="button"
                onClick={() => { onChange(toISO(new Date(ano, mes, d))); setOpen(false); }}
                style={{
                  border: ehHoje(d) && !ehSelecionado(d) ? '1px solid #30363d' : '1px solid transparent',
                  background: ehSelecionado(d) ? '#f0a500' : 'transparent',
                  color: ehSelecionado(d) ? '#000' : '#e6edf3',
                  borderRadius: 6, padding: '6px 0', fontSize: 12,
                  fontWeight: ehSelecionado(d) ? 700 : 500, cursor: 'pointer',
                  fontFamily: "'DM Mono', monospace",
                }}
                onMouseEnter={e => { if (!ehSelecionado(d)) e.currentTarget.style.background = 'rgba(240,165,0,0.15)'; }}
                onMouseLeave={e => { if (!ehSelecionado(d)) e.currentTarget.style.background = 'transparent'; }}
              >
                {d}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, borderTop: '1px solid #30363d', paddingTop: 8 }}>
            <button type="button" onClick={() => { onChange(''); setOpen(false); }} style={linkBtn}>Limpar</button>
            <button type="button" onClick={() => { onChange(toISO(new Date())); setOpen(false); }} style={linkBtn}>Hoje</button>
          </div>
        </div>
      )}
    </div>
  );
}
