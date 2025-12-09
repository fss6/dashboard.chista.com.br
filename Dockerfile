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

# Copiar pasta public para standalone (necessário para arquivos estáticos)
# O Next.js não copia automaticamente a pasta public no modo standalone
RUN cp -R public .next/standalone/public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Executar o servidor standalone
CMD ["node", ".next/standalone/server.js"] 