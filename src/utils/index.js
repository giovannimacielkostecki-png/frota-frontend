// src/utils/index.js
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const fmt = {
  moeda:  (v) => v == null ? '—' : `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  numero: (v) => v == null ? '—' : Number(v).toLocaleString('pt-BR'),
  km:     (v) => v == null ? '—' : `${Number(v).toLocaleString('pt-BR')} km`,
  data: (d) => {
  if (!d) return '—';
  const str = typeof d === 'string' ? d : d.toISOString();
  const [y, m, day] = str.slice(0, 10).split('-');
  return `${day}/${m}/${y}`;
  dataHora:(d)=> d ? format(typeof d === 'string' ? parseISO(d) : d, 'dd/MM/yy HH:mm', { locale: ptBR }) : '—',
  consumo:(v) => v == null ? '—' : `${Number(v).toFixed(1)} km/L`,
};

export function diasRestantes(dataVenc) {
  if (!dataVenc) return null;
  return differenceInDays(parseISO(dataVenc), new Date());
}

export function corDias(dias) {
  if (dias <= 7)  return '#f85149';
  if (dias <= 15) return '#f0a500';
  if (dias <= 30) return '#58a6ff';
  return '#3fb950';
}

export function statusPill(status) {
  const map = {
    ABERTA:       { label: 'Aberta',      bg: 'rgba(248,81,73,.15)',  color: '#f85149' },
    PAGA:         { label: 'Paga',        bg: 'rgba(63,185,80,.15)',  color: '#3fb950' },
    BOM:          { label: 'Bom',         bg: 'rgba(63,185,80,.15)',  color: '#3fb950' },
    ATENCAO:      { label: 'Atenção',     bg: 'rgba(240,165,0,.15)',  color: '#f0a500' },
    TROCAR:       { label: 'Trocar!',     bg: 'rgba(248,81,73,.15)',  color: '#f85149' },
    EM_TRANSITO:  { label: 'Em trânsito', bg: 'rgba(88,166,255,.15)', color: '#58a6ff' },
    ENTREGUE:     { label: 'Entregue',    bg: 'rgba(63,185,80,.15)',  color: '#3fb950' },
    CALCULADO:    { label: 'Calculado',   bg: 'rgba(188,140,255,.15)',color: '#bc8cff' },
    CONFIRMADO:   { label: 'Confirmado',  bg: 'rgba(88,166,255,.15)', color: '#58a6ff' },
    CANCELADO:    { label: 'Cancelado',   bg: 'rgba(248,81,73,.15)',  color: '#f85149' },
  };
  return map[status] || { label: status, bg: 'rgba(139,148,158,.15)', color: '#8b949e' };
}
