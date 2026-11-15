# Controle de acesso com reconhecimento de placas

## Fluxo

```
Câmera LPR ──► POST /api/devices/plate-reads ──► identificação ──► solicitação PENDING
                                                                         │
                         console da portaria (SSE /api/access/stream) ◄──┘
                                                                         │
                     operador aprova ──► driver abre o portão/catraca ──► APPROVED
                     operador nega   ──────────────────────────────────► DENIED
                     sem ação no prazo ────────────────────────────────► EXPIRED
```

A identificação é automática; **a abertura sempre exige ação humana**.

## Identificação

1. A placa é normalizada e erros comuns de OCR são corrigidos pela posição (`0↔O`, `1↔I`, `8↔B`...).
2. Placas antigas e Mercosul são comparadas pela chave canônica Mercosul (`ABC1234` ≡ `ABC1C34`).
3. O motor de decisão sugere:

| Situação | Tipo | Sugestão |
|---|---|---|
| Veículo cadastrado ativo | `RESIDENT_VEHICLE` | `APPROVE` |
| Visitante pré-autorizado no período | `VISITOR_VEHICLE` | `APPROVE` |
| Veículo bloqueado | `BLOCKED_VEHICLE` | `DENY` |
| Placa desconhecida ou ilegível | `UNKNOWN_VEHICLE` | `REVIEW` |
| Confiança abaixo de `ALPR_MIN_CONFIDENCE` | — | `REVIEW` |

Leituras repetidas da mesma placa no mesmo portão em 30 s reaproveitam a solicitação pendente.

## Integração da câmera

1. Admin cadastra o portão: `POST /api/gates`.
2. Admin gera a chave do dispositivo: `POST /api/gates/:id/device-key` (exibida uma única vez).
3. A câmera envia cada leitura com o header `x-device-key`:

```json
{ "plate": "ABC1D23", "confidence": 0.94, "direction": "IN", "snapshotUrl": "https://..." }
```

Câmeras sem LPR embarcado podem enviar `imageBase64`; nesse caso configure `ALPR_PROVIDER=platerecognizer` e `ALPR_API_TOKEN`.

## Acionamento de portões e catracas

| Driver | Uso |
|---|---|
| `SIMULATED` | Desenvolvimento e demonstração (apenas registra em log) |
| `HTTP_RELAY` | Controladora/relé de rede: `POST {endpoint}` com `{ action: "open", gateId, accessRequestId }` |

Se o acionamento falhar, a solicitação volta para `PENDING` e o operador é informado.

## Operação

| Endpoint | Descrição |
|---|---|
| `GET /api/access/stream` | Eventos em tempo real (`access.requested`, `access.decided`) |
| `GET /api/access/requests?status=PENDING` | Fila de liberação |
| `POST /api/access/requests/:id/approve` | Libera e aciona o portão |
| `POST /api/access/requests/:id/deny` | Nega o acesso |
| `POST /api/access/manual` | Liberação manual (interfone, pedestre, falha da câmera) |
| `GET /api/access/summary` | Indicadores do dia |
