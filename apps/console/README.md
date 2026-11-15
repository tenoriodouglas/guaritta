# Guaritta Console

Console web da portaria: fila de liberação em tempo real, liberação manual, visitantes, encomendas e consulta de veículos.

```bash
npm ci
npm run dev      # http://localhost:5173 (proxy /api -> http://localhost:3000)
npm test
npm run build
```

Acesso restrito aos perfis `ADMIN` e `CONCIERGE`. Para apontar para outra API em desenvolvimento: `API_URL=http://host:3000 npm run dev`.
