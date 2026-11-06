# ADR-006 – SQLite-Treiber: better-sqlite3

**Datum:** 2026-11-06
**Status:** Angenommen

## Kontext
Drizzle unterstützt mehrere SQLite-Treiber. Die App läuft als einzelner Node-Prozess auf einem Laptop, ohne Netzwerk-Datenbank.

## Entscheidung
`better-sqlite3` mit `drizzle-orm/better-sqlite3`.

## Alternativen
- **`@libsql/client`:** Asynchron, für Turso/Netzwerk gedacht; lokal kein Vorteil, zusätzliche Abstraktion.
- **`node:sqlite` (eingebaut):** Noch jung, Drizzle-Support weniger ausgereift.

## Konsequenzen
- Synchrone API: einfache Transaktionen (Bestellung + Positionen + PrintJobs atomar), keine Async-Fehlerquellen im Repository.
- Natives Modul: beim Setup auf dem Laptop wird kompiliert bzw. ein Prebuilt geladen; Node-Version im `engines`-Feld festlegen.
- SQLite-Backup-API (`db.backup()`) ist verfügbar → konsistente Downloads in F10.
- `PRAGMA journal_mode = WAL` für parallele Lese-Zugriffe während der Worker schreibt.
