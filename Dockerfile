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

CMD ["npm", "start"] 