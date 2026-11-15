# Arquitetura

## Visão geral

- **API** modular (um módulo por contexto de negócio): `visitors`, `deliveries`, `health`.
- Cada módulo segue camadas:
  - `domain/` — entidades e contratos (interfaces de repositório), sem dependência de framework.
  - `dto/` — validação de entrada da API.
  - `infra/` — implementações de repositório (atualmente em memória; PostgreSQL planejado).
  - `*.service.ts` — regras de aplicação.
  - `*.controller.ts` — endpoints HTTP.
- Repositórios são injetados por token, permitindo trocar a persistência sem alterar serviços.

## Próximos passos

1. Persistência PostgreSQL (ORM a definir).
2. Autenticação JWT com perfis: `ADMIN`, `PORTEIRO`, `MORADOR`.
3. Multi-condomínio (tenant por condomínio).
4. Notificações push para moradores.
5. App mobile.
