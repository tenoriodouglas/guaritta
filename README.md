# Guaritta

Plataforma de gestão de portaria para condomínios: controle de visitantes, prestadores, encomendas e registro de acessos, integrando porteiros, moradores e síndicos.

## Funcionalidades (MVP)

- **Visitantes**: pré-autorização pelo morador, registro de entrada e saída.
- **Encomendas**: recebimento na portaria, notificação e retirada pelo morador.
- **Acessos**: histórico auditável de entradas e saídas.
- **Unidades e moradores**: cadastro de blocos, apartamentos e residentes.

## Estrutura

```
apps/
  api/      # Backend REST (NestJS + TypeScript)
  mobile/   # App para moradores e porteiros (a definir)
docs/       # Documentação de arquitetura e decisões
```

## Executando a API

```bash
docker compose up -d        # PostgreSQL
cd apps/api
cp .env.example .env
npm install
npm run start:dev
```

API em `http://localhost:3000/api` · health check em `GET /api/health`.
