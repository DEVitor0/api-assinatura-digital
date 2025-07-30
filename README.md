# 📄 Plataforma de assinaturas digitais

Este projeto é uma **plataforma robusta de assinatura digital**, desenvolvida com **arquitetura de microserviços** para atender a demandas reais de segurança, rastreabilidade e escalabilidade.  

Pensada para **instituições públicas, empresas privadas, órgãos reguladores e sistemas jurídicos**, a solução permite gerenciar todo o ciclo de vida de um documento assinado digitalmente, desde o envio até a validação pública da autenticidade.

## 💼 Por que este projeto importa?

Em um mundo onde **contratos, declarações, autorizações e registros legais** estão migrando para o digital, garantir a **autenticidade, validade jurídica e integridade dos documentos** não é mais uma opção, É UMA EXIGÊNCIA!!!  

Esta solução agrega valor ao mercado por:

- Eliminar burocracias e custos com documentos físicos  
- Reduzir fraudes com autenticação e rastreamento de assinaturas  
- Integrar com qualquer sistema via API para automação de processos  
- Permitir que **usuários finais e empresas** verifiquem a validade de um certificado ou documento de forma autônoma e segura  
- Oferecer **transparência jurídica e técnica**, com registro completo de todas as ações

---

## 🧱 Estrutura de Serviços

```
.
├── audit-service
├── auth-service
├── certificate-service
├── document-service
├── infra
├── signature-service
└── validator-service
```

---

### 🚀 Plataforma e Infraestrutura

- **Node.js**, **Express**, **TypeScript** — base moderna e escalável para backend  
- **Docker** & **Kubernetes** — containerização e orquestração para alta disponibilidade e escalabilidade  
- **MongoDB** (Mongoose) — banco NoSQL flexível com suporte para armazenamento de arquivos  

### 🔐 Segurança e Autenticação

- **JWT** & **bcrypt** — autenticação segura com tokens e proteção de senhas  
- **Helmet**, **Rate limiting**, **express-useragent**, **request-ip** — hardening, proteção contra ataques e captura de contexto do usuário  
- **SHA-256** — criptografia para garantia de integridade dos documentos  

### ⚙️ Validação, Monitoramento e Mensageria

- **Zod** — validação robusta de dados com tipagem segura  
- **RabbitMQ** (via `amqplib`) — sistema confiável de mensageria para comunicação assíncrona entre microserviços  
- **Redis** (`ioredis`) — cache e gerenciamento de sessões com alta performance  
- **Prometheus** (`prom-client`) — monitoramento e métricas para observabilidade do sistema  

### 🧪 Qualidade, Testes e Documentação

- **Jest** — testes automatizados para garantir confiabilidade  
- **Swagger (OpenAPI)** — documentação clara e interativa das APIs  
- **ESLint**, **Prettier**, **EditorConfig**, **Babel** — padronização e boas práticas no código  

### 📦 Ferramentas e Utilitários

- **Multer** — upload seguro e eficiente de arquivos (PDFs)  
- **Morgan** — logging detalhado de requisições HTTP  
- **Axios** — cliente HTTP para comunicação entre serviços  
- **UUID** — geração de identificadores únicos para recursos  

---

## 📦 Serviços

### 1. `auth-service` – Autenticação e Autorização

Responsável por tudo relacionado à autenticação e autorização.

**Funcionalidades:**

- Registro e login de usuários
- Geração e validação de JWT e Refresh Tokens
- Middleware de verificação de roles (`admin`, `user`, `signer`)
- Logout e revalidação de sessão
- Proteções de segurança: bcrypt, rate limit, brute force
- Healthcheck (`GET /api/health`)

---

### 2. `document-service` – Gestão de Documentos

Gerencia os arquivos enviados que serão assinados.

**Funcionalidades:**

- Upload de PDFs (via `multer`)
- Validação e geração de hash SHA256
- Armazenamento seguro em disco
- Metadados: nome, tipo, autor, hash
- Listagem, busca e remoção de documentos
- Middleware de autenticação compartilhado com `auth-service`

---

### 3. `signature-service` – Sessões de Assinatura

Orquestra o processo de assinatura digital.

**Funcionalidades:**

- Criação de sessão de assinatura com TTL (Redis)
- Adição e gerenciamento de signatários
- Geração de token exclusivo por signatário (JWT próprio)
- Registro da assinatura (IP, navegador, horário)
- Gerenciamento de status (pendente, assinado, rejeitado)
- Exposição de métricas (`/metrics`)
- Eventos assíncronos (RabbitMQ)
- Healthcheck (`GET /api/health`)

---

### 4. `certificate-service` – Emissão de Certificados

Gera certificados finais contendo:

- Hash SHA256 do documento
- QR Code de verificação
- Número de protocolo (UUID)
- Lista de signatários
- Link para download e consulta pública
- Rota pública de verificação por hash ou UUID

---

### 5. `validator-service` – Verificação de Documentos

Verifica a integridade e validade dos documentos e certificados.

**Funcionalidades:**

- Verificação de hash de documento
- Consulta de certificados via código público
- Retorno de integridade e validade

---

### 6. `audit-service` – Log de Auditoria

Registra eventos sensíveis para rastreabilidade.

**Funcionalidades:**

- Log de assinatura, rejeição, falhas
- Exportação e filtragem por data, usuário ou documento
- Armazenamento seguro dos logs

---

## 🛠️ Desenvolvimento

### Rodando localmente

1. Clone o repositório
2. Suba os containers com Docker Compose:
   ```bash
   docker-compose -f infra/docker-compose.yml up --build
   ```
3. Cada serviço roda em sua porta respectiva (veja o compose ou K8s)

---

## 📚 Documentação com Swagger

Todos os serviços possuem documentação Swagger acessível via rota `/api/docs`.
**Sempre verifique as .env.example para garantir que o projeto rode corretamente**

---

## 🧪 Testes

- Utilizei **Jest** para testes unitários
- Os testes ficam na pasta `__tests__` com sufixo `.test.ts`

---

## 📩 Contato

Fico a disposição através do email vitormoreira6940@gmail.com para auxiliar com qualquer duvida ou problema referente ao projeto

