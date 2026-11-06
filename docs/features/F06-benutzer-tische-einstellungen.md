# F06 – Benutzer, Tische und Einstellungen verwalten

**Status:** Umgesetzt
**Priorität:** Muss

## Ziel

Der Admin legt Benutzer (Service, Admin), die Tische des Anlasses und allgemeine Einstellungen (Anlassname, TWINT-QR) fest.

## User Stories

- Als Admin möchte ich für jeden Helfer einen Benutzer anlegen, damit Bestellungen nachvollziehbar sind.
- Als Admin möchte ich die Tische des Anlasses erfassen, damit der Service sie nur noch antippen muss.
- Als Admin möchte ich den TWINT-QR-Code des Vereins einmal abscannen, damit er beim Bezahlen angezeigt wird.

## Akzeptanzkriterien

**Benutzer** (`/admin/users`)

- [ ] Anlegen/bearbeiten: `username` (eindeutig), `displayName`, `role`, `active`; Passwort setzen/zurücksetzen.
- [ ] Der letzte aktive Admin kann nicht deaktiviert oder zu `service` geändert werden.
- [ ] Bei leerer Datenbank (erster Start, neuer Anlass) wird ein initialer Admin per Setup-Seite angelegt.

**Tische** (`/admin/tables`)

- [ ] Anlegen/bearbeiten: `label`, `sortOrder`, `active`; Schnellerfassung „Tische 1–30 anlegen“.
- [ ] Tische mit Bestellungen werden deaktiviert statt gelöscht.

**Einstellungen** (`/admin/settings`)

- [ ] `eventName` setzen (erscheint auf Zetteln).
- [ ] TWINT-QR erfassen: Kamera-Scan des Vereins-QR (Sticker/Ausdruck) liest den **Inhalt** aus → `Settings.twintQrContent`. Alternativ Inhalt als Text einfügen.
- [ ] Kamera-Scan funktioniert nur in sicherem Kontext; ohne HTTPS also direkt am Server-Laptop über `http://localhost`. Die Seite weist darauf hin, wenn keine Kamera verfügbar ist.
- [ ] Aus `twintQrContent` wird ein QR-Code generiert und als Vorschau angezeigt; derselbe Generator wird in F07 verwendet.

## Daten / API

- `User`, `Table`, `Settings`
- `UserService`, `TableService`, `SettingsService`
- QR: Scan clientseitig (z. B. `BarcodeDetector`/`jsQR`), Generierung clientseitig (z. B. `qrcode`).

## Nicht im Scope

- Mehrere Anlässe parallel (→ F10: eine Datenbank pro Anlass).

## Abhängigkeiten

- F01

## Offene Fragen

- keine
