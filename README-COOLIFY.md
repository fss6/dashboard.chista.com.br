# 🚀 Deploy no Coolify

## 📋 Configuração Rápida

### 1. **Instalar Coolify**
```bash
docker run -d \
  --name coolify \
  --restart unless-stopped \
  -p 8000:8000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v coolify-db:/app/database \
  ghcr.io/coollabsio/coolify:latest
```

### 2. **Acessar Dashboard**
```
http://localhost:8000
```

### 3. **Criar Projeto**
- **Nome:** `dashboard-chista`
- **Tipo:** `Application`
- **Source:** `Git Repository`
- **Repository:** `https://github.com/seu-usuario/dashboard.chista.com.br`
- **Branch:** `main`

### 4. **Configurar Aplicação**
- **Build Command:** `npm run build`
- **Start Command:** `node .next/standalone/server.js`
- **Port:** `3000`
- **Docker Compose File:** `docker-compose.coolify.yml`

### 5. **Configurar Domínio**
- **Domain:** `dashboard.chista.com.br`
- **SSL:** `Let's Encrypt` (automático)

### 6. **Variáveis de Ambiente**
```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
AUTH0_SECRET=your_auth0_secret_here
AUTH0_BASE_URL=https://dashboard.chista.com.br
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id_here
AUTH0_CLIENT_SECRET=your_client_secret_here
CHISTA_API_BASE_URL=https://api.chista.com.br
CHISTA_API_TOKEN=your_chista_api_token_here
```

### 7. **Deploy**
Clicar em **"Deploy"** 🚀

## 📦 Arquivos de Configuração

- **`docker-compose.coolify.yml`** - Docker Compose otimizado
- **`coolify.json`** - Configuração da aplicação
- **`src/app/api/health/route.js`** - Health check endpoint

## 🔍 Monitoramento

### Health Check
```bash
curl https://dashboard.chista.com.br/api/health
```

### Logs
```bash
docker-compose -f docker-compose.coolify.yml logs -f web
```

## ✅ Vantagens

- ✅ **SSL automático** (Let's Encrypt)
- ✅ **Deploy automático** (Git webhooks)
- ✅ **Backup automático**
- ✅ **Monitoramento integrado**
- ✅ **Interface web intuitiva**
- ✅ **Zero vendor lock-in**

## 🆘 Suporte

- **Documentação:** [Coolify Docs](https://coolify.io/docs)
- **GitHub:** [Coolify Repository](https://github.com/coollabsio/coolify)
- **Discord:** [Coolify Community](https://discord.gg/coolify)

---

**🎉 Deploy simplificado e automatizado!**
