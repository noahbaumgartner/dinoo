# F05 – Drucker und Druckwarteschlange verwalten

**Status:** Umgesetzt
**Priorität:** Muss

## Ziel

Der Admin erfasst die Drucker (Name, IP, Modell), prüft sie per Testdruck und sieht jederzeit, was in der Druckwarteschlange steht.

## User Stories

- Als Admin möchte ich vor dem Anlass beide Drucker erfassen und einen Testzettel drucken, damit ich weiss, dass alles verbunden ist.
- Als Admin möchte ich bei einem Druckerausfall sehen, wie viele Zettel warten.
- Als Admin möchte ich die Zettel eines ausgefallenen Druckers auf einen anderen Drucker umleiten, damit die Station weiterarbeiten kann, bis der Drucker wieder läuft.

## Akzeptanzkriterien

**Drucker** (`/admin/printers`)

- [ ] Anlegen/bearbeiten: `name`, `host`, `port` (Default 443, ePOS-Print über HTTPS; ePOS-Print muss am Drucker aktiv sein), `model`. Neue Drucker sind aktiv; `active` wird in der Liste pro Zeile ein-/ausgeschaltet, nicht im Dialog.
- [ ] Testdruck pro Drucker (als `PrintJob` `kind = test` über die Warteschlange); Ergebnis sichtbar. Der Testzettel enthält nur den Titel „Testdruck“ (gross) und einen zufälligen Witz aus einer festen Liste von 100 Witzen, umgebrochen an Wortgrenzen. Er verwendet **nicht** die Druckvorlage (dafür gibt es den Testdruck in F11).
- [ ] Statusanzeige pro Drucker: erreichbar/nicht erreichbar (letzter Erfolg, letzter Fehler), Anzahl wartender Jobs.
- [ ] Drucker mit Zuordnungen (Kategorie/Artikel) oder wartenden Jobs können nicht gelöscht, nur deaktiviert werden. Deaktivieren mit wartenden Jobs verlangt vorher Abbrechen.

**Umleiten** (`/admin/printers`, → ADR-011)

- [ ] Der Admin wählt bei einem Drucker «Umleiten …» und einen Zieldrucker. Nur Admins sehen und setzen Umleitungen; der Service sieht weiterhin nur «Druck wartet».
- [ ] Beim Setzen gehen alle `queued` Jobs des Quelldruckers an den Zieldrucker, in ihrer ursprünglichen Reihenfolge (`createdAt` bleibt). Neue Jobs für den Quelldrucker (Bestellungen, Nachdrucke) gehen direkt an den Zieldrucker, solange die Umleitung aktiv ist.
- [ ] Jobs, die gerade `printing` sind, laufen beim Quelldrucker zu Ende. Schlagen sie fehl, schiebt der Worker sie zum Zieldrucker. Kein Zettel wird doppelt gedruckt.
- [ ] Jeder umgeleitete Zettel beginnt mit einem gut sichtbaren Block «FÜR: <STATION>» (gross, invertiert) und «Umgeleitet, bitte weitergeben». Der Block wird beim Umleiten bzw. Einreihen in den `payload` geschrieben (ADR-008) und nur einmal gesetzt, auch wenn ein Zettel mehrmals verschoben wird.
- [ ] Ziel kann nur ein aktiver Drucker sein, nie der Quelldrucker selbst und nie ein selbst umgeleiteter Drucker. Ein Drucker, auf den umgeleitet wird, kann nicht umgeleitet, deaktiviert oder gelöscht werden. Damit gibt es keine Ketten und keine Schleifen.
- [ ] Ein bereits umgeleiteter Drucker kann auf ein anderes Ziel umgeleitet werden (z. B. wenn auch das Ziel ausfällt). Schon verschobene Jobs bleiben beim alten Ziel.
- [ ] Unter `/admin/printers` und `/admin/print-queue` ist eine aktive Umleitung sichtbar: Quelle, Ziel und Zeitpunkt. In der Warteschlange steht bei verschobenen Jobs «(für <Station>)».
- [ ] «Umleitung aufheben»: neue Jobs gehen wieder an den Quelldrucker; bereits umgeleitete Jobs bleiben beim Ziel.
- [ ] Testdrucke (F05, F11) eines umgeleiteten Druckers sind gesperrt, weil sie den Drucker selbst prüfen sollen. Zuerst die Umleitung aufheben.
- [ ] Die Umleitung ist in der Datenbank gespeichert und überlebt einen Neustart.
- [ ] Ein umgeleiteter Drucker kann deaktiviert werden; die Umleitung bleibt bestehen.

**Warteschlange** (`/admin/print-queue`)

- [ ] Liste aller Jobs mit Filter nach Drucker und Status; Standardfilter: nicht gedruckt.
- [ ] Pro Job: Bestellnummer/Tisch (bei `order`), Zieldrucker, Status, Versuche, letzter Fehler, Zeitpunkte; Vorschau des `payload` als Text.
- [ ] Aktionen pro Job: „Abbrechen“, „Erneut drucken“ (Kopie).
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
- Automatisches Umleiten ohne Admin, Lastverteilung zwischen Druckern, Umleiten einzelner Artikel.
- Unterschiedliche Papierbreiten: beide Modelle drucken 80 mm, der Zettel passt deshalb auf jedem Ziel.

## Abhängigkeiten

- F01, F03

## Offene Fragen

- keine
