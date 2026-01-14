FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY .env.template ./

# Create data directory and set permissions for node user
# Always ensure permissions are correct (even if directories/files already exist)
RUN mkdir -p /app/data && \
    chown node:node /app/data && \
    chmod 755 /app/data && \
    touch /app/data/presences.json 2>/dev/null || true && \
    chown node:node /app/data/presences.json && \
    chmod 644 /app/data/presences.json

USER node
EXPOSE 3001
CMD ["node", "dist/server.js"]
