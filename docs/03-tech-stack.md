# Tech-Stack

| Bereich | Wahl | Begründung / ADR |
|---------|------|------------------|
| Anwendung | **SvelteKit-Monolith** (Svelte 5, TypeScript) | Ein Prozess auf dem Server-Laptop liefert Frontend, API und Druckanbindung. → [ADR-001](decisions/ADR-001-sveltekit-monolith.md) |
| UI-Komponenten | **`@noahbaumgartner/svelte-ui`** (lokal via `npm link`) | Eigene, wiederverwendbare Komponentenbibliothek. → [ADR-002](decisions/ADR-002-svelte-ui-via-npm-link.md) |
| Icons | `@lucide/svelte` | Peer-Dependency von svelte-ui |
| Datenbank | **SQLite** mit **Drizzle ORM** | Dateibasiert, kein separater DB-Prozess, ideal für Offline-Betrieb auf einem Laptop. → [ADR-003](decisions/ADR-003-sqlite-drizzle.md) |
| Drucker | Epson TM-T20IV, TM-T20III via Ethernet (ESC/POS) | Vorhandene Hardware. Konkretes Protokoll/Library offen. |
| Hosting | Lokal auf dem Server-Laptop, kein Internet | Siehe Betriebsszenario in `00-overview.md` |
| Auth | Session-basiert, lokal | Konkrete Umsetzung offen |
| Tests | Vitest (Unit), Playwright (E2E) | SvelteKit-Standard |

## Server-Architektur: Services & Repositories
Der serverseitige Code (`src/lib/server/`) ist in zwei Schichten gegliedert. → [ADR-004](decisions/ADR-004-services-und-repositories.md)

```
src/lib/server/
├── repositories/     # Zugriff auf Aussenwelt: DB und Drucker
│   ├── db/           # Drizzle-Schema, Migrationen, ein Repository pro Aggregat
│   └── printer/      # Druckerzugriff (ESC/POS über Ethernet)
└── services/         # Fachlogik, orchestriert Repositories
```

- **Repositories** kapseln jede Form von I/O: Datenbank **und Drucker**. Sie enthalten keine Fachlogik und sind austauschbar (z. B. Fake-Drucker in Tests).
- **Services** enthalten die Fachlogik (z. B. „Bestellung aufgeben“ = speichern + Zettel an die zuständigen Drucker schicken). Sie kennen nur Repository-Schnittstellen, nie Drizzle oder Druckerprotokolle direkt.
- **Routes / Form Actions / API-Endpunkte** (`src/routes/`) rufen ausschliesslich Services auf.

## Nicht-funktionale Anforderungen
- **Offline-first:** Kein Internetzugang, keine externen Dienste zur Laufzeit.
- **Geräte:** Smartphones und Tablets im WLAN als Haupt-Clients → Mobile-first, grosse Bedienelemente.
- **Robustheit:** Druckerausfall darf keine Bestellung verlieren (Druckaufträge persistieren, Wiederholung möglich).
- **Sprache:** UI in Deutsch (Schweiz). Code und Bezeichner auf Englisch.
- **Installation:** Muss von Vereinsmitgliedern auf einem neuen Laptop einrichtbar sein (dokumentierter Setup-Prozess).
