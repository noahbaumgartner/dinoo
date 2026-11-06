# F10 – Datenbank (Anlass) verwalten

**Status:** Bereit
**Priorität:** Muss

## Ziel
Eine Datenbankdatei entspricht genau einem Anlass. Der Admin kann im Admin-Interface einen neuen Anlass (neue Datenbank) anlegen, zwischen vorhandenen wechseln und Datenbanken sichern.

## User Stories
- Als Admin möchte ich nach dem Sommerfest für das Herbstfest eine frische Datenbank anlegen, ohne Dateien von Hand zu kopieren.
- Als Admin möchte ich zur Datenbank des letzten Anlasses zurückwechseln, um Zahlen nachzuschauen.
- Als Admin möchte ich eine Datenbank als Datei herunterladen (Backup) und wieder hochladen.

## Akzeptanzkriterien
- [ ] Nur Rolle `admin` (`/admin/database`).
- [ ] Alle Datenbanken liegen in einem Datenverzeichnis (`DATA_DIR`, Default `./data`); die aktive ist in einer kleinen Konfigurationsdatei (`data/active.json`) vermerkt.
- [ ] Liste der vorhandenen Datenbanken: Dateiname, Anlassname (aus `Settings.eventName`), Grösse, letzte Änderung, Markierung „aktiv“.
- [ ] **Neu anlegen:** Name eingeben → neue Datei mit Migrationen; optional Benutzer, Tische, Drucker und Angebot aus der aktiven Datenbank übernehmen (ohne Bestellungen/Zahlungen/Jobs).
- [ ] **Wechseln:** Aktive Datenbank umschalten. Vorher: Druckwarteschlange muss leer sein (oder Admin bestätigt Abbruch). Nach dem Wechsel sind alle Sessions ungültig; Benutzer melden sich neu an.
- [ ] **Herunterladen:** aktive oder andere Datenbank als `.sqlite`-Datei (konsistente Kopie via SQLite-Backup-API).
- [ ] **Hochladen:** `.sqlite`-Datei ins Datenverzeichnis legen; Migrationen laufen beim Aktivieren.
- [ ] **Löschen:** nur nicht-aktive Datenbanken, mit Bestätigung.
- [ ] Repositories hängen an einer austauschbaren DB-Verbindung; der Wechsel erfolgt ohne Neustart des Prozesses.

## Daten / API
- Dateisystem (`DATA_DIR`), `active.json`
- `DatabaseService` (anlegen, wechseln, sichern, auflisten) über ein `DatabaseFileRepository`

## UI
- Tabelle der Datenbanken mit Aktionen; prominenter Hinweis, welche aktiv ist.

## Nicht im Scope
- Automatische zeitgesteuerte Backups (empfohlen: Download nach jedem Anlass).
- Zusammenführen zweier Datenbanken.

## Abhängigkeiten
- F01, F06

## Offene Fragen
- keine
