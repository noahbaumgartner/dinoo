# Tech-Stack

| Bereich        | Wahl                                                                                                                    | Begründung / ADR                                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Anwendung      | **SvelteKit-Monolith** (Svelte 5, TypeScript)                                                                           | Ein Prozess auf dem Server-Laptop liefert Frontend, API und Druckanbindung. → [ADR-001](decisions/ADR-001-sveltekit-monolith.md) |
| UI-Komponenten | **`@noahbaumgartner/svelte-ui`** (lokal via `npm link`)                                                                 | Eigene, wiederverwendbare Komponentenbibliothek. → [ADR-002](decisions/ADR-002-svelte-ui-via-npm-link.md)                        |
| Icons          | `@lucide/svelte`                                                                                                        | Peer-Dependency von svelte-ui                                                                                                    |
| Datenbank      | **SQLite** (`better-sqlite3`) mit **Drizzle ORM**, eine Datei pro Anlass                                                | → [ADR-003](decisions/ADR-003-sqlite-drizzle.md), [ADR-006](decisions/ADR-006-sqlite-treiber.md)                                 |
| Drucker        | Epson TM-T20IV, TM-T20III im lokalen Netz, ESC/POS (gebaut mit `node-thermal-printer`), gesendet über ePOS-Print/HTTPS  | → [ADR-005](decisions/ADR-005-druck-library.md)                                                                                  |
| Auth           | **Better Auth** (Drizzle-Adapter, username-Plugin)                                                                      | → [ADR-007](decisions/ADR-007-auth-library.md)                                                                                   |
| QR             | Lesen im Browser mit `jsqr` (Kamera auf localhost, sonst Foto), Anzeige mit `qrcode`                                    | Statischer TWINT-QR, Inhalt wird gespeichert (F06)                                                                               |
| Diagramme      | `LineChart`, `BarChart`, `Stat` aus svelte-ui (eigenes SVG/CSS, keine Abhängigkeit)                                     | F09                                                                                                                              |
| Toolchain      | **Vite+** (`vp dev`, `vp build`, `vp test`, `vp lint`, `vp fmt`)                                                        | Wie in den anderen Projekten (portfolio)                                                                                         |
| Hosting        | Lokal auf dem Server-Laptop, Start via `npm run dev` (Vite+) oder `npm run build && npm start`; kein Dienst, kein HTTPS | Siehe Betriebsszenario in `00-overview.md`                                                                                       |
| Tests          | Vitest über `vp test` (Services gegen echte SQLite-Datei und Fake-Drucker)                                              | End-to-End-Tests noch offen                                                                                                      |

## Server-Architektur: Services & Repositories

Der serverseitige Code (`src/lib/server/`) ist in zwei Schichten gegliedert. → [ADR-004](decisions/ADR-004-services-und-repositories.md)

```
src/lib/server/
├── runtime.ts        # Zusammensetzung: aktive Datenbank → Repositories → Services
├── app.ts            # Die eine Runtime des Prozesses (DATA_DIR, PRINTER_DRIVER)
├── repositories/     # Zugriff auf Aussenwelt: DB, Drucker, Anmeldung
│   ├── db/           # Drizzle-Schema, ein Repository pro Aggregat, Datenbankdateien
│   ├── printer/      # PrinterDeviceRepository: ePOS-Print über HTTPS oder Fake
│   └── auth/         # Better Auth (Sitzungen, Passwörter)
└── services/         # Fachlogik inkl. Druck-Worker, orchestriert Repositories
drizzle/              # SQL-Migrationen (drizzle-kit generate)
```

- **Repositories** kapseln jede Form von I/O: Datenbank **und Drucker**. Sie enthalten keine Fachlogik und sind austauschbar (z. B. Fake-Drucker in Tests).
- **Services** enthalten die Fachlogik (z. B. „Bestellung aufgeben“ = speichern + Zettel an die zuständigen Drucker schicken). Sie kennen nur Repository-Schnittstellen, nie Drizzle oder Druckerprotokolle direkt.
- **Routes / Form Actions / API-Endpunkte** (`src/routes/`) rufen ausschliesslich Services auf.

## Nicht-funktionale Anforderungen

- **Offline-first:** Kein Internetzugang, keine externen Dienste zur Laufzeit.
- **Geräte:** Smartphones und Tablets im WLAN als Haupt-Clients → Mobile-first, grosse Bedienelemente.
- **Robustheit:** Druckerausfall darf keine Bestellung verlieren: persistente Druckwarteschlange, automatisches Nachdrucken beim Wiederverbinden (F03).
- **Hintergrundarbeit im Prozess:** Der Druck-Worker läuft im selben Node-Prozess wie SvelteKit (Start in `hooks.server.ts`); kein separater Dienst.
- **Sprache:** UI in Deutsch (Schweiz). Code und Bezeichner auf Englisch.
- **Installation:** Muss von Vereinsmitgliedern auf einem neuen Laptop einrichtbar sein (dokumentierter Setup-Prozess).
