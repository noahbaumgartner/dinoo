# F01 – Anmeldung

**Status:** Umgesetzt
**Priorität:** Muss

## Ziel

Service-Personal und Admins melden sich mit Benutzername und Passwort an, damit Bestellungen einer Person zugeordnet sind und das Admin-Interface geschützt ist.

## User Stories

- Als Service-Mitarbeiter möchte ich mich auf meinem Smartphone anmelden, damit ich Bestellungen aufnehmen kann.
- Als Admin möchte ich mich von jedem Gerät im WLAN anmelden, damit ich das Angebot auch unterwegs anpassen kann.

## Akzeptanzkriterien

- [ ] Nicht angemeldete Benutzer werden auf die Anmeldeseite geleitet; nur `/login` ist öffentlich.
- [ ] Anmeldung mit `username` + Passwort; Fehlermeldung bei falschen Daten ohne Hinweis, welcher Teil falsch war.
- [ ] Deaktivierte Benutzer (`active = false`) können sich nicht anmelden.
- [ ] Die Session bleibt mindestens für die Dauer eines Anlasses (≥ 24 h) gültig.
- [ ] Abmelden ist von jeder Seite möglich.
- [ ] Routen unter `/admin` sind nur mit Rolle `admin` erreichbar; `service` erhält 403.
- [ ] Passwörter werden gehasht gespeichert (z. B. argon2), nie im Klartext.

## Daten / API

- `User` (siehe `02-domain-model.md`)
- Session-Cookie (HttpOnly) + Session-Tabelle; konkrete Umsetzung → `open-questions.md`.

## UI / Ablauf

1. Anmeldeseite: Benutzername, Passwort, „Anmelden“.
2. Nach Erfolg: Service → Bestellablauf (F02), Admin → Admin-Startseite.

## Nicht im Scope

- Passwort-Reset per E-Mail (kein Internet). Passwort setzt der Admin (F06).
- Selbstregistrierung.

## Abhängigkeiten

- keine

## Offene Fragen

- Auth-Umsetzung (eigene Sessions vs. Library) → `open-questions.md`
