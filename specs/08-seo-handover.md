# SEO Handover (Technischer Auszug)

Stand: 2026-03-20
Projekt: pfalz-development.de

## 1) Domain, Basis-URL, Brand

- Basis-Konfiguration in src/config/site.ts
- siteConfig.url: process.env.NEXT_PUBLIC_APP_URL oder Fallback http://localhost:3000
- Brand/Name: Pfalz Development
- Globale Description: Webdesign und professionelle Websites fuer Unternehmen in der Pfalz - Neustadt an der Weinstrasse, Landau und Umgebung.
- OG-Image: /logo-pfalz-development.webp

## 2) Internationalisierung und URL-Strategie

- Locales: de, en, pfl
- Default-Locale: de
- Prefix-Strategie: as-needed (de ohne Prefix, en/pfl mit Prefix)
- Routing-Quelle: src/routing.ts

## 3) Globale SEO-Metadaten (Layout)

Datei: src/app/[locale]/layout.tsx

- metadataBase: new URL(siteConfig.url)
- Title-Template:
  - default: siteConfig.name
  - template: %s | Pfalz Development
- Description: siteConfig.description
- Icons: /pfalz-development-favicon.ico
- Keywords (global):
  - Webdesign Pfalz
  - Website erstellen lassen Pfalz
  - Webentwickler Neustadt an der Weinstrasse
  - Webdesign Landau
  - Website fuer Ferienwohnung
  - Website fuer Restaurant
  - Lokale SEO Pfalz
- Open Graph (global):
  - type: website
  - locale: de_DE
  - url: siteConfig.url
  - title/description/siteName aus siteConfig
  - image: siteConfig.ogImage (1200x630)
- Twitter (global):
  - card: summary_large_image
  - title/description/images aus siteConfig
- Alternates (global):
  - canonical: /
  - hreflang: de=/, en=/en, pfl=/pfl, x-default=/
- Robots-Meta (global):
  - index: true
  - follow: true
  - googleBot: max-video-preview -1, max-image-preview large, max-snippet -1
- Weitere Metadaten:
  - geo.region: DE-RP
  - geo.placename: Neustadt an der Weinstrasse
- Viewport:
  - width=device-width
  - initialScale=1
  - viewportFit=cover
  - theme-color: light #fcfbf7, dark #2c2623

## 4) Seiten-Metadaten Homepage pro Locale

Datei: src/app/[locale]/page.tsx

- generateMetadata() setzt pro Locale:
  - title: common.home.headline
  - description: common.home.subheadline
  - canonical: locale-basiert (de=/, en=/en, pfl=/pfl)
  - hreflang: de/en/pfl/x-default
  - Open Graph:
    - locale: de_DE (de/pfl), en_US (en)
    - url: canonicalUrl
    - title/description: aus Übersetzungen
    - image: siteConfig.ogImage (1200x630)
  - Twitter:
    - card: summary_large_image
    - title/description: aus Übersetzungen
    - image: siteConfig.ogImage
- Homepage-Keywords (aktuell statisch, deutsch):
  - Website erstellen lassen Pfalz
  - Webdesign Neustadt an der Weinstrasse
  - Webdesign Landau in der Pfalz
  - Webentwickler Pfalz
  - Homepage fuer Unternehmen Pfalz
  - Website fuer Ferienwohnung Pfalz
  - Website fuer Restaurant Pfalz
  - Webdesign Bad Duerkheim
  - Webdesign Speyer
  - Webdesign Ludwigshafen

## 5) Strukturierte Daten (JSON-LD)

Datei: src/app/[locale]/page.tsx

Es werden drei JSON-LD Blöcke eingebunden:

1. WebSite

- @type: WebSite
- @id: {siteConfig.url}#website
- url: siteConfig.url
- inLanguage: de-DE oder en-US
- name: siteConfig.name
- publisher.name/url: siteConfig

2. ProfessionalService

- @type: ProfessionalService
- @id: {canonicalUrl}#professional-service
- name/url/inLanguage
- contact:
  - email: kontakt@pfalz-development.de
  - telephone: +4963211876643
  - contactPoint (customer support, DE, availableLanguage de/en)
- sameAs: GitHub-Profil
- areaServed:
  - Neustadt an der Weinstrasse
  - Landau in der Pfalz
  - Bad Duerkheim
  - Speyer
  - Ludwigshafen
  - Pfalz
- PostalAddress:
  - Froebelstrasse 20
  - 67433
  - Neustadt an der Weinstrasse
  - DE
- serviceType:
  - Webdesign
  - Webentwicklung
  - Website Erstellung
  - Website Wartung
  - Hosting

3. FAQPage

- @type: FAQPage
- inLanguage: de-DE oder en-US
- mainEntity aus übersetzten FAQ-Daten (Frage/Antwort)

## 6) Robots und Indexierungssteuerung

Datei: src/app/robots.ts

- userAgent: \*
- allow: /
- disallow:
  - /api/
  - /admin/
- sitemap: {siteConfig.url}/sitemap.xml

Hinweis: Zusätzlich existiert robots-Meta in layout.tsx mit index/follow=true.

## 7) XML Sitemap

Datei: src/app/sitemap.ts

Enthaltene URLs:

- /
- /en
- /pfl
- /impressum
- /datenschutz
- /en/impressum
- /en/datenschutz
- /pfl/impressum
- /pfl/datenschutz

Sitemap-Felder:

- lastModified: aktuelles Datum zur Build-Zeit
- changeFrequency:
  - monthly fuer Impressum/Datenschutz
  - weekly fuer sonstige Seiten
- priority:
  - 1.0 fuer /
  - 0.9 fuer /en und /pfl
  - 0.5 fuer Rechtstexte

## 8) Content-Quellen fuer SEO-relevante Texte

- Homepage Title/Description je Locale kommen aus:
  - messages/de.json -> common.home.headline, common.home.subheadline
  - messages/en.json -> common.home.headline, common.home.subheadline
  - messages/pfl.json -> common.home.headline, common.home.subheadline
- FAQ-Inhalte fuer FAQPage kommen aus messages.\*.json -> common.home.faq.items

## 9) Wichtige Prüfungspunkte fuer SEO-Auditor

- Ist NEXT_PUBLIC_APP_URL in Produktion korrekt gesetzt (kein localhost)?
- Sind die Homepage-Keywords je Locale lokalisiert gewünscht oder bewusst DE-zentriert?
- Soll availableLanguage im ProfessionalService um pfl erweitert werden?
- Sind zusätzliche Marketing-/Leistungsseiten für Longtail geplant (derzeit Fokus auf Home + Legal)?
- Ist gewünscht, dass rechtliche Seiten in der Sitemap nur priority 0.5 haben?
