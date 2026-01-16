# Stage 1: Build
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Instala todas as dependências (incluindo devDependencies para o build)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Build da aplicação (Gera .output)
RUN bun run build

# Stage 2: Runner
FROM oven/bun:1-alpine

WORKDIR /app

# Copia os artefatos do build
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
# É crucial copiar o node_modules ou reinstalar as deps de produção para que o comando "start" funcione
# Como estamos usando Bun, copiar node_modules é rápido e seguro se a arquitetura for a mesma (Alpine -> Alpine)
COPY --from=builder /app/node_modules ./node_modules

ENV PORT=3000
EXPOSE 3000

CMD ["bun", "run", "start"]