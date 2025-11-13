# 🏗️ Plataforma de assinaturas digitais - Infraestrutura

> **🧩 Infra Layer** - orquestra os ambientes de execução dos microserviços. Responsável por provisionar dependências (MongoDB, Redis, RabbitMQ), expor serviços com nomes estáveis e garantir comunicação interna segura entre os componentes do ecossistema.

> **Versão:** `v1.0.0` | **Documentação:** `docker-compose.yml / k8s/*.yaml` | **Status:** 🟢 Estável

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white) ![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Objetivos da Infraestrutura](#-objetivos-da-infraestrutura)
- [Panorama de Comunicação](#-panorama-de-comunicação)
- [Stack Docker Compose](#-stack-docker-compose)
- [Manifests Kubernetes](#-manifests-kubernetes)
- [Dependências Compartilhadas](#-dependências-compartilhadas)
- [Execução e Comandos Úteis](#-execução-e-comandos-úteis)
- [Boas Práticas e Observações](#-boas-práticas-e-observações)

---

## 🌐 Visão Geral

A pasta `infra/` centraliza todos os artefatos necessários para executar a plataforma em ambientes locais (Docker Compose) e clusterizados (Kubernetes). Cada microserviço possui um container dedicado e se comunica via nomes DNS internos. As dependências (MongoDB, Redis, RabbitMQ) também são disponibilizadas como serviços dentro da mesma malha para reduzir acoplamento e garantir discoverability automática.

---

## 🎯 Objetivos da Infraestrutura

- ✅ **Facilitar o onboarding** de novos desenvolvedores com um único comando (`docker-compose up`).
- ✅ **Padronizar variáveis de ambiente** em ambos os ambientes (local e cluster).
- ✅ **Isolar dependências** para cada domínio (ex.: Mongo dedicado para auth, documents, signature no Kubernetes).
- ✅ **Garantir comunicação segura** através de nomes estáveis (`auth-service`, `document-service`, etc.).
- ✅ **Suportar escalabilidade futura** com manifests Kubernetes prontos para uso.
- ✅ **Persistir dados críticos** usando volumes nomeados ou PersistentVolumeClaims.

---

## 🔄 Panorama de Comunicação

### Entre microserviços

- **Auth Service (`5001`)** valida tokens para todos os demais serviços via HTTP. No Compose, é referenciado como `http://auth-service:5001`; no Kubernetes, via Service ClusterIP `auth-service`.
- **Document Service (`5002`)** consulta o Auth Service antes de listar ou armazenar documentos e expõe endpoints consumidos por Signature, Certificate e Validator.
- **Signature Service (`5003`)** usa Redis como cache/distribuição de sessões e RabbitMQ para publicação de eventos, enviando notificações que podem ser consumidas por Audit Service (futuro).
- **Certificate Service (`5005`)** depende do MongoDB compartilhado para armazenar certificados e é consultado pelo Validator Service.
- **Validator Service (`5006`)** consome APIs do Certificate e Document Service para validar integridade de documentos assinados.
- **Audit Service (`5007`)** persiste logs críticos e depende de RabbitMQ para consumo assíncrono de eventos (planejado) e MongoDB para armazenamento.

### Entre serviços de suporte

- **MongoDB** atua como datastore primário para praticamente todos os domínios. No Compose existe um único container (`mongo`); no Kubernetes há manifests opcionais para bancos dedicados (`mongo-service`, `mongo-documents`, `mongo-signature`).
- **Redis** fornece cache/locking para Signature Service. Deploy simples com PVC (Kubernetes) e volume nomeado (Compose).
- **RabbitMQ** sustenta comunicação assíncrona entre serviços (ex.: assinatura → auditoria). Exposto com porta de broker (`5672`) e dashboard (`15672`).

### Resolução de nomes

- **Docker Compose** utiliza a rede default bridge; cada container é acessível pelo nome declarado em `container_name`.
- **Kubernetes** utiliza Services ClusterIP. Exemplos: `document-service.default.svc.cluster.local:5002`.

---

## 🐳 Stack Docker Compose

Arquivo: `infra/docker-compose.yml`

| Serviço | Porta Host | Propósito | Dependências |
|---------|------------|-----------|--------------|
| `auth-service` | `5001` | Autenticação e tokens | `mongo` |
| `document-service` | `5002` | Upload e gestão de PDFs | `auth-service` |
| `signature-service` | `5003` | Fluxo de assinaturas | `redis`, `rabbitmq` |
| `certificate-service` | `5005` | Emissão de certificados | `mongo` |
| `validator-service` | `5006` | Validação pública | `certificate-service`, `document-service` |
| `audit-service` | `5007` | Logs de auditoria | `mongo`, `rabbitmq` |
| `mongo` | `27017` | Banco de dados principal | Volume `mongo_data` |
| `redis` | `6380` (→6379) | Cache/filas rápidas | Volume `redis_data` |
| `rabbitmq` | `5672`, `15672` | Mensageria e painel | Volume `rabbitmq_data` |

**Destaques do Compose**

- Cada microserviço monta o diretório local em `/app`, viabilizando hot reload durante o desenvolvimento.
- Variáveis de ambiente padronizam URIs: `AUTH_SERVICE_URL`, `MONGO_URI`, `RABBITMQ_URL`.
- Volumes nomeados (`mongo_data`, `redis_data`, `rabbitmq_data`) preservam dados mesmo após `docker-compose down` (sem `-v`).
- Todas as portas ficam expostas no host para facilitar testes manuais e acesso ao Swagger.

**Subida rápida**
```bash
cd infra
docker-compose up --build
```

---

## ☸️ Manifests Kubernetes

Localização: `infra/k8s/`

### Deployments + Services

| Arquivo | Conteúdo | Observações |
|---------|-----------|-------------|
| `auth-service.yaml` | Deployment + Service | Define image `auth-service:latest`, porta 5001 e `MONGO_URI` apontando para `mongo-service`. |
| `document-service.yaml` | Deployment + Service | Inclui `AUTH_SERVICE_URL=http://auth-service:5001`, garantindo comunicação interna. |
| `signature-service.yaml` | Deployment + Service | Consome `redis-service` e `mongo-service`; variável `REDIS_PORT=6379`. |
| `redis.yaml` | PVC + Deployment + Service | Garante persistência (`redis-pvc`) e exposição interna. |
| `mongodb-services/*.yml` | Variações de Deployments/Services | Permitem isolar bancos por domínio (`mongo-documents`, `mongo-signature`) quando necessário. |

### Padrões aplicados

- **Rolling updates** padrão de Deployments (replicas=1, pode ser ajustado para HA).
- **Env vars** idênticas às do Compose para reduzir divergências.
- **Services ClusterIP** expõem portas internas; ingress/LoadBalancer pode ser adicionado sob `infra/nginx/` (placeholder atual).
- **PVCs** usados para persistência crítica (`redis-pvc`, `mongo-pvc`). Outros manifests usam `emptyDir` para ambientes efêmeros.

**Aplicação**
```bash
kubectl apply -f infra/k8s/mongodb-services/mongo-auth.yml
kubectl apply -f infra/k8s/redis.yaml
kubectl apply -f infra/k8s/auth-service.yaml
# Repita para os demais serviços conforme necessidade
```

---

## 🧱 Dependências Compartilhadas

### MongoDB
- **Compose:** container único `mongo`. Ajuste `MONGO_URI` de cada serviço para bancos diferentes (`mongodb://mongo:27017/<db>`).
- **Kubernetes:** manifests dedicados permitem separar cargas (ex.: `mongo-documents`, `mongo-signature`).
- **Uso:** armazena usuários, documentos, assinaturas, certificados e logs.

### Redis
- Cache de sessões/tokenização do Signature Service.
- Mantém PVC (`redis-pvc`) para persistência opcional de dados.

### RabbitMQ
- Viabiliza comunicação assíncrona (eventos de assinatura → auditoria/notificação).
- Porta `15672` fornece painel administrativo.

### Nginx (placeholder)
- Diretório reservado para futuros ingress/controllers ou reverse proxies.
- Permite centralizar SSL, limites e roteamento externo.

---

## 🚀 Execução e Comandos Úteis

### Subir todo o stack localmente
```bash
cd infra
docker-compose up --build
```

### Parar containers mantendo volumes
```bash
docker-compose down
```

### Limpar volumes (exclui dados persistidos)
```bash
docker-compose down -v
```

### Aplicar manifests no Kubernetes (exemplo)
```bash
kubectl apply -f infra/k8s/auth-service.yaml
kubectl get pods -l app=auth-service
```

### Acessar RabbitMQ dashboard
- **Compose:** http://localhost:15672 (usuário/senha padrão `guest/guest`).
- **Kubernetes:** exponha via `kubectl port-forward svc/rabbitmq 15672:15672`.

---

## ✅ Boas Práticas e Observações

- Mantenha as imagens atualizadas (`imagePullPolicy: IfNotPresent` pode ser alterado para `Always` em CI/CD).
- Garanta que os bancos apontem para endpoints internos (evite `host.docker.internal` em produção; ajuste `MONGO_URI`).
- Configure volumes externos para `archives/` do Document Service ao usar Compose (via bind mount) quando precisar persistir arquivos reais.
- Utilize secrets (Kubernetes) para credenciais sensíveis em futuros ambientes (tokens JWT, senhas Mongo, etc.).
- Para produção, considere Ingress controlado (Nginx/Traefik) e certificados TLS.

---

## 📚 Referências

- `infra/docker-compose.yml`
- `infra/k8s/*.yaml`
- Documentação oficial: [Docker Compose](https://docs.docker.com/compose/), [Kubernetes](https://kubernetes.io/docs/home/), [RabbitMQ](https://www.rabbitmq.com/), [Redis](https://redis.io/), [MongoDB](https://www.mongodb.com/).

---

**Infraestrutura desenhada para sustentar e escalar a Plataforma de Assinaturas Digitais com confiabilidade e simplicidade operacional.**
