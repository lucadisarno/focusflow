#!/bin/bash
set -e

npm install -g pnpm
pnpm install --frozen-lockfile

# Genera il client Prisma nel path corretto per pnpm
cd packages/db
npx prisma generate
cd ../..

# Copia il client generato nel path che pnpm usa a runtime
cp -r packages/db/node_modules/.prisma/client node_modules/.prisma/client 2>/dev/null || true
mkdir -p node_modules/.pnpm/@prisma+client@7.5.0_prisma@7.5.0_@types+react@19.2.2_react-dom@19.2.0_react@19.2.0__react@19_442rdndnjoctl53uqwcvxzzaja/node_modules/@prisma/client
cp -r packages/db/node_modules/.prisma/client/* node_modules/.pnpm/@prisma+client@7.5.0_prisma@7.5.0_@types+react@19.2.2_react-dom@19.2.0_react@19.2.0__react@19_442rdndnjoctl53uqwcvxzzaja/node_modules/@prisma/client/ 2>/dev/null || true

pnpm --filter @focusflow/auth build
pnpm --filter @focusflow/server build
