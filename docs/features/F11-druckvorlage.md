# F11 – Druckvorlage

**Status:** Entwurf
**Priorität:** Soll

## Ziel

Der Admin legt in einer Druckvorlage fest, was auf dem Bestellzettel steht, in welcher Reihenfolge, wie ausgerichtet und in welcher Grösse. Eine Vorlage gilt für alle Drucker des Anlasses.

## User Stories

- Als Admin möchte ich den Bestellzettel an unseren Anlass anpassen (z. B. Tisch riesig und invertiert, Anlassname weg), damit die Küche das Wichtige sofort sieht.
- Als Admin möchte ich beim Bearbeiten sehen, wie der Zettel aussieht, und ihn mit Beispieldaten testweise drucken, bevor ich speichere.
- Als Admin möchte ich jederzeit zur Standardvorlage zurückkehren können.

## Grundsatz

Ein Bondrucker druckt fortlaufend Zeile für Zeile, es gibt keine freie Positionierung (→ ADR-008). „Was wo“ heisst daher: **Reihenfolge der Blöcke** und **Ausrichtung**. „Grösse“ heisst: ESC/POS-Vergrösserung in Breite und Höhe.

## Aufbau der Vorlage

Eine Vorlage ist eine geordnete Liste von **Blöcken**:

| Block   | Einstellungen                                                                                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`  | Text mit Platzhaltern + Stil                                                                                                                                                            |
| `items` | **Positionszeile** (Text mit Platzhaltern + Stil) und **Notizzeile** (Text mit Platzhaltern + Stil); wird pro Position des Zettels wiederholt, die Notizzeile nur bei vorhandener Notiz |
| `rule`  | Trennlinie, Zeichen `-` oder `=`                                                                                                                                                        |
| `feed`  | Leerzeilen, 1–5                                                                                                                                                                         |

**Stil** (für `text`, Positions- und Notizzeile):

| Eigenschaft | Werte                                  | Standard |
| ----------- | -------------------------------------- | -------- |
| align       | `left` \| `center` \| `right`          | `left`   |
| width       | 1–4 (Vervielfachung der Zeichenbreite) | 1        |
| height      | 1–4 (Vervielfachung der Zeichenhöhe)   | 1        |
| bold        | ja/nein                                | nein     |
| underline   | ja/nein                                | nein     |
| invert      | ja/nein (weiss auf schwarz)            | nein     |

**Platzhalter** (Schreibweise `{name}`):

| Platzhalter       | Wert                                   | Verfügbar in       |
| ----------------- | -------------------------------------- | ------------------ |
| `{anlass}`        | `Settings.eventName`                   | überall            |
| `{bestellnummer}` | `Order.orderNumber`                    | überall            |
| `{tisch}`         | `Order.tableLabel`                     | überall            |
| `{datum}`         | Bestelldatum `TT.MM.JJJJ`              | überall            |
| `{zeit}`          | Bestellzeit `HH:MM`                    | überall            |
| `{service}`       | `User.displayName` des Erfassers       | überall            |
| `{drucker}`       | `Printer.name` des Zieldruckers        | überall            |
| `{anzahl}`        | Summe der Mengen auf **diesem** Zettel | überall            |
| `{menge}`         | `OrderItem.quantity`                   | nur Positionszeile |
| `{artikel}`       | `OrderItem.articleName`                | nur Positionszeile |
| `{notiz}`         | `OrderItem.note`                       | nur Notizzeile     |

**Standardvorlage** (entspricht dem bisherigen, fest programmierten Zettel):

```
text  "{anlass}"                    center
text  "Bestellung {bestellnummer}"  center, 2×2
text  "Tisch {tisch}"               center, 2×2, fett
text  "{datum} {zeit}"              center
rule  "-"
items "{menge} x {artikel}" fett  /  "  > {notiz}"
rule  "-"
text  "Aufgenommen von: {service}"
feed  1
```

## Akzeptanzkriterien

**Speichern und Validieren**

- [ ] Es gibt genau **eine** Vorlage pro Anlass-Datenbank, gespeichert als JSON in `Settings.ticketTemplate`. Fehlt der Eintrag, gilt die Standardvorlage.
- [ ] Die Vorlage gilt für alle Bestellzettel aller Drucker.
- [ ] Beim Speichern wird validiert; bei Fehlern wird nicht gespeichert und eine verständliche Meldung pro Block angezeigt:
  - genau ein `items`-Block,
  - nur bekannte Platzhalter, und nur dort, wo sie verfügbar sind (`{artikel}` ausserhalb der Positionszeile ist ein Fehler),
  - Stilwerte im erlaubten Bereich, `feed` 1–5, höchstens 30 Blöcke, Texte höchstens 200 Zeichen.
- [ ] „Auf Standard zurücksetzen“ ersetzt die Vorlage nach Bestätigung durch die Standardvorlage.

**Rendern** (in `TicketService`)

- [ ] Beim Einreihen einer Bestellung (F03) wird der Zettel mit der **aktuell gespeicherten** Vorlage gerendert und als `payload` gespeichert. Spätere Änderungen an der Vorlage ändern wartende oder gedruckte Jobs nicht.
- [ ] Platzhalter werden durch ihre Werte ersetzt. Ergibt ein `text`-Block nach dem Ersetzen nur Leerzeichen (z. B. `{anlass}` ohne Anlassname), wird die Zeile weggelassen.
- [ ] Jede Zeile wird an Wortgrenzen auf die nutzbare Breite umgebrochen: `floor(42 / width)` Zeichen. Ein einzelnes Wort, das länger ist, wird hart getrennt. Fortsetzungszeilen behalten den Stil.
- [ ] Positionen erscheinen in derselben Reihenfolge wie heute (F03).
- [ ] Jeder Zettel endet mit einem Schnitt; Umlaute werden korrekt gedruckt.
- [ ] Das Drucker-Repository setzt Ausrichtung, Breite/Höhe, Fett, Unterstrichen und Invertiert in ESC/POS um; die Textvorschau der Warteschlange (F05) zeigt den Inhalt lesbar an (Stil nur angedeutet).

**Editor** (`/admin/print-template`, nur `admin`)

- [ ] Blöcke hinzufügen, löschen und per Drag-Handle umsortieren.
- [ ] Pro Block die Einstellungen aus „Aufbau der Vorlage“ bearbeiten; Platzhalter lassen sich über Chips an der Cursorposition einfügen.
- [ ] Eine **Live-Vorschau** zeigt den Zettel mit Beispieldaten (siehe unten) als Papierstreifen mit 42 Zeichen Breite; Grössen, Ausrichtung, Fett, Unterstrichen und Invertiert werden nachgebildet. Sie aktualisiert sich bei jeder Änderung, auch vor dem Speichern.
- [ ] Zeilen, die in der Vorschau umbrechen, werden markiert (Hinweis „bricht um“), damit der Admin die Grösse anpassen kann.
- [ ] Ungespeicherte Änderungen sind erkennbar; beim Verlassen der Seite wird gewarnt.

**Testdruck mit Vorlage**

- [ ] Im Editor gibt es „Testdruck“ mit Auswahl des Druckers (aktive Drucker).
- [ ] Gedruckt wird die Vorlage **so, wie sie gerade im Editor steht** (auch ungespeichert), gefüllt mit den Beispieldaten. Sie muss dafür gültig sein; sonst erscheinen dieselben Meldungen wie beim Speichern.
- [ ] Der Testdruck läuft als `PrintJob` `kind = test` über die Warteschlange (F03) und ist in der Warteschlange sichtbar; ein Hinweis bestätigt das Einreihen.
- [ ] Der Testdruck in der Druckerliste (F05) bleibt davon unabhängig (Titel + Witz, ohne Vorlage).

**Beispieldaten** (Vorschau und Testdruck, fest)

- Anlass: `Settings.eventName` (leer → „Musterfest“), Bestellnummer 42, Tisch „B07“, aktuelles Datum und Zeit, Service: angemeldeter Admin, Drucker: gewählter Drucker (Vorschau: „Küche“).
- Positionen: `2 x Pommes`, `1 x Bratwurst` mit Notiz „ohne Senf, extra Brot“, `3 x Rivella`, `1 x Cordon bleu mit Pommes und Salat` (langer Name, zeigt den Umbruch).

## Daten / API

- Liest/schreibt: `Settings.ticketTemplate` (neu, → `02-domain-model.md`)
- Schreibt: `PrintJob` (`kind = test`) für den Testdruck
- `SettingsService`: Vorlage lesen (inkl. Standard), validieren, speichern, zurücksetzen. Validierung und Rendern sind reine Funktionen in den Services und ohne Datenbank testbar.
- `TicketService.orderTicket` rendert mit der Vorlage; neu `TicketService.templateTestTicket(template, sample)`.
- `PrintQueueService.enqueueTemplateTest(printerId, template)`.
- Das gespeicherte `Ticket`-Format (`payload`) wird erweitert: `align` um `right`, `size` ersetzt durch `width`/`height`, neu `underline` und `invert`. Bestehende `payload`s mit `size: 'large'` werden weiterhin als 2×2 gedruckt.

## UI / Ablauf

1. Admin öffnet „Druckvorlage“ im Admin-Menü.
2. Oben die Blockliste (auf dem Handy), daneben bzw. darunter die Vorlage als Papierstreifen. Auf breiten Bildschirmen zweispaltig, Vorschau bleibt beim Scrollen sichtbar.
3. Block antippen → Einstellungen klappen auf: Textfeld mit Platzhalter-Chips, Ausrichtung als Segmentauswahl, Breite und Höhe als Stepper (oder Schnellwahl 1×1 / 1×2 / 2×2), Schalter für Fett, Unterstrichen, Invertiert.
4. „+ Block“ fügt Text, Linie oder Abstand ein (der `items`-Block existiert immer genau einmal und kann nur verschoben werden).
5. Aktionen: „Speichern“, „Testdruck …“, „Auf Standard zurücksetzen“.

## Nicht im Scope

- Freie Positionierung (x/y), Bilder/Logos, QR- und Barcodes.
- Mehrere Vorlagen oder eine Vorlage pro Drucker (Erweiterung später möglich).
- Bedingungen und Logik in der Vorlage (ausser: Notizzeile nur bei Notiz, leere Textzeilen entfallen).
- Preise auf dem Zettel; Quittung für den Gast.
- Vorlage für den Drucker-Testdruck (F05).

## Abhängigkeiten

- F03 (Rendern beim Einreihen, Warteschlange), F05 (Drucker, Warteschlangen-Vorschau), F06 (Einstellungen)

## Offene Fragen

- keine
