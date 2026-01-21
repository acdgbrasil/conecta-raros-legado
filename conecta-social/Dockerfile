# Estágio 1: Instalação de Dependências
FROM oven/bun:1-alpine AS deps
WORKDIR /app

# Copia arquivos de definição de pacotes
COPY package.json bun.lock ./

# Instala dependências (incluindo devDependencies para build se necessário)
RUN bun install --frozen-lockfile

# Estágio 2: Execução
FROM oven/bun:1-alpine AS runner
WORKDIR /app

# Copia apenas as dependências instaladas
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Copia apenas o código fonte necessário (ignora o que não é usado)
# Nota: O .dockerignore deve lidar com pastas como 'social' se quiser ser restrito,
# mas aqui copiamos o src inteiro para garantir que os módulos compartilhados funcionem.
COPY src ./src
COPY tsconfig.json ./

# Define o ambiente como produção
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Inicializa o servidor usando o ponto de entrada principal
CMD ["bun", "run", "src/index.ts"]