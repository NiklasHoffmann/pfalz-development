# Pfalz Development Website

Offizielle Website fuer Pfalz Development auf Basis von Next.js App Router.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- next-intl (Locales: `de`, `en`, `pfl`)
- MongoDB + Mongoose
- Zod + React Hook Form
- Nodemailer (Kontaktformular)

## Features

- Mehrsprachige Landingpage mit separaten Locale-Routen
- Kontaktformular mit Validation, Rate Limiting und optionalem SMTP-Versand
- User CRUD API (`/api/users`) als Beispiel-Backend
- Health-Endpoint fuer Monitoring (`/api/health`)
- SEO-Basics mit `sitemap.ts` und `robots.ts`
- Dockerfile + docker-compose fuer lokale und produktive Deployments
- ESLint, Prettier, Husky, TypeScript Checks

## Projektstruktur

```text
pfalz-development.de/
|- src/
|  |- app/
|  |  |- [locale]/
|  |  |  |- page.tsx
|  |  |  |- datenschutz/page.tsx
|  |  |  |- impressum/page.tsx
|  |  |- api/
|  |  |  |- contact/route.ts
|  |  |  |- health/route.ts
|  |  |  |- test/route.ts
|  |  |  |- users/route.ts
|  |  |  |- users/[id]/route.ts
|  |  |- robots.ts
|  |  |- sitemap.ts
|  |- components/
|  |  |- home/
|  |  |- ui/
|  |- hooks/
|  |- lib/
|  |- models/
|  |- schemas/
|  |- contexts/
|  |- proxy.ts
|  |- i18n.ts
|  |- routing.ts
|- messages/
|  |- de.json
|  |- en.json
|  |- pfl.json
|- specs/
|- Dockerfile
|- docker-compose.yml
|- README.md
|- USAGE.md
```

## Quick Start

### Voraussetzungen

- Node.js 20+
- npm
- MongoDB (lokal oder Atlas)

### Installation

```bash
git clone https://github.com/NiklasHoffmann/pfalz-development.git
cd pfalz-development
npm install
cp .env.example .env.local
```

Danach `.env.local` anpassen.

Minimal erforderlich:

```env
MONGODB_URI=mongodb://localhost:27017/nextjs-starter
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional (Kontaktmail):

```env
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
```

Starten:

```bash
npm run dev
```

## NPM Scripts

```bash
npm run dev
npm run build
npm run start
npm run start:standalone
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run type-check
```

## API Endpoints

### Health

```http
GET /api/health
```

### Kontakt

```http
POST /api/contact
```

Payload:

```json
{
  "name": "Max Mustermann",
  "business": "Firma GmbH",
  "email": "max@example.com",
  "phone": "+49 123 456",
  "message": "Hallo, ich brauche eine neue Website.",
  "website": ""
}
```

### Users

```http
GET    /api/users
POST   /api/users
GET    /api/users/[id]
PATCH  /api/users/[id]
DELETE /api/users/[id]
```

### Test

```http
GET  /api/test
POST /api/test
```

## i18n

- Lokale Routen: `/`, `/de`, `/en`, `/pfl`
- Uebersetzungen liegen in `messages/*.json`

## Deployment

### Docker Compose

```bash
docker-compose up -d
```

### Dockerfile (single image)

```bash
docker build -t pfalz-development .
docker run -p 3000:3000 -e MONGODB_URI=... -e NEXT_PUBLIC_APP_URL=... pfalz-development
```

### Coolify

- Deployment-Typ: Dockerfile
- Port: `3000`
- Healthcheck: `/api/health`

Hinweis: Das Dockerfile baut mit `NEXT_OUTPUT_STANDALONE=1` und startet per `node server.js`.

## Code Quality

- Pre-commit: Prettier + ESLint (lint-staged)
- Pre-push: TypeScript Check
- CI Workflow in `.github/workflows/ci.yml`

## Weiterfuehrende Doku

- `USAGE.md` fuer konkrete Code-Beispiele
- `specs/` fuer fachliche Projektunterlagen

## Repository

https://github.com/NiklasHoffmann/pfalz-development
