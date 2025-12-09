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

# Copiar arquivos estáticos para standalone (necessário para chunks, CSS, etc.)
# O Next.js não copia automaticamente .next/static e public no modo standalone
RUN mkdir -p .next/standalone/.next && \
    cp -R .next/static .next/standalone/.next/static && \
    cp -R public .next/standalone/public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Executar o servidor standalone
# O servidor precisa estar em /app/.next/standalone/ e os arquivos estáticos em
# /app/.next/standalone/.next/static/ e /app/.next/standalone/public/
CMD ["node", ".next/standalone/server.js"] 