# Tailscale-Protected Admin on a VPS

This project serves the public website and the internal admin area from the same Next.js application. The recommended way to keep the public site reachable while limiting admin access to your own devices is:

1. keep the public website reachable on your normal domain
2. install Tailscale on the VPS and on your personal devices
3. access the admin only over the VPS Tailscale address or MagicDNS hostname
4. let your reverse proxy and Tailscale be the main network barrier for admin access

## Recommended Default

For this project, the simplest production setup is:

- public website stays public on your normal domain
- admin is only reachable through Tailscale
- the app keeps normal admin login and session checks
- `ADMIN_ENFORCE_IP_ALLOWLIST=false` so you do not have to maintain per-device IPs in the app

This is usually the best tradeoff for a small private admin used only from your own devices.

## Important Network Detail

If you enable the app-side admin allowlist, this application reads the client IP from `X-Forwarded-For` or `X-Real-IP`.

That means:

- a reverse proxy on the VPS should forward the real client IP to the Next.js app
- if you access the Node process directly on port `3000`, the app can resolve the client as `anonymous` and reject admin access

Recommended: run the Next.js app behind an HTTP reverse proxy such as Nginx or Caddy on the VPS.

## Recommended Topology

- public website: `https://pfalz-development.de`
- internal admin access: `https://<machine-name>.<tailnet>.ts.net/admin/login` or `https://<tailscale-ip>/admin/login`
- Next.js app: local backend on `127.0.0.1:3000`
- reverse proxy: forwards requests to `127.0.0.1:3000` and sets forwarded IP headers

## Reverse Proxy Requirement

Example headers that must be forwarded to the app:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

Without these headers, `ADMIN_ALLOWED_IPS` cannot reliably distinguish your Tailscale devices from other requests.

## Step-by-Step Setup

### 1. Install Tailscale on the VPS

Follow the standard Linux installation for your distribution and authenticate the server into your tailnet.

Recommended extras:

- enable MagicDNS in the Tailscale admin console
- disable key expiry on the VPS node or use a tagged node
- enable Tailscale SSH if you also want private SSH access to the server

### 2. Install Tailscale on your devices

Install Tailscale on:

- smartphone
- tablet
- laptop
- desktop

Log all devices into the same tailnet.

### 3. Disable the app-side IP allowlist

Set this in production:

```env
ADMIN_ENFORCE_IP_ALLOWLIST=false
```

That keeps the app simple and leaves the network restriction to Tailscale plus your VPS reverse proxy.

### 4. Restart the application

After changing the environment, restart the container or service so the new setting is loaded.

### 5. Access the admin only over Tailscale

Use the VPS Tailscale hostname or Tailscale IP, not the public domain, for admin work.

Examples:

- `https://my-vps.my-tailnet.ts.net/admin/login`
- `https://100.101.102.50/admin/login`

The public domain should keep serving the public site normally, while your proxy should block public admin access.

## Optional Extra Layer

If you want a second network-level check inside the app, you can still keep the allowlist enabled.

### 1. Collect the Tailscale IPv4 addresses of your devices

On each device, retrieve the Tailscale IP. Depending on platform, you can read it in the Tailscale app or with:

```bash
tailscale ip -4
```

### 2. Configure the admin allowlist

```env
ADMIN_ENFORCE_IP_ALLOWLIST=true
```

Set `ADMIN_ALLOWED_IPS` in production to the comma-separated list of your Tailscale device IPs.

Example:

```env
ADMIN_ALLOWED_IPS=100.101.102.10,100.101.102.11,100.101.102.12,100.101.102.13
```

Do not use your changing home, office, or mobile public IPs here if the goal is device-based private access through Tailscale.

### 3. Restart the application

After changing the environment, restart the container or service so the new allowlist is loaded.

### 4. Access the admin only over Tailscale

Use the VPS Tailscale hostname or Tailscale IP, not the public domain, for admin work.

Examples:

- `https://my-vps.my-tailnet.ts.net/admin/login`
- `https://100.101.102.50/admin/login`

The public domain can keep serving the public site normally, but the admin entry points should return `403` for non-allowlisted IPs.

## Tailscale SSH

If you also want private SSH access to the VPS, enable Tailscale SSH on the server and restrict it in your Tailscale ACLs.

Typical host command:

```bash
sudo tailscale set --ssh
```

## If You Do Not Yet Have a Reverse Proxy

Add one before relying on `ADMIN_ALLOWED_IPS` for Tailscale-based admin access.

Why:

- this application expects forwarded client IP headers
- direct requests to the Node process may not provide them
- a small VPS reverse proxy solves that and keeps the app logic unchanged

## Verification Checklist

After setup, confirm all of the following:

1. the public homepage still works on the normal domain
2. `/admin/login` on the public domain is blocked by your public proxy rules
3. the admin login page works over the Tailscale hostname or Tailscale IP
4. login, forgot-password, reset-password, and protected admin pages work from your Tailscale devices
5. if `ADMIN_ENFORCE_IP_ALLOWLIST=true`, a non-allowlisted browser receives `403` for admin auth routes and no admin page content
