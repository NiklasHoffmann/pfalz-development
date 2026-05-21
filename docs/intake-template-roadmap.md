# Intake Template Roadmap

## Aktueller Stand

- Zentrale Template-Registry liegt in `src/content/intake/templates/index.ts`.
- Branchenpakete liegen unter `src/content/intake/templates/packages/branchen/`.
- Leistungspakete liegen unter `src/content/intake/templates/packages/leistungen/`.
- Aktuell vorhanden:
  - Fewo-Paket mit `Start`, `Struktur`, `Detail`
  - Restaurant-Paket mit `Start`, `Struktur`, `Detail`
  - Dienstleister-Paket mit `Start`, `Struktur`, `Detail`

## Sinnvolle nächste Schritte

1. Template-Auswahl im Admin nach `Branchen` und `Leistungen` gruppieren.
2. Template-Metadaten ergänzen, z. B. `category`, `industry`, `serviceType`, `difficulty`, `recommendedFor`.
3. Wiederverwendbare Fragebausteine auslagern, z. B. Kontaktblock, Medienblock, Sprachwahl, Website-Funktionsblock.
4. Namen, Slugs und `stepKey`s systematisch vereinheitlichen, bevor viele weitere Pakete dazukommen.
5. Prüfungen für Template-Qualität ergänzen, z. B. gegen doppelte Slugs, doppelte Question-Keys oder inkonsistente Pflichtfelder.

## Spätere Ausbaustufen

1. Einfachen Admin-Bearbeitungsmodus für bestehende Formulare ergänzen, mindestens als JSON-Editor mit Vorschau.
2. Paket-Dokumentation ergänzen, wann `Start`, `Struktur` und `Detail` sinnvoll eingesetzt werden.
3. Paketvarianten pro Ziel aufbauen, z. B. `Lead-Fokus`, `Image-Fokus`, `SEO-Fokus`, `Recruiting-Fokus`.
4. Interne Zuordnung aufbauen, welche Pakete gut zu welchen Branchen oder Leistungen passen.
5. Fragebogen-UX weiter verbessern, z. B. mit besserer Abschlussübersicht oder Restschritt-Hinweisen.

## Mögliche weitere Pakete

### Branchen

- Arztpraxis
- Handwerk
- Kanzlei
- Hotel
- Kosmetik / Beauty
- Fitness / Studio

### Leistungen

- SEO
- Relaunch
- Branding
- Recruiting
- Lokale Landingpages
- Performance / Conversion

## Empfehlung für die nächste Ausbauphase

Wenn die Template-Anzahl weiter wächst, zuerst diese drei Punkte angehen:

1. Admin-Auswahl gruppieren
2. Template-Metadaten einführen
3. Gemeinsame Fragebausteine wiederverwendbar machen
