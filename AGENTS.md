# FocusFlow — Guida per Agenti AI (Codex)

## Panoramica del progetto

FocusFlow è un'applicazione fullstack di gestione task con autenticazione, calendario e statistiche in tempo reale.

**Funzionalità principali:**
- Autenticazione email/password e Google OAuth
- Gestione task con status, priorità, scadenze
- Categorie e tag personalizzati
- Vista calendario con drag & drop
- Statistiche in tempo reale

## Stack tecnologico

| Area | Tecnologie |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query |
| **Backend** | Node.js, Fastify, TypeScript |
| **Database** | PostgreSQL (Neon.tech), Prisma ORM |
| **Auth** | BetterAuth + Redis (Upstash) |
| **Monorepo** | Turborepo + pnpm workspaces |
| **Deploy** | Vercel (frontend) + Render (backend) |
| **CI/CD** | GitHub Actions |

## Struttura del progetto

```
focusflow/
├── apps/
│   ├── server/            # Backend Fastify
│   │   ├── src/
│   │   │   ├── __tests__/      # Test di integrazione e unitari
│   │   │   ├── lib/
│   │   │   ├── plugins/
│   │   │   ├── routes/
│   │   │   └── types/
│   │   ├── app.ts
│   │   └── index.ts
│   └── web/                # Frontend React (Vite)
├── packages/
│   ├── db/                 # Package condiviso per il database
│   │   ├── generated/           # Client Prisma generato
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   └── schema.prisma    # Schema Prisma (qui, non in apps/server!)
│   │   ├── src/
│   │   ├── package.json
│   │   ├── prisma.config.ts
│   │   └── tsconfig.json
│   └── auth/               # Package condiviso per l'autenticazione (BetterAuth)
├── .github/workflows/      # Pipeline CI/CD
├── Dockerfile
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
└── .env / .env.example
```

> ⚠️ Nota per l'agente: lo schema Prisma vive in `packages/db/prisma/schema.prisma`, **non** dentro `apps/server`. Il client generato si trova in `packages/db/generated/`.

## Comandi principali

Comandi confermati (da `package.json` root):

```bash
# Installazione dipendenze (workspace pnpm, gestore: pnpm@9.0.0, node >=18)
pnpm install

# Sviluppo (avvia tutte le app in parallelo via Turborepo)
pnpm dev

# Build di tutto il monorepo
pnpm build

# Lint
pnpm lint

# Controllo tipi TypeScript
pnpm check-types

# Formattazione codice (Prettier su ts/tsx/md)
pnpm format
```

Comandi database (package `@focusflow/db`, confermati da `packages/db/package.json`):
```bash
# Genera il client Prisma
pnpm --filter db db:generate

# Push schema sul DB senza creare una migration (utile in sviluppo rapido)
pnpm --filter db db:push

# Crea e applica una migration (modalità dev)
pnpm --filter db db:migrate

# Apre Prisma Studio (GUI per esplorare/modificare i dati a mano)
pnpm --filter db db:studio
```

> ℹ️ `prisma generate` viene eseguito automaticamente anche dopo ogni `pnpm install` (script `postinstall`), quindi nella maggior parte dei casi non serve lanciarlo manualmente dopo aver clonato o aggiornato le dipendenze.

Comandi specifici del backend (`apps/server`, package `@focusflow/server`):
```bash
# Sviluppo con hot reload (carica .env dalla root del monorepo: ../../.env)
pnpm --filter server dev

# Build (compilazione TypeScript)
pnpm --filter server build

# Avvio in produzione (dopo build)
pnpm --filter server start

# Test (Vitest)
pnpm --filter server test

# Typecheck del solo backend
pnpm --filter server typecheck

# Lint (ESLint)
pnpm --filter server lint
```

> ✅ **Risolto**: i test si lanciano con **Vitest** (`vitest run`), confermato in `apps/server/package.json`. Non sono esposti dalla root — vanno lanciati con `pnpm --filter server test`.
>
> ⚠️ **Incongruenza confermata tra root e backend**: `apps/server/package.json` ha uno script chiamato `typecheck` (`tsc --noEmit`), e così anche il task in `turbo.json`. Ma lo script root in `package.json` si chiama `check-types` e lancia `turbo run check-types` — un task/script che **non esiste con questo nome da nessuna parte**. Quindi **`pnpm check-types` dalla root probabilmente non funziona**. Soluzione consigliata: rinominare lo script root da `check-types` a `typecheck`, così combacia con tutto il resto:
> ```json
> "typecheck": "turbo run typecheck"
> ```
> (questa è una correzione concreta da proporre a Codex stesso, alla prima sessione di lavoro)

## Convenzioni di codice

- **TypeScript ovunque**: niente file `.js` per nuovo codice, salvo configurazioni che lo richiedano esplicitamente
- **ESM**: il backend usa `"type": "module"` — import/export in stile ES Modules, non `require`
- **Gestione errori backend**: seguire il pattern già presente nelle route esistenti in `apps/server/src/routes/`
- **Componenti React**: usare componenti funzionali con Hooks, stile shadcn/ui per la UI
- **Naming**: file di test seguono il pattern `*.test.ts` dentro `__tests__/`
- **Variabili d'ambiente**: mai committare `.env` — usare sempre `.env.example` come riferimento per le chiavi richieste, senza valori reali. Il backend carica il `.env` dalla root del monorepo (`../../.env` rispetto a `apps/server`), non un proprio file locale
- **Package condivisi**: il backend importa `@focusflow/auth` e `@focusflow/db` come workspace package (`workspace:*`) — eventuali modifiche a logica di auth o database vanno fatte in quei package, non duplicate nel server
- **Rate limiting e CORS**: già gestiti via plugin Fastify (`@fastify/cors`, `@fastify/rate-limit`) — verificare la configurazione esistente prima di aggiungerne di nuova

## Testing

Il progetto ha test di integrazione e unitari nel backend (`apps/server/src/__tests__/`):
- `health.integration.test.ts`
- `routes.test.ts`
- `utils.test.ts`

> Prima di proporre modifiche a logica di business o route, esegui i test esistenti per verificare che nulla si rompa. Se aggiungi nuove funzionalità, aggiungi anche i test corrispondenti seguendo lo stile dei test già presenti.

## Database

- ORM: **Prisma 7**, schema in `packages/db/prisma/schema.prisma`
- Client generato in `packages/db/generated/`
- Provider: PostgreSQL ospitato su Neon.tech
- **Driver/adapter**: il package usa sia `@prisma/adapter-neon` (driver serverless via `@neondatabase/serverless` + `ws`) sia `@prisma/adapter-pg` (driver `pg` standard) — verificare quale dei due è effettivamente in uso nel codice di inizializzazione del client prima di proporre modifiche alla connessione al DB, per non romperla scegliendo l'adapter sbagliato
- Modelli noti: `User` (con relazioni a `sessions`, `accounts`, `tasks`), e altri da esplorare nello stesso file
- Prima di modificare lo schema, generare una nuova migration con `pnpm --filter db db:migrate`

## Note importanti per l'agente

- **Non modificare file fuori dalla working directory** senza chiedere conferma esplicita
- **Non eseguire comandi che richiedono accesso di rete** (push, fetch da API esterne) senza approvazione, salvo diversamente configurato nei permessi di Codex
- **Non committare mai segreti**: token, password, chiavi API non devono finire in nessun file tracciato da Git
- Il deploy è gestito separatamente su Vercel (frontend) e Render (backend) — non serve preoccuparsi della pipeline di deploy a meno che non venga chiesto esplicitamente

---

*Ultimo aggiornamento: da compilare manualmente quando questo file viene modificato.*