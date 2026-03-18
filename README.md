# Next.js Production-Ready Starter v3.0

Ein vollständiges, produktionsreifes Next.js Starter-Template mit TypeScript, Tailwind CSS, MongoDB, i18n und vielen weiteren Features.

## Features

### Core Stack

- **Next.js 16** - Neueste Version mit App Router & Performance-Optimierungen
- **React 19** - Modernste React-Version
- **TypeScript** - Vollständige Type-Safety im Strict Mode
- **Tailwind CSS** - Utility-First CSS Framework
- **MongoDB** - NoSQL Datenbank mit Mongoose ODM

### Developer Experience

- **i18n** - Mehrsprachigkeit mit next-intl (Deutsch/Englisch)
- **Theme Toggle** - Perfekter Dark/Light Mode ohne Flicker
- **Validation** - Zod für Runtime-Validation & Env Variables
- **ESLint + Prettier** - Code Quality & Auto-Formatting
- **Husky** - Git Hooks für Pre-Commit & Pre-Push Checks
- **Winston Logger** - Strukturiertes Logging mit Rotation

### Production Features

- **Error Handling** - Error Boundaries & Custom Error Pages
- **Loading States** - Suspense Fallbacks & Loading Components
- **Rate Limiting** - In-Memory API Rate Limiting
- **API Response Wrapper** - Konsistente Success/Error Responses
- **SEO** - Dynamic Sitemap & Robots.txt
- **TypeScript Strict Mode** - Maximale Type-Safety
- **VS Code Integration** - Settings & Extensions empfohlen
- **Docker Ready** - Dockerfile & docker-compose.yml
- **CI/CD Pipeline** - GitHub Actions Integration

### NEW: Advanced UI Components & Hooks

- **Form System** - React Hook Form + Zod Integration
- **Data Fetching** - TanStack Query mit Custom Hooks
- **Modal/Dialog System** - Radix UI Components
- **Table & Pagination** - Reusable Table mit Sorting
- **Search & Filter** - Debounced Search + MongoDB Filter Builder
- **Notifications** - useNotification Hook mit Toast
- **Date/Number Formatting** - i18n-aware Utilities
- **Common Validations** - 20+ Zod Schemas
- **Auth Structure** - Context, HOC, Permissions (ready to implement)

## Was ist neu? (v3.0 - Major Update)

### Form System

- **React Hook Form** - Performance-optimiertes Form Handling
- **Zod Integration** - Type-safe Validation
- **UI Components** - Input, Textarea, Select, Checkbox mit Error Display
- **useZodForm Hook** - Simplified Form Setup

### Data Fetching Layer

- **TanStack Query** - Caching, Background Updates, Optimistic UI
- **Custom Hooks** - useUsers, useUser, useCreateUser, useUpdateUser, useDeleteUser
- **Query Keys** - Strukturierte Key-Management
- **Auto-Invalidation** - Automatische Cache Updates

### UI Component Library

- **Modal/Dialog** - Radix UI mit useModal & useConfirm Hooks
- **Table** - Flexible, typsichere Table Component
- **Pagination** - Component + usePagination Hook
- **SearchInput** - Mit Clear Button & Loading State
- **Form Controls** - Styled, accessible, mit Error Handling

### Utilities & Helpers

- **useDebounce** - Debounced Values für Search
- **useNotification** - Success/Error/Warning/Info Toasts
- **Date Formatting** - formatDate, formatRelativeTime, formatRelativeDate
- **Number Formatting** - Currency, Percent, FileSize, Compact Numbers
- **Query Filter Builder** - Type-safe MongoDB Query Builder

### Validation Schemas

- Email, Password, Phone, URL, Slug, Username
- File Size & Type Validation
- Date Range, IP Address, Credit Card
- JSON, Hex Color, Postal Code
- 20+ wiederverwendbare Schemas

### Auth Structure (Ready to Implement)

- **AuthContext** - User State Management
- **withAuth HOC** - Protected Routes
- **Permission System** - Role-based Access Control
- **usePermissions Hook** - Check User Permissions

### Theme System

- **Zero-Flicker Loading** - Blocking Script verhindert Theme-Flash
- **Smooth Transitions** - 200ms sanfte Übergänge für alle Elemente
- **Backdrop Filter Support** - Blur-Effekte animieren mit
- **Loading State Prevention** - Keine Transitions beim ersten Load
- **System Preference Sync** - Auto-Erkennung & localStorage Persistierung

### API & Backend

- **Complete User CRUD API** - `/api/users` mit Validation
- **Health Check Endpoint** - `/api/health` für Monitoring
- **Rate Limiting** - Schutz vor API Abuse
- **File Upload Utils** - Validation & Processing Helpers
- **Constants Library** - Zentrale App-Konfiguration

### DevOps

- **Docker Support** - Multi-stage Build für Production
- **GitHub Actions** - Automatische CI/CD Pipeline
- **Logging** - Winston mit File Rotation
- **Environment Validation** - Zod-basierte Env Checks

## Projektstruktur

```
NextJSRaw/
├── src/
│   ├── app/
│   │   ├── [locale]/              # Internationalisierte Routes
│   │   │   ├── layout.tsx         # Root Layout mit Theme Script
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── loading.tsx        # Loading UI
│   │   │   ├── error.tsx          # Error Boundary
│   │   │   └── not-found.tsx      # 404 Page
│   │   ├── api/                   # API Routes
│   │   │   ├── health/            # Health Check
│   │   │   ├── test/              # Test Endpoint
│   │   │   └── users/             # User CRUD API
│   │   ├── global-error.tsx       # Global Error Handler
│   │   ├── sitemap.ts             # Dynamic Sitemap
│   │   └── robots.ts              # Robots.txt
│   ├── components/
│   │   ├── hoc/                   # Higher-Order Components
│   │   │   └── withAuth.tsx       # Protected Route HOC
│   │   ├── providers/             # React Providers
│   │   │   ├── ThemeProvider.tsx  # Theme Context
│   │   │   └── ReactQueryProvider.tsx # TanStack Query
│   │   ├── ui/                    # UI Components
│   │   │   ├── Form/              # Form Components
│   │   │   │   ├── Input.tsx      # Input Field
│   │   │   │   ├── Textarea.tsx   # Textarea Field
│   │   │   │   ├── Select.tsx     # Select Dropdown
│   │   │   │   ├── Checkbox.tsx   # Checkbox Field
│   │   │   │   └── Form.tsx       # Form Wrapper
│   │   │   ├── Modal.tsx          # Modal Dialog
│   │   │   ├── ConfirmDialog.tsx  # Confirmation Dialog
│   │   │   ├── Table.tsx          # Data Table
│   │   │   ├── Pagination.tsx     # Pagination Component
│   │   │   ├── SearchInput.tsx    # Search Input with Clear
│   │   │   ├── ThemeToggle.tsx    # Theme Switcher
│   │   │   └── LoadingSpinner.tsx # Loading Indicator
│   │   └── layouts/               # Layout Components
│   ├── contexts/                  # React Contexts
│   │   └── AuthContext.tsx        # Auth Context (ready to implement)
│   ├── hooks/                     # Custom Hooks
│   │   ├── useZodForm.ts          # Form Hook with Zod
│   │   ├── useUsers.ts            # User CRUD Hooks (TanStack Query)
│   │   ├── useModal.ts            # Modal State Hook
│   │   ├── useConfirm.ts          # Confirmation Dialog Hook
│   │   ├── useNotification.ts     # Toast Notification Hook
│   │   ├── useDebounce.ts         # Debounce Hook
│   │   ├── usePagination.ts       # Pagination Hook
│   │   └── usePermissions.ts      # Permission Check Hook
│   ├── lib/
│   │   ├── env.ts                 # Env Validation (Zod)
│   │   ├── mongodb.ts             # Database Connection
│   │   ├── logger.ts              # Winston Logger
│   │   ├── utils.ts               # Utility Functions
│   │   ├── api-response.ts        # API Helpers
│   │   ├── rate-limit.ts          # Rate Limiter
│   │   ├── constants.ts           # App Constants
│   │   ├── file-utils.ts          # File Processing
│   │   ├── format.ts              # Date/Number Formatting
│   │   ├── query-filter.ts        # MongoDB Filter Builder
│   │   └── permissions.ts         # Permission Utils
│   ├── models/                    # Mongoose Models
│   │   └── User.ts                # User Model
│   ├── schemas/                   # Zod Validation Schemas
│   │   ├── user.schema.ts         # User Schemas
│   │   └── common.schema.ts       # Common Validation Schemas
│   ├── types/                     # TypeScript Types
│   ├── config/                    # App Configuration
│   ├── i18n.ts                    # i18n Config
│   ├── routing.ts                 # Routing Config
│   └── middleware.ts              # Next.js Middleware
├── messages/                      # i18n Translations
│   ├── de.json
│   └── en.json
├── .github/workflows/             # GitHub Actions
│   └── ci.yml                     # CI/CD Pipeline
├── .vscode/                       # VS Code Settings
├── .husky/                        # Git Hooks
├── Dockerfile                     # Docker Configuration
├── docker-compose.yml             # Docker Compose Setup
└── public/                        # Static Assets
```

## Quick Start

### Voraussetzungen

- Node.js 20+
- npm/pnpm/yarn
- MongoDB (lokal oder Atlas)

### Installation

1. **Repository klonen**

```bash
git clone https://github.com/NiklasHoffmann/NextJSRaw.git
cd NextJSRaw
```

2. **Dependencies installieren**

```bash
npm install
```

3. **Environment Variables einrichten**

```bash
cp .env.example .env.local
```

Bearbeite `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/nextjs-starter
NEXT_PUBLIC_APP_URL=http://localhost:3000
LOG_LEVEL=info
API_RATE_LIMIT=100
API_RATE_LIMIT_WINDOW=60000
```

4. **Development Server starten**

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## Verfügbare Scripts

```bash
npm run dev          # Development Server starten
npm run build        # Production Build erstellen
npm run start        # Production Server starten
npm run lint         # ESLint ausführen
npm run lint:fix     # ESLint mit Auto-Fix
npm run format       # Code formatieren mit Prettier
npm run format:check # Prettier Check
npm run type-check   # TypeScript Type-Check
```

## Internationalisierung (i18n)

Das Projekt unterstützt Deutsch und Englisch:

- `/` oder `/de` - Deutsche Version
- `/en` - Englische Version

Übersetzungen bearbeiten in:

- `messages/de.json`
- `messages/en.json`

## Theme System

### Features

- **Instant Load** - Blocking Script lädt Theme VOR React Hydration
- **Zero Flicker** - Kein Flash of Unstyled Content (FOUC)
- **Smooth Transitions** - 200ms sanfte Farbübergänge
- **Persistent** - Theme wird in localStorage gespeichert
- **System Sync** - Automatische Erkennung der System-Präferenz

### Technische Details

```typescript
// Blocking Script in layout.tsx lädt Theme vor React
localStorage.getItem('nextjs-theme')
→ Setzt 'dark' class auf <html>
→ CSS Transitions erst nach Load aktiviert
→ Kein Flicker, perfekte UX
```

## Database

### MongoDB Connection

Die MongoDB-Verbindung wird automatisch im Hintergrund verwaltet:

- Connection Pooling
- Automatic Reconnection
- Cached Connections in Development

### Models

Beispiel User Model:

```typescript
import User from '@/models/User';

const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
});
```

## API Endpoints

### Health Check

## Coolify Deployment

Dieses Projekt ist fuer Coolify mit Dockerfile vorbereitet.

### Empfohlene Methode

1. In Coolify ein neues Projekt als `Dockerfile`-Deployment anlegen.
2. Build-Kontext auf Repository-Root lassen.
3. Port auf `3000` setzen.
4. Healthcheck auf `/api/health` setzen.

### Wichtige Environment Variables in Coolify

- `NODE_ENV=production`
- `NEXT_PUBLIC_APP_URL=https://deine-domain.tld`
- `MONGODB_URI=...`
- optional fuer Kontaktformular-Mailversand:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
  - `SMTP_FROM_EMAIL`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`

### Hinweis zu Start Command

Das Projekt nutzt `output: standalone` und startet in Production ueber:

```bash
npm start
```

Der Script zeigt auf `node .next/standalone/server.js` und ist damit fuer Coolify kompatibel.

```bash
GET /api/health
# Response: { status: 'healthy', database: 'connected' }
```

### Users API

```bash
GET    /api/users          # List all active users
POST   /api/users          # Create new user
GET    /api/users/[id]     # Get user by ID
PATCH  /api/users/[id]     # Update user
DELETE /api/users/[id]     # Soft delete user
```

**Beispiel Request:**

```bash
# Create User
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Response
{
  "success": true,
  "data": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true
  },
  "message": "User created successfully"
}
```

### Test Endpoint

```bash
GET  /api/test             # Test mit Rate Limiting
POST /api/test             # Echo request body
```

## Code Quality

### Pre-Commit Hooks

- Prettier Auto-Formatting
- TypeScript Type-Check

### Pre-Push Hooks

- TypeScript Type-Check
- Verhindert Pushen bei Type-Errors

### GitHub Actions

- ESLint & Prettier Check
- TypeScript Validation
- Build Test
- Automatisch bei Push & Pull Requests

## Deployment

### Vercel (Empfohlen)

1. Push zu GitHub
2. Import in Vercel
3. Environment Variables setzen
4. Deploy

### Docker

```bash
# Mit Docker Compose (inkl. MongoDB)
docker-compose up -d

# Oder manuell
docker build -t nextjs-starter .
docker run -p 3000:3000 \
  -e MONGODB_URI=your_uri \
  -e NEXT_PUBLIC_APP_URL=your_url \
  nextjs-starter
```

### Manual

```bash
npm run build
npm run start
```

## Environment Variables

Erforderliche Environment Variables:

```env
MONGODB_URI=mongodb://localhost:27017/nextjs-starter
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
LOG_LEVEL=info
API_RATE_LIMIT=100
API_RATE_LIMIT_WINDOW=60000
```

## VS Code Integration

Empfohlene Extensions werden automatisch vorgeschlagen:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- MongoDB for VS Code
- TypeScript Next.js

## Was fehlt noch?

Für spezialisierte Use Cases könntest du ergänzen:

### Authentication

- NextAuth.js Integration
- JWT Token Management
- Protected Routes Middleware
- Session Management

### Testing

- Jest Unit Tests
- Playwright E2E Tests
- API Integration Tests

### Features

- Email Service (Resend/Nodemailer)
- File Upload zu Cloud (S3/Cloudinary)
- Webhook Handler
- Cron Jobs
- Redis Caching

### DevOps

- Monitoring (Sentry)
- Analytics (Plausible/Umami)
- Performance Monitoring
- Error Tracking

## Weitere Ressourcen

- [Next.js Dokumentation](https://nextjs.org/docs)
- [Tailwind CSS Dokumentation](https://tailwindcss.com/docs)
- [MongoDB Dokumentation](https://docs.mongodb.com)
- [next-intl Dokumentation](https://next-intl-docs.vercel.app)
- [next-themes Dokumentation](https://github.com/pacocoursey/next-themes)

## Contributing

Contributions sind willkommen! Bitte erstelle einen Pull Request.

## Lizenz

MIT License

## Author

Erstellt von **Niklas Hoffmann** als Production-Ready Starter Template für Next.js 16

**Repository:** https://github.com/NiklasHoffmann/NextJSRaw

---

## Features Highlights

- Zero Security Vulnerabilities
- 100% TypeScript Coverage
- Perfect Dark Mode (No Flicker)
- Production-Ready API
- Docker Support
- CI/CD Pipeline
- Full i18n Support
- SEO Optimized
