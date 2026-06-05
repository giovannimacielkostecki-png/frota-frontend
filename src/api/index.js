// src/api/index.js
// Centraliza todos os serviços de API — importa daqui em vez de usar axios diretamente
import api from './client';

// ── AUTH ─────────────────────────────────────
export const authAPI = {
  login:  (email, senha)   => api.post('/auth/login', { email, senha }),
  perfil: ()               => api.get('/auth/perfil'),
};

// ── DASHBOARD ────────────────────────────────
export const dashboardAPI = {
  resumo:        ()            => api.get('/dashboard/resumo'),
  custosMensais: (ano)         => api.get('/dashboard/custos-mensais', { params: { ano } }),
  custoPorVeiculo: (mes, ano)  => api.get('/dashboard/custo-veiculo',  { params: { mes, ano } }),
};

// ── VEÍCULOS ─────────────────────────────────
export const veiculoAPI = {
  listar:      (params)  => api.get('/veiculos', { params }),
  buscar:      (id)      => api.get(`/veiculos/${id}`),
  criar:       (data)    => api.post('/veiculos', data),
  atualizar:   (id, data)=> api.put(`/veiculos/${id}`, data),
  desativar:   (id)      => api.delete(`/veiculos/${id}`),
};

// ── ABASTECIMENTO ────────────────────────────
export const abastecimentoAPI = {
  listar:       (params) => api.get('/abastecimentos', { params }),
  resumo:       (params) => api.get('/abastecimentos/resumo', { params }),
  criar:        (data)   => api.post('/abastecimentos', data),
  atualizar:    (id, data) => api.put(`/abastecimentos/${id}`, data),   // novo
  deletar:      (id)       => api.delete(`/abastecimentos/${id}`),       // novo
};

// ── PNEUS ────────────────────────────────────
export const pneuAPI = {
  alertas:          ()         => api.get('/pneus/alertas'),
  porVeiculo:       (id)       => api.get(`/pneus/veiculo/${id}`),
  registrarRodizio: (data)     => api.post('/pneus/rodizio', data),
};

// ── DOCUMENTOS ───────────────────────────────
export const documentoAPI = {
  listar: (params) => api.get('/documentos', { params }),
  criar:  (data)   => api.post('/documentos', data),
  atualizar: (id, data) => api.put(`/documentos/${id}`, data),
};

// ── MULTAS ───────────────────────────────────
export const multaAPI = {
  listar:            (params) => api.get('/multas', { params }),
  consultarPlaca:    (placa)  => api.get(`/multas/consultar/${placa}`),
  criar:             (data)   => api.post('/multas', data),
  registrarPagamento:(id)     => api.patch(`/multas/${id}/pagamento`),
};

// ── CUSTOS ───────────────────────────────────
export const custoAPI = {
  listar: (params) => api.get('/custos', { params }),
  criar:  (data)   => api.post('/custos', data),
};

// ── FRETES ───────────────────────────────────
export const freteAPI = {
  calcular:       (data)      => api.post('/fretes/calcular', data),
  listar:         (params)    => api.get('/fretes', { params }),
  salvar:         (data)      => api.post('/fretes', data),
  atualizarStatus:(id, status)=> api.patch(`/fretes/${id}/status`, { status }),
};

// ── RASTREAMENTO ─────────────────────────────
export const rastreamentoAPI = {
  posicaoAtual:    ()          => api.get('/rastreamento/atual'),
  historico:       (id, params)=> api.get(`/rastreamento/veiculo/${id}`, { params }),
  sincronizar:     ()          => api.post('/rastreamento/sincronizar'),
};
