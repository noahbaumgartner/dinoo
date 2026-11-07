# F02 – Bestellung aufnehmen

**Status:** Umgesetzt
**Priorität:** Muss

## Ziel

Service-Personal nimmt am Tisch eine Bestellung in vier Schritten auf: Tisch wählen, Artikel wählen, abschicken, abrechnen. Die Zettel gehen automatisch an die Drucker (F03), die Abrechnung ist F07.

## User Stories

- Als Service-Mitarbeiter möchte ich mit wenigen Taps Tisch und Artikel wählen, damit die Aufnahme nicht länger dauert als mit Block und Stift.
- Als Service-Mitarbeiter möchte ich nach dem Abschicken direkt kassieren können, damit ich den Tisch nicht zweimal besuchen muss.

## Ablauf (verbindlich)

1. **Tisch auswählen** – Saalplan als Raster, darunter die freien Tische (grosse Kacheln).
2. **Artikel auswählen** – nach Kategorie gruppiert, Menge per +/–, laufende Zwischensumme, optionale Notiz.
3. **Bestellung abschicken** – ein Button. Speichert, vergibt Bestellnummer, erzeugt PrintJobs (F03).
4. **Bestellung abrechnen** – Bar (mit Rechnungshilfe) oder TWINT-Code anzeigen (F07). Kann übersprungen und später nachgeholt werden.

## Akzeptanzkriterien

- [ ] Nur angemeldete Benutzer (`service` oder `admin`).
- [ ] Schritt 1 zeigt den Saalplan als Raster (Zeilen × Spalten wie in F06); inaktive Rastertische sind leere Stellen. Darunter die aktiven freien Tische, sortiert nach `sortOrder`. Ist der Plan breiter als der Bildschirm, scrollt er horizontal. **Pflichtfeld: Tisch.** Ein Name des Bestellers wird nicht erfasst.
- [ ] Schritt 2 zeigt nur aktive Artikel in aktiven Kategorien; Menge per +/– (0 entfernt die Position); Zwischensumme laufend sichtbar; Zurück zu Schritt 1 ohne Datenverlust.
- [ ] Schritt 3 ist ein einziger Button „Bestellung abschicken“, deaktiviert ohne Position. Doppelklick/Netzwerk-Retry erzeugt keine zweite Bestellung (Idempotenz-Token).
- [ ] Beim Abschicken: `orderNumber` fortlaufend; `tableLabel`, `articleName`, `priceCents`, effektiver `printerId` und `totalCents` als Snapshot gespeichert.
- [ ] Bestellung wird gespeichert und die Zettel in die Druckwarteschlange gestellt (F03); auch bei nicht erreichbarem Drucker geht die Bestellung durch. Druckstatus pro Drucker sichtbar (wartet / gedruckt).
- [ ] Nach Schritt 3 wechselt die Ansicht automatisch zu Schritt 4 (F07) mit Bestellnummer und Betrag.
- [ ] „Neue Bestellung“ startet wieder bei Schritt 1.

## Daten / API

- Liest: `Table`, `Category`, `Article`
- Schreibt: `Order`, `OrderItem` via `OrderService.placeOrder()`, der `PrintService` (F03) anstösst.

## UI

- Fortschrittsanzeige der 4 Schritte oben, fixe Aktionsleiste unten (Zwischensumme + primärer Button).
- Mobile-first, Bedienelemente mindestens 44 px.

## Nicht im Scope

- Bestellung nachträglich ändern oder stornieren: **bewusst nicht möglich**. Korrektur = neue Bestellung.
- Rabatte, Trinkgeld.

## Abhängigkeiten

- F01, F03, F04 (Angebot), F05 (Drucker), F06 (Tische), F07 (Abrechnung)

## Offene Fragen

- keine (Zieldrucker wird beim Bestellen **nicht** angezeigt, Entscheid)
