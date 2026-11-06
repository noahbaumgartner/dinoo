# F05 – Drucker und Druckwarteschlange verwalten

**Status:** Bereit
**Priorität:** Muss

## Ziel
Der Admin erfasst die Drucker (Name, IP, Modell), prüft sie per Testdruck und sieht jederzeit, was in der Druckwarteschlange steht.

## User Stories
- Als Admin möchte ich vor dem Anlass beide Drucker erfassen und einen Testzettel drucken, damit ich weiss, dass alles verbunden ist.
- Als Admin möchte ich bei einem Druckerausfall sehen, wie viele Zettel warten, und sie bei Bedarf auf den anderen Drucker umleiten.

## Akzeptanzkriterien
**Drucker** (`/admin/printers`)
- [ ] Anlegen/bearbeiten: `name`, `host`, `port` (Default 9100), `model`, `active`.
- [ ] Testdruck pro Drucker (als `PrintJob` `kind = test` über die Warteschlange); Ergebnis sichtbar.
- [ ] Statusanzeige pro Drucker: erreichbar/nicht erreichbar (letzter Erfolg, letzter Fehler), Anzahl wartender Jobs.
- [ ] Drucker mit Zuordnungen (Kategorie/Artikel) oder wartenden Jobs können nicht gelöscht, nur deaktiviert werden. Deaktivieren mit wartenden Jobs verlangt vorher Umleiten oder Abbrechen.

**Warteschlange** (`/admin/print-queue`)
- [ ] Liste aller Jobs mit Filter nach Drucker und Status; Standardfilter: nicht gedruckt.
- [ ] Pro Job: Bestellnummer/Tisch (bei `order`), Zieldrucker, Status, Versuche, letzter Fehler, Zeitpunkte; Vorschau des `payload` als Text.
- [ ] Aktionen pro Job: „Abbrechen“, „Umleiten auf …“, „Erneut drucken“ (Kopie).
- [ ] Sammelaktion: alle wartenden Jobs eines Druckers auf einen anderen umleiten.
- [ ] Ansicht aktualisiert sich automatisch (Polling), damit der Admin das Nachdrucken live sieht.

## Daten / API
- `Printer`, `PrintJob`
- `PrinterAdminService`, `PrintQueueService` (F03)

## UI
1. Druckerliste mit Status-Badge, Warteschlangen-Zähler, Button „Testdruck“.
2. Dialog zum Bearbeiten.
3. Seite „Druckwarteschlange“ mit Tabelle, Filtern und Aktionen.

## Nicht im Scope
- Automatische Druckersuche im Netz.

## Abhängigkeiten
- F01, F03

## Offene Fragen
- keine
