# use the official Bun image
FROM oven/bun:1-alpine AS base
WORKDIR /app

# Em desenvolvimento, vamos simplificar para garantir que os Workspaces funcionem.
# Workspaces dependem de symlinks relativos que quebram facilmente em multi-stage complexos.

# 1. Copia tudo primeiro (respeitando .dockerignore)
COPY . .

# 2. Garante que não há node_modules antigos e instala do zero
RUN rm -rf node_modules src/modules/*/node_modules && bun install

# Variáveis de ambiente
ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000/tcp

# O comando 'dev' é o padrão
CMD [ "bun", "run", "dev" ]