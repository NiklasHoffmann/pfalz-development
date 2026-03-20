# 14-Tage Plan: Security + Offpage SEO

Stand: 2026-03-20 (aktualisiert)

## Statusuebersicht

### Erledigt

1. Security-Header live:
   - Strict-Transport-Security
   - Content-Security-Policy
   - Referrer-Policy
   - Permissions-Policy
   - X-Frame-Options
   - X-Content-Type-Options
   - Cross-Origin-Opener-Policy
   - Cross-Origin-Resource-Policy
2. HTTPS auf Hauptdomain aktiv und stabil.
3. www auf non-www Redirect auf HTTPS-Ebene aktiv.
4. Canonical/Hreflang auf non-www korrekt sichtbar.
5. SEO-Titel verkuerzt und live.
6. SecurityHeaders-Scan mit Note A dokumentiert.
7. SSL Labs Check fuer Hauptdomain mit Note A dokumentiert.
8. Automatisierter Live-Check verfuegbar ueber `npm run security:check-live`.

### Offen (wichtig)

1. SSL Labs fuer www-Host final dokumentieren.
2. Offpage-Aufbau starten (Citations + Backlinks + Outreach).

### Offen (optional)

1. Redirect-Kette von http://www auf 1 Hop optimieren.
2. CSP langfristig ohne unsafe-inline (nur mit nonce/hash).

## Was wir sofort umgesetzt haben

1. Security-Hardening im Code.
2. Deploy-Validierung mit curl.
3. 14-Tage Umsetzungsplan mit Prioritaeten.
4. Node-basiertes Security-Live-Check-Script angelegt.

## Testprotokoll (durchgelaufen)

Stand: 2026-03-20

1. Lint/Type/Dependency
   - `npm run lint` -> erfolgreich.
   - `npm audit --omit=dev --audit-level=moderate` -> 0 Vulnerabilities.
2. Automatisierter Header-Test
   - `npm run security:check-live` -> bestanden.
   - Gepruefte Header auf `/` und `/en`:
     - Strict-Transport-Security
     - Content-Security-Policy
     - Referrer-Policy
     - Permissions-Policy
     - X-Frame-Options
     - X-Content-Type-Options
     - Cross-Origin-Opener-Policy
     - Cross-Origin-Resource-Policy
3. Redirect-Checks mit curl
   - `https://pfalz-development.de` -> 200.
   - `https://www.pfalz-development.de` -> Redirect auf non-www.
   - `http://pfalz-development.de` -> Redirect auf HTTPS.
   - `http://www.pfalz-development.de` -> Redirect-Kette aktiv (2 Hops, funktional ok).
4. Externe Scans
   - SecurityHeaders: Note A fuer `https://pfalz-development.de/en`.
   - SSL Labs: Note A fuer `pfalz-development.de`.

## Konkrete Aufgaben fuer die naechsten 14 Tage

### Tag 1-2: Abschluss Security-Dokumentation

1. Securityheaders-Scan laufen lassen und Ergebnis sichern.
2. SSL Labs Scans fuer beide Hosts sichern.
3. Ergebnisse in Kurzprotokoll uebernehmen (Datum, Score, offene Punkte).

### Tag 3-4: Redirect/SEO-Re-Check

1. Redirect-Kette erneut pruefen:
   - http://pfalz-development.de
   - https://www.pfalz-development.de
   - http://www.pfalz-development.de
2. Onpage-Tool erneut laufen lassen und Vorher/Nachher notieren.

### Tag 5-7: Local SEO Grundlagen

1. Google Unternehmensprofil vervollstaendigen.
2. NAP-Daten konsistent in allen Profilen pflegen.
3. Eintraege bei Das Oertliche, Gelbe Seiten, Bing Places erstellen/pruefen.

### Tag 8-10: Backlink-Welle 1

1. 5-10 lokale Eintraege mit Link aufbauen.
2. Drei konkrete Partnerlinks anfragen.
3. Ziel-URL fuer alle Links standardisieren:
   - https://pfalz-development.de/

### Tag 11-12: Link-Magnet Content

1. Eine lokale Ratgeberseite erstellen.
2. Von Startseite intern auf den Ratgeber verlinken.
3. 5 direkte Outreach-Kontakte anschreiben.

### Tag 13-14: Messung und Priorisierung

1. Search Console: Impressionen, Klicks, Indexierung, Queries.
2. Offpage: verweisende Domains und neue Links erfassen.
3. 30-Tage-Fortsetzungsplan festlegen.

## KPI-Ziele

1. Security-Header Score deutlich verbessert.
2. +5 bis +15 neue verweisende Domains.
3. 100% konsistente NAP-Daten in Kernprofilen.
4. Keine kritischen Onpage-Fehler mehr.
