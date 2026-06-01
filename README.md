# 🖥️ FrotaPRO — Frontend

Interface web do sistema de gestão de frota, conectada ao backend via API REST.

## Stack
- **Framework**: React 18 + Vite
- **Roteamento**: React Router v6
- **HTTP**: Axios (com interceptors de auth)
- **Gráficos**: Recharts
- **Mapa**: Leaflet + React-Leaflet
- **Notificações**: React Hot Toast
- **Datas**: date-fns (pt-BR)

---

## ⚡ Como rodar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variável de ambiente (opcional)
Por padrão o Vite faz proxy de `/api` para `http://localhost:3001`.
Se seu backend rodar em outra porta, edite `vite.config.js`.

### 3. Rodar em desenvolvimento (com backend rodando)
```bash
npm run dev
# Acesse: http://localhost:5173
```

### 4. Build para produção
```bash
npm run build
# Arquivos gerados em /dist
```

---

## 🗂️ Estrutura

```
frota-frontend/
├── src/
│   ├── api/
│   │   ├── client.js        ← Axios + interceptors JWT
│   │   └── index.js         ← Todos os serviços de API
│   ├── components/
│   │   ├── layout/
│   │   │   └── Layout.jsx   ← Sidebar + Outlet
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Veiculos.jsx
│   │   │   ├── Abastecimento.jsx
│   │   │   ├── Pneus.jsx
│   │   │   ├── Custos.jsx
│   │   │   ├── Multas.jsx
│   │   │   ├── Vencimentos.jsx
│   │   │   ├── Frete.jsx
│   │   │   └── Rastreamento.jsx
│   │   └── ui/
│   │       └── index.jsx    ← Biblioteca de componentes
│   ├── context/
│   │   └── AuthContext.jsx  ← Estado de autenticação global
│   ├── hooks/
│   │   └── useFetch.js      ← Hooks de dados (useFetch, useMutation)
│   ├── utils/
│   │   └── index.js         ← Formatação, cores, utilitários
│   ├── App.jsx              ← Rotas + proteção de autenticação
│   ├── main.jsx             ← Entry point
│   └── index.css            ← Design system global
└── vite.config.js           ← Proxy para /api
```

---

## 🔑 Fluxo de autenticação

1. Login → POST `/api/auth/login` → recebe `{ token, usuario }`
2. Token salvo em `localStorage` como `frota_token`
3. Todo request inclui `Authorization: Bearer <token>` automaticamente
4. 401 → limpa storage e redireciona para `/login`
5. Rotas protegidas via componente `<Privado>`

---

## 📡 Módulos conectados à API

| Página         | Endpoints consumidos                                     |
|----------------|----------------------------------------------------------|
| Dashboard      | `/dashboard/resumo`, `/dashboard/custos-mensais`         |
| Veículos       | `/veiculos` (CRUD)                                       |
| Abastecimento  | `/abastecimentos`, `/abastecimentos/resumo`              |
| Pneus          | `/pneus/alertas`, `/pneus/veiculo/:id`, `/pneus/rodizio` |
| Custos         | `/custos`, `/dashboard/custo-veiculo`                    |
| Multas         | `/multas`, `/multas/consultar/:placa`                    |
| Vencimentos    | `/documentos`                                            |
| Frete          | `/fretes/calcular`, `/fretes`                            |
| Rastreamento   | `/rastreamento/atual`, `/rastreamento/sincronizar`       |
