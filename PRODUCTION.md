# 🚀 Production Deployment Guide

Este guia explica como fazer o deploy da aplicação Dashboard Chista em ambiente de produção.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Domínio configurado (dashboard.chista.com.br)
- Certificados SSL (Let's Encrypt recomendado)
- Servidor com pelo menos 2GB RAM e 2 vCPUs

## 🛠️ Configuração Inicial

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.prod.example .env.prod

# Editar com suas configurações
nano .env.prod
```

**Variáveis obrigatórias:**
```env
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

### 2. Configurar SSL (Recomendado)

#### Opção A: Let's Encrypt com Traefik (Recomendado)
```bash
# Criar rede Traefik
docker network create traefik-public

# Configurar Traefik com Let's Encrypt
# (Ver documentação do Traefik para detalhes)
```

#### Opção B: Certificados Manuais
```bash
# Criar diretório para certificados
mkdir -p ssl

# Colocar seus certificados
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

## 🚀 Deploy

### Deploy Básico
```bash
./deploy-prod.sh
```

### Deploy com Nginx (Recomendado)
```bash
./deploy-prod.sh --with-nginx
```

### Deploy com Cache Redis
```bash
./deploy-prod.sh --with-cache
```

### Deploy com Database PostgreSQL
```bash
./deploy-prod.sh --with-database
```

### Deploy Completo
```bash
./deploy-prod.sh --with-nginx --with-cache --with-database
```

## 📊 Monitoramento

### Health Check
```bash
# Verificar status da aplicação
curl https://dashboard.chista.com.br/api/health

# Resposta esperada:
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "memory": {
    "used": 150,
    "total": 200,
    "external": 50
  }
}
```

### Logs
```bash
# Ver logs da aplicação
docker-compose -f docker-compose.prod.yml logs -f web

# Ver logs do Nginx (se usado)
docker-compose -f docker-compose.prod.yml logs -f nginx

# Ver logs de todos os serviços
docker-compose -f docker-compose.prod.yml logs -f
```

### Status dos Containers
```bash
docker-compose -f docker-compose.prod.yml ps
```

## 🔧 Manutenção

### Atualizar Aplicação
```bash
# Parar serviços
docker-compose -f docker-compose.prod.yml down

# Rebuild e subir
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Ou usar o script
./deploy-prod.sh
```

### Backup (se usando database)
```bash
# Backup PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U dashboard dashboard > backup.sql

# Backup Redis (se necessário)
docker-compose -f docker-compose.prod.yml exec redis redis-cli BGSAVE
```

### Limpeza
```bash
# Limpar containers não utilizados
docker system prune -f

# Limpar volumes não utilizados
docker volume prune -f

# Limpar imagens não utilizadas
docker image prune -f
```

## 🔒 Segurança

### Configurações Implementadas

1. **Headers de Segurança**
   - X-Frame-Options: SAMEORIGIN
   - X-XSS-Protection: 1; mode=block
   - X-Content-Type-Options: nosniff
   - Strict-Transport-Security: max-age=31536000

2. **Rate Limiting**
   - API: 10 requests/segundo
   - Auth: 5 requests/minuto

3. **SSL/TLS**
   - TLS 1.2 e 1.3
   - Ciphers seguros
   - HSTS habilitado

4. **Container Security**
   - Read-only filesystem
   - No new privileges
   - Resource limits

### Recomendações Adicionais

1. **Firewall**
   ```bash
   # Permitir apenas portas necessárias
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 22/tcp
   ufw enable
   ```

2. **Fail2ban**
   ```bash
   # Instalar e configurar fail2ban
   apt install fail2ban
   ```

3. **Monitoramento**
   - Configurar alertas para CPU/Memory
   - Monitorar logs de erro
   - Configurar backup automático

## 📈 Performance

### Otimizações Implementadas

1. **Nginx**
   - Gzip compression
   - Static file caching
   - HTTP/2 support

2. **Docker**
   - Multi-stage builds
   - Resource limits
   - Health checks

3. **Next.js**
   - Production build
   - Telemetry disabled
   - Optimized images

### Monitoramento de Performance

```bash
# Ver uso de recursos
docker stats

# Ver logs de performance
docker-compose -f docker-compose.prod.yml logs web | grep -i performance
```

## 🆘 Troubleshooting

### Problemas Comuns

1. **Container não inicia**
   ```bash
   # Verificar logs
   docker-compose -f docker-compose.prod.yml logs web
   
   # Verificar variáveis de ambiente
   docker-compose -f docker-compose.prod.yml config
   ```

2. **SSL não funciona**
   ```bash
   # Verificar certificados
   openssl x509 -in ssl/cert.pem -text -noout
   
   # Verificar configuração Nginx
   docker-compose -f docker-compose.prod.yml exec nginx nginx -t
   ```

3. **Aplicação lenta**
   ```bash
   # Verificar recursos
   docker stats
   
   # Verificar logs de erro
   docker-compose -f docker-compose.prod.yml logs web | grep -i error
   ```

### Contatos de Suporte

- **Issues**: GitHub Issues
- **Documentação**: Este arquivo
- **Logs**: Docker logs

## 📝 Changelog

### v1.0.0
- Deploy básico com Docker
- Configuração de produção
- Health checks
- Documentação completa
