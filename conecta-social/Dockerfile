# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/build ./build
# We also need the .env file if not provided strictly by docker-compose environment mapping, 
# but docker-compose usually handles the env vars. 
# Copying static assets if they are needed by path resolution relative to root
# (Though the code seems to look relative to __filename which is in build/)

EXPOSE 3000

CMD ["npm", "start"]
