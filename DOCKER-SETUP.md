# 🐳 Docker Setup - Produção vs Desenvolvimento

## 📋 Configuração Otimizada

### ✅ **Produção (Coolify)**

#### **Dockerfile (Produção)**
```dockerfile
# Dockerfile para Next.js (produção)
FROM node:20-alpine

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", ".next/standalone/server.js"]
```

#### **docker-compose.coolify.yml**
```yaml
version: '3.8'

services:
  web:
    build: 
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
      - PORT=3000
    volumes:
      - coolify_web_data:/app/.next
      - coolify_public_data:/app/public
    command: node .next/standalone/server.js
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - coolify_network
```

### 🔧 **Desenvolvimento**

#### **Dockerfile.dev**
```dockerfile
# Dockerfile para Next.js (desenvolvimento)
FROM node:20-alpine

WORKDIR /app

# Instalar dependências primeiro (para cache de layer)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

#### **docker-compose.yml**
```yaml
version: '3.8'
services:
  web:
    build: 
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev
    restart: unless-stopped
```

## 🔄 Diferenças Principais

| Aspecto | Desenvolvimento | Produção |
|---------|----------------|----------|
| **Build** | Não faz build | `npm run build` |
| **Comando** | `npm run dev` | `node .next/standalone/server.js` |
| **Volumes** | Hot reload | Build otimizado |
| **Environment** | Development | Production |
| **Telemetry** | Habilitada | Desabilitada |

## 🚀 Como Usar

### **Desenvolvimento:**
```bash
docker-compose up
```

### **Produção (Coolify):**
```bash
# No Coolify Dashboard:
# 1. Apontar para docker-compose.coolify.yml
# 2. Configurar variáveis de ambiente
# 3. Deploy automático
```

## ⚙️ Configurações Next.js

### **next.config.ts**
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',  // Otimização para produção
  images: {
    remotePatterns: [
      // ... configurações de imagens
    ],
  },
};
```

## 📦 Build Process

### **Desenvolvimento:**
1. Instala dependências
2. Copia código fonte
3. Roda em modo dev (hot reload)

### **Produção:**
1. Instala dependências
2. Copia código fonte
3. **Executa `npm run build`**
4. Roda com `node .next/standalone/server.js`

## ✅ Benefícios

### **Produção:**
- ✅ **Build otimizado** para performance
- ✅ **Menor tamanho** de imagem
- ✅ **Melhor segurança** (sem dev dependencies)
- ✅ **Hot reload desabilitado** (performance)

### **Desenvolvimento:**
- ✅ **Hot reload** para desenvolvimento rápido
- ✅ **Volumes montados** para mudanças em tempo real
- ✅ **Dev dependencies** disponíveis
- ✅ **Debugging** facilitado

---

**🎉 Configuração otimizada para ambos os ambientes!**
