# Stage 1: Build
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Instala dependências
COPY package.json bun.lock ./
RUN bun install

# Copia o código fonte
COPY . .

# Desabilita telemetria do Next.js durante o build
ENV NEXT_TELEMETRY_DISABLED=1

# Build da aplicação
RUN bun run build

# Stage 2: Runner
FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Cria usuário não-root por segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copia arquivos fonte e configs para modo DEV
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/postcss.config.mjs ./
COPY --from=builder /app/eslint.config.mjs ./

# Define permissões
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["bun", "run", "start"]
