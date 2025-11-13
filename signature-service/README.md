# ✍️ Plataforma de assinaturas digitais - Backend

> **🖊️ Signature Service** - orquestra todo o fluxo de sessões de assinatura. Responsável por criar convites, gerenciar signatários, registrar evidências (IP, agente, timestamp) e publicar eventos para o restante do ecossistema.

> **Versão:** `v1.0.0` | **Documentação:** `Swagger /api/docs` | **Status:** 🟢 Estável

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white) ![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white) ![Swagger UI](https://img.shields.io/badge/Swagger_UI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black) ![Zod](https://img.shields.io/badge/Zod-3068FE?style=for-the-badge&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Responsabilidades Principais](#-responsabilidades-principais)
- [Arquitetura em Texto](#-arquitetura-em-texto)
- [Fluxos Essenciais](#-fluxos-essenciais)
- [Integração com Outros Serviços](#-integração-com-outros-serviços)
- [Modelos de Dados](#-modelos-de-dados)
- [Endpoints da API](#-endpoints-da-api)
- [Eventos e Mensageria](#-eventos-e-mensageria)
- [Métricas e Observabilidade](#-métricas-e-observabilidade)
- [Configuração e Variáveis](#-configuração-e-variáveis)
- [Execução e Deploy](#-execução-e-deploy)
- [Testes](#-testes)
- [Roadmap](#-roadmap)
- [Referências](#-referências)

---

## 🎯 Visão Geral

O **Signature Service** coordena o ciclo de vida de uma sessão de assinatura digital. Ele valida documentos com o `document-service`, garante que somente usuários autorizados (validado pelo `auth-service`) possam criar ou participar de sessões e persiste tanto o estado das sessões quanto o histórico de assinaturas no MongoDB. A latência é reduzida com Redis, que armazena o TTL das sessões, enquanto eventos confirmados são enviados ao RabbitMQ para que outros serviços (ex.: Notification, Audit) reajam.

### 🔑 Responsabilidades Principais

- ✅ Criar e expirar sessões de assinatura com duração configurável (TTL).
- ✅ Gerenciar signatários (incluir, listar, remover) garantindo integridade e autorização.
- ✅ Emitir tokens temporários (JWT) para signatários concluírem a assinatura.
- ✅ Registrar evidências de assinatura (IP, agente, horário) no log persistente.
- ✅ Publicar eventos em RabbitMQ quando uma assinatura é confirmada.
- ✅ Expor métricas Prometheus (`/api/metrics`) para monitorar o serviço.

---

## 🏗️ Arquitetura em Texto

- **API HTTP (Express 5 + TypeScript)** — rotas agrupadas em `/api`. Middlewares de segurança (`helmet`, `cors`), logging (`morgan`) e parsing JSON são aplicados globalmente.
- **Autenticação delegada** — middleware `authenticate` chama `AUTH_SERVICE_URL` para validar JWTs e injeta `req.user` em todas as rotas protegidas.
- **Camada de serviços** — a lógica de negócio fica em `services/`, isolando integrações externas (`auth`, `document`, `rabbit`, `redis`).
- **MongoDB (Mongoose)** — modelos `SignatureSession` e `SignatureLog` persistem estado da sessão e trilha de auditoria.
- **Redis (ioredis)** — cacheia sessões vivas (`session:<id>`) com TTL para detecção rápida de expiração.
- **RabbitMQ (amqplib)** — responsável por publicar eventos de assinatura para consumo assíncrono por outros microserviços.
- **Validações (Zod)** — schemas garantem consistência de payloads para criação de sessões e gerenciamento de signatários.
- **Máquina de estados (XState/Typescript-FSM)** — o arquivo `signatureStatus.machine.ts` define transições válidas entre estados do signatário (pendente → assinado/rejeitado).

---

## 🔄 Fluxos Essenciais

### ✍️ 1. Criação de sessão — `POST /api/sessions`

1. **Autenticação** — o cliente envia `Authorization: Bearer <token>`. O middleware valida no `auth-service`.
2. **Validação** — o body é verificado com `sessionSchema` (documento, lista de signers, TTL opcional).
3. **Verificação do documento** — `signatureSession.service` chama `document-service` (com o mesmo token) para garantir que o documento existe e pertence ao usuário.
4. **Persistência** — é criado um registro em `SignatureSession` com `expiresAt` baseado no TTL.
5. **Cache** — Redis recebe a chave `session:<id>` com `EX = ttlMinutes * 60`.
6. **Métricas** — incrementa o contador `signature_sessions_created_total` e atualiza o gauge de sessões ativas.
7. **Resposta** — retorna `201 Created` com os dados da sessão.

### 👥 2. Gerenciamento de signatários — `POST /api/signers`, `GET /api/signers`, `DELETE /api/signers`

1. **Adicionar** — verifica se o usuário existe no `auth-service` (`verifyUserExists`), previne duplicatas e inclui no array `signers` da sessão.
2. **Listar** — retorna todos os signatários associados ao `documentId` informado na query.
3. **Remover** — exclui o signatário da sessão mantendo o restante intacto.

### 🔐 3. Token para signatário — `POST /api/signers/token`

1. **Autorização do criador** — apenas quem criou a sessão pode solicitar tokens para signatários.
2. **Verificações** — confirma se o signatário está cadastrado para a sessão.
3. **Emissão** — gera JWT assinado com `SIGNATURE_TOKEN_SECRET` valendo por `SIGNATURE_TOKEN_EXPIRES_IN` (padrão 10 min).
4. **Uso** — token é enviado ao signatário (via canal externo) para finalizar a assinatura.

### ✅ 4. Registro da assinatura — `POST /api/sign`

1. **Client info** — middleware `captureClientInfo` adiciona IP e userAgent a `req.clientInfo`.
2. **Persistência** — cria um `SignatureLog` com evidências (documento, sessão, usuário, IP, userAgent, status).
3. **Eventos** — serviço pode acionar `publishEvent` com `assinatura_confirmada`, alimentando RabbitMQ.
4. **Resposta** — retorna `200 OK` com mensagem de sucesso.

### 🔍 5. Recuperar sessão + documento — `GET /api/sessions/:documentId`

1. **Busca** — localiza a sessão referente ao `documentId`.
2. **Documento** — reutiliza o token do usuário para consultar o Document Service e anexar detalhes.
3. **Retorno** — entrega `session` e `document` agregados em um único payload.

---

## 🔗 Integração com Outros Serviços

| Serviço | Tipo | Finalidade |
|---------|------|------------|
| `auth-service` | REST (`POST /api/auth/validate-token`, `GET /api/users/:id`) | Validação de tokens e verificação de existência de usuários/signatários. |
| `document-service` | REST (`GET /api/documents/:id`) | Confirma existência e obtém metadados do documento antes de criar sessão/retornar dados. |
| `redis` | TCP (`6379`) | Cache do TTL das sessões e contagem rápida de sessões ativas. |
| `rabbitmq` | AMQP (`assinatura_confirmada`) | Publicação de eventos para Notification/Audit. |
| `audit-service` (*futuro*) | REST | Registro adicional de logs quando necessário. |

---

## 📂 Modelos de Dados

### `SignatureSession`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `documentId` | ObjectId | Documento que está em processo de assinatura. |
| `createdBy` | ObjectId | Usuário criador da sessão. |
| `expiresAt` | Date | Data/hora limite da sessão. |
| `signers[]` | Array | Lista de signatários com `userId`, `status`, `signed`, `signedAt`. |
| `status` | enum (`active`, `expired`, `completed`) | Situação geral da sessão. |
| `createdAt/updatedAt` | Date | Timestamps automáticos do Mongoose. |

### `SignatureLog`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `documentId` | string | Documento assinado. |
| `sessionId` | string | Sessão relacionada. |
| `userId` | string | Usuário que assinou. |
| `ipAddress` | string | IP coletado. |
| `userAgent` | string | User agent do dispositivo. |
| `status` | string | Mensagem de status registrada. |
| `createdAt` | Date | Timestamp imutável. |

---

## 🌐 Endpoints da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/sessions` | Cria nova sessão de assinatura | Bearer |
| POST | `/api/signers` | Adiciona signatário | Bearer |
| GET | `/api/signers` | Lista signatários de um documento (`?documentId=`) | Bearer |
| DELETE | `/api/signers` | Remove signatário | Bearer |
| POST | `/api/signers/token` | Gera token temporário para signatário | Bearer |
| POST | `/api/sign` | Registra assinatura (log de evidências) | Bearer |
| GET | `/api/sessions/:documentId` | Retorna sessão + documento | Bearer |
| GET | `/api/metrics` | Exibe métricas Prometheus | Público |

### Exemplos rápidos

**Criar sessão**
```bash
curl -X POST http://localhost:5003/api/sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "65f1c8d4f2a1c7ab12345678",
    "signers": ["507f1f77bcf86cd799439011"],
    "ttlMinutes": 45
  }'
```

**Gerar token para signatário**
```bash
curl -X POST http://localhost:5003/api/signers/token \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "65f1c8d4f2a1c7ab12345678",
    "userId": "507f1f77bcf86cd799439022"
  }'
```

Resposta (201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

---

## 📣 Eventos e Mensageria

- **Fila:** `assinatura_confirmada`
- **Produtor:** `publishEvent` (Signature Service)
- **Consumidores esperados:** Notification Service (envio de e-mails), Audit Service (registro adicional), Certificate Service (gatilho para geração de certificado).
- **Formato do payload:**
```json
{
  "documentId": "65f1c8d4f2a1c7ab12345678",
  "userId": "507f1f77bcf86cd799439011",
  "sessionId": "65f1c8d4f2a1c7ab87654321",
  "timestamp": "2025-02-01T14:35:22.145Z"
}
```

---

## 📊 Métricas e Observabilidade

- `GET /api/metrics` expõe indicadores para Prometheus.
- Métricas principais:
  - `signature_sessions_created_total`
  - `signature_session_creation_duration_seconds`
  - `signature_sessions_active_redis`
- Logs estruturados (`morgan`) facilitam rastreamento em produção.
- Integração futura com Audit Service para cada assinatura finalizada.

---

## ⚙️ Configuração e Variáveis

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `5003` | Porta HTTP do serviço |
| `NODE_ENV` | `development` | Ambiente de execução |
| `MONGO_URI` | `mongodb://mongo-signature:27017/signature-service` | URI do MongoDB |
| `AUTH_SERVICE_URL` | `http://auth-service:5001` | Validação de usuários e tokens |
| `DOCUMENT_SERVICE_URL` | `http://document-service:5002` | Consulta de documentos |
| `RABBITMQ_URL` | `amqp://rabbitmq:5672` | Broker para eventos |
| `REDIS_HOST` | `redis` | Host do Redis |
| `REDIS_PORT` | `6379` | Porta do Redis |
| `SIGNATURE_TOKEN_SECRET` | `tokenAindaMaisForte1234` | Segredo JWT para tokens de assinatura |
| `SIGNATURE_TOKEN_EXPIRES_IN` | `10m` | Tempo de expiração do token |
| `SIGNATURE_SESSION_TTL` | `30` | TTL padrão (minutos) utilizado na criação (opcional) |

> 💡 Certifique-se de carregar as variáveis em arquivos `.env` ou via secrets antes de subir a aplicação.

---

## 🚀 Execução e Deploy

### Ambiente local
```bash
npm install
npm run dev      # nodemon com reload automático
```

### Build produção
```bash
npm run build
npm start        # executa dist/server.js
```

### Docker
```bash
docker build -t signature-service .
docker run -d \
  --name signature-service \
  -p 5003:5003 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/signature \
  -e AUTH_SERVICE_URL=http://host.docker.internal:5001 \
  -e DOCUMENT_SERVICE_URL=http://host.docker.internal:5002 \
  -e RABBITMQ_URL=amqp://host.docker.internal:5672 \
  -e REDIS_HOST=host.docker.internal \
  signature-service
```

### Kubernetes (sugestão)
- Deployment com readiness/liveness probes no endpoint `/`.
- Service ClusterIP exposto na porta 5003.
- ConfigMaps/Secrets para variáveis sensíveis (`SIGNATURE_TOKEN_SECRET`).
- Considerar HPA baseado em consumo CPU/mem + métricas de fila.

---

## 🧪 Testes

- **Unitários** — lógica de JWT (`utils/jwt.test.ts`), criação de sessões e validação de schemas.
- **Integração** — `signatureSession.test.ts` cobre o fluxo completo (criação, assinatura, expiração).
- **Healthcheck** — `healthcheck.test.ts` assegura que o serviço responde e que dependências críticas estão acessíveis.

```bash
npm test
```

---

## 🗺️ Roadmap

- [ ] Integrar consumo automático de eventos do RabbitMQ (atualmente apenas publicação).
- [ ] Ampliar logs no Audit Service para toda mudança de status.
- [ ] Suporte a assinatura baseada em token do signatário sem autenticação prévia.
- [ ] Implementar expiração automática (cron) para sessões vencidas.
- [ ] Adicionar testes de performance e carga (k6, Artillery).

---

## 📚 Referências

- `src/controllers/` — pontos de entrada das rotas
- `src/services/` — regras de negócio e integrações
- `src/events/` — publicação de eventos RabbitMQ
- `src/metrics/` — configuração do Prometheus
- `swagger.json` — documentação interativa da API

---

**Serviço projetado para garantir jornadas de assinatura confiáveis, auditáveis e integradas ao restante do ecossistema de assinaturas digitais.**
