# ✍️ Plataforma de assinaturas digitais - Backend

> **📄 Document Service** - gerencia o ciclo de vida dos arquivos enviados pelos usuários. Responsável por receber, validar, armazenar metadados e garantir a rastreabilidade dos documentos PDF.

> **Versão:** `v1.0.0` | **Documentação:** `Swagger /api/docs` | **Status:** 🟢 Estável

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![Multer](https://img.shields.io/badge/Multer-FF6F00?style=for-the-badge&logo=upload&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/Mongoose-800000?style=for-the-badge&logo=mongoose&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) ![Swagger UI](https://img.shields.io/badge/Swagger_UI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Responsabilidades Principais](#-responsabilidades-principais)
- [Arquitetura em Texto](#-arquitetura-em-texto)
- [Fluxos Essenciais](#-fluxos-essenciais)
- [Comunicação com Outros Serviços](#-comunicação-com-outros-serviços)
- [Modelo de Dados](#-modelo-de-dados)
- [Endpoints da API](#-endpoints-da-api)
- [Configuração e Variáveis](#-configuração-e-variáveis)
- [Como Executar](#-como-executar)
- [Testes](#-testes)

---

## 🎯 Visão Geral

O **Document Service** centraliza o gerenciamento de documentos PDF do ecossistema de assinaturas digitais. Ele recebe uploads autenticados, garante que apenas PDFs válidos sejam aceitos, calcula hashes SHA-256 para não-repúdio, guarda metadados no MongoDB e entrega listagens e operações de consulta/exclusão limitadas ao proprietário do arquivo.

### 🔑 Responsabilidades Principais

- ✅ **Ingestão segura de PDFs** com controle de tipo via `multer` e naming único (`uuid + timestamp`).
- ✅ **Autenticação delegada** ao `Auth Service` para validar tokens antes de qualquer operação.
- ✅ **Persistência de metadados** em MongoDB via `Mongoose`, preservando histórico com timestamps.
- ✅ **Cálculo de hash SHA-256** para cada arquivo armazenado, garantindo integridade e rastreabilidade.
- ✅ **API RESTful protegida** para consulta, detalhamento e exclusão de documentos do usuário autenticado.
- ✅ **Documentação interativa** disponível em `/api/docs` com Swagger UI.

---

## 🏗️ Arquitetura em Texto

- **Servidor HTTP (Express 5)** — Inicializa middlewares globais (`express.json()`), expõe rotas sob `/api/documents` e monta a documentação Swagger (`/api/docs`). A inicialização conecta ao MongoDB antes de aceitar requisições, garantindo disponibilidade do banco.
- **Autenticação delegada** — O middleware `authenticate` chama o `Auth Service` via `axios` (`/api/auth/validate-token`) para validar o JWT, anexando `req.user` com o payload aprovado. Falhas resultam em status 401 ou 500, evitando acesso não autorizado.
- **Tratamento de upload** — O middleware `uploadPdf` utiliza `multer` em modo disco, salvando os arquivos no diretório `archives/` com nomes únicos (`UUID + timestamp`). Ele bloqueia qualquer formato diferente de PDF.
- **Camada de serviços** — `document.service.ts` encapsula a persistência dos metadados, convertendo o `uploadedBy` para `ObjectId` e utilizando o modelo `Document`.
- **Persistência MongoDB** — O schema `Document` armazena nome original, nome físico, mime type, hash e referência ao usuário, com timestamps automáticos (`createdAt`, `updatedAt`).
- **Bibliotecas utilitárias** — `generateSHA256` (Node `crypto`) calcula o hash diretamente do arquivo em disco, permitindo verificações posteriores.

---

## 🔄 Fluxos Essenciais

### 📤 Upload de PDF — `POST /api/documents/upload`

1. **Validação do token** — O header `Authorization: Bearer <token>` é enviado. O middleware chama o Auth Service; se inválido, responde 401.
2. **Processamento do arquivo** — `multer` aceita apenas campo `document` com MIME `application/pdf`, gera nome único e grava o arquivo em `archives/`.
3. **Pós-processamento** — É calculado o hash SHA-256 e executado `saveDocumentMetadata`, armazenando metadados vinculados ao usuário autenticado.
4. **Resposta** — Sucesso retorna 200 com mensagem e dados resumidos do arquivo (id, nomes, tamanho, caminho, hash). Erros de validação retornam 400; falhas internas, 500.

### 📥 Listagem e consultas — `GET /api/documents`, `GET /api/documents/:id`

1. **Autenticação** — O mesmo middleware garante que `req.user` contenha o usuário.
2. **Listagem** — `/api/documents` busca apenas documentos de `uploadedBy` = usuário logado, ordenados por `createdAt` desc.
3. **Detalhe** — `/api/documents/:id` valida o formato do `id` (ObjectId). Retorna 200 com documento se pertencer ao usuário; 404 caso contrário; 400 se o id for inválido.

### 🗑️ Remoção — `DELETE /api/documents/:id`

1. **Checagens iniciais** — Validação do `id` e do token.
2. **Exclusão condicional** — `findOneAndDelete` remove somente se o documento pertence ao usuário autenticado.
3. **Resposta** — Retorna 200 com confirmação textual ou 404 se inexistente / sem permissão. Erros técnicos resultam em 500.

---

## 🔗 Comunicação com Outros Serviços

- **Auth Service** — Dependência obrigatória. Todas as rotas utilizam `axios` para validar tokens em `http://auth-service:5001/api/auth/validate-token` (configurável via `AUTH_SERVICE_URL`).
- **Demais serviços** — A API fornece endpoints REST consumidos por `signature-service`, `certificate-service` e `validator-service` para recuperar documentação associada a uma assinatura.
- **Armazenamento externo** — Arquivos físicos ficam no diretório local `archives/`. Em produção, recomenda-se montar volume persistente ou serviço de storage dedicado.

---

## 📂 Modelo de Dados

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `originalName` | string | ✅ | Nome original enviado pelo usuário |
| `storedName` | string | ✅ | Nome físico gerado (`UUID + timestamp + .pdf`) |
| `mimeType` | string | ✅ | Sempre `application/pdf` |
| `hash` | string | ✅ | Hash SHA-256 calculado após upload |
| `uploadedBy` | ObjectId | ✅ | Referência ao usuário dono |
| `createdAt` | Date | ✅ | Gerado automaticamente pelo MongoDB |
| `updatedAt` | Date | ✅ | Atualizado a cada modificação |

---

## 🌐 Endpoints da API

| Método | Rota | Descrição | Sucesso |
|--------|------|-----------|---------|
| GET | `/api/documents/me` | Greeting autenticado (teste de sessão) | 200 + mensagem |
| GET | `/api/documents` | Lista documentos do usuário autenticado | 200 + array de documentos |
| GET | `/api/documents/:id` | Busca documento específico do usuário | 200 + documento / 404 |
| DELETE | `/api/documents/:id` | Remove documento do usuário | 200 + mensagem / 404 |
| POST | `/api/documents/upload` | Upload de PDF autenticado | 200 + dados do arquivo |

### Exemplos rápidos

**Listar documentos**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:5002/api/documents
```
Resposta (200):
```json
[
  {
    "_id": "65f1c8d4f2a1c7ab12345678",
    "originalName": "contrato.pdf",
    "storedName": "b6b1e...-2025-02-01T10-15-00-123Z.pdf",
    "hash": "e3b0c44298...",
    "createdAt": "2025-02-01T10:15:00.123Z"
  }
]
```

**Upload de PDF**
```bash
curl -X POST http://localhost:5002/api/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "document=@/caminho/arquivo.pdf"
```
Resposta (200):
```json
{
  "message": "Upload realizado com sucesso.",
  "file": {
    "id": "65f1c8d4f2a1c7ab12345678",
    "originalName": "arquivo.pdf",
    "hash": "e3b0c44298..."
  }
}
```

**Excluir documento**
```bash
curl -X DELETE http://localhost:5002/api/documents/65f1c8d4f2a1c7ab12345678 \
  -H "Authorization: Bearer <token>"
```
Resposta (200):
```json
{ "message": "Documento deletado com sucesso." }
```

---

## ⚙️ Configuração e Variáveis

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `5002` | Porta HTTP do serviço |
| `MONGO_URI` | `mongodb://mongo-documents:27017/documents` | URI do MongoDB |
| `AUTH_SERVICE_URL` | `http://auth-service:5001` | Base URL usada para validar tokens |
| `NODE_ENV` | `development` | Ambiente de execução |

> 💡 Certifique-se de que o diretório `archives/` esteja em um volume persistente em produção.

---

## 🚀 Como Executar

### Ambiente local

```bash
npm install
npm run dev       # Nodemon com reload automático
```

Antes de iniciar, defina as variáveis necessárias (exemplo):
```bash
export PORT=5002
export MONGO_URI=mongodb://localhost:27017/documents
export AUTH_SERVICE_URL=http://localhost:5001
```

### Build e execução em produção

```bash
npm run build
npm start         # Servidor rodando a partir de dist/
```

### Docker

```bash
docker build -t document-service .
docker run -p 5002:5002 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/documents \
  -e AUTH_SERVICE_URL=http://host.docker.internal:5001 \
  document-service
```

> Também disponível via `docker-compose` na raiz do projeto (`document-service` depende de `mongo`).

---

## 🧪 Testes

- **Framework**: Jest + Supertest
- **Cobertura**: rotas de upload, middlewares e helpers (`generateSHA256`).
- **Executar**:
```bash
npm test
```

---

## 📚 Referências

- Swagger UI: `http://localhost:5002/api/docs`
- `src/pages/api/documents/*` – rotas REST
- `src/middlewares/*` – autenticação e upload
- `src/services/document.service.ts` – persistência de metadados
- `src/libs/hash.ts` – utilitário SHA-256

---

**Mantido para garantir consistência entre uploads de documentos e o restante da plataforma de assinaturas digitais.**
