# FocusFlow 🎯

Web app di gestione task scalabile, costruita con un monorepo Turborepo + pnpm.

## 🌐 Demo live

- **Frontend:** https://focusflow-web-theta.vercel.app
- **Backend API:** https://focusflow-server-uwqz.onrender.com/health

> ⚠️ Il backend è ospitato su Render (piano free) e potrebbe impiegare 30-50 secondi per rispondere al primo accesso dopo un periodo di inattività.

## 🛠 Tech Stack

| Area | Tecnologia |
|------|-----------|
| **Package Manager** | pnpm |
| **Monorepo** | Turborepo |
| **Frontend** | React 18, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Fastify |
| **Database** | PostgreSQL (Neon.tech) + Prisma ORM |
| **Caching** | Redis (Upstash) |
| **Autenticazione** | BetterAuth |
| **Deploy Frontend** | Vercel |
| **Deploy Backend** | Render |
| **Linguaggio** | TypeScript (100%) |

## 📁 Struttura del progetto

```
focusflow/
├── apps/
│   ├── web/          # React App (Vite + Tailwind + shadcn/ui)
│   └── server/       # API REST (Fastify)
├── packages/
│   ├── db/           # Prisma schema e client condiviso
│   ├── auth/         # Configurazione BetterAuth condivisa
│   └── config-typescript/  # Configurazioni TypeScript comuni
├── turbo.json
└── pnpm-workspace.yaml
```

## ✨ Features

- 🔐 **Autenticazione completa** — email/password + Google OAuth, sessioni con Redis
- ✅ **Gestione Task** — CRUD completo con priorità, status, scadenze
- 🗂️ **Categorie** — organizza i task con categorie personalizzate (colore + icona)
- 🏷️ **Tag** — etichetta i task con tag colorati
- 📅 **Calendario** — visualizza i task con scadenza, drag & drop per cambiare data
- 🔍 **Search globale** — ricerca istantanea con Cmd+K e debounce 300ms
- 🔽 **Filtri avanzati** — filtra per status, priorità, categoria, tag, date range
- 🔗 **URL params sync** — i filtri attivi sono sincronizzati nell'URL
- 🌙 **Dark/Light mode** — tema dinamico con persistenza
- ⚡ **Lazy loading** — code splitting automatico per pagina
- 🚀 **CI/CD** — deploy automatico su push in `main`

## 🚀 Avvio in locale

### Prerequisiti

- Node.js >= 18
- pnpm >= 8

### Setup

```sh
# Clona il repository
git clone https://github.com/lucadisarno/focusflow
cd focusflow

# Installa le dipendenze
pnpm install

# Copia i file di environment
cp .env.example .env
# Compila il .env con i tuoi valori (DATABASE_URL, REDIS_URL, BETTER_AUTH_SECRET...)

# Genera il client Prisma
pnpm --filter @focusflow/db db:generate

# Sincronizza il database
pnpm --filter @focusflow/db db:push
```

### Sviluppo

```sh
# Avvia tutti i servizi in parallelo
pnpm dev

# Oppure avvia singolarmente
pnpm --filter @focusflow/web dev      # Frontend → http://localhost:5173
pnpm --filter @focusflow/server dev   # Backend  → http://localhost:3000
```

### Build

```sh
# Build di tutti i package
pnpm build

# Build specifico
pnpm --filter @focusflow/server build
pnpm --filter @focusflow/web build
```

## 🗄️ Database

Il progetto usa **PostgreSQL su Neon.tech** con Prisma ORM. Lo schema include:

- `User`, `Session`, `Account` — gestiti da BetterAuth
- `Task` — con status, priorità, scadenza, categoria e tag
- `Category`, `Tag`, `TaskTag` — sistema di organizzazione
- `FocusSession` — sessioni di focus (estendibile)

## 🔑 Variabili d'ambiente

```env
# Database (Neon.tech)
DATABASE_URL=postgresql://...       # Connessione diretta
DATABASE_DIRECT_URL=postgresql://... # Connessione pooler

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# BetterAuth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://...

# CORS
CORS_ORIGIN=https://...
FRONTEND_URL=https://...
```

## 📡 API Endpoints

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/sign-in/email` | Login |
| POST | `/api/auth/sign-up/email` | Registrazione |
| GET | `/api/tasks` | Lista task (con filtri) |
| POST | `/api/tasks` | Crea task |
| PATCH | `/api/tasks/:id` | Aggiorna task |
| DELETE | `/api/tasks/:id` | Elimina task |
| GET | `/api/tasks/calendar` | Task per il calendario |
| GET | `/api/search` | Search globale |
| GET | `/api/dashboard` | Statistiche dashboard |
| GET/POST/DELETE | `/api/categories` | Gestione categorie |
| GET/POST/DELETE | `/api/tags` | Gestione tag |
