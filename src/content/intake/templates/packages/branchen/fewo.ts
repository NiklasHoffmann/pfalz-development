import type { IntakeTemplateDefinition } from '@/types/intake';

export const fewoStartTemplate: IntakeTemplateDefinition = {
  title: 'Fewo Startfragebogen Website-Ausrichtung',
  slug: 'fewo-startfragebogen-website-ausrichtung',
  description:
    'Kurzer Startfragebogen zur groben Ausrichtung, Struktur und Funktion einer Ferienwohnungs-Website.',
  status: 'active',
  version: 1,
  formType: 'custom',
  defaultLocale: 'de',
  sections: [
    {
      id: 'fewo-start-ausgangslage',
      title: 'Ausgangslage',
      order: 1,
      description: 'Kurze Einordnung des Projekts und der Ausgangssituation.',
      stepKey: 'ausgangslage',
      questions: [
        {
          id: 'fewo-start-project-type',
          key: 'projectType',
          fieldType: 'radio',
          label: 'Was trifft auf das Projekt am ehesten zu?',
          required: true,
          order: 1,
          options: [
            { label: 'Es soll eine neue Website entstehen', value: 'neu' },
            {
              label: 'Eine bestehende Website soll überarbeitet werden',
              value: 'relaunch',
            },
            {
              label: 'Es gibt bisher nur Buchungsplattformen oder Profile',
              value: 'plattformen',
            },
          ],
        },
        {
          id: 'fewo-start-main-goal',
          key: 'mainGoal',
          fieldType: 'checkbox-group',
          label: 'Was soll die Website hauptsächlich erreichen?',
          helpText: 'Mehrfachauswahl möglich.',
          required: true,
          order: 2,
          options: [
            { label: 'Mehr direkte Anfragen', value: 'direkte-anfragen' },
            { label: 'Mehr Direktbuchungen', value: 'direktbuchungen' },
            {
              label: 'Professioneller auftreten',
              value: 'professioneller-auftritt',
            },
            {
              label: 'Bessere Sichtbarkeit bei Google',
              value: 'sichtbarkeit',
            },
            {
              label: 'Wichtige Infos übersichtlich bereitstellen',
              value: 'informationen',
            },
          ],
          validationRules: {
            minSelections: 1,
          },
        },
      ],
    },
    {
      id: 'fewo-start-aufbau',
      title: 'Aufbau',
      order: 2,
      description: 'Welche Grundstruktur die Website haben soll.',
      stepKey: 'aufbau',
      questions: [
        {
          id: 'fewo-start-page-scope',
          key: 'pageScope',
          fieldType: 'radio',
          label: 'Wie umfangreich soll die Website ungefähr werden?',
          required: true,
          order: 1,
          options: [
            { label: 'Eher kompakt', value: 'kompakt' },
            { label: 'Mittelgroß', value: 'mittel' },
            { label: 'Etwas umfangreicher', value: 'umfangreich' },
          ],
        },
        {
          id: 'fewo-start-core-sections',
          key: 'coreSections',
          fieldType: 'checkbox-group',
          label: 'Welche Bereiche soll die Website auf jeden Fall haben?',
          helpText: 'Mehrfachauswahl möglich.',
          required: true,
          order: 2,
          options: [
            { label: 'Startseite', value: 'startseite' },
            { label: 'Ausstattung', value: 'ausstattung' },
            { label: 'Preise', value: 'preise' },
            { label: 'Galerie', value: 'galerie' },
            { label: 'Lage & Umgebung', value: 'lage-umgebung' },
            { label: 'Kontakt / Anfrage', value: 'kontakt-anfrage' },
            { label: 'Bewertungen', value: 'bewertungen' },
            { label: 'FAQ', value: 'faq' },
          ],
          validationRules: {
            minSelections: 1,
          },
        },
      ],
    },
    {
      id: 'fewo-start-funktionen',
      title: 'Funktionen',
      order: 3,
      description: 'Welche Kernfunktionen vorgesehen sind.',
      stepKey: 'funktionen',
      questions: [
        {
          id: 'fewo-start-features',
          key: 'features',
          fieldType: 'checkbox-group',
          label: 'Welche Funktionen soll die Website enthalten?',
          helpText: 'Mehrfachauswahl möglich.',
          required: false,
          order: 1,
          options: [
            { label: 'Kontaktformular', value: 'kontaktformular' },
            { label: 'Buchungsanfrage', value: 'buchungsanfrage' },
            { label: 'Verfügbarkeitskalender', value: 'kalender' },
            { label: 'Interaktive Karte', value: 'karte' },
            { label: 'WhatsApp-Kontakt', value: 'whatsapp' },
            { label: 'Mehrsprachigkeit', value: 'mehrsprachigkeit' },
          ],
        },
        {
          id: 'fewo-start-booking-flow',
          key: 'bookingFlow',
          fieldType: 'radio',
          label: 'Wie sollen Anfragen oder Buchungen grundsätzlich laufen?',
          required: true,
          order: 2,
          options: [
            {
              label: 'Über Kontaktformular oder Telefon',
              value: 'kontakt',
            },
            {
              label: 'Über Anfrageformular auf der Website',
              value: 'anfrageformular',
            },
            {
              label: 'Weiterleitung auf externe Plattform',
              value: 'extern',
            },
            { label: 'Noch offen', value: 'offen' },
          ],
        },
      ],
    },
    {
      id: 'fewo-start-prioritaeten',
      title: 'Prioritäten',
      order: 4,
      description: 'Was im ersten Schritt am wichtigsten ist.',
      stepKey: 'prioritaeten',
      questions: [
        {
          id: 'fewo-start-priority-focus',
          key: 'priorityFocus',
          fieldType: 'checkbox-group',
          label: 'Was ist im ersten Schritt besonders wichtig?',
          helpText: 'Mehrfachauswahl möglich.',
          required: true,
          order: 1,
          options: [
            { label: 'Schnell online gehen', value: 'schnell-online' },
            {
              label: 'Professioneller und klarer Aufbau',
              value: 'klarer-aufbau',
            },
            { label: 'Mehr direkte Anfragen', value: 'anfragen' },
            { label: 'Gute mobile Nutzbarkeit', value: 'mobil' },
            {
              label: 'Später gut erweiterbar bleiben',
              value: 'erweiterbar',
            },
          ],
          validationRules: {
            minSelections: 1,
          },
        },
        {
          id: 'fewo-start-notes',
          key: 'additionalNotes',
          fieldType: 'textarea',
          label:
            'Gibt es noch etwas Wichtiges zur groben Ausrichtung der Website?',
          placeholder: 'Freitext für zusätzliche Hinweise',
          required: false,
          order: 2,
        },
      ],
    },
  ],
};

export const fewoStructureTemplate: IntakeTemplateDefinition = {
  title: 'Grundsatzfragebogen Ferienwohnung Website-Struktur',
  slug: 'grundsatzfragebogen-ferienwohnung-struktur',
  description:
    'Kurzer Grundsatzfragebogen für Aufbau, Struktur und Funktionsumfang einer Ferienwohnungs-Website.',
  status: 'active',
  version: 1,
  formType: 'custom',
  defaultLocale: 'de',
  sections: [
    {
      id: 'fewo-structure-unterkunftsmodell',
      title: 'Unterkunftsmodell',
      order: 1,
      description:
        'Wie Angebot, Einheiten und Informationsbedarf aufgebaut sind.',
      stepKey: 'unterkunftsmodell',
      questions: [
        {
          id: 'fewo-structure-accommodation-model',
          key: 'accommodationModel',
          fieldType: 'radio',
          label: 'Wie ist das Angebot grundsätzlich aufgebaut?',
          required: true,
          order: 1,
          options: [
            {
              label: 'Eine einzelne Ferienwohnung steht im Mittelpunkt',
              value: 'single-unit',
            },
            {
              label: 'Mehrere Ferienwohnungen oder Einheiten gehören zusammen',
              value: 'multiple-units',
            },
            {
              label:
                'Es gibt zusätzliche Angebote wie Arrangements oder Extras',
              value: 'extras-offers',
            },
            {
              label: 'Die genaue Struktur ist noch offen',
              value: 'open',
            },
          ],
        },
        {
          id: 'fewo-structure-existing-presence',
          key: 'existingPresenceUrl',
          fieldType: 'url',
          label: 'Falls schon etwas vorhanden ist: Website- oder Profil-Link',
          placeholder: 'https://...',
          required: false,
          order: 2,
        },
        {
          id: 'fewo-structure-pre-inquiry-information',
          key: 'preInquiryInformation',
          fieldType: 'textarea',
          label:
            'Welche Informationen sollen Gäste vor einer Anfrage unbedingt verstanden haben?',
          placeholder:
            'Zum Beispiel Eignung für Familien, Lage, Ausstattung, Preise oder Buchungsablauf',
          required: true,
          order: 3,
        },
      ],
    },
    {
      id: 'fewo-structure-aufbau',
      title: 'Aufbau & Seiten',
      order: 2,
      description: 'Welche Bereiche und Seitentypen geplant sind.',
      stepKey: 'aufbau-seiten',
      questions: [
        {
          id: 'fewo-structure-page-architecture',
          key: 'pageArchitecture',
          fieldType: 'radio',
          label: 'Welche Seitenlogik passt am ehesten?',
          required: true,
          order: 1,
          options: [
            {
              label: 'Eine kompakte Seite mit klaren Abschnitten reicht aus',
              value: 'one-pager',
            },
            {
              label: 'Ein kompakter mehrseitiger Aufbau ist sinnvoll',
              value: 'compact-multipage',
            },
            {
              label:
                'Mehrere klar getrennte Unterseiten sollen Inhalte aufteilen',
              value: 'content-sections',
            },
            {
              label: 'Einzelne Unterkünfte oder Themen brauchen eigene Seiten',
              value: 'separate-unit-pages',
            },
          ],
        },
        {
          id: 'fewo-structure-dedicated-subpages',
          key: 'dedicatedSubpages',
          fieldType: 'checkbox-group',
          label: 'Welche Themen sollen bewusst eigene Unterseiten bekommen?',
          helpText: 'Mehrfachauswahl möglich.',
          required: false,
          order: 2,
          options: [
            {
              label: 'Unterkunft im Überblick',
              value: 'overview-page',
            },
            { label: 'Ausstattung', value: 'amenities-page' },
            { label: 'Preise', value: 'pricing-page' },
            { label: 'Galerie', value: 'gallery-page' },
            { label: 'Lage & Umgebung', value: 'location-page' },
            { label: 'Bewertungen', value: 'reviews-page' },
            { label: 'FAQ', value: 'faq-page' },
            { label: 'Anreise / Check-in', value: 'arrival-page' },
            {
              label: 'Buchung / Anfrage',
              value: 'booking-page',
            },
          ],
        },
        {
          id: 'fewo-structure-navigation-focus',
          key: 'navigationFocus',
          fieldType: 'textarea',
          label: 'Wie soll die Navigation gedacht sein?',
          placeholder:
            'Zum Beispiel sehr kompakt, wenige Klicks, klare Priorität auf Anfrage oder getrennt nach Themen',
          required: false,
          order: 3,
        },
      ],
    },
    {
      id: 'fewo-structure-entscheidungslogik',
      title: 'Entscheidungslogik',
      order: 3,
      description:
        'Welche Informationen Gäste ohne Rückfrage verstehen sollen.',
      stepKey: 'entscheidungslogik',
      questions: [
        {
          id: 'fewo-structure-decision-questions',
          key: 'decisionQuestions',
          fieldType: 'checkbox-group',
          label:
            'Welche Fragen sollen Gäste möglichst ohne Rückfrage klären können?',
          helpText: 'Mehrfachauswahl möglich.',
          required: true,
          order: 1,
          options: [
            { label: 'Preisniveau / Preislogik', value: 'pricing' },
            { label: 'Personenzahl / Belegung', value: 'occupancy' },
            { label: 'Haustiere', value: 'pets' },
            { label: 'Kinderfreundlichkeit', value: 'families' },
            { label: 'Parkplatz / Anreise', value: 'parking-arrival' },
            { label: 'WLAN / Arbeiten vor Ort', value: 'wifi-work' },
            { label: 'Verfügbarkeit / Zeitraum', value: 'availability' },
            { label: 'Lage / Umgebung', value: 'location-area' },
          ],
          validationRules: {
            minSelections: 1,
          },
        },
        {
          id: 'fewo-structure-primary-cta-placement',
          key: 'primaryCtaPlacement',
          fieldType: 'radio',
          label: 'Wie sichtbar soll der Haupt-Kontaktweg auf der Website sein?',
          required: true,
          order: 2,
          options: [
            {
              label: 'Sehr prominent direkt am Anfang und mehrfach im Verlauf',
              value: 'high-visibility',
            },
            {
              label: 'Klar sichtbar, aber nur an passenden Stellen',
              value: 'balanced-visibility',
            },
            {
              label: 'Eher zurückhaltend, damit Inhalte zuerst wirken',
              value: 'low-visibility',
            },
            { label: 'Noch offen', value: 'open' },
          ],
        },
        {
          id: 'fewo-structure-platform-integration-level',
          key: 'platformIntegrationLevel',
          fieldType: 'radio',
          label:
            'Wie stark sollen externe Buchungsplattformen eingebunden sein?',
          required: true,
          order: 3,
          options: [
            {
              label: 'Gar nicht oder nur im Hintergrund',
              value: 'none',
            },
            {
              label: 'Als zusätzliche Option neben der direkten Anfrage',
              value: 'secondary-option',
            },
            {
              label: 'Deutlich sichtbar als alternativer Abschlussweg',
              value: 'parallel-option',
            },
            {
              label: 'Die Website soll primär dorthin weiterleiten',
              value: 'primary-external',
            },
          ],
        },
      ],
    },
    {
      id: 'fewo-structure-prioritaeten',
      title: 'Ausrichtung & Prioritäten',
      order: 4,
      description:
        'Wie die Website später betrieben und erweitert werden soll.',
      stepKey: 'ausrichtung-prioritaeten',
      questions: [
        {
          id: 'fewo-structure-language-scope',
          key: 'languageScope',
          fieldType: 'radio',
          label:
            'Soll die Website eher einsprachig oder mehrsprachig gedacht werden?',
          required: true,
          order: 1,
          options: [
            { label: 'Nur deutsch', value: 'de' },
            { label: 'Deutsch und Englisch', value: 'de-en' },
            {
              label: 'Mehrsprachig mit weiterer Sprache',
              value: 'mehrsprachig',
            },
            { label: 'Noch offen', value: 'offen' },
          ],
        },
        {
          id: 'fewo-structure-content-ownership',
          key: 'contentOwnership',
          fieldType: 'radio',
          label: 'Wer soll Inhalte später hauptsächlich pflegen?',
          required: true,
          order: 2,
          options: [
            {
              label: 'Ich möchte Inhalte selbst einfach anpassen können',
              value: 'owner-maintained',
            },
            {
              label: 'Pflege soll überwiegend extern übernommen werden',
              value: 'agency-maintained',
            },
            {
              label: 'Eine gemischte Lösung ist sinnvoll',
              value: 'shared-maintenance',
            },
            { label: 'Noch offen', value: 'open' },
          ],
        },
        {
          id: 'fewo-structure-future-expansion-plans',
          key: 'futureExpansionPlans',
          fieldType: 'checkbox-group',
          label:
            'Welche Erweiterungen sollen strukturell schon mitgedacht werden?',
          helpText: 'Mehrfachauswahl möglich.',
          required: false,
          order: 3,
          options: [
            {
              label: 'Weitere Unterkünfte oder Einheiten',
              value: 'more-units',
            },
            {
              label: 'Saisonale Angebote oder Arrangements',
              value: 'seasonal-offers',
            },
            {
              label: 'Gästebewertungen oder Referenzen',
              value: 'reviews',
            },
            {
              label: 'Tipps für Umgebung, Ausflüge oder Gastronomie',
              value: 'local-tips',
            },
            {
              label: 'Weitere Sprachversionen',
              value: 'more-languages',
            },
            {
              label: 'Downloadbereich oder Gästeinfos',
              value: 'downloads-info',
            },
            {
              label: 'Aktuell ist keine Erweiterung geplant',
              value: 'no-expansion',
            },
          ],
        },
        {
          id: 'fewo-structure-notes',
          key: 'additionalNotes',
          fieldType: 'textarea',
          label:
            'Gibt es noch etwas Wichtiges zur Struktur oder zum späteren Betrieb der Website?',
          placeholder: 'Freitext für zusätzliche Hinweise',
          required: false,
          order: 4,
        },
      ],
    },
  ],
};

export const fewoDetailTemplate: IntakeTemplateDefinition = {
  title: 'Fewo Detailfragebogen Website-Umsetzung',
  slug: 'fewo-detailfragebogen-website-umsetzung',
  description:
    'Detaillierter Fragebogen für Ferienwohnungen mit Fokus auf Daten, Medien, Ausstattung und konkrete Website-Anforderungen.',
  status: 'active',
  version: 1,
  formType: 'custom',
  defaultLocale: 'de',
  sections: [
    {
      id: 'fewo-detail-basis',
      title: 'Basisdaten',
      order: 1,
      description: 'Allgemeine Informationen zur Ferienwohnung.',
      stepKey: 'basisdaten',
      questions: [
        {
          id: 'fewo-detail-name',
          key: 'propertyName',
          fieldType: 'text',
          label: 'Name der Ferienwohnung',
          required: true,
          order: 1,
        },
        {
          id: 'fewo-detail-slogan',
          key: 'propertySlogan',
          fieldType: 'text',
          label: 'Slogan oder kurzer Untertitel',
          required: false,
          order: 2,
        },
        {
          id: 'fewo-detail-address',
          key: 'propertyAddress',
          fieldType: 'textarea',
          label: 'Adresse oder Lage der Unterkunft',
          required: true,
          order: 3,
        },
        {
          id: 'fewo-detail-guests',
          key: 'maxGuests',
          fieldType: 'text',
          label: 'Für wie viele Personen ist die Unterkunft geeignet?',
          required: true,
          order: 4,
          validationRules: {
            pattern: '^[0-9]+$',
          },
        },
        {
          id: 'fewo-detail-target-groups',
          key: 'targetGroups',
          fieldType: 'checkbox-group',
          label: 'Welche Zielgruppen sollen angesprochen werden?',
          required: false,
          order: 5,
          options: [
            { label: 'Paare', value: 'paare' },
            { label: 'Familien', value: 'familien' },
            {
              label: 'Geschäftsreisende',
              value: 'geschaeftsreisende',
            },
            { label: 'Monteure', value: 'monteure' },
            {
              label: 'Urlauber mit Hund',
              value: 'urlauber-mit-hund',
            },
            { label: 'Gruppen', value: 'gruppen' },
            { label: 'Langzeitgäste', value: 'langzeitgaeste' },
          ],
        },
      ],
    },
    {
      id: 'fewo-detail-booking',
      title: 'Buchung & Kontakt',
      order: 2,
      description: 'Wie Gäste anfragen oder buchen sollen.',
      stepKey: 'buchung-kontakt',
      questions: [
        {
          id: 'fewo-detail-booking-channels',
          key: 'bookingChannels',
          fieldType: 'checkbox-group',
          label: 'Wie sollen Gäste buchen oder anfragen können?',
          required: true,
          order: 1,
          options: [
            {
              label: 'Direkte Buchungsanfrage über Formular',
              value: 'formular',
            },
            { label: 'Weiterleitung zu Airbnb', value: 'airbnb' },
            { label: 'Weiterleitung zu Booking.com', value: 'booking-com' },
            { label: 'Telefonische Anfrage', value: 'telefon' },
            { label: 'WhatsApp-Anfrage', value: 'whatsapp' },
            { label: 'E-Mail-Anfrage', value: 'email' },
          ],
          validationRules: {
            minSelections: 1,
          },
        },
        {
          id: 'fewo-detail-inquiry-required-fields',
          key: 'inquiryRequiredFields',
          fieldType: 'checkbox-group',
          label:
            'Welche Angaben sollen Gäste in einer Anfrage möglichst direkt mitgeben?',
          helpText: 'Mehrfachauswahl möglich.',
          required: false,
          order: 2,
          options: [
            { label: 'Reisezeitraum', value: 'travel-period' },
            { label: 'Personenzahl', value: 'guest-count' },
            { label: 'Haustier ja / nein', value: 'pet-info' },
            { label: 'Telefonnummer', value: 'phone-number' },
            { label: 'Besondere Wünsche', value: 'special-requests' },
            { label: 'Geplante Anreisezeit', value: 'arrival-time' },
          ],
        },
        {
          id: 'fewo-detail-phone',
          key: 'phone',
          fieldType: 'phone',
          label: 'Telefonnummer für Anfragen',
          required: false,
          order: 3,
        },
        {
          id: 'fewo-detail-email',
          key: 'email',
          fieldType: 'email',
          label: 'E-Mail-Adresse für Anfragen',
          required: true,
          order: 4,
        },
        {
          id: 'fewo-detail-airbnb-url',
          key: 'airbnbUrl',
          fieldType: 'url',
          label: 'Airbnb-Link',
          required: false,
          order: 5,
        },
        {
          id: 'fewo-detail-booking-url',
          key: 'bookingUrl',
          fieldType: 'url',
          label: 'Booking.com-Link',
          required: false,
          order: 6,
        },
        {
          id: 'fewo-detail-response-expectation',
          key: 'responseExpectation',
          fieldType: 'radio',
          label: 'Wie schnell wird in der Regel auf Anfragen reagiert?',
          required: false,
          order: 7,
          options: [
            { label: 'Meist am selben Tag', value: 'same-day' },
            { label: 'Innerhalb von 24 Stunden', value: '24h' },
            { label: 'Innerhalb von 1 bis 2 Tagen', value: '1-2-days' },
            { label: 'Unterschiedlich', value: 'varies' },
          ],
        },
      ],
    },
    {
      id: 'fewo-detail-property',
      title: 'Unterkunft & Ausstattung',
      order: 3,
      description: 'Details zur Ferienwohnung und zur Ausstattung.',
      stepKey: 'unterkunft-ausstattung',
      questions: [
        {
          id: 'fewo-detail-description',
          key: 'propertyDescription',
          fieldType: 'textarea',
          label: 'Kurzbeschreibung der Ferienwohnung',
          required: true,
          order: 1,
        },
        {
          id: 'fewo-detail-usp',
          key: 'uniqueSellingPoints',
          fieldType: 'textarea',
          label: 'Was macht die Unterkunft besonders?',
          required: false,
          order: 2,
        },
        {
          id: 'fewo-detail-amenities',
          key: 'amenities',
          fieldType: 'checkbox-group',
          label: 'Welche Ausstattung ist vorhanden?',
          required: false,
          order: 3,
          options: [
            { label: 'WLAN', value: 'wlan' },
            { label: 'Küche', value: 'kueche' },
            { label: 'Parkplatz', value: 'parkplatz' },
            { label: 'Waschmaschine', value: 'waschmaschine' },
            { label: 'Trockner', value: 'trockner' },
            { label: 'Balkon', value: 'balkon' },
            { label: 'Terrasse', value: 'terrasse' },
            { label: 'Garten', value: 'garten' },
            { label: 'Smart-TV', value: 'smart-tv' },
            { label: 'Kaffeemaschine', value: 'kaffeemaschine' },
            { label: 'Geschirrspüler', value: 'geschirrspueler' },
            { label: 'Klimaanlage', value: 'klimaanlage' },
            { label: 'Kinderbett', value: 'kinderbett' },
            {
              label: 'Haustiere erlaubt',
              value: 'haustiere-erlaubt',
            },
            {
              label: 'Nichtraucherunterkunft',
              value: 'nichtraucherunterkunft',
            },
          ],
        },
        {
          id: 'fewo-detail-rooms',
          key: 'rooms',
          fieldType: 'textarea',
          label: 'Bitte Räume, Betten und Badezimmer beschreiben',
          required: true,
          order: 4,
        },
        {
          id: 'fewo-detail-house-rules',
          key: 'houseRules',
          fieldType: 'textarea',
          label: 'Welche wichtigen Regeln oder Hinweise gelten für Gäste?',
          placeholder:
            'Zum Beispiel Haustiere, Rauchen, Ruhezeiten, Check-in oder Mindestaufenthalt',
          required: false,
          order: 5,
        },
        {
          id: 'fewo-detail-surroundings-highlights',
          key: 'surroundingsHighlights',
          fieldType: 'textarea',
          label:
            'Welche Highlights in Lage und Umgebung sollen unbedingt erwähnt werden?',
          placeholder:
            'Zum Beispiel Altstadt, Wanderwege, Weingüter, Restaurants oder Bahnhofsnähe',
          required: false,
          order: 6,
        },
      ],
    },
    {
      id: 'fewo-detail-media',
      title: 'Bilder & Website-Inhalte',
      order: 4,
      description: 'Material und Funktionswünsche für die Website.',
      stepKey: 'bilder-website',
      questions: [
        {
          id: 'fewo-detail-images',
          key: 'propertyImages',
          fieldType: 'file',
          label: 'Bilder der Ferienwohnung hochladen',
          required: true,
          order: 1,
          validationRules: {
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
            maxFileSize: 15728640,
            allowMultiple: true,
          },
        },
        {
          id: 'fewo-detail-logo',
          key: 'logo',
          fieldType: 'file',
          label: 'Logo hochladen, falls vorhanden',
          required: false,
          order: 2,
          validationRules: {
            allowedMimeTypes: [
              'image/jpeg',
              'image/png',
              'image/svg+xml',
              'image/webp',
            ],
            maxFileSize: 5242880,
            allowMultiple: false,
          },
        },
        {
          id: 'fewo-detail-available-assets',
          key: 'availableAssets',
          fieldType: 'checkbox-group',
          label: 'Welche Inhalte oder Unterlagen liegen bereits vor?',
          helpText: 'Mehrfachauswahl möglich.',
          required: false,
          order: 3,
          options: [
            { label: 'Professionelle Fotos', value: 'professional-photos' },
            { label: 'Eigene Smartphone-Bilder', value: 'phone-photos' },
            { label: 'Logo', value: 'logo' },
            { label: 'Grundriss', value: 'floor-plan' },
            { label: 'Preisliste', value: 'pricing-table' },
            { label: 'Hausregeln / Gästeinfos', value: 'house-rules' },
            { label: 'Gästebewertungen', value: 'reviews' },
            { label: 'Tipps für Umgebung und Ausflüge', value: 'local-tips' },
            { label: 'Anfahrtsbeschreibung', value: 'arrival-info' },
          ],
        },
        {
          id: 'fewo-detail-content-support',
          key: 'contentSupport',
          fieldType: 'checkbox-group',
          label: 'Wobei brauchst du bei den Inhalten Unterstützung?',
          helpText: 'Mehrfachauswahl möglich.',
          required: false,
          order: 4,
          options: [
            { label: 'Texte formulieren oder überarbeiten', value: 'copy' },
            {
              label: 'Bilder auswählen und sortieren',
              value: 'image-selection',
            },
            {
              label: 'Inhalte sinnvoll kürzen und priorisieren',
              value: 'prioritization',
            },
            {
              label: 'FAQ oder Gästeinfos strukturieren',
              value: 'faq-structure',
            },
            {
              label: 'Übersetzung oder englische Inhalte',
              value: 'translation',
            },
            { label: 'Aktuell keine Unterstützung nötig', value: 'none' },
          ],
        },
        {
          id: 'fewo-detail-hero-focus',
          key: 'heroFocus',
          fieldType: 'radio',
          label: 'Was soll auf der Website visuell als Erstes im Fokus stehen?',
          required: false,
          order: 5,
          options: [
            { label: 'Außenansicht oder Gesamtstimmung', value: 'exterior' },
            { label: 'Wohn- oder Essbereich', value: 'living-area' },
            { label: 'Schlafbereich oder Ruhe', value: 'sleeping-area' },
            {
              label: 'Terrasse, Garten oder Außenfläche',
              value: 'outdoor-area',
            },
            { label: 'Lage und Umgebung', value: 'location-area' },
            { label: 'Noch offen', value: 'open' },
          ],
        },
        {
          id: 'fewo-detail-feature-notes',
          key: 'additionalNotes',
          fieldType: 'textarea',
          label: 'Gibt es noch zusätzliche Infos, Wünsche oder Besonderheiten?',
          helpText:
            'Hier ist Platz für alles, was bisher noch nicht abgefragt wurde.',
          placeholder: 'Freitext für weitere Hinweise',
          required: false,
          order: 6,
          validationRules: {
            maxLength: 3000,
          },
        },
      ],
    },
  ],
};

export const fewoTemplatePack: IntakeTemplateDefinition[] = [
  fewoStartTemplate,
  fewoStructureTemplate,
  fewoDetailTemplate,
];
