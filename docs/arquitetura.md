# Arquitetura

## Visão geral

API modular em NestJS (ESM), um módulo por contexto de negócio:

```
auth · users · units · residents · vehicles · visitors · deliveries
gates · alpr · access · notifications · health
```

Cada módulo segue a mesma organização:

- `dto/` — contratos de entrada validados com `class-validator`.
- `*.repository.ts` — acesso a dados com Drizzle (única camada que conhece SQL).
- `*.service.ts` — regras de aplicação.
- `*.controller.ts` — endpoints HTTP, autorização por perfil.
- Regras de domínio puras (ex.: `decision-engine.ts`, `visit-lifecycle.ts`) isoladas e testadas sem banco.

## Decisões

- **Drizzle ORM**: schema em TypeScript, migrações SQL versionadas, sem binários nativos.
- **Eventos de domínio** (`@nestjs/event-emitter`): visitantes, encomendas e acessos publicam eventos; notificações e streams reagem sem acoplamento.
- **Transições atômicas**: mudanças de status usam `UPDATE ... WHERE status = esperado`, evitando dupla liberação ou retirada.
- **Portas e adaptadores** para hardware e serviços externos: `GateDriver` (catracas/portões) e `PlateRecognizer` (LPR) podem ser trocados por configuração.
- **Segurança**: JWT global com `@Public()` explícito, perfis via `@Roles()`, moradores restritos à própria unidade, chaves de dispositivo armazenadas como hash, `helmet` e rate limit.
- **Erros de banco** (unicidade, FK) são traduzidos para 409/422.

## Próximos passos

1. App mobile (morador e porteiro) consumindo os streams SSE.
2. Console web da portaria.
3. Multi-condomínio (tenant por condomínio).
4. Push notifications (FCM/APNs) e WhatsApp.
5. Reconhecimento facial para catracas de pedestres.
6. Armazenamento de snapshots das câmeras (S3 compatível).
