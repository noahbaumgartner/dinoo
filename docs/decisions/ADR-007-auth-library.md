# ADR-007 – Authentifizierung mit Better Auth

**Datum:** 2026-11-06
**Status:** Angenommen

## Kontext

Benutzername/Passwort-Anmeldung mit Rollen, offline, SQLite via Drizzle. Es soll eine Library statt einer Eigenimplementierung verwendet werden.

## Entscheidung

**Better Auth** mit Drizzle-Adapter (SQLite) und `username`-Plugin; Rollen über ein eigenes `role`-Feld am Benutzer. Sessions als Cookie, Lebensdauer ≥ 24 h.

## Alternativen

- **Lucia:** Inzwischen nur noch Anleitung, keine Library mehr; entspräche einer Eigenimplementierung.
- **Auth.js (SvelteKit):** Auf OAuth-Provider ausgerichtet; Credentials-Login ist dort zweitklassig.
- **Eigene Sessions + argon2:** Wenig Code, aber ohne Library nicht gewünscht.

## Konsequenzen

- Better Auth bringt eigene Tabellen (user, session, account, verification) mit; `User` aus dem Domänenmodell wird darauf abgebildet (zusätzliche Felder `displayName`, `role`, `active`).
- Beim Datenbankwechsel (F10) müssen Sessions der alten Datenbank ungültig werden; das ergibt sich, weil Sessions in derselben Datenbank liegen.
- Benutzer werden vom Admin über den internen Adapter von Better Auth angelegt (Selbstregistrierung ist abgeschaltet); Better Auth verlangt eine E-Mail, dinoo setzt intern `<benutzername>@dinoo.local`.
- Anmeldung, Abmeldung und Sitzungsprüfung laufen serverseitig über `auth.api` und das SvelteKit-Cookie-Plugin; die HTTP-Endpunkte von Better Auth sind nicht eingebunden.
