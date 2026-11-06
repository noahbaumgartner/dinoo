# F05 – Drucker verwalten

**Status:** Bereit
**Priorität:** Muss

## Ziel
Der Admin erfasst die Drucker (Name, IP, Modell), prüft sie per Testdruck und behält fehlgeschlagene Druckaufträge im Blick.

## User Stories
- Als Admin möchte ich vor dem Anlass beide Drucker erfassen und einen Testzettel drucken, damit ich weiss, dass alles verbunden ist.
- Als Admin möchte ich bei einem Druckerausfall sehen, welche Zettel fehlen, und sie auf den anderen Drucker umleiten.

## Akzeptanzkriterien
- [ ] Nur Rolle `admin` (`/admin/printers`).
- [ ] Drucker anlegen/bearbeiten: `name`, `host`, `port` (Default 9100), `model`, `active`.
- [ ] Testdruck pro Drucker mit Anlassname, Druckername, Zeit; Ergebnis (ok/Fehler mit Meldung) wird angezeigt.
- [ ] Erreichbarkeitsanzeige pro Drucker (letzter erfolgreicher Druck / letzter Fehler).
- [ ] Übersicht der `PrintJob`s mit Status; Filter „fehlgeschlagen“.
- [ ] Aktionen pro Job: „Erneut drucken“, „Auf anderen Drucker umleiten“.
- [ ] Drucker mit Zuordnungen (Kategorie/Artikel) können nicht gelöscht, nur deaktiviert werden.

## Daten / API
- `Printer`, `PrintJob`
- `PrinterAdminService`, `PrintService` (F03)

## UI
1. Druckerliste mit Status-Badge und Button „Testdruck“.
2. Dialog zum Bearbeiten.
3. Tab „Druckaufträge“ mit Liste und Aktionen.

## Nicht im Scope
- Automatische Druckersuche im Netz.

## Abhängigkeiten
- F01

## Offene Fragen
- keine
