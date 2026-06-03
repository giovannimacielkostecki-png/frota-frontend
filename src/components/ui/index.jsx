// src/components/ui/index.jsx
// Biblioteca de componentes reutilizáveis

export function Spinner({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid #30363d`,
      borderTopColor: '#f0a500',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      display: 'inline-block',
    }} />
  );
}

export function Pill({ status, label }) {
  const map = {
    green:  { bg: 'rgba(63,185,80,.15)',   color: '#3fb950' },
    red:    { bg: 'rgba(248,81,73,.15)',   color: '#f85149' },
    amber:  { bg: 'rgba(240,165,0,.15)',   color: '#f0a500' },
    blue:   { bg: 'rgba(88,166,255,.15)',  color: '#58a6ff' },
    purple: { bg: 'rgba(188,140,255,.15)', color: '#bc8cff' },
    gray:   { bg: 'rgba(139,148,158,.15)', color: '#8b949e' },
  };
  const s = map[status] || map.gray;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      background: s.bg,
      color: s.color,
    }}>{label}</span>
  );
}

export function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: 10,
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, color: '#484f58', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, fontFamily: "'DM Mono', monospace", color: color || '#e6edf3' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#484f58', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function Card({ children, style }) {
  return (
    <div style={{
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: 10,
      ...style,
    }}>
      {children}
    </div>
  );
}

export function CardHeader({ icon, title, children }) {
  return (
    <div style={{
      padding: '12px 16px',
      borderBottom: '1px solid #30363d',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      fontWeight: 600,
    }}>
      {icon && <span style={{ color: '#f0a500', fontSize: 16 }}>{icon}</span>}
      <span style={{ flex: 1 }}>{title}</span>
      {children}
    </div>
  );
}

export function Table({ columns, rows, loading, emptyText = 'Nenhum registro encontrado' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{
                padding: '9px 16px',
                textAlign: 'left',
                color: '#484f58',
                fontWeight: 500,
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #30363d',
                whiteSpace: 'nowrap',
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} style={{ padding: 32, textAlign: 'center' }}>
              <Spinner />
            </td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 32, textAlign: 'center', color: '#484f58' }}>
              {emptyText}
            </td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} style={{ cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map((c) => (
                <td key={c.key} style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid rgba(48,54,61,0.5)',
                  color: '#e6edf3',
                  fontFamily: c.mono ? "'DM Mono', monospace" : undefined,
                }}>
                  {c.render ? c.render(row) : row[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Input({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 11, color: '#484f58', fontWeight: 500 }}>{label}</label>}
      <input {...props} style={{
        background: '#21262d',
        border: '1px solid #30363d',
        borderRadius: 7,
        padding: '8px 12px',
        color: '#e6edf3',
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        outline: 'none',
        transition: 'border-color 0.15s',
        width: '100%',
        ...(props.style || {}),
      }}
        onFocus={e => e.target.style.borderColor = '#f0a500'}
        onBlur={e  => e.target.style.borderColor = '#30363d'}
      />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && <label style={{ fontSize: 11, color: '#484f58', fontWeight: 500 }}>{label}</label>}
      <select {...props} style={{
        background: '#21262d',
        border: '1px solid #30363d',
        borderRadius: 7,
        padding: '8px 12px',
        color: '#e6edf3',
        fontSize: 13,
        fontFamily: "'DM Sans', sans-serif",
        outline: 'none',
        width: '100%',
        ...(props.style || {}),
      }}>
        {children}
      </select>
    </div>
  );
}

export function Btn({ children, variant = 'primary', loading, ...props }) {
  const styles = {
    primary:  { background: '#f0a500', color: '#000', border: 'none' },
    secondary:{ background: 'transparent', color: '#8b949e', border: '1px solid #30363d' },
    danger:   { background: 'rgba(248,81,73,.15)', color: '#f85149', border: '1px solid rgba(248,81,73,.3)' },
  };
  return (
    <button {...props} disabled={loading || props.disabled} style={{
      ...styles[variant],
      borderRadius: 7,
      padding: '8px 16px',
      fontSize: 13,
      fontWeight: 600,
      cursor: loading || props.disabled ? 'not-allowed' : 'pointer',
      fontFamily: "'DM Sans', sans-serif",
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      opacity: loading || props.disabled ? 0.6 : 1,
      ...(props.style || {}),
    }}>
      {loading ? <Spinner size={14} /> : null}
      {children}
    </button>
  );
}

export function PageLoading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <Spinner size={32} />
    </div>
  );
}

export function FormGrid({ children, cols = 2 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 12,
    }}>
      {children}
    </div>
  /* Remove as setinhas dos campos de número (Chrome, Edge, Safari) */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Remove as setinhas no Firefox */
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
  
  );
}
