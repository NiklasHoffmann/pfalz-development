# 14-Tage Plan: Security + Offpage SEO

Stand: 2026-03-20

## Ziel
- Security-Hardening technisch abschliessen.
- Offpage-Signale (Backlinks, Local Signals, Brand Mentions) strukturiert aufbauen.

## Tag 1-2: Security Deployment + Verifikation
1. Deployment ausrollen, damit neue Security-Header live sind.
2. Live-Checks ausfuehren:
   - `curl -I https://pfalz-development.de`
   - `curl -I https://pfalz-development.de/en`
3. Soll-Header pruefen:
   - Strict-Transport-Security
   - Content-Security-Policy
   - Referrer-Policy
   - Permissions-Policy
   - X-Frame-Options
   - X-Content-Type-Options
4. Externe Tests:
   - https://securityheaders.com/
   - SSL Labs fuer `pfalz-development.de` und `www.pfalz-development.de`

## Tag 3-4: Redirect/Canonical Kontrolle
1. Redirect-Kette pruefen:
   - `http://pfalz-development.de`
   - `https://www.pfalz-development.de`
   - `http://www.pfalz-development.de`
2. SEO-Crawler erneut laufen lassen und dokumentieren:
   - Onpage Score
   - Meta-Angaben
   - Seitenstruktur
3. Sicherstellen, dass Canonical/Hreflang auf non-www Host zeigen.

## Tag 5-7: Local SEO Grundlagen
1. Google Unternehmensprofil optimieren:
   - Hauptkategorie, Beschreibung, Oeffnungszeiten
   - Leistungen, Fotos, Kontaktwege
2. Konsistente NAP-Daten festziehen (Name/Adresse/Telefon) fuer alle Plattformen.
3. Wichtigste Branchenprofile anlegen oder korrigieren (D-A-CH lokal):
   - Das Oertliche
   - Gelbe Seiten
   - Bing Places

## Tag 8-10: Erste Backlink-Welle
1. 5-10 lokale/verwandte Eintraege mit Link aufbauen.
2. Partner/Netzwerk anschreiben fuer 3 konkrete Verlinkungen:
   - Referenzen
   - Partnerseiten
   - Vereins-/Projektseiten
3. Zielseite fuer Links standardisieren:
   - `https://pfalz-development.de/`

## Tag 11-12: Content als Link-Magnet
1. Eine neue, teilbare Seite erstellen (z. B. regionaler Leitfaden):
   - "Website-Checkliste fuer lokale Betriebe in der Pfalz"
2. Interne Verlinkung auf diese Seite von der Startseite.
3. Outreach an 5 lokale Kontakte mit Mehrwert-Hinweis.

## Tag 13-14: Messung und Feinjustierung
1. Search Console pruefen:
   - Indexierung
   - Abdeckung
   - Core Web Vitals
2. SEO-Tool Vergleich alt/neu dokumentieren.
3. Nächste 30 Tage priorisieren:
   - 2 neue Backlinks pro Woche
   - 1 neuer lokaler Ratgeber pro Monat

## KPI-Ziele (realistisch)
- Security Headers Bewertung deutlich verbessert.
- Backlinks: +5 bis +15 neue verweisende Domains.
- Local Citations: 100% konsistente NAP-Daten.
- Onpage-Checks: keine kritischen Meta/Struktur-Fehler mehr.
