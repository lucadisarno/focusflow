#!/bin/bash
set -e

npm install -g pnpm
pnpm install --frozen-lockfile
pnpm --filter @focusflow/db db:generate
pnpm --filter @focusflow/auth build
pnpm --filter @focusflow/server build
