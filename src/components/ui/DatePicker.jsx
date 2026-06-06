// src/components/ui/DatePicker.jsx
import { useState, useRef, useEffect } from 'react';

export default function DatePicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const parsed = value ? new Date(value + 'T12:00:00') : new Date();
  const [viewYear,  setViewYear]  = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const DIAS  = ['D','S','T','Q','Q','S','S'];

  function getDias() {
    const primeiro = new Date(viewYear, viewMonth, 1).getDay();
    const total    = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < primeiro; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    return cells;
  }

  function selecionar(dia) {
    if (!dia) return;
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(dia).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  }

  function display() {
    if (!value) return 'Selecione...';
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  }

  const selectedDay   = value ? parseInt(value.split('-')[2]) : null;
  const selectedMonth = value ? parseInt(value.split('-')[1]) - 1 : null;
  const selectedYear  = value ? parseInt(value.split('-')[0]) : null;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 11, color: '#484f58', fontWeight: 500 }}>{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          background: '#21262d', border: '1px solid #30363d', borderRadius: 7,
          padding: '8px 12px', color: value ? '#e6edf3' : '#484f58',
          fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          textAlign: 'left', cursor: 'pointer', width: '100%',
        }}
      >
        {display()}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 999,
          marginTop: 4, background: '#161b22',
          border: '1px solid #30363d', borderRadius: 10,
          padding: 12, width: 240, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button type="button" onClick={() => {
              if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
              else setViewMonth(m => m - 1);
            }} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 16 }}>‹</button>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>
              {MESES[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={() => {
              if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
              else setViewMonth(m => m + 1);
            }} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 16 }}>›</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DIAS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, color: '#484f58', fontWeight: 600, padding: '2px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {getDias().map((dia, i) => {
              const isSelected = dia && dia === selectedDay && viewMonth === selectedMonth && viewYear === selectedYear;
              const isToday    = dia && new Date().getDate() === dia && new Date().getMonth() === viewMonth && new Date().getFullYear() === viewYear;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selecionar(dia)}
                  disabled={!dia}
                  style={{
                    background: isSelected ? '#f0a500' : 'transparent',
                    border: isToday && !isSelected ? '1px solid #f0a500' : 'none',
                    borderRadius: 5,
                    color: isSelected ? '#000' : dia ? '#e6edf3' : 'transparent',
                    fontSize: 12, padding: '4px 0',
                    cursor: dia ? 'pointer' : 'default',
                    fontWeight: isSelected ? 700 : 400,
                  }}
                >
                  {dia || ''}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
