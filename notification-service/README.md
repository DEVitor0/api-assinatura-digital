# ✍️ Plataforma de assinaturas digitais - Backend

> **🔔 Notification Service** - centraliza o envio de notificações transacionais do ecossistema. Responsável por consumir eventos críticos, enriquecer conteúdos com metadados dos documentos e entregar mensagens via e-mail (e canais futuros), garantindo rastreabilidade e feedback aos usuários.

> **Versão:** `v1.0.0` | **Documentação:** `Swagger /api/docs` (planejado) | **Status:** 🟡 Em planejamento

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![BullMQ](https://img.shields.io/badge/BullMQ-800000?style=for-the-badge&logoColor=white) ![Nodemailer](https://img.shields.io/badge/Nodemailer-4A148C?style=for-the-badge&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Responsabilidades Principais](#-responsabilidades-principais)
- [Arquitetura em Texto](#-arquitetura-em-texto)
- [Fluxos Essenciais](#-fluxos-essenciais)
- [Comunicação com Outros Serviços](#-comunicação-com-outros-serviços)
- [Formato de Mensagens e Templates](#-formato-de-mensagens-e-templates)
- [Endpoints da API (planejados)](#-endpoints-da-api-planejados)
- [Configuração e Variáveis](#-configuração-e-variáveis)
- [Execução e Deploy](#-execução-e-deploy)
- [Testes e Observabilidade](#-testes-e-observabilidade)
- [Roadmap](#-roadmap)
- [Referências](#-referências)

---

## 🎯 Visão Geral

O **Notification Service** é responsável por manter usuários e integradores informados sobre o status de documentos, assinaturas e validações. Ele opera de forma híbrida: processa eventos assíncronos vindos do broker (RabbitMQ) e expõe uma API REST para disparos explícitos ou reenvio de notificações. A meta é oferecer resiliência, escalabilidade e fácil rastreabilidade das mensagens enviadas.

> ℹ️ **Status atual**: código em fase de especificação. Esta documentação descreve a arquitetura planejada para orientar implementação, testes e integração futura.

### 🔑 Responsabilidades Principais

- ✅ Consumir eventos sobre criação, assinatura, rejeição e validação de documentos.
- ✅ Consolidar metadados (usuário, documento, hash, links públicos) consultando outros microserviços.
- ✅ Selecionar templates adequados e preencher placeholders com dados dinâmicos.
- ✅ Enfileirar e enviar notificações via e-mail (SMTP/Nodemailer) e preparar infraestrutura para canais secundários (SMS, Webhook, push).
- ✅ Registrar o resultado do envio e fornecer reprocessamento em caso de falhas.
- ✅ Expor endpoints REST para disparo manual, consulta de histórico e healthcheck.

---

## 🏗️ Arquitetura em Texto

- **API HTTP (Express + TypeScript)** — expõe rotas sob `/api/notifications` para disparo manual, reenvio e estatísticas. Utiliza middlewares para autenticação (delegando ao Auth Service) e rate limiting básico.
- **Consumer RabbitMQ** — serviço worker dedicado que se conecta à fila (ex.: `notifications.events`) e processa mensagens vindas de Signature Service, Certificate Service ou Validator Service.
- **Fila interna (BullMQ + Redis)** — armazena jobs de envio para controlar tentativas, backoff e paralelismo. Permite reprocessar notificações com falha sem perder o evento original.
- **Template Engine** — combina templates Markdown/HTML com dados obtidos via Document Service e Auth Service. Permite customizar conteúdo por tipo de evento.
- **Mailer (Nodemailer)** — camada responsável por entregar mensagens via SMTP ou provedores transacionais (SendGrid, Amazon SES). Configurável por variáveis de ambiente.
- **Auditoria** — após envio bem-sucedido ou falha, registra log no Audit Service garantindo trilha de auditoria completa.

---

## 🔄 Fluxos Essenciais

### 📨 1. Consumo assíncrono via RabbitMQ

1. **Publicação do evento** — Signature Service emite mensagem `signature.completed` com `documentId`, `userId`, timestamp e contexto.
2. **Ingestão RabbitMQ** — Notification Service consome a mensagem da fila configurada (`notifications.events`).
3. **Enriquecimento** — Consulta Document Service para obter metadados (nome do documento, hash, link de download) e Auth Service para detalhes do destinatário.
4. **Enfileiramento interno** — Cria job no BullMQ (`send-email`) armazenando payload completo.
5. **Envio** — Worker executa o job, renderiza template, envia via SMTP. Em caso de sucesso, marca como concluído; em falha, aplica políticas de retry exponencial.
6. **Registro** — Notifica Audit Service com o resultado (sucesso/erro) e armazena status para consultas futuras.

### ✉️ 2. Disparo manual via API REST

1. **Solicitação autenticada** — Operador ou serviço chama `POST /api/notifications/send` com token válido do Auth Service.
2. **Validação** — Middleware autentica e aplica schema validation (ex.: Joi/Zod) nos dados recebidos.
3. **Processamento** — API cria job em BullMQ com canal solicitado (`email`, `webhook`) e enfileira para processamento.
4. **Resposta** — Retorna `202 Accepted` com `notificationId`, permitindo acompanhar status pelo endpoint `/api/notifications/:id`.

### ♻️ 3. Reprocessamento automático

1. **Falha detectada** — Worker marca job como falho, registrando motivo (ex.: timeout SMTP).
2. **Retry** — BullMQ agenda nova tentativa com backoff exponencial (ex.: 3, 15, 60 minutos).
3. **Circuit breaker** — Após limite de tentativas, move job para `dead-letter queue` e aguarda intervenção manual (`POST /api/notifications/:id/retry`).

---

## 🔗 Comunicação com Outros Serviços

| Serviço | Interação | Motivo |
|---------|-----------|--------|
| **Auth Service** | `POST /api/auth/validate-token` (REST) | Validar tokens que chegam nas rotas do Notification Service. |
| **Document Service** | `GET /api/documents/:id` (REST) | Recuperar detalhes do documento para enriquecer templates. |
| **Signature/Certificate/Validator Services** | RabbitMQ (`notifications.events`) | Principais produtores de eventos de notificação. |
| **Audit Service** | `POST /api/audit` (REST) | Registrar logs de sucesso/falha das notificações para fins de rastreabilidade. |
| **Infra (Redis, RabbitMQ)** | conexões diretas | Redis para filas internas (BullMQ), RabbitMQ como broker de eventos externos. |

---

## 🗃️ Formato de Mensagens e Templates

### Evento recebido (RabbitMQ)
```json
{
  "event": "signature.completed",
  "documentId": "65f1c8d4f2a1c7ab12345678",
  "userId": "507f1f77bcf86cd799439011",
  "payload": {
    "signedAt": "2025-02-01T14:35:22.145Z",
    "signers": ["Alice", "Bob"],
    "downloadUrl": "https://gateway/api/documents/65f1c8d4.../download"
  }
}
```

### Template preenchido (exemplo simplificado)
```json
{
  "subject": "Documento assinado com sucesso",
  "bodyHtml": "<p>Olá Alice,</p><p>O documento <strong>Contrato.pdf</strong> foi assinado por todos os participantes.</p>",
  "bodyText": "Olá Alice, o documento Contrato.pdf foi assinado por todos os participantes."
}
```

---

## 🌐 Endpoints da API (planejados)

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| GET | `/api/notifications/health` | Healthcheck básico (status do broker/Redis) | Planejado |
| POST | `/api/notifications/send` | Disparo manual de notificação | Planejado |
| GET | `/api/notifications/:id` | Consulta status de um envio | Planejado |
| POST | `/api/notifications/:id/retry` | Reenfileira uma notificação com falha | Planejado |
| GET | `/api/notifications/templates` | Lista templates disponíveis | Planejado |

### Exemplo de requisição (planejado)
```bash
curl -X POST http://localhost:5008/api/notifications/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "email",
    "recipient": {
      "email": "usuario@exemplo.com",
      "name": "Usuário Exemplo"
    },
    "template": "document.signed",
    "data": {
      "documentName": "Contrato.pdf",
      "signedAt": "2025-02-01T14:35:22Z"
    }
  }'
```

Resposta esperada (202):
```json
{
  "notificationId": "noti_01HT8K5YHX3V6H3N7DA0N7T2C6",
  "status": "queued"
}
```

---

## ⚙️ Configuração e Variáveis

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `5008` | Porta HTTP do Notification Service |
| `NODE_ENV` | `development` | Ambiente de execução |
| `AUTH_SERVICE_URL` | `http://auth-service:5001` | Validação de tokens |
| `DOCUMENT_SERVICE_URL` | `http://document-service:5002` | Metadados de documentos |
| `AUDIT_SERVICE_URL` | `http://audit-service:5007/api/audit` | Registro de logs |
| `RABBITMQ_URL` | `amqp://rabbitmq:5672` | Broker de eventos externos |
| `REDIS_HOST` | `redis` | Host do Redis (BullMQ) |
| `REDIS_PORT` | `6379` | Porta do Redis |
| `MAIL_TRANSPORT` | `smtp` | Provedor de envio (`smtp`, `ses`, `sendgrid`, etc.) |
| `SMTP_HOST` | `smtp.mailtrap.io` | Host SMTP (quando `MAIL_TRANSPORT=smtp`) |
| `SMTP_PORT` | `587` | Porta SMTP |
| `SMTP_USER` / `SMTP_PASS` | - | Credenciais SMTP |
| `MAIL_FROM_NAME` | `Plataforma de Assinaturas` | Nome remetente |
| `MAIL_FROM_EMAIL` | `no-reply@assinaturas.com` | E-mail remetente |
| `BULL_RETRY_LIMIT` | `5` | Tentativas antes de DLQ |

> 💡 Ajuste as variáveis conforme o ambiente. Em produção, use secrets seguros (Kubernetes Secrets, Docker Swarm secrets).

---

## 🚀 Execução e Deploy

### Ambiente local (planejado)
```bash
npm install
npm run dev       # Inicia API e consumer com hot-reload
```

### Build produção
```bash
npm run build
npm start         # Executa a API a partir de dist/
```

### Docker
```bash
docker build -t notification-service .
docker run -d \
  --name notification-service \
  -p 5008:5008 \
  -e RABBITMQ_URL=amqp://host.docker.internal:5672 \
  -e REDIS_HOST=host.docker.internal \
  notification-service
```

> Integração futura com `infra/docker-compose.yml` adicionará o serviço após conclusão da implementação.

### Kubernetes (sugestão)
- Criar Deployment com 2 containers (API + worker) ou usar dois Deployments separados visando escalabilidade independente.
- Utilizar ConfigMaps/Secrets para variáveis e um HorizontalPodAutoscaler baseado em métricas do BullMQ.

---

## 🧪 Testes e Observabilidade

- **Testes unitários** (Jest): validação de templates, formatação de e-mails, integração com clientes externos.
- **Testes de integração**: simulação de consumo RabbitMQ + envio fake (Mailhog/Nodemailer test account).
- **Observabilidade**:
  - Logs estruturados (pino/winston) com correlação de `notificationId`.
  - Métricas de fila (Bull Board / Prometheus exporter) para monitorar jobs ativos/falhos.
  - Healthcheck expondo status de RabbitMQ/Redis/SMTP.

---

## 🗺️ Roadmap

- [ ] Implementar scaffolding inicial (Express, rotas básicas e consumer RabbitMQ).
- [ ] Integrar BullMQ + Redis para gerenciamento de jobs.
- [ ] Criar camada de templates com suporte a múltiplos idiomas.
- [ ] Adicionar provedores alternativos (SMS, Webhook).
- [ ] Construir documentação Swagger e collection Postman.
- [ ] Automatizar deploy via CI/CD com Docker Registry.

---

## 📚 Referências

- RabbitMQ – https://www.rabbitmq.com/
- BullMQ – https://docs.bullmq.io/
- Nodemailer – https://nodemailer.com/
- Template engines (Handlebars, MJML)
- Documentação interna: `README.md` raiz (visão macro do ecossistema)

---

**Serviço projetado para garantir comunicação proativa com usuários e integradores, mantendo a experiência da Plataforma de Assinaturas alinhada aos eventos críticos do negócio.**
