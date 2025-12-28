# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/

# Define build arguments
ARG DATABASE_URL
ARG API_SECRET
ARG CLOUD_NAME
ARG API_KEY

# Install dependencies
RUN npm ci
RUN npm ci --prefix client

# Copy source code
COPY prisma ./prisma
COPY types ./types
COPY server ./server
COPY client ./client

# Generate Prisma Client
RUN npx prisma generate

# Build Client
RUN npm run build --prefix client

# Build Server
RUN npx tsc -p server

# Prune dev dependencies
RUN npm prune --production && \
    rm -rf node_modules/prisma node_modules/typescript node_modules/.cache node_modules/effect && \
    rm -rf node_modules/@prisma/client/runtime/*.wasm*
RUN rm -rf node_modules/.cache/
RUN rm -rf node_modules/@prisma/engines/
RUN rm -rf node_modules/.prisma/client/query_engine-windows.dll.node
RUN rm -rf node_modules/prisma/

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package.json
COPY package.json  ./package.json
COPY package-lock.json ./package-lock.json

# Copy built artifacts from builder
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/prisma ./prisma

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules
# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "server/dist/index.js"]
