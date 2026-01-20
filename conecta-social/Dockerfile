# Stage 1: Dependencies
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Stage 2: Production
FROM oven/bun:1-alpine AS runner
WORKDIR /app

# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Copy source code
COPY . .

# Set environment to production
ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "start"]
