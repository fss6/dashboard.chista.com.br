# 🔧 Fix: Arquivos Estáticos (CSS, JS, Fontes)

## 🐛 Problema Identificado

Muitos erros 404 para arquivos estáticos:
- CSS files (e.g., `3d3404beaf3a56ad.css`)
- Font files (e.g., `93f479601ee12b01-s.p.woff2`)
- JavaScript chunks (e.g., `main-app-f38f0d9153b95312.js`)

### **Causa Raiz:**
- **Volumes Docker** interferindo com arquivos do build
- **Next.js standalone** precisa de acesso direto aos arquivos
- **Volumes montados** sobrescrevendo arquivos do build

## ✅ Solução Aplicada

### **1. Configuração Final do docker-compose.coolify.yml:**
```yaml
version: '3.8'

services:
  web:
    build: 
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
      - PORT=3000
    command: node .next/standalone/server.js
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### **2. Dockerfile Simplificado:**
```dockerfile
# Build da aplicação
RUN npm run build

# Servidor standalone
CMD ["node", ".next/standalone/server.js"]
```

### **3. Configuração Next.js:**
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',  // Gera build otimizado
  images: {
    remotePatterns: [
      // ... configurações
    ],
  },
};
```

## 🔍 Como Funciona Agora

### **Build Process:**
1. **`npm run build`** executa
2. **Next.js** gera `.next/standalone/`
3. **Arquivos estáticos** ficam em `.next/static/`
4. **Servidor** roda de `.next/standalone/server.js`
5. **Sem volumes** interferindo

### **Estrutura Final:**
```
/app/
├── .next/
│   ├── standalone/
│   │   ├── server.js          # Servidor
│   │   └── public/            # Arquivos públicos
│   └── static/                # CSS, JS, fontes
│       ├── chunks/            # JavaScript chunks
│       ├── css/               # CSS files
│       └── media/             # Fontes
└── ...
```

## 📦 Arquivos Atualizados

- ✅ **`docker-compose.coolify.yml`** - Configuração consolidada
- ✅ **`FIX-STATIC-FILES.md`** - Esta documentação

## 🚀 Resultado Esperado

- ✅ **CSS carrega** corretamente
- ✅ **JavaScript chunks** funcionam
- ✅ **Fontes** carregam
- ✅ **Logo** funciona
- ✅ **Performance** otimizada

## 🔄 Alternativas

### **Se precisar de volumes:**
```yaml
# Apenas para dados persistentes (não arquivos estáticos)
volumes:
  - app_data:/app/data
```

---

**🎉 Arquivos estáticos agora devem carregar corretamente!**
