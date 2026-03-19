# Stage 1 — Build
FROM node:20-alpine AS builder

# Installa pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copia i file di configurazione del monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copia i package.json di tutti i package necessari
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/
COPY packages/auth/package.json ./packages/auth/
COPY packages/config-typescript/package.json ./packages/config-typescript/

# Installa le dipendenze
RUN pnpm install --frozen-lockfile

# Copia il codice sorgente
COPY apps/server ./apps/server
COPY packages/db ./packages/db
COPY packages/auth ./packages/auth
COPY packages/config-typescript ./packages/config-typescript

# Build del server
RUN pnpm --filter @focusflow/server build

# Stage 2 — Production
FROM node:20-alpine AS runner

RUN npm install -g pnpm

WORKDIR /app

# Copia solo il necessario dal builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/server/package.json ./apps/server/
COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/packages/auth/package.json ./packages/auth/
COPY --from=builder /app/packages/config-typescript/package.json ./packages/config-typescript/

# Installa solo le dipendenze di produzione
RUN pnpm install --frozen-lockfile --prod

# Copia il codice compilato
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/auth ./packages/auth

EXPOSE 3000

CMD ["node", "apps/server/dist/index.js"]