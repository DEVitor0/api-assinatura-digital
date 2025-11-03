# ✍️ Plataforma de assinaturas digitais - Backend

> **Projeto de API** - Plataforma de assinatura digital baseada em microserviços, projetada para gerenciar o ciclo completo de documentos digitais com segurança, rastreabilidade e escalabilidade.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)


## 📋 Índice

- [🎯 Sobre o Projeto](#-sobre-o-projeto)
  - [🎯 Público-Alvo](#-público-alvo)
  - [✨ Características Principais](#-características-principais)
- [🏗️ Arquitetura do Sistema](#-arquitetura-do-sistema)
  - [🎨 Padrão Arquitetural](#-padrão-arquitetural)
  - [🔄 Fluxo de Dados](#-fluxo-de-dados)
    - [Fluxo de Usuário](#fluxo-de-usuário)
    - [Microserviços e Interações](#microserviços-e-interações)
- [🛠 Pré-requisitos e Instalação](#-pré-requisitos-para-rodar-o-projeto)
  - [🛠️ Instalação](#️-instalação)
  - [⚙️ Configuração do Ambiente](#-configuração-do-ambiente)
- [🚀 Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [📚 Documentação da API](#-documentação-da-api)
  - [🔗 Endpoints Disponíveis](#-endpoints-disponíveis)
  - [📖 Swagger UI](#-swagger-ui)
  - [Serviços Individuais](#-serviços-individuais)
- [🗂️ Estrutura de Pastas](#-estrutura-de-pastas)
  - [🎯 Padrão de Módulos](#-padrão-de-módulos)
- [📈 Histórico de Commits](#-histórico-de-commits)
- [👨‍💻 Autor](#-autor)
- [📄 Licença](#-licença)



## 📚 Documentação das APIs


- [🛡️ **Auth Service**](https://github.com/DEVitor0/api-assinatura-digital/tree/main/auth-service)
- [📄 **Document Service**](https://github.com/DEVitor0/api-assinatura-digital/tree/main/document-service) 
- [✍️ **Signature Service**](https://github.com/DEVitor0/api-assinatura-digital/tree/main/signature-service) 
- [📜 **Certificate Service**](https://github.com/DEVitor0/api-assinatura-digital/tree/main/certificate-service)
- [🔍 **Validator Service**](https://github.com/DEVitor0/api-assinatura-digital/tree/main/validator-service) 
- [📊 **Audit Service**](https://github.com/DEVitor0/api-assinatura-digital/tree/main/audit-service)
- [📧 **Notification Service**](https://github.com/DEVitor0/api-assinatura-digital/tree/main/notification-service)


## 🎯 Sobre o Projeto

Este projeto é uma plataforma que centraliza a criação, assinatura, emissão e verificação de documentos digitais, permitindo registrar cada ação realizada sobre um documento, gerar certificados de autenticidade e consultar a validade de forma segura e transparente

### 🎯 **Público-Alvo**
- **Empresas e organizações** que precisam formalizar documentos digitalmente
- **Órgãos públicos e reguladores** que exigem rastreabilidade e validade jurídica
- **Profissionais jurídicos e contábeis** que lidam com contratos e certificados
- **Usuários finais** que precisam assinar ou verificar documentos de forma segura e confiável

### ✨ Características Principais

- **🔐 Assinaturas Digitais Seguras** – Emissão, assinatura e validação de documentos com autenticação JWT, criptografia SHA-256 e conformidade legal.  
- **🧩 Arquitetura de Microserviços** – Estrutura modular e escalável, com comunicação assíncrona via RabbitMQ e cache Redis.  
- **📄 Gestão Completa de Documentos** – Upload seguro, geração de hash, metadados e armazenamento protegido.  
- **📜 Certificados e Validação Pública** – Emissão de certificados com QR Code e consulta pública de autenticidade.  
- **📊 Logs, Auditoria e Monitoramento** – Rastreabilidade total de eventos, métricas com Prometheus e logging detalhado.  
- **📚 Documentação e Testes Automatizados** – APIs documentadas com Swagger e cobertura de testes com Jest.  
- **🐳 Infraestrutura Moderna** – Deploy com Docker, Kubernetes e banco de dados MongoDB para alta disponibilidade.  


## 🏗️ Arquitetura do Sistema

### 🎨 Padrão Arquitetural

O projeto segue uma **arquitetura de microserviços** bem estruturada:

![Fluxograma da comunicação entre microserviços](/images/fluxograma.jpg)

### 🔄 Fluxo de Dados


#### Fluxo de Usuário

1. Usuário envia documento → **API Gateway**  
2. **Auth Service** valida usuário → **Document Service** recebe PDF  
3. **Signature Service** aplica assinatura → publica evento em **Audit Service**  
4. **Certificate Service** gera certificado → **Validator Service** valida  
5. **Notification Service** informa usuário sobre status  

---

#### Microserviços e Interações

- **Auth Service** → autentica, gera tokens (REST → Document, Signature)  
- **Document Service** → recebe PDFs, armazena (REST → Signature)  
- **Signature Service** → aplica assinatura (REST → Certificate; RabbitMQ → Audit)  
- **Certificate Service** → gera certificado (REST → Validator; API externa: CertificateClient)  
- **Validator Service** → valida documentos e certificados (REST)  
- **Audit Service** → registra logs de eventos RabbitMQ  
- **Notification Service** → envia notificações (REST; API externa: DocumentClient)  

# 🛠 Pré-requisitos para rodar o projeto

| Software / Ferramenta       | Versão mínima  | Observações                                   |
|-----------------------------|---------------|-----------------------------------------------|
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) | 20.x          | Inclui npm                                   |
| ![npm](https://img.shields.io/badge/-npm-D42E2D?style=for-the-badge&logo=npm&logoColor=white) | 9.x           | Gerenciador de pacotes padrão do Node.js     |                       |
| ![Git](https://img.shields.io/badge/-Git-F05032?style=for-the-badge&logo=git&logoColor=white) | 2.x           | Controle de versão       
| ![Yarn](https://img.shields.io/badge/-yarn-2C8EBB?style=for-the-badge&logo=yarn&logoColor=white) | 3.x           | Alternativa ao npm                         |
| ![Docker](https://img.shields.io/badge/-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) | 24.x          | Necessário para containers de backend e DBs |
| ![Kubernetes](https://img.shields.io/badge/-Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white) | Opcional      | Recomendado para deploy em produção         |



### 🛠️ Instalação

```bash
# 1. Clonar o repositório
https://github.com/DEVitor0/api-assinatura-digital.git
cd api-assinatura-digital

# 2. Instalar dependências em cada microserviço
cd audit-service
command -v yarn >/dev/null 2>&1 && yarn install || npm install
# (OBS: Faça isso em cada microserviço, com excessão de infra)

# 3. Configurar variáveis de ambiente
# Cada serviço possui seu próprio arquivo .env.example.
# Copie esses arquivos e renomeie para .env dentro de cada pasta correspondente.

# Exemplo:

cp ./auth-service/.env.example ./auth-service/.env
cp ./document-service/.env.example ./document-service/.env
cp ./signature-service/.env.example ./signature-service/.env

# 4. Subir os serviços com Docker
# Execute o comando abaixo para iniciar todos os containers necessários (MongoDB, Redis, RabbitMQ, etc):

cd infra
docker compose up -d

# 5. Executar o projeto
cd [diretório]
npm run dev    # Desenvolvimento
npm start      # Produção
```

### ⚙️ Configuração do Ambiente
Cada microserviço possui uma .env, nela apenas substiua os valores conforme informado

```env
# Exemplo de .env usada em signature-service
NODE_ENV=development
PORT=5003

MONGO_URI=mongodb://mongo-signature:27017/signature-service

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=senhaMuitoForte1234

REDIS_TTL_SIGNATURE_SESSION=3600

SIGNATURE_TOKEN_SECRET=tokenAindaMaisForte1234
SIGNATURE_TOKEN_EXPIRES_IN=10m

SIGNATURE_SESSION_TTL=30

DOCUMENT_SERVICE_URL=http://localhost:5002

```

## 📚 Documentação da API

### 🔗 Endpoints Disponíveis

Após iniciar o serviço, você pode acessá-la em:

👉 **http://localhost:<PORTA>/api/docs**

Substitua `<PORTA>` pela porta configurada no arquivo `.env` de cada microserviço.  
Exemplo: `http://localhost:5003/api/docs`

### 📖 Swagger UI

A documentação interativa da API está disponível através do Swagger, permitindo:
- Visualizar todos os endpoints
- Testar requisições diretamente
- Ver schemas de dados
- Entender parâmetros e respostas

## 🗂️ Estrutura de Pastas

📦 Projeto de Microserviços
- 📝 audit-service
- 🔐 auth-service
- 📜 certificate-service
- 📂 document-service
- 🏗️ infra
- 🔔 notification-service
- ✍️ signature-service
- ✅ validator-service

### 🎯 Padrão de Módulos

- **controllers**: Recebe requisições e retorna respostas (Express), interage com os serviços.  
- **events**: Gerencia eventos internos ou externos, como filas, WebHooks ou listeners.  
- **metrics**: Coleta e registra métricas da aplicação, como contadores e tempos de resposta.  
- **middlewares**: Processa requisições antes dos controllers, incluindo autenticação, logging e tratamento de erros.  
- **models**: Define a estrutura de dados ou esquemas, geralmente integrados ao banco de dados.  
- **routes**: Define os endpoints da API e conecta URLs aos controllers correspondentes.  
- **server.ts**: Ponto de entrada da aplicação; configura servidor, middlewares, rotas e inicializa tudo.  
- **services**: Contém a lógica de negócio da aplicação ou integrações com APIs externas.  
- **types**: Tipos TypeScript ou interfaces para garantir tipagem consistente.  
- **utils**: Funções auxiliares reutilizáveis, como formatação de dados e validações.

*Para uma melhor análise das entidades recomenda-se seguir esta **ordem de inspeção de arquivos**:*  
`models` → `types` → `utils` → `services` → `controllers` → `routes` → `middlewares` → `events` → `metrics` → `server.ts`


## 🔧 Tecnologias Utilizadas

<!-- Linha 1: Backend e linguagens -->
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

<!-- Linha 2: Containerização e banco -->
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

<!-- Linha 3: Segurança -->
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSONWebTokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-000000?style=for-the-badge)
![Helmet](https://img.shields.io/badge/Helmet-000000?style=for-the-badge)
![SHA-256](https://img.shields.io/badge/SHA--256-000000?style=for-the-badge)

<!-- Linha 4: Validação, mensageria e monitoramento -->
![Zod](https://img.shields.io/badge/Zod-EECF6D?style=for-the-badge)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)

<!-- Linha 5: Testes, documentação e qualidade -->
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white)

<!-- Linha 6: Utilitários -->
![Multer](https://img.shields.io/badge/Multer-C47AC0?style=for-the-badge)
![Morgan](https://img.shields.io/badge/Morgan-A3D9FF?style=for-the-badge)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![UUID](https://img.shields.io/badge/UUID-000000?style=for-the-badge)

## 📈 Histórico de Commits

### 🎯 **Estrutura de Commits**
O projeto segue uma convenção de commits bem definida:

```
feat: ✨ Nova funcionalidade
fix: 🐛 Correção de bug
docs: 📚 Documentação
style: 🎨 Formatação de código
refactor: ♻️ Refatoração
test: 🧪 Testes
chore: 🔧 Configurações e dependências
```

## 👨‍💻 Autor

**Vitor Moreira** - Desenvolvedor

- 📧 Email: vitormoreira6940@gmail.com
- 🔗 LinkedIn: www.linkedin.com/in/devitor0
- 🐙 GitHub: https://github.com/DEVitor0

### 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.