# F06 – Benutzer, Tische und Einstellungen verwalten

**Status:** Bereit
**Priorität:** Muss

## Ziel
Der Admin legt Benutzer (Service, Admin), die Tische des Anlasses und allgemeine Einstellungen (Anlassname, TWINT-QR) fest.

## User Stories
- Als Admin möchte ich für jeden Helfer einen Benutzer anlegen, damit Bestellungen nachvollziehbar sind.
- Als Admin möchte ich die Tische des Anlasses erfassen, damit der Service sie nur noch antippen muss.
- Als Admin möchte ich den TWINT-QR-Code des Vereins hinterlegen, damit er beim Bezahlen angezeigt wird.

## Akzeptanzkriterien
**Benutzer** (`/admin/users`)
- [ ] Anlegen/bearbeiten: `username` (eindeutig), `displayName`, `role`, `active`; Passwort setzen/zurücksetzen.
- [ ] Der letzte aktive Admin kann nicht deaktiviert oder zu `service` geändert werden.
- [ ] Beim ersten Start ohne Benutzer wird ein initialer Admin per Setup-Seite oder CLI angelegt.

**Tische** (`/admin/tables`)
- [ ] Anlegen/bearbeiten: `label`, `sortOrder`, `active`; Schnellerfassung „Tische 1–30 anlegen“.
- [ ] Tische mit Bestellungen werden deaktiviert statt gelöscht.

**Einstellungen** (`/admin/settings`)
- [ ] `eventName` setzen (erscheint auf Zetteln).
- [ ] TWINT-QR-Code als Bild (PNG/JPG) hochladen, Vorschau anzeigen, ersetzen.

## Daten / API
- `User`, `Table`, `Settings`
- `UserService`, `TableService`, `SettingsService`

## Nicht im Scope
- Mehrere Anlässe parallel.

## Abhängigkeiten
- F01

## Offene Fragen
- Ablage des QR-Bilds: in SQLite (Blob) oder als Datei im Datenverzeichnis?
