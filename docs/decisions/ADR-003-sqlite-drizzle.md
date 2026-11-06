# ADR-003 – SQLite mit Drizzle ORM

**Datum:** 2026-11-06
**Status:** Angenommen

## Kontext

Die Daten eines Anlasses (Angebot, Bestellungen, Benutzer, Drucker) liegen auf dem Server-Laptop. Es gibt keinen Internetzugang und niemanden, der einen Datenbankserver betreibt.

## Entscheidung

- **SQLite** als Datenbank, eine Datei pro Installation.
- **Drizzle ORM** für Schema, typsichere Queries und Migrationen (`drizzle-kit`).

## Alternativen

- **PostgreSQL/MySQL:** Zusätzlicher Dienst auf dem Laptop, Mehraufwand ohne Nutzen bei einem einzelnen Server.
- **Prisma:** Grösserer Runtime-Footprint, generierter Client; Drizzle ist leichter und näher an SQL.
- **Kein ORM (besser-sqlite3 direkt):** Weniger Abstraktion, aber keine Typsicherheit und Migrationen von Hand.

## Konsequenzen

- Backup = Kopie einer Datei. Sinnvoll vor/nach jedem Anlass.
- Drizzle-Schema und Migrationen liegen unter `src/lib/server/repositories/db/`.
- Nur Repositories greifen auf Drizzle zu (→ [ADR-004](ADR-004-services-und-repositories.md)).
- Treiber: `better-sqlite3` (→ [ADR-006](ADR-006-sqlite-treiber.md)).
- Eine Datenbankdatei = ein Anlass; Wechsel im Admin (F10).
