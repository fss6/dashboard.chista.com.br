# Dockerfile para Next.js (desenvolvimento)
FROM node:20-alpine

WORKDIR /app

# Instalar dependências primeiro (para cache de layer)
COPY package.json package-lock.json* ./
RUN npm ci --only=production=false

# Copiar código fonte
COPY . .

# Limpar cache e reinstalar se necessário
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"] 