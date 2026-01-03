# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Production stage
FROM pierrezemb/gostatic
COPY --from=builder /app/dist /srv/http/
CMD ["-port","8080","-https-promote", "-enable-logging"]
