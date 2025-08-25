# 🚀 Coolify Deployment Guide

Este guia explica como fazer o deploy da aplicação Dashboard Chista usando o **Coolify**.

## 📋 O que é o Coolify?

O **Coolify** é uma plataforma open-source de self-hosting que simplifica o deploy e gerenciamento de aplicações. Ele oferece:

- ✅ Deploy automatizado
- ✅ SSL automático (Let's Encrypt)
- ✅ Monitoramento integrado
- ✅ Backup automático
- ✅ Interface web amigável
- ✅ Zero vendor lock-in

## 🛠️ Pré-requisitos

- Docker e Docker Compose instalados
- Domínio configurado (dashboard.chista.com.br)
- Servidor com pelo menos 2GB RAM

## 🚀 Instalação do Coolify

### 1. Instalar Coolify

```bash
# Criar rede para Coolify
docker network create coolify_network

# Instalar Coolify
docker run -d \
  --name coolify \
  --restart unless-stopped \
  -p 8000:8000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v coolify-db:/app/database \
  -v coolify-builds:/app/builds \
  -v coolify-backups:/app/backups \
  ghcr.io/coollabsio/coolify:latest
```

### 2. Acessar Dashboard

```bash
# Acessar: http://localhost:8000
# Ou: http://seu-servidor:8000
```

## 📦 Configuração da Aplicação

### 1. Arquivos de Configuração

Os seguintes arquivos foram criados especificamente para o Coolify:

- **`docker-compose.coolify.yml`** - Docker Compose otimizado
- **`coolify.json`** - Configuração da aplicação

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Aplicação
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000

# Authentication (Auth0)
AUTH0_SECRET=your_auth0_secret_here
AUTH0_BASE_URL=https://dashboard.chista.com.br
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_client_secret_here

# API Configuration
CHISTA_API_BASE_URL=https://api.chista.com.br
CHISTA_API_TOKEN=your_chista_api_token_here
```

**Nota:** Esta aplicação não utiliza banco de dados local (PostgreSQL) nem cache (Redis), pois se conecta diretamente à API externa da Chista.

## 🚀 Deploy no Coolify

### Deploy via Dashboard

1. **Acessar Coolify Dashboard**
   - URL: `http://localhost:8000`
   - Criar conta inicial

2. **Criar Novo Projeto**
   - Clicar em "New Project"
   - Nome: `dashboard-chista`
   - Tipo: `Application`

3. **Configurar Aplicação**
   - **Source**: `Git Repository`
   - **Repository**: `https://github.com/seu-usuario/dashboard.chista.com.br`
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Port**: `3000`
   - **Docker Compose File**: `docker-compose.coolify.yml`

4. **Configurar Domínio**
   - **Domain**: `dashboard.chista.com.br`
   - **SSL**: `Let's Encrypt` (automático)

5. **Configurar Variáveis de Ambiente**
   - Adicionar todas as variáveis do `.env` acima

6. **Deploy**
   - Clicar em "Deploy"

## 🔧 Configurações Avançadas

### 1. Recursos (Resources)

```json
{
  "resources": {
    "limits": {
      "cpu": "1.0",
      "memory": "1G"
    },
    "reservations": {
      "cpu": "0.5",
      "memory": "512M"
    }
  }
}
```

### 2. Health Check

```json
{
  "healthcheck": "/api/health"
}
```

### 3. Volumes Persistentes

```json
{
  "volumes": [
    {
      "name": "coolify_web_data",
      "path": "/app/.next",
      "type": "persistent"
    },
    {
      "name": "coolify_public_data", 
      "path": "/app/public",
      "type": "persistent"
    }
  ]
}
```

**Nota:** Apenas volumes para a aplicação Next.js, sem necessidade de volumes para banco de dados.

## 📊 Monitoramento

### 1. Dashboard do Coolify

- **Status**: Visualização em tempo real
- **Logs**: Logs da aplicação
- **Métricas**: CPU, Memory, Network
- **Backups**: Status dos backups

### 2. Health Check

```bash
# Verificar status da aplicação
curl https://dashboard.chista.com.br/api/health

# Resposta esperada:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

### 3. Logs

```bash
# Via Coolify Dashboard
# Ou via CLI:
docker-compose -f docker-compose.coolify.yml logs -f web
```

## 🔄 CI/CD com Coolify

### 1. Deploy Automático

O Coolify pode fazer deploy automático quando:

- Push para branch `main`
- Pull Request mergeado
- Tag criada

### 2. Configurar Webhook

```bash
# No GitHub/GitLab, adicionar webhook:
URL: https://seu-coolify.com/api/v1/webhooks/github
Secret: (gerado pelo Coolify)
```

### 3. Preview Deployments

- Deploy automático para Pull Requests
- URLs únicas para cada PR
- Testes antes do merge

## 🔒 Segurança

### 1. SSL Automático

- Let's Encrypt integrado
- Renovação automática
- HSTS habilitado

### 2. Isolamento

- Containers isolados
- Rede dedicada
- Volumes seguros

### 3. Backup

- Backup automático dos volumes da aplicação
- Backup das configurações (.env)
- Retenção configurável
- Restore fácil

## 🆘 Troubleshooting

### Problemas Comuns

1. **Deploy falha**
   ```bash
   # Verificar logs
   docker-compose -f docker-compose.coolify.yml logs web
   
   # Verificar variáveis de ambiente
   docker-compose -f docker-compose.coolify.yml config
   ```

2. **SSL não funciona**
   - Verificar se domínio aponta para servidor
   - Aguardar propagação DNS (até 24h)
   - Verificar logs do Coolify

3. **Aplicação não responde**
   ```bash
   # Verificar health check
   curl -f https://dashboard.chista.com.br/api/health
   
   # Verificar containers
   docker-compose -f docker-compose.coolify.yml ps
   ```

### Logs Úteis

```bash
# Logs do Coolify
docker logs coolify

# Logs da aplicação
docker-compose -f docker-compose.coolify.yml logs -f web

# Logs do sistema
journalctl -u docker
```

## 📈 Vantagens do Coolify

### ✅ Comparado com Deploy Manual

| Aspecto | Deploy Manual | Coolify |
|---------|---------------|---------|
| **Configuração** | Complexa | Simples |
| **SSL** | Manual | Automático |
| **Backup** | Manual | Automático |
| **Monitoramento** | Básico | Avançado |
| **CI/CD** | Complexo | Integrado |
| **Manutenção** | Alta | Baixa |

### ✅ Recursos Exclusivos

- **Zero Downtime Deployments**
- **Rollback com um clique**
- **Preview Deployments**
- **Backup automático**
- **Monitoramento integrado**
- **Interface web intuitiva**

## 🎯 Próximos Passos

1. **Configurar Backup**
   - Definir frequência de backup dos volumes
   - Configurar backup das configurações
   - Testar restore da aplicação

2. **Monitoramento Avançado**
   - Configurar alertas
   - Métricas customizadas
   - Log aggregation

3. **Escalabilidade**
   - Load balancer
   - Auto-scaling
   - CDN

## 📞 Suporte

- **Documentação**: [Coolify Docs](https://coolify.io/docs)
- **GitHub**: [Coolify Repository](https://github.com/coollabsio/coolify)
- **Discord**: [Coolify Community](https://discord.gg/coolify)

---

**🎉 Parabéns!** Sua aplicação está agora otimizada para o Coolify com deploy automatizado, SSL gratuito e monitoramento integrado!
