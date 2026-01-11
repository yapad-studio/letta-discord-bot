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
RUN mkdir -p /app/data && \
    chown node:node /app/data && \
    chmod 755 /app/data && \
    # Only create presences.json if it doesn't exist (preserve existing data)
    if [ ! -f /app/data/presences.json ]; then \
        touch /app/data/presences.json && \
        chown node:node /app/data/presences.json && \
        chmod 644 /app/data/presences.json; \
    fi

USER node
EXPOSE 3001
CMD ["node", "dist/server.js"]