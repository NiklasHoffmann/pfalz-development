# Pfalz Development

This repository contains a production-oriented Next.js application built around three connected surfaces: a multilingual marketing site, a protected client intake flow, and an internal admin area.

From a GitHub portfolio perspective, this project is less about presenting a service brand and more about showing how I design and ship a real application that combines public pages, internal workflows, forms, authentication, uploads, and operational concerns in one codebase.

## What This Repository Demonstrates

- multilingual routing with `next-intl` and locale-aware page structure
- public-facing marketing pages with SEO-oriented metadata and route coverage
- validated contact handling with rate limiting, honeypot protection, optional Turnstile, and SMTP delivery
- protected intake questionnaires with shareable access links, draft saving, step-based flows, and file uploads
- internal admin tooling for submissions, forms, staff access, access links, and audit logging
- containerized local or server deployment with health checks and a standalone production build

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- next-intl
- MongoDB and Mongoose
- Zod and React Hook Form
- Nodemailer
- Winston

## Product Areas

### Public Website

- App Router based marketing site
- locales: `de`, `en`, `pfl`
- default locale `de` without prefix, `en` and `pfl` with prefix
- service, industry, location, and project entry pages
- SEO support through sitemap, robots, metadata, and structured page setup

### Contact and Lead Handling

- validated contact API
- anti-spam honeypot field
- API rate limiting
- optional Cloudflare Turnstile support
- optional SMTP delivery for contact requests

### Intake and Internal Admin

- protected questionnaire routes for individual clients
- step-based questionnaire UI with file uploads and draft persistence
- internal admin login and secured first-user bootstrap flow
- admin interfaces for forms, staff, access links, submissions, and audit trails

## Project Structure

| Area                    | Purpose                                                                          |
| ----------------------- | -------------------------------------------------------------------------------- |
| `src/app/[locale]`      | Public routes, localized layouts, protected intake pages, and admin entry points |
| `src/app/api/contact`   | Contact form processing                                                          |
| `src/app/api/health`    | Health check endpoint for monitoring and deployment                              |
| `src/app/api/intake/*`  | Intake access resolution, uploads, and submission lifecycle                      |
| `src/app/api/admin/*`   | Admin authentication, session handling, and staff bootstrap                      |
| `src/components/admin`  | Internal admin interface components                                              |
| `src/components/intake` | Questionnaire UI components                                                      |
| `messages/*.json`       | Translation files for `de`, `en`, and `pfl`                                      |

## Why This Project Matters

The interesting part is not the marketing website alone. The repository combines several concerns that are often split across separate tools or only partially implemented in smaller projects:

- content-heavy public pages
- user input and validation
- protected internal workflows
- file handling
- operational safeguards and runtime safety checks
- localization
- deployable infrastructure

That mix makes it a stronger representation of day-to-day product engineering than a pure landing page or a framework starter.

## Local Development

### Prerequisites

- Node.js 20+
- npm
- MongoDB locally or MongoDB Atlas

### Install

```bash
git clone https://github.com/NiklasHoffmann/pfalz-development.git
cd <repo-folder>
npm install
```

Copy `.env.example` to `.env.local` and adjust the values.

### Minimum required environment variables

```env
MONGODB_URI=mongodb://localhost:27017/nextjs-starter
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_APP_URL=
```

These two values are enough for the public site in local development. If you want to use intake or admin flows locally, also set the auth and signing secrets from the production section below.

### Recommended for contact handling

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
```

### Important for intake and admin in production

```env
INTAKE_SESSION_SECRET=
INTAKE_SHARE_LINK_SECRET=
ADMIN_API_KEY=
ADMIN_APP_URL=
ADMIN_ENFORCE_IP_ALLOWLIST=true
ADMIN_ALLOWED_IPS=
ADMIN_SESSION_SECRET=
ADMIN_PROXY_SHARED_SECRET=
```

Notes:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` must either both be set or both be omitted.
- `INTAKE_SESSION_SECRET` and `INTAKE_SHARE_LINK_SECRET` are required in production for signed intake access.
- `ADMIN_SESSION_SECRET` is required for admin authentication in every environment.
- `ADMIN_APP_URL` is optional. Set it when the admin should live on a dedicated host such as `https://admin.pfalz-development.de`.
- For a private Tailscale admin, set `ADMIN_APP_URL` to the VPS MagicDNS host such as `https://my-vps.my-tailnet.ts.net`.
- `ADMIN_ENFORCE_IP_ALLOWLIST` defaults to `true`. Set it to `false` if your reverse proxy or private network is the primary admin barrier.
- `ADMIN_ALLOWED_IPS` should be set whenever `ADMIN_ENFORCE_IP_ALLOWLIST=true`. Without it, the admin area is only reachable from local loopback addresses.
- `ADMIN_PROXY_SHARED_SECRET` is only needed when a private local reverse proxy injects the admin host into a public app gateway such as Coolify or Traefik. It must match the value configured in that proxy exactly.
- First-user bootstrap without `ADMIN_API_KEY` is restricted to local development requests only.
- The complete template lives in `.env.example`.

### Run locally

```bash
npm run dev
```

The app then runs on `http://localhost:3000`.

## Representative Routes

| Route                | Purpose                        |
| -------------------- | ------------------------------ |
| `/`                  | German default landing page    |
| `/en`                | English locale entry           |
| `/pfl`               | Palatine locale entry          |
| `/leistungen/*`      | Service pages                  |
| `/branchen/*`        | Industry pages                 |
| `/orte/*`            | Location pages                 |
| `/fragebogen/[slug]` | Protected client questionnaire |
| `/admin/login`       | Internal admin login           |
| `/admin/*`           | Internal admin workspace       |

## Representative APIs

| API                          | Purpose                                     |
| ---------------------------- | ------------------------------------------- |
| `/api/contact`               | Process contact requests                    |
| `/api/health`                | Health checks for monitoring and deployment |
| `/api/intake/access/resolve` | Resolve intake access links                 |
| `/api/intake/submissions/*`  | Save answers and finalize submissions       |
| `/api/intake/uploads`        | Handle questionnaire file uploads           |
| `/api/admin/auth/*`          | Admin login, logout, and session checks     |
| `/api/admin/staff/bootstrap` | Bootstrap the first internal staff user     |

## Scripts

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
npm run security:check-live
```

## Deployment

### Docker Compose

```bash
docker compose up --build
```

Important: the checked-in `docker-compose.yml` runs the app with `NODE_ENV=production`. That means the container needs the production auth and signing secrets before startup, otherwise environment validation will stop the app.

At minimum, provide these values in the deployment environment or compose override:

```env
MONGODB_URI=
NEXT_PUBLIC_APP_URL=
ADMIN_APP_URL=
INTAKE_SESSION_SECRET=
INTAKE_SHARE_LINK_SECRET=
ADMIN_SESSION_SECRET=
ADMIN_ENFORCE_IP_ALLOWLIST=true
ADMIN_ALLOWED_IPS=
```

For a Tailscale-only admin, use:

```env
NEXT_PUBLIC_APP_URL=https://pfalz-development.de
ADMIN_APP_URL=https://my-vps.my-tailnet.ts.net
ADMIN_ENFORCE_IP_ALLOWLIST=false
ADMIN_PROXY_SHARED_SECRET=
```

The provided compose setup starts:

- the Next.js app on port `3000`
- MongoDB on port `27017`

### Dockerfile

```bash
docker build -t pfalz-development .
docker run -p 3000:3000 \
	-e MONGODB_URI=... \
	-e NEXT_PUBLIC_APP_URL=https://your-domain.example \
	-e ADMIN_APP_URL=https://admin.your-domain.example \
	-e INTAKE_SESSION_SECRET=... \
	-e INTAKE_SHARE_LINK_SECRET=... \
	-e ADMIN_SESSION_SECRET=... \
	-e ADMIN_ENFORCE_IP_ALLOWLIST=true \
	-e ADMIN_ALLOWED_IPS=... \
	pfalz-development
```

If the admin should only be reachable inside Tailscale, set `ADMIN_APP_URL` to the Tailscale hostname and switch `ADMIN_ENFORCE_IP_ALLOWLIST=false`.

If that private admin host is forwarded through a local proxy into Coolify or Traefik, also set `ADMIN_PROXY_SHARED_SECRET` and configure the proxy to send matching `X-Admin-Forwarded-Host` and `X-Admin-Proxy-Secret` headers.

The image uses a standalone Next.js production build and starts with `node server.js`.

### Health Checks

- endpoint: `/api/health`
- already wired into the Docker image health check

## Code Quality

- ESLint for static analysis
- Prettier for formatting
- Husky and `lint-staged` for local Git hooks
- TypeScript checks via `npm run type-check`
- CI workflow in `.github/workflows/ci.yml`

## Additional Documentation

- `USAGE.md` for implementation examples
- `docs/admin-subdomain.md` for a clean `admin.<domain>` setup, including Coolify
- `docs/tailscale-admin-vps.md` for a private Tailscale-based admin setup on a VPS
- Private planning, client, and operating documents are intentionally kept outside the public repository

## License

This repository is proprietary and not licensed for public reuse.
All rights reserved.
See the `LICENSE` file for details.

## Repository

https://github.com/NiklasHoffmann/pfalz-development
