# ✍️ Plataforma de assinaturas digitais - Backend

> **✅ Validator Service** - valida a integridade de documentos e certificados emitidos pelo ecossistema. Responsável por consultar serviços externos, recalcular hashes e garantir que o arquivo baixado é idêntico ao que foi certificado originalmente.

> **Versão:** `v1.0.0` | **Documentação:** `Swagger /api/validator/docs` | **Status:** 🟢 Estável

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) ![Swagger UI](https://img.shields.io/badge/Swagger_UI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black) ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![SHA-256](https://img.shields.io/badge/Hash-SHA--256-424242?style=for-the-badge&logoColor=white)

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Responsabilidades Principais](#-responsabilidades-principais)
- [Arquitetura em Texto](#-arquitetura-em-texto)
- [Fluxos Essenciais](#-fluxos-essenciais)
- [Integração com Outros Serviços](#-integração-com-outros-serviços)
- [Estruturas e Respostas](#-estruturas-e-respostas)
- [Endpoints da API](#-endpoints-da-api)
- [Configuração e Variáveis](#-configuração-e-variáveis)
- [Execução e Deploy](#-execução-e-deploy)
- [Testes](#-testes)
- [Roadmap](#-roadmap)
- [Referências](#-referências)

---

## 🎯 Visão Geral

O **Validator Service** fornece uma API pública para verificar se um certificado digital e o documento associado continuam íntegros. Ele consulta o `certificate-service` pelo identificador informado, obtém o documento correspondente no `document-service`, baixa o arquivo original e recalcula o hash SHA-256. O resultado é comparado com o hash persistido no certificado, garantindo transparência e confiabilidade do processo de assinatura.

### 🔑 Responsabilidades Principais

- ✅ Validar certificados emitidos pela plataforma utilizando códigos públicos.
- ✅ Recalcular o hash do arquivo original e comparar com o hash oficial.
- ✅ Retornar metadados relevantes para consulta pública (certificado + documento).
- ✅ Disponibilizar documentação interativa via Swagger e healthcheck para monitoramento.
- ✅ Tratar falhas de comunicação com serviços dependentes e retornar mensagens claras.

---

## 🏗️ Arquitetura em Texto

- **API HTTP (Express + TypeScript)** — rotas montadas em `/api/validator`; inclui Swagger UI em `/api/docs` para inspeção manual.
- **Camada de serviço (`validator.service.ts`)** — concentra a regra de validação, orquestrando chamadas aos clientes externos e comparando hashes.
- **Clientes externos**:
  - `certificateClient` consulta o `certificate-service` para recuperar certificado e hash original.
  - `documentClient` utiliza o `document-service` para buscar metadados e baixar o arquivo binário.
- **Utilitário de hash (`hashUtils.ts`)** — recalcula hash SHA-256 a partir do buffer do arquivo baixado.
- **Swagger autogerado** — `swagger.json` descreve os endpoints disponíveis, mantendo consistência com a implementação.

---

## 🔄 Fluxos Essenciais

### 🔎 1. Validação por código — `GET /api/validator/verify/:codigo`

1. **Entrada pública** — usuário informa o `codigo` do certificado emitido.
2. **Busca do certificado** — serviço chama `certificate-service` para obter hash e metadados (`documentId`, `filePath`).
3. **Document lookup** — com o `documentId`, consulta o `document-service` para recuperar detalhes e endpoint de download. Se necessário, reutiliza token fornecido no header `Authorization`.
4. **Download do arquivo** — realiza requisição HTTP para obter o PDF em binário.
5. **Recalculando hash** — `hashUtils.gerarHash` calcula SHA-256 do buffer.
6. **Comparação** — compara `hashCalculado` com `hashOriginal` (do certificado).
7. **Resposta** — retorna JSON indicando se o documento é válido, exibindo hashes e anexando metadados do certificado/documento.

### ❤️‍🩹 2. Tratamento de falhas

- Certificado inexistente → `valido: false`, mensagem "Certificado não encontrado." status 400.
- Documento indisponível → erro controlado com mensagem dedicada.
- Falha ao baixar arquivo → mensagem "Erro ao baixar arquivo do documento" com status 400.
- Qualquer exceção não tratada → resposta genérica `Erro na validação` com status 400.

### 🩺 3. Healthcheck — `GET /api/validator/healthcheck`

- Retorna status simples com uptime do microserviço, usado por orquestradores e monitoramento.

---

## 🔗 Integração com Outros Serviços

| Serviço | Protocolo | Propósito |
|---------|-----------|-----------|
| `certificate-service` | REST (`GET /api/public/certificates/:identifier`) | Obtém certificado, hash original e referência ao documento. |
| `document-service` | REST (`GET /api/documents/:id`) | Busca metadados do documento e provê URL para download. |
| `document-service` (download) | HTTP direto (URL retornada) | Recupera binário do arquivo para recalcular hash. |
| (Opcional) `auth-service` | REST (`Bearer token`) | Token pode vir de serviços internos para acessar documentos protegidos. |

> ℹ️ Token no header `Authorization` é propagado ao `document-service` caso o endpoint de documentos exija autenticação.

---

## 📄 Estruturas e Respostas

### Resposta de validação bem-sucedida
```json
{
  "valido": true,
  "mensagem": "Documento íntegro e válido.",
  "hashOriginal": "e3b0c44298...",
  "hashCalculado": "e3b0c44298...",
  "certificado": {
    "identifier": "ABC-123-XYZ",
    "issuedAt": "2025-02-01T14:35:22.145Z",
    "documentId": "65f1c8d4f2a1c7ab12345678"
  },
  "documento": {
    "_id": "65f1c8d4f2a1c7ab12345678",
    "storedName": "b6b1e...pdf",
    "hash": "e3b0c44298..."
  }
}
```

### Resposta com divergência de hash
```json
{
  "valido": false,
  "mensagem": "Documento corrompido ou alterado.",
  "hashOriginal": "e3b0c44298...",
  "hashCalculado": "9f86d08188..."
}
```

---

## 🌐 Endpoints da API

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/validator/verify/:codigo` | Valida certificado e documento associados ao código informado | Opcional (Bearer) |
| GET | `/api/validator/healthcheck` | Retorna status do serviço | Público |
| GET | `/api/validator/docs` | Swagger UI | Público |

### Exemplo de uso

```bash
curl http://localhost:5006/api/validator/verify/ABC-123-XYZ
```

Resposta (200):
```json
{
  "valido": true,
  "mensagem": "Documento íntegro e válido.",
  "hashOriginal": "e3b0c44298...",
  "hashCalculado": "e3b0c44298..."
}
```

---

## ⚙️ Configuração e Variáveis

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `5006` | Porta HTTP do Validator Service |
| `NODE_ENV` | `development` | Ambiente de execução |
| `CERTIFICATE_SERVICE_URL` | `http://certificate-service:5005/api/public` | Endpoint público do certificate-service |
| `DOCUMENT_SERVICE_URL` | `http://document-service:5002/api/documents` | Base URL para consulta de documentos |

> 💡 Defina essas variáveis em `.env` ou no orquestrador (Docker/Kubernetes) antes de subir o serviço.

---

## 🚀 Execução e Deploy

### Ambiente local
```bash
npm install
npm run dev       # executa em modo desenvolvimento (ts-node-dev)
```

### Build e produção
```bash
npm run build
npm start         # utiliza artefatos em dist/
```

### Docker
```bash
docker build -t validator-service .
docker run -d \
  --name validator-service \
  -p 5006:5006 \
  -e CERTIFICATE_SERVICE_URL=http://host.docker.internal:5005/api/public \
  -e DOCUMENT_SERVICE_URL=http://host.docker.internal:5002/api/documents \
  validator-service
```

> Também é inicializado automaticamente via `infra/docker-compose.yml` na raiz do projeto.

---

## 🧪 Testes

- **Unitários**: `validator.service.test.ts` valida lógica de comparação de hash, tratamento de erros e fluxos positivos/negativos.
- **Healthcheck**: `healthcheck.test.ts` garante resposta consistente do endpoint de status.

```bash
npm test
```

---

## 🗺️ Roadmap

- [ ] Implementar cache inteligente para certificados validados recentemente.
- [ ] Adicionar métricas Prometheus (tempo de validação, taxas de sucesso/erro).
- [ ] Incluir webhook opcional para notificar validações suspeitas.
- [ ] Melhorar tratamento de exceções com códigos de erro padronizados.

---

## 📚 Referências

- `src/services/validator.service.ts`
- `src/clients/certificateClient.ts`
- `src/clients/documentClient.ts`
- `swagger.json`

---

**Serviço essencial para manter a confiança na plataforma, permitindo que qualquer parte verifique autenticidade e integridade de documentos certificados.**
