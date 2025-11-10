# ✍️ Plataforma de Assinaturas Digitais - Backend



> **🔎 Audit Service** - Registra e persiste logs detalhados de eventos críticos do ecossistema. Responsável por garantir a **rastreabilidade** e **não-repúdio** das ações dos usuários e do sistema.



> **Versão:** `v1.0.0` | **Documentação:** indisponível via Swagger UI **Status:** | **Status:** 🟢 Estável



![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-85EA2D?style=for-the-badge&logo=mongoose&logoColor=white&color=red) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white) ![Babel](https://img.shields.io/badge/Babel-F9DC3E?style=for-the-badge&logo=babel&logoColor=black) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&logo=open-source-initiative&logoColor=white)


## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura Interna](#-arquitetura-interna)
- [Comunicação com Outros Serviços](#-comunicação-com-outros-serviços)
- [Modelo de Dados](#-modelo-de-dados)
- [API Endpoints](#-api-endpoints)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Configuração e Variáveis de Ambiente](#-configuração-e-variáveis-de-ambiente)
- [Como Executar](#-como-executar)
- [Exemplos de Uso](#-exemplos-de-uso)
- [Testes](#-testes)
- [Docker](#-docker)

---

## 🎯 Visão Geral

O **Audit Service** é um microserviço dedicado à **auditoria e rastreabilidade** de eventos críticos do ecossistema de assinaturas digitais. Ele atua como um **repositório centralizado** de logs, garantindo que todas as ações importantes sejam registradas de forma imutável e consultável.

### 🎯 Objetivos Principais

- ✅ **Rastreabilidade**: Registrar todos os eventos críticos do sistema
- ✅ **Não-repúdio**: Provar que ações foram realizadas por usuários específicos
- ✅ **Conformidade**: Atender requisitos legais de auditoria
- ✅ **Análise**: Permitir consultas históricas de eventos
- ✅ **Segurança**: Manter histórico de tentativas de acesso e falhas

### 🔑 Características

- **API RESTful** para recebimento e consulta de logs
- **Persistência em MongoDB** para armazenamento escalável
- **Arquitetura em camadas** (Controller → Service → Model)
- **Comunicação assíncrona** via HTTP (não bloqueia o fluxo principal)
- **Filtros flexíveis** para consulta de logs históricos
- **TypeScript** para type-safety e melhor manutenibilidade

---

## 🏗️ Arquitetura Interna

### 🔄 Fluxo de Processamento

#### 📝 1. Registro de Log — `POST /api/audit`

Quando um serviço cliente (como o `auth-service`) precisa registrar um evento de auditoria, ele envia uma requisição **HTTP POST** para o endpoint `/api/audit`.

#### 🔄 Fluxo da requisição

1. **Servidor Express (porta 5007)**  

   Recebe a requisição e aplica o middleware `express.json()` para interpretar o corpo JSON.

2. **Roteamento**  

   A requisição é direcionada para o handler `criarLogHandler`, definido em `audit.routes.ts`.

3. **Controlador**

   - Extrai os dados do corpo da requisição.  
   - Chama a função `registrarLog()` no **serviço de auditoria**.

4. **Serviço de auditoria**

   - Cria uma instância do modelo `AuditLog` com os dados recebidos.  
   - Persiste o documento no MongoDB, na collection `auditlogs` (banco de dados `audit`).

5. **Resposta**

   - Em caso de sucesso: retorna **HTTP 201 (Created)** com o log criado em formato JSON.  
   - Em caso de falha: retorna **HTTP 500 (Internal Server Error)** com uma mensagem genérica de erro.

---

#### 🔍 2. Consulta de Logs — `GET /api/audit`

Para consultar logs de auditoria, o cliente envia uma requisição **HTTP GET** para o endpoint `/api/audit`, podendo incluir parâmetros de query string para filtrar os resultados (como `userId`, `documentId`, `eventType`, etc.).

#### 🔄 Fluxo da requisição

1. **Servidor Express (porta 5007)**  

   Recebe a requisição e roteia para o handler `listarLogsHandler`.

2. **Controlador**

   - Extrai os parâmetros de query da requisição.  
   - Passa os filtros para a função `buscarLogs()` no **serviço de auditoria**.

3. **Serviço de auditoria**

   - Constrói uma query no MongoDB com base nos filtros fornecidos.  
   - Aplica os filtros ao modelo `AuditLog`.  
   - Ordena os resultados por timestamp em ordem decrescente (mais recentes primeiro) usando `.sort({ createdAt: -1 })`.

4. **Resposta**

   - Em caso de sucesso: retorna **HTTP 200 (OK)** com um array JSON contendo todos os logs que correspondem aos critérios de filtro.  
   - Se nenhum log for encontrado: retorna um array vazio `[]`.  
   - Em caso de falha: retorna **HTTP 500 (Internal Server Error)** com uma mensagem genérica de erro.


### 📦 Camadas Detalhadas

#### **1. Presentation Layer (Routes + Controllers)**

- **Responsabilidade**: Receber requisições HTTP e validar entrada
- **Arquivos**: `routes/audit.routes.ts`, `controllers/audit.controller.ts`
- **Tratamento**: Validação de dados, tratamento de erros HTTP

#### **2. Business Logic Layer (Services)**

- **Responsabilidade**: Lógica de negócio e orquestração
- **Arquivo**: `services/audit.services.ts`
- **Funções**: `registrarLog()`, `buscarLogs()`

#### **3. Data Access Layer (Model)**

- **Responsabilidade**: Abstração do banco de dados
- **Arquivo**: `model/AuditLog.ts`
- **Tecnologia**: Mongoose ODM

#### **4. Infrastructure Layer (App + Server)**

- **Responsabilidade**: Configuração do servidor e middleware
- **Arquivos**: `app.ts`, `server.ts`
- **Configurações**: Express, MongoDB connection, CORS (se aplicável)

---

### 🔌 Integração com Auth Service

O **Auth Service** é o principal consumidor do Audit Service, enviando logs de todos os eventos de autenticação e autorização.

#### **Biblioteca de Integração**

O Auth Service possui uma biblioteca dedicada (`libs/audit-service.ts`) que encapsula a comunicação:

```typescript
// auth-service/src/libs/audit-service.ts
const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 
  'http://audit-service:5007/api/audit';

export async function sendAuditLog(log: AuditLog): Promise<void> {
  try {
    await axios.post(AUDIT_SERVICE_URL, {
      ...log,
      timestamp: log.timestamp || new Date(),
    });
  } catch (error) {
    console.error('Erro ao enviar log de auditoria:', error);
  }
}
```

#### **Eventos Registrados pelo Auth Service**

| Evento | Descrição | Quando é Disparado |
|--------|-----------|-------------------|
| `REGISTER` | Novo usuário registrado | Cadastro bem-sucedido |
| `LOGIN` | Login bem-sucedido | Autenticação válida |
| `FAILED_LOGIN` | Tentativa de login falhada | Credenciais inválidas |
| `LOGOUT` | Logout realizado | Sessão encerrada |
| `FAILED_LOGOUT` | Falha ao fazer logout | Erro no processo |
| `SESSION_VALIDATED` | Sessão validada | Validação de token |
| `GENERATE_ACCESS_TOKEN` | Token de acesso gerado | Geração de JWT |
| `GENERATE_REFRESH_TOKEN` | Token de refresh gerado | Renovação de sessão |
| `VALIDATE_REFRESH_TOKEN` | Token de refresh validado | Validação de refresh token |
| `REVOKE_REFRESH_TOKEN` | Token revogado | Invalidação de token |

#### **Exemplo de Uso no Auth Service**

```typescript
// auth-service/src/services/auth.service.ts
import { sendAuditLog } from '../libs/audit-service';

// Após login bem-sucedido
await sendAuditLog({
  action: 'LOGIN',
  userId: user.id,
  email: user.email,
  message: 'Login realizado com sucesso',
  timestamp: new Date()
});
```

### 🔄 Comunicação Assíncrona

A comunicação é **não-bloqueante**:

- ✅ Chamadas HTTP são **assíncronas** (async/await)
- ✅ Erros são **capturados e logados**, mas não interrompem o fluxo principal
- ✅ O serviço que envia o log **não espera confirmação** (fire-and-forget pattern)
- ⚠️ **Nota**: Em produção, recomenda-se usar filas (RabbitMQ) para maior garantia de entrega

### 🌐 Configuração de URL

A URL do Audit Service é configurável via variável de ambiente:

```bash
# No serviço cliente (ex: auth-service)
AUDIT_SERVICE_URL=http://audit-service:5007/api/audit
```

**Ambientes:**
- **Docker Compose**: `http://audit-service:5007/api/audit` (nome do container)
- **Local**: `http://localhost:5007/api/audit`
- **Kubernetes**: `http://audit-service.namespace.svc.cluster.local:5007/api/audit`

---

## 📊 Modelo de Dados

### 🗄️ Schema do AuditLog

O modelo `AuditLog` define a estrutura dos logs de auditoria armazenados no MongoDB:

```typescript
interface IAuditLog {
  eventType: 'signature' | 'rejection' | 'failure';
  userId: string;
  documentId: string;
  message?: string;
  timestamp: Date;
}
```

### 📋 Campos Detalhados

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `eventType` | `enum` | ✅ Sim | Tipo do evento: `'signature'`, `'rejection'`, `'failure'` |
| `userId` | `string` | ✅ Sim | ID do usuário que realizou a ação |
| `documentId` | `string` | ✅ Sim | ID do documento relacionado |
| `message` | `string` | ❌ Não | Mensagem descritiva adicional |
| `timestamp` | `Date` | ✅ Sim | Data e hora do evento (gerado automaticamente) |

### 🔍 Tipos de Eventos

#### **1. `signature`**
- **Uso**: Documento assinado com sucesso
- **Exemplo**: "Documento assinado digitalmente pelo usuário"

#### **2. `rejection`**
- **Uso**: Documento rejeitado
- **Exemplo**: "Documento rejeitado pelo usuário"

#### **3. `failure`**
- **Uso**: Falha em operação
- **Exemplo**: "Falha ao processar assinatura"

### 📦 Estrutura no MongoDB

```json
{
  "_id": ObjectId("..."),
  "eventType": "signature",
  "userId": "user-123",
  "documentId": "doc-456",
  "message": "Documento assinado com sucesso",
  "timestamp": ISODate("2024-01-15T10:30:00Z"),
  "__v": 0
}
```

### 🔐 Índices Recomendados

Para otimizar consultas, recomenda-se criar índices:

```javascript
// Índice composto para consultas por usuário e tipo
db.auditlogs.createIndex({ userId: 1, eventType: 1 });

// Índice para consultas por documento
db.auditlogs.createIndex({ documentId: 1 });

// Índice para ordenação por timestamp
db.auditlogs.createIndex({ timestamp: -1 });
```

---

## 🌐 API Endpoints

### 📍 Base URL

```
http://localhost:5007/api/audit
```

### 1. **POST /api/audit** - Registrar Log

Registra um novo evento de auditoria no sistema.

#### **Request**

```http
POST /api/audit
Content-Type: application/json

{
  "eventType": "signature",
  "userId": "user-123",
  "documentId": "doc-456",
  "message": "Documento assinado com sucesso"
}
```

#### **Request Body**

| Campo | Tipo | Obrigatório | Valores Aceitos |
|-------|------|-------------|-----------------|
| `eventType` | `string` | ✅ Sim | `"signature"`, `"rejection"`, `"failure"` |
| `userId` | `string` | ✅ Sim | Qualquer string (ID do usuário) |
| `documentId` | `string` | ✅ Sim | Qualquer string (ID do documento) |
| `message` | `string` | ❌ Não | Texto descritivo |
| `timestamp` | `string` (ISO) | ❌ Não | Se omitido, usa data atual |

#### **Response - Sucesso (201 Created)**

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "eventType": "signature",
  "userId": "user-123",
  "documentId": "doc-456",
  "message": "Documento assinado com sucesso",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "__v": 0
}
```

#### **Response - Erro (500 Internal Server Error)**

```json
{
  "error": "Erro ao registrar log."
}
```

---

### 2. **GET /api/audit** - Listar Logs

Consulta logs de auditoria com filtros opcionais.

#### **Request**

```http
GET /api/audit?userId=user-123&eventType=signature
```

#### **Query Parameters**

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `userId` | `string` | ❌ Não | Filtrar por ID do usuário |
| `documentId` | `string` | ❌ Não | Filtrar por ID do documento |
| `eventType` | `string` | ❌ Não | Filtrar por tipo: `signature`, `rejection`, `failure` |
| `message` | `string` | ❌ Não | Buscar na mensagem (regex) |

#### **Response - Sucesso (200 OK)**

```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "eventType": "signature",
    "userId": "user-123",
    "documentId": "doc-456",
    "message": "Documento assinado com sucesso",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "__v": 0
  },
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "eventType": "rejection",
    "userId": "user-123",
    "documentId": "doc-789",
    "message": "Documento rejeitado",
    "timestamp": "2024-01-15T09:15:00.000Z",
    "__v": 0
  }
]
```

**Nota**: Os resultados são ordenados por `timestamp` em ordem decrescente (mais recentes primeiro).

#### **Response - Erro (500 Internal Server Error)**

```json
{
  "error": "Erro ao buscar logs."
}
```

---

## 📁 Estrutura do Projeto

```
audit-service/
├── __tests__/                    # Testes automatizados
│   └── healthcheck.test.ts       # Testes de healthcheck
├── src/                          # Código-fonte
│   ├── app.ts                    # Configuração do Express e MongoDB
│   ├── server.ts                 # Inicialização do servidor
│   ├── controllers/              # Camada de controladores
│   │   └── audit.controller.ts   # Handlers HTTP
│   ├── services/                 # Camada de serviços (lógica de negócio)
│   │   └── audit.services.ts     # Funções de registro e busca
│   ├── model/                    # Camada de modelo (Mongoose)
│   │   └── AuditLog.ts           # Schema e interface do AuditLog
│   ├── routes/                   # Definição de rotas
│   │   └── audit.routes.ts       # Rotas REST
│   ├── consumers/                # Consumidores de mensageria (futuro)
│   └── utils/                    # Utilitários (futuro)
├── Dockerfile                    # Configuração Docker
├── jest.config.ts                # Configuração Jest
├── tsconfig.json                 # Configuração TypeScript
├── package.json                  # Dependências e scripts
└── README.md                     # Esta documentação
```

### 📝 Descrição dos Diretórios

- **`__tests__/`**: Testes unitários e de integração usando Jest
- **`src/controllers/`**: Handlers HTTP que processam requisições
- **`src/services/`**: Lógica de negócio e orquestração
- **`src/model/`**: Modelos Mongoose e interfaces TypeScript
- **`src/routes/`**: Definição de rotas REST
- **`src/consumers/`**: Preparado para consumidores de filas (RabbitMQ)
- **`src/utils/`**: Funções utilitárias compartilhadas

---

## 💡 Exemplos de Uso

### 📝 Exemplo 1: Registrar Log de Assinatura

```bash
curl -X POST http://localhost:5007/api/audit \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "signature",
    "userId": "user-123",
    "documentId": "doc-456",
    "message": "Documento assinado com sucesso"
  }'
```

**Resposta**:

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "eventType": "signature",
  "userId": "user-123",
  "documentId": "doc-456",
  "message": "Documento assinado com sucesso",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "__v": 0
}
```

### 📝 Exemplo 2: Registrar Log de Rejeição

```bash
curl -X POST http://localhost:5007/api/audit \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "rejection",
    "userId": "user-789",
    "documentId": "doc-123",
    "message": "Usuário rejeitou o documento"
  }'
```

### 📝 Exemplo 3: Buscar Logs por Usuário

```bash
curl "http://localhost:5007/api/audit?userId=user-123"
```

### 📝 Exemplo 4: Buscar Logs por Tipo de Evento

```bash
curl "http://localhost:5007/api/audit?eventType=signature"
```

### 📝 Exemplo 5: Buscar Logs com Múltiplos Filtros

```bash
curl "http://localhost:5007/api/audit?userId=user-123&eventType=signature&documentId=doc-456"
```

---

## 🧪 Testes

### 🏃 Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm test -- --watch

# Executar testes com cobertura
npm test -- --coverage
```

### 📊 Estrutura de Testes

Os testes estão organizados em `__tests__/`:

- **`healthcheck.test.ts`**: Testes básicos de healthcheck

---

## 🔮 Melhorias Futuras

- [ ] **Integração com RabbitMQ**: Consumir eventos de filas para maior garantia de entrega
- [ ] **Swagger/OpenAPI**: Documentação interativa da API
- [ ] **Healthcheck Endpoint**: Endpoint `/health` para monitoramento
- [ ] **Paginação**: Suporte a paginação nas consultas de logs
- [ ] **Retenção de Dados**: Política de retenção e arquivamento
- [ ] **Métricas**: Integração com Prometheus
- [ ] **Validação**: Validação de entrada com Joi ou Zod
- [ ] **Rate Limiting**: Proteção contra abuso da API
- [ ] **Autenticação**: Proteção dos endpoints com JWT

---

## 📚 Referências

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
