# syntax=docker/dockerfile:1

# Etapa 1: Construccion de la aplicacion
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Instalar dependencias para Chromium (compilacion de diagramas Mermaid en prebuild)
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

# Etapa 2: Servidor web estatico con Nginx
FROM nginx:alpine AS runner

# Configuracion para Single Page Application y catalogos
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    location /catalog/academic-sober/ {\n\
        try_files $uri $uri/ /catalog/academic-sober/index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
