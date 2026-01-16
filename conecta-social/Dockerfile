# Stage 1: Build
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json ./
# Bun usa bun.lockb, mas se não tiver, ele gera. Se tiver package-lock, ele ignora ou converte.
# Como estamos mudando, vamos garantir que instale as deps.
RUN bun install

# Copy source code
COPY . .

# Build the application (opcional com Bun, pois ele roda TS direto, mas mantemos para prod)
# Se o build usar SWC/TSC, ainda funciona. Mas com Bun podemos rodar direto.
# Vamos manter o build step padrão caso queira gerar JS puro para prod.
RUN bun run build

# Stage 2: Production
FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
RUN bun install --production

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["bun", "start"]