# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_CONVEX_URL
ARG VITE_TMDB_READ_ACCESS_TOKEN

# Make them available as environment variables during build
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL
ENV VITE_TMDB_READ_ACCESS_TOKEN=$VITE_TMDB_READ_ACCESS_TOKEN

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# Production stage
FROM pierrezemb/gostatic
COPY --from=builder /app/dist /srv/http/
CMD ["-port","8080","-https-promote", "-enable-logging"]
