# syntax=docker/dockerfile:1

# Etapa 1: Construccion de la aplicacion
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Instalar dependencias necesarias para Chromium (compilacion de diagramas Mermaid en prebuild)
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: Entorno ligero de produccion
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/src/format ./src/format

EXPOSE 3000

CMD ["node", "server/main-prod.js"]
