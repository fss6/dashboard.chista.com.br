# 🚀 Coolify - Configuração Simplificada

## 📋 Resumo das Mudanças

A configuração do Coolify foi **simplificada** removendo Redis e PostgreSQL, mantendo apenas a aplicação web.

### ✅ O que foi removido:

- ❌ **Redis** (cache)
- ❌ **PostgreSQL** (banco de dados)
- ❌ Volumes de dados desnecessários
- ❌ Variáveis de ambiente de banco

### ✅ O que foi mantido:

- ✅ **Aplicação Next.js** (web)
- ✅ **Volumes da aplicação** (.next, public)
- ✅ **Health check** (/api/health)
- ✅ **SSL automático** (Let's Encrypt)
- ✅ **Monitoramento** integrado

## 🏗️ Arquitetura Final

```
┌─────────────────┐
│   Coolify       │
│   Dashboard     │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   Aplicação     │
│   Next.js       │
│   Port: 3000    │
└─────────┬───────┘
          │
┌─────────▼───────┐
│   API Externa   │
│   (Chista API)  │
└─────────────────┘
```

## 📦 Serviços Ativos

### 1. **web** (Aplicação Next.js)
- **Porta:** 3000
- **Framework:** Next.js
- **Health Check:** `/api/health`
- **Volumes:** 
  - `coolify_web_data` → `/app/.next`
  - `coolify_public_data` → `/app/public`
- **Docker Compose:** `docker-compose.coolify.yml`

## 🔧 Configuração Mínima

### Variáveis de Ambiente Necessárias:

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

## 🚀 Deploy Simplificado

### 1. **Instalar Coolify:**
```bash
docker run -d \
  --name coolify \
  --restart unless-stopped \
  -p 8000:8000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v coolify-db:/app/database \
  ghcr.io/coollabsio/coolify:latest
```

### 2. **Deploy via Dashboard:**
- Acessar: `http://localhost:8000`
- Criar projeto
- Configurar repositório
- Deploy com um clique

## 📊 Benefícios da Simplificação

### ✅ **Menor Complexidade:**
- Menos serviços para gerenciar
- Configuração mais simples
- Menos pontos de falha

### ✅ **Menor Consumo de Recursos:**
- Menos containers rodando
- Menos memória utilizada
- Menos CPU consumida

### ✅ **Manutenção Mais Fácil:**
- Menos logs para monitorar
- Menos backups para gerenciar
- Menos configurações para manter

### ✅ **Deploy Mais Rápido:**
- Menos serviços para inicializar
- Menos dependências
- Startup mais rápido

## 🔍 Monitoramento

### Health Check:
```bash
curl https://dashboard.chista.com.br/api/health
```

### Logs:
```bash
docker-compose -f docker-compose.coolify.yml logs -f web
```

### Status:
```bash
docker-compose -f docker-compose.coolify.yml ps
```

## 🎯 Próximos Passos

1. **Deploy inicial** usando o script
2. **Configurar domínio** no Coolify
3. **Testar SSL** automático
4. **Configurar backup** dos volumes
5. **Monitorar** performance

## 📝 Notas Importantes

- ✅ **Sem banco de dados local** - dados vêm da API externa
- ✅ **Sem cache local** - cache gerenciado pela API
- ✅ **Stateless** - aplicação não mantém estado local
- ✅ **Escalável** - pode rodar múltiplas instâncias

---

**🎉 Configuração otimizada e simplificada para máxima eficiência!**
