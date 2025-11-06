# ✍️ Plataforma de assinaturas digitais - Backend

> **🛡️ Auth Service** - gerencia autenticação e autorização da plataforma. Responsável por emitir e validar tokens, gerenciar usuários e permissões, e autenticar comunicações entre microserviços.

> **Versão:** `v1.0.0` | **Documentação:** `Swagger /api/docs` | **Status:** 🟢 Estável

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Swagger UI](https://img.shields.io/badge/Swagger_UI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)
![Babel](https://img.shields.io/badge/Babel-F9DC3E?style=for-the-badge&logo=babel&logoColor=black)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge&logo=open-source-initiative&logoColor=white)


## 📋 Menu de Navegação

- [ 🏠 **Voltar para Main**](https://github.com/DEVitor0/api-assinatura-digital/)
- [🎯 Finalidade deste Serviço](#-finalidade-deste-serviço)
- [🧩 Integração com o Ecossistema](#-integração-com-o-ecossistema)
- [🛡️ Mecanismos de Segurança](#-mecanismos-de-segurança)
- [🏗️ Arquitetura Interna do Serviço](#-arquitetura-interna-do-serviço)
  - [🧱 Entrada / Server](#1-entrada--server)
  - [🧭 Rotas / Controllers](#2-rotas--controllers)
  - [🧰 Middlewares](#3-middlewares)
  - [⚙️ Services (Lógica de Negócio)](#4-services-lógica-de-negócio)
  - [🗃️ Models / Persistência](#5-models--persistência)
  - [🧩 Libs / Utilitários](#6-libs--utilitários)
  - [🧠 Validations & Types](#7-validations--types)
- [🔐 Fluxo de Autenticação e Autorização](#-fluxo-de-autenticação-e-autorização)
- [🔗 Endpoints Disponíveis](#-endpoints-disponíveis)
  - [📨 POST /register](#1-post-register)
  - [🔑 POST /login](#2-post-login)
  - [🚪 POST /logout](#3-post-logout)
  - [♻️ POST /refresh](#4-post-refresh)
  - [👤 GET /me](#5-get-me)
- [🧠 Princípios e Decisões Importantes](#-princípios-e-decisões-importantes)
- [🧭 Roadmap dos Próximos Passos](#-roadmap-dos-próximos-passos)
- [👨‍💻 Autor](#-autor)
- [📄 Licença](#-licença)


## 🎯 Finalidade deste serviço

O serviço é responsável por gerenciar a autenticação, autorização e gerenciamento de sessão (access + refresh tokens). Ele emite e valida tokens, administra usuários e permissões, e autentica a comunicação entre microserviços.

## 🧩 Integração com o Ecossistema

O Auth Service integra-se com os seguintes microserviços:

| Serviço | Função | Protocolo |
|----------|--------|------------|
| API Gateway | Encaminhamento e autenticação global | HTTP / JWT |
| Audit Service | Registro de eventos de segurança | HTTP assíncrono (Axios) |
| User Service | Sincronização de perfis e permissões | REST interno |

## 🛡️ Mecanismos de Segurança

- **CORS**: bloqueia origens não confiáveis.
- **Helmet**: adiciona cabeçalhos HTTP seguros.
- **Rate Limiters**: protegem endpoints sensíveis (login e rotas globais).
- **Brute Force Protection**: 5 tentativas por IP em 5 minutos.
- **JWT Assinado**: tokens assinados com chave privada RSA.
- **Refresh Tokens Persistentes**: revogação imediata de sessões comprometidas.
- **Auditoria Assíncrona**: registro externo de eventos críticos de segurança.


## 🎨 **Arquitetura interna do serviço**

A arquitetura interna é em camadas, com responsabilidades claras para facilitar manutenção, testes e auditoria.

🧱 **1. Entrada / Server** 
- `server.ts` / `server.js`  
- Inicializa Express, conecta ao MongoDB, aplica `cors`, `helmet`, `morgan` e o `globalRateLimiter`.  
- Expõe `/api/auth`, `/api/docs` e `/api/health`.

🧭 **2. Rotas / Controllers** 
- `pages/api/auth/*` (register, login, logout, refresh, me) e `pages/api/validate-auth/validate-token`  
- Apenas fazem parsing HTTP mínimo e delegam a services. Controllers tratam respostas HTTP (status/códigos) e erros básicos.

🧰 **3. Middlewares**
- `authenticate` — valida JWT (header `Authorization: Bearer ...`) e injeta `req.user`.  
- `authorize` — verifica roles (`admin|user|signer`).  
- `bruteForceProtector` — `express-rate-limit` aplicado à rota de login (5 tentativas / 5 min).  
- `globalRateLimiter` — limite global (100 req / 15 min).  
- Middlewares isolam lógica de segurança antes que a request alcance os services.

⚙️ **4. Services (lógica de negócio)**
- `auth.service` — fluxo de registro e login (validação, comparação de senha, criação de tokens temporários).  
- `token.service` — geração de Access Token (JWT curto) e Refresh Token (JWT + persistência), validação e revogação.  
- `session.service` — valida/retorna dados de sessão (`/me`).  
- `logout.service` — revogação e remoção de refresh token.  
- Services não manipulam HTTP diretamente; retornam resultados ou lançam erros tratados pelos controllers.

🗃️ **5. Models / Persistência**
- `User` — documento Mongoose: `{ name, email(unique), password(hashed), role }`.  
- `RefreshToken` — documento Mongoose: `{ userId, token, expiresAt, createdAt }`.  
- Persistência utilizada para: autorizar reuso/revogação de refresh tokens e armazenar usuários.

🧩 **6. Libs / Utilitários**
- `hash` — wrappers para `bcrypt` (hash/compare).  
- `audit-service` — cliente HTTP (`axios`) que envia eventos para o Audit Service (ações: LOGIN, FAILED_LOGIN, REGISTER, GENERATE_REFRESH_TOKEN, REVOKE_REFRESH_TOKEN, SESSION_VALIDATED, etc.). Chamadas são assíncronas e não bloqueiam o fluxo crítico (em produção, preferível usar filas).

🧠 **7. Validations & Types**
- `auth.validation` (Zod) — valida payloads de entrada (register/login).  
- `types/jwt-payload` e `types/express` — tipagens que garantem consistência (`req.user`).

## 🔐 Fluxo de autenticação e autorização

1. Cliente → `POST /api/auth/login`  
2. `bruteForceProtector` valida taxa; request chega ao controller `login`.  
3. Controller delega a `auth.service`:
   - busca `User` no DB;
   - compara senha via `hash.compare`;
   - gera Access Token e Refresh Token via `token.service`;
   - persiste Refresh Token em `RefreshToken` collection.
4. `auth.service` chama `audit-service.sendAuditLog(...)` para registrar o evento.  
5. Controller retorna `{ accessToken, refreshToken }` ao cliente.

## 🔗 Endpoints disponíveis


| Ambiente | URL Base |
|-----------|-----------|
| Desenvolvimento | `http://auth-service:<PORT>/api/auth` |

> ⚙️ **Importante:**  
> Substitua `<PORT>` pela porta configurada no arquivo `.env` do serviço.  
> Exemplo: se o arquivo `.env` define `PORT=5001`, a URL final será:  
> `http://auth-service:5001/api/auth`.


### 📨 **1. POST /register**
Cria um novo usuário no sistema.

| Descrição | Registrar novo usuário |
|------------|------------------------|
| **Request Body** | `application/json` |
| **Schema** | `RegisterInput` |
| **Respostas** | `201 Created` – Usuário criado <br> `400 Bad Request` – Erro de validação |

**🧾 Exemplo de corpo da requisição:**
```json
{
  "name": "João da Silva",
  "email": "joao@email.com",
  "password": "123456"
}
```

### 🔑 2. **POST /login**
Autentica o usuário e retorna o par de tokens de sessão.

| Descrição | Login do usuário |
|-----------|------------------|
| **Request Body** | `application/json` |
| **Schema** | `LoginInput` |
| **Respostas** | `200 OK` – Login bem-sucedido<br>`401 Unauthorized` – Credenciais inválidas |

**🧾 Exemplo de resposta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzUxMiIs..."
}
```

### 🚪 3. POST /logout

Finaliza a sessão do usuário e invalida o refresh token associado.

| Descrição | Logout do usuário |
|-----------|-------------------|
| **Respostas** | **200 OK** – Logout realizado com sucesso |


### ♻️ 4. POST /refresh

Renova os tokens de acesso e atualização de forma segura.

| Descrição | Renovar tokens de autenticação |
|-----------|--------------------------------|
| **Request Body** | application/json |
| **Propriedades** | `refreshToken` (string, obrigatório) |
| **Respostas** | **200 OK** – Tokens renovados <br> **401 Unauthorized** – Token inválido ou expirado |

### 🧾 Exemplo de requisição:
```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiIs..."
}
```

### 👤 5. GET /me

Obtém as informações da sessão atual com base no token JWT e
retorna o usuário autenticado.

| Código | Descrição |
|--------|------------|
| 200 OK | Usuário autenticado |
| 401 Unauthorized | Token ausente ou inválido |

#### 🧱 RegisterInput
```json
{
  "name": "string",
  "email": "string (email)",
  "password": "string (password)"
}
```

#### 🧱 LoginInput
```json
{
  "email": "string (email)",
  "password": "string (password)"
}
```

#### 🧱 AuthTokens
```json
{
  "accessToken": "string (JWT)",
  "refreshToken": "string (JWT)"
}
```


## 🧠 Princípios e decisões importantes
- **Separation of concerns**: middlewares (políticas), services (negócio), models (persistência).  
- **Stateful refresh tokens**: refresh tokens são persistidos para permitir revogação imediata.  
- **Audit externo**: logs de segurança são enviados a um serviço dedicado (melhor rastreabilidade e conformidade).  
- **Rate limiting localizado**: proteção específica para endpoints sensíveis (login) além do limiter global.  
- **Validação estrita**: Zod para evitar dados malformados antes de chegar aos services.


## 🧭 Roadmap dos próximos passos

- [ ] Suporte a OAuth2 (Google / GitHub)
- [ ] Integração com fila RabbitMQ para auditoria assíncrona
- [ ] Módulo de MFA (Two-Factor Authentication)
- [ ] Logs estruturados (ELK Stack)
- [ ] Monitoramento com Prometheus / Grafana


## 👨‍💻 Autor

**Vitor Moreira** - Desenvolvedor

- 📧 Email: vitormoreira6940@gmail.com
- 🔗 LinkedIn: www.linkedin.com/in/devitor0
- 🐙 GitHub: https://github.com/DEVitor0

### 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](https://github.com/DEVitor0/api-assinatura-digital/blob/main/LICENSE) para mais detalhes.