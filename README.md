# FocusFlow 🎯

> Applicazione fullstack di gestione task con autenticazione,
> calendario e statistiche in tempo reale.

![CI](https://github.com/lucadisarno/focusflow/actions/workflows/focusflow-ci.yml/badge.svg)

## Demo
🔗 [focusflow-web-theta.vercel.app](https://focusflow-web-theta.vercel.app)

## Tech Stack
**Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query  
**Backend:** Node.js, Fastify, TypeScript  
**Database:** PostgreSQL (Neon.tech), Prisma ORM  
**Auth:** BetterAuth + Redis (Upstash)  
**Monorepo:** Turborepo + pnpm workspaces  
**Deploy:** Vercel (frontend) + Render (backend)  
**CI/CD:** GitHub Actions  

## Funzionalità
- ✅ Autenticazione email/password e Google OAuth
- ✅ Gestione task con status, priorità, scadenze
- ✅ Categorie e tag personalizzati
- ✅ Vista calendario con drag & drop
- ✅ Dashboard con statistiche e progresso categorie
- ✅ Ricerca globale con Cmd+K
- ✅ Dark mode

## Setup locale

### Prerequisiti
- Node.js 20+
- pnpm 8+
- Docker (opzionale, per DB locale)

### Installazione
```bash
git clone https://github.com/lucadisarno/focusflow.git
cd focusflow
pnpm install
```

### Variabili d'ambiente
Copia `.env.example` in `.env` e compila i valori:
```bash
cp .env.example .env
```

| Variabile | Descrizione |
|-----------|-------------|
| `DATABASE_URL` | URL PostgreSQL (Neon.tech) |
| `DATABASE_DIRECT_URL` | URL diretto per le migration |
| `BETTER_AUTH_SECRET` | Stringa random 32+ caratteri |
| `BETTER_AUTH_URL` | URL del backend |
| `UPSTASH_REDIS_REST_URL` | URL Redis (Upstash) |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis |
| `CORS_ORIGIN` | URL del frontend |

### Avvio sviluppo
```bash
pnpm dev
```

## Struttura del progetto
```
focusflow/
├── apps/
│   ├── web/          # React + Vite (frontend)
│   └── server/       # Fastify (backend API)
├── packages/
│   ├── db/           # Prisma schema e client
│   ├── auth/         # Configurazione BetterAuth
│   └── config-typescript/  # tsconfig condivisi
└── turbo.json        # Pipeline di build
```

## Scelte architetturali
- **Monorepo con Turborepo** per condividere tipi TypeScript tra frontend e backend
- **Prisma ORM** per type safety end-to-end e migration versionati
- **BetterAuth + Redis** per sessioni stateless veloci
- **Compensating transactions** invece di `prisma.$transaction`
  per compatibilità con il connection pooler di NeonTech
