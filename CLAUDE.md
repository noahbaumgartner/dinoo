# dinoo – Essensbestellsystem für Vereinsanlässe

## Projekt
Offline-Bestellsystem: Ein Laptop vor Ort ist Server (WLAN, Web-App, SQLite) und druckt Bestellzettel auf Epson-Thermodrucker (TM-T20IV/TM-T20III) am Ethernet. Alle Geräte im WLAN nutzen dieselbe Web-Oberfläche; das Admin-Interface ist Teil davon und nur für die Rolle Admin. Details: `docs/00-overview.md`.

## Spezifikation
Die gesamte fachliche und technische Spezifikation liegt in `docs/` (Übersicht: `docs/README.md`).
- Vor der Umsetzung eines Features die zugehörige Datei in `docs/features/` sowie `docs/02-domain-model.md` lesen.
- Akzeptanzkriterien sind die Definition of Done und Grundlage für Tests.
- Ist etwas unklar oder widersprüchlich: nicht raten, sondern nachfragen bzw. in `docs/open-questions.md` eintragen.
- Architekturentscheide als ADR in `docs/decisions/` festhalten.

## Tech-Stack (Details: `docs/03-tech-stack.md`)
- **SvelteKit-Monolith**, Svelte 5 (Runes), TypeScript, Node-Adapter.
- **UI:** `@noahbaumgartner/svelte-ui` (lokal unter `../svelte-ui`, eingebunden via `npm link`). Keine andere UI-Bibliothek. Tokens einmal im Root-Layout importieren (`@noahbaumgartner/svelte-ui/tokens.css`). Icons: `@lucide/svelte`.
- **DB:** SQLite + Drizzle ORM, Schema und Migrationen unter `src/lib/server/repositories/db/`.

## Architektur-Regeln (ADR-004)
- `src/lib/server/repositories/`: jeglicher I/O. **Datenbank und Drucker sind Repositories.** Keine Fachlogik.
- `src/lib/server/services/`: Fachlogik, orchestriert Repositories, bekommt sie injiziert (testbar mit Fakes).
- `src/routes/`: ruft nur Services auf. Kein direkter Zugriff auf Drizzle oder Drucker.
- Abhängigkeiten nur nach unten: Route → Service → Repository.

## Komponenten: svelte-ui oder dinoo? (ADR-002)
- Fehlt eine **generelle** Komponente (ohne Fachbegriffe, in jedem Projekt brauchbar): in `../svelte-ui` ergänzen, exportieren in `src/lib/index.ts`, verallgemeinert halten.
- Alles mit Fachbezug (Bestellung, Artikel, Drucker): in dinoo unter `src/lib/components/`.

## Konventionen
- Code, Dateinamen, Bezeichner: **Englisch**. UI-Texte und Doku: **Deutsch (Schweiz)**, `ss` statt `ß`.
- Mobile-first: Haupt-Clients sind Smartphones/Tablets im WLAN.
- Keine Laufzeit-Abhängigkeit auf Internet oder externe Dienste.
