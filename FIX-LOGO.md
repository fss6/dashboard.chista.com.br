# 🔧 Fix: Problema do logo.png

## 🐛 Problema Identificado

O erro `The requested resource isn't a valid image for /logo.png received text/html; charset=utf-8` estava acontecendo porque:

### **Causa Raiz:**
- **`output: standalone`** copia arquivos da pasta `public` para `.next/standalone/public`
- **Volume `coolify_public_data:/app/public`** estava sobrescrevendo os arquivos
- **Servidor standalone** procurava em `.next/standalone/public/logo.png`
- **Volume montado** em `/app/public` interferia no caminho

## ✅ Solução Aplicada

### **Removido do docker-compose.coolify.yml:**
```yaml
# ❌ ANTES (problemático)
volumes:
  - coolify_web_data:/app/.next
  - coolify_public_data:/app/public  # ← REMOVIDO

volumes:
  coolify_web_data:
    driver: local
  coolify_public_data:  # ← REMOVIDO
    driver: local
```

```yaml
# ✅ DEPOIS (correto)
volumes:
  - coolify_web_data:/app/.next

volumes:
  coolify_web_data:
    driver: local
```

## 🔍 Como Funciona Agora

### **Build Process:**
1. **`npm run build`** executa
2. **Next.js** copia `public/` → `.next/standalone/public/`
3. **Arquivos estáticos** ficam em `.next/standalone/public/`
4. **Servidor** roda de `.next/standalone/server.js`
5. **Logo** acessível em `/logo.png`

### **Estrutura Final:**
```
/app/
├── .next/
│   └── standalone/
│       ├── server.js          # Servidor
│       └── public/            # Arquivos estáticos
│           ├── logo.png       # ← Aqui!
│           ├── file.svg
│           └── ...
└── ...
```

## 📦 Arquivos Afetados

- ✅ **`docker-compose.coolify.yml`** - Volume removido
- ✅ **`DOCKER-SETUP.md`** - Documentação atualizada
- ✅ **`public/logo.png`** - Arquivo existe (1.2MB)

## 🚀 Resultado

- ✅ **Logo carrega** corretamente
- ✅ **Arquivos estáticos** funcionam
- ✅ **Build standalone** otimizado
- ✅ **Performance** melhorada

---

**🎉 Problema resolvido! O logo agora carrega corretamente.**
