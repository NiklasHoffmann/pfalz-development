# Admin on a Dedicated Subdomain

For this project, the cleanest setup is usually:

- public website on `https://pfalz-development.de`
- admin on `https://admin.pfalz-development.de`
- same codebase
- one Coolify app with two domains, or two Coolify apps if you want stricter operational separation later

## Recommended Simple Setup for Coolify

The simplest version does not need an extra Nginx container and does not require a second repository.

Use one deployment and attach both domains in Coolify:

- `pfalz-development.de`
- `admin.pfalz-development.de`

## Exact Coolify Setup

### 1. DNS

Create DNS records for both hosts so they point to the same VPS that runs Coolify.

Typical setup:

- `pfalz-development.de` -> your server IP
- `admin.pfalz-development.de` -> your server IP

If your DNS provider uses `A` and `AAAA` records, add the same values for both hosts.

### 2. Coolify Application

Open your existing application in Coolify and keep using the same repository and build setup.

You do not need:

- a second repository
- a second Dockerfile
- an extra Nginx container

### 3. Add Both Domains in Coolify

In the Coolify application settings, add both domains to the same app:

- `https://pfalz-development.de`
- `https://admin.pfalz-development.de`

Coolify should then handle the reverse proxy and TLS certificates for both hosts.

### 4. Set Environment Variables

Set these values in the Coolify environment section:

```env
NEXT_PUBLIC_APP_URL=https://pfalz-development.de
ADMIN_APP_URL=https://admin.pfalz-development.de
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
ADMIN_ENFORCE_IP_ALLOWLIST=true
ADMIN_ALLOWED_IPS=your.allowed.ip.list
INTAKE_SESSION_SECRET=replace-with-a-long-random-secret
INTAKE_SHARE_LINK_SECRET=replace-with-a-long-random-secret
MONGODB_URI=your.mongodb.connection.string
```

If you already have the other production variables configured, only the important new part is:

```env
NEXT_PUBLIC_APP_URL=https://pfalz-development.de
ADMIN_APP_URL=https://admin.pfalz-development.de
```

### 5. Redeploy

After saving the new environment variables and domains, trigger a redeploy in Coolify.

### 6. Expected Result

After deployment:

- `https://pfalz-development.de` serves the public website
- `https://admin.pfalz-development.de/admin/login` serves the admin login
- `https://pfalz-development.de/admin/login` returns `404`
- admin reset emails point to `admin.pfalz-development.de`

## Verification Checklist for Coolify

Run these checks after deployment:

1. Open `https://pfalz-development.de` and verify the normal website loads.
2. Open `https://admin.pfalz-development.de/admin/login` and verify the admin login loads.
3. Open `https://pfalz-development.de/admin/login` and verify it does not expose the admin login.
4. Trigger a password reset and verify the email link uses `admin.pfalz-development.de`.
5. Log into the admin on the admin subdomain and verify the protected admin pages and admin API actions work.

## Recommended First Production Value

For the first rollout, keep:

```env
ADMIN_ENFORCE_IP_ALLOWLIST=true
```

That keeps the existing extra admin barrier active while the admin is still reachable over the public internet on its own subdomain.

You can simplify that later only if you move the admin behind a stricter private access layer.

Set these environment variables:

```env
NEXT_PUBLIC_APP_URL=https://pfalz-development.de
ADMIN_APP_URL=https://admin.pfalz-development.de
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
ADMIN_ENFORCE_IP_ALLOWLIST=true
ADMIN_ALLOWED_IPS=...
```

If you later move the admin behind a stronger private barrier, you can change:

```env
ADMIN_ENFORCE_IP_ALLOWLIST=false
```

## What the App Does with `ADMIN_APP_URL`

When `ADMIN_APP_URL` is set:

- admin reset links point to the admin subdomain
- admin page metadata points to the admin subdomain
- admin pages and admin API routes only respond on the configured admin host
- requests to admin routes on the public host return `404`

That gives you a clean split without immediately maintaining two separate deployments.

## Coolify Notes

- Coolify already handles the reverse proxy and TLS part for normal app hosting
- you do not need to add a separate Nginx service just to get `admin.pfalz-development.de`
- just add the second domain to the same application and set `ADMIN_APP_URL`

## DNS

Create a DNS record for `admin.pfalz-development.de` that points to the same server as your main site.

## Recommended Security Level

For now, keep the current app-side admin protections:

- signed admin session cookie
- rate limiting
- trusted origin checks
- admin IP allowlist, if enabled

This is the safest simple version while the admin is still reachable via the public internet on its own subdomain.

## Later Upgrade Path

If you want even stricter separation later, the next step is:

1. keep `pfalz-development.de` as the public host
2. move `admin.pfalz-development.de` to a second Coolify deployment
3. optionally put that admin deployment behind Tailscale or another private access layer

You do not need that extra step immediately.
