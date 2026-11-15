# Guaritta

Plataforma de gestão de portaria para condomínios: cadastro de unidades, moradores e veículos, visitantes, encomendas e **controle de acesso com reconhecimento automático de placas (LPR)** — a identificação é automática, a liberação de catracas e portões é sempre feita por um operador.

## Funcionalidades

| Módulo | Recursos |
|---|---|
| **Autenticação** | JWT, perfis `ADMIN`, `CONCIERGE` (porteiro) e `RESIDENT`, rate limit no login |
| **Unidades e moradores** | Blocos/apartamentos, moradores, detalhe da unidade com moradores e veículos |
| **Veículos** | Validação de placa antiga e Mercosul, equivalência automática entre os formatos, bloqueio |
| **Visitantes** | Pré-autorização pelo morador com janela de validade e placa opcional; entrada/saída |
| **Encomendas** | Recebimento e retirada com controle de concorrência |
| **Portões e catracas** | Drivers plugáveis (simulado, relé HTTP), chave de API por câmera |
| **Reconhecimento de placas** | Placa enviada pela câmera ou imagem processada por provedor (Plate Recognizer), correção de erros de OCR |
| **Controle de acesso** | Motor de decisão (aprovar / revisar / negar), fila de liberação humana, deduplicação de leituras, expiração automática, liberação manual |
| **Tempo real** | Stream SSE para o console da portaria e para o app do morador |
| **Notificações** | Encomenda recebida, visitante chegou, veículo entrou, acesso negado |
| **Indicadores** | Resumo diário de acessos por status e tipo |

## Stack

NestJS 12 (ESM) · TypeScript · PostgreSQL 16 · Drizzle ORM · Vitest · oxlint · Swagger/OpenAPI · Docker · GitHub Actions

## Estrutura

```
apps/
  api/            # Backend REST
    drizzle/      # Migrações SQL
    src/
      common/     # Utilitários (placas, validações, filtros)
      config/     # Variáveis de ambiente validadas
      database/   # Schema Drizzle, migração e seed
      modules/    # Um módulo por contexto de negócio
    test/         # Testes e2e com PostgreSQL
  mobile/         # App (a definir)
docs/             # Arquitetura e fluxo de acesso
```

## Executando

```bash
docker compose up -d postgres
cd apps/api
cp .env.example .env
npm ci
npm run db:migrate
npm run db:seed          # cria o admin definido em ADMIN_EMAIL/ADMIN_PASSWORD
npm run start:dev
```

- API: `http://localhost:3000/api`
- Documentação interativa (Swagger): `http://localhost:3000/api/docs`

Stack completa via Docker: `docker compose --profile full up --build`.

## Testes

```bash
npm test            # unitários
npm run test:e2e    # e2e (requer PostgreSQL; usa o banco guaritta_test)
npm run lint
```

Veja também [arquitetura](docs/arquitetura.md) e [controle de acesso](docs/controle-de-acesso.md).
