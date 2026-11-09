# F02 – Bestellung aufnehmen

**Status:** Umgesetzt
**Priorität:** Muss

## Ziel

Service-Personal nimmt am Tisch eine Bestellung in vier Schritten auf: Tisch wählen, Artikel wählen, abschicken, abrechnen. Die Zettel gehen automatisch an die Drucker (F03), die Abrechnung ist F07.

## User Stories

- Als Service-Mitarbeiter möchte ich mit wenigen Taps Tisch und Artikel wählen, damit die Aufnahme nicht länger dauert als mit Block und Stift.
- Als Service-Mitarbeiter möchte ich nach dem Abschicken direkt kassieren können, damit ich den Tisch nicht zweimal besuchen muss.

## Ablauf (verbindlich)

1. **Tisch auswählen** – bei mehreren Bereichen zuerst den Bereich, dann als Liste nach Reihen (Standard) oder als Tischplan-Raster, darunter die freien Tische (grosse Kacheln).
2. **Artikel auswählen** – nach Kategorie gruppiert, Positionen per «+» oder Stift, Menge pro Position per +/–, laufende Zwischensumme, optional Optionen und eine Notiz pro Position.
3. **Bestellung abschicken** – ein Button. Speichert, vergibt Bestellnummer, erzeugt PrintJobs (F03).
4. **Bestellung abrechnen** – Bar (mit Rechnungshilfe) oder TWINT-Code anzeigen (F07). Kann übersprungen und später nachgeholt werden.

## Akzeptanzkriterien

- [ ] Nur angemeldete Benutzer (`service` oder `admin`).
- [ ] **Bereich:** Haben mehrere Bereiche aktive Tische, zeigt Schritt 1 unter dem Titel eine Auswahl der Bereiche (Tabs, scrollen seitwärts bei vielen Bereichen); angezeigt werden nur die Tische des gewählten Bereichs. Die Wahl wird pro Gerät gemerkt (ein Helfer arbeitet meist in einem Bereich); Standard ist der erste Bereich. Bereiche ohne aktive Tische erscheinen nicht. Hat nur ein Bereich aktive Tische, gibt es keine Auswahl und Schritt 1 sieht aus wie ohne Bereiche.
- [ ] Schritt 1 hat zwei Ansichten, umschaltbar über Tabs oben rechts («Liste» / «Plan»); Standard ist «Liste», die Wahl wird pro Gerät gemerkt. Die Tabs erscheinen nur, wenn der Bereich Rastertische hat.
- [ ] «Liste»: pro Zeile des Tischplans ein Untertitel «Reihe A» (bzw. «Reihe 1» bei Zahlen-Nummerierung), darunter die aktiven Tische der Reihe in Spaltenreihenfolge als Kacheln in derselben Grösse wie im Tischplan; Reihen ohne aktive Tische entfallen. Die freien Tische folgen unter «Weitere Tische».
- [ ] «Plan»: der Tischplan des Bereichs als Raster (Zeilen × Spalten wie in F06); inaktive Rastertische sind leere Stellen. Darunter die aktiven freien Tische, sortiert nach `sortOrder`. Ist der Plan breiter als der Bildschirm, scrollt er horizontal. **Pflichtfeld: Tisch.** Ein Name des Bestellers wird nicht erfasst.
- [ ] Schritt 2 zeigt nur aktive Artikel in aktiven Kategorien; Menge pro Position per +/– (0 entfernt die Position); Zwischensumme laufend sichtbar; Zurück zu Schritt 1 ohne Datenverlust.
- [ ] Artikelzeile: Name, Preis, darunter die Beschreibung (falls vorhanden, gedämpft) und bei Mindestalter 16/18 ein Badge «16+»/«18+».
- [ ] **Positionen:** Jede unterschiedliche Kombination aus Optionen und Notiz eines Artikels ist eine eigene Position, bei allen Artikeln, ob mit oder ohne Optionen. Die Artikelzeile hat rechts einen Stift und einen «+»-Button, aber keine Mengenauswahl. Die Positionen des Artikels stehen eingerückt darunter, ohne Akzentbalken, je mit den gewählten Optionen (z. B. «Sorte: Schoggi · 2× Becher»), Notiz (kursiv; ohne Optionen und Notiz steht «Standard»), Stückpreis, Stift und Mengenauswahl (0 entfernt die Position). Die Artikelzeile trägt den Akzentbalken, sobald der Artikel eine Position hat.
  - **«+»** (oder ein Tipp auf die Artikelzeile) fügt eine Position mit den Startwerten hinzu (Anzahl = von, Schalter aus, Auswahl leer, keine Notiz) bzw. erhöht deren Menge. Hat der Artikel eine **Pflicht-Auswahl**, öffnet sich stattdessen sofort der Drawer für eine neue Position.
  - **Stift in der Artikelzeile** öffnet den Drawer für eine neue Position, damit ein Artikel direkt mit Optionen bzw. Notiz erfasst werden kann; Button «Hinzufügen · Stückpreis».
  - **Stift in einer Position** öffnet deren Drawer mit «Speichern · Stückpreis» und «Entfernen».
  - Der Drawer hat als Titel den Artikelnamen, als Untertitel die Beschreibung, darin die Optionen (Anzahl als Mengenauswahl im Bereich, Schalter, Auswahl als Liste) je mit Aufpreis, darunter «Notiz für die Küche» (höchstens 200 Zeichen; leer gilt als keine). «Hinzufügen» bzw. «Speichern» ist erst möglich, wenn alle Pflicht-Auswahlen gewählt sind. Ergibt eine Änderung dieselbe Kombination wie eine andere Position, werden die beiden zusammengelegt.
  - Der Positionspreis ist (Artikelpreis + Aufpreise) × Menge. Eine Notiz für die ganze Bestellung gibt es nicht.
- [ ] **Fokus-Modus** ab Schritt 2: Die Kopfzeile zeigt statt Navigation und Benutzermenü nur «Bestellung · Tisch X» und einen Button «Abbrechen»; ein Wechsel auf eine andere Seite ist über das Menü nicht möglich. «Abbrechen» führt zurück zu Schritt 1 und hebt den Fokus-Modus auf.
- [ ] Gibt es bereits Positionen oder eine Notiz, fragt «Abbrechen» zuerst nach («Bestellung verwerfen?» mit «Verwerfen» / «Weiter bearbeiten»). Dieselbe Rückfrage kommt, wenn die Seite auf anderem Weg verlassen wird (z. B. Browser-Zurück). Beim Neuladen oder Schliessen des Tabs zeigt der Browser seine eigene Warnung. Nach dem Abschicken entfällt die Rückfrage.
- [ ] Schritt 3 öffnet sich als Drawer über den Artikeln („Prüfen“): Positionen mit ihren Optionen und Notizen, Total und ein einziger Button „Bestellung abschicken“, deaktiviert ohne Position. Doppelklick/Netzwerk-Retry erzeugt keine zweite Bestellung (Idempotenz-Token).
- [ ] Beim Abschicken: `orderNumber` fortlaufend; `tableLabel`, `articleName`, `priceCents` (inkl. Aufpreise), Optionstexte, effektiver `printerId` und `totalCents` als Snapshot gespeichert. Der Server prüft die Optionen gegen den aktuellen Artikel (Bereich, gültiger Wert, Pflicht-Auswahl) und lehnt sonst mit «Ein Artikel wurde geändert. Bitte Bestellung prüfen.» ab.
- [ ] Bestellung wird gespeichert und die Zettel in die Druckwarteschlange gestellt (F03); auch bei nicht erreichbarem Drucker geht die Bestellung durch. Die Bestellansicht zeigt keinen Druckstatus; wartende Zettel sind in der Bestellliste (F08) und im Admin (F05) sichtbar.
- [ ] Nach Schritt 3 wechselt die Ansicht automatisch zu Schritt 4 (F07) mit Bestellnummer und Betrag.
- [ ] „Neue Bestellung“ startet wieder bei Schritt 1.

## Daten / API

- Liest: `Table`, `Category`, `Article`
- Schreibt: `Order`, `OrderItem` via `OrderService.placeOrder()`, der `PrintService` (F03) anstösst.

## UI

- Keine Fortschrittsanzeige (spart Platz auf dem Handy). Ein Tipp auf einen Tisch führt direkt zu den Artikeln; ab Schritt 2 fixe Aktionsleiste unten (Zwischensumme + primärer Button, «Zurück»).
- Zwischenschritte (Prüfen, Bar, TWINT) erscheinen als Drawer – auf dem Handy von unten, ab 768 px als Panel rechts –, damit die Ansicht darunter sichtbar bleibt und alles auf einem Bildschirm Platz hat.
- Mobile-first, Bedienelemente mindestens 44 px.

## Nicht im Scope

- Bestellung nachträglich ändern oder stornieren: **bewusst nicht möglich**. Korrektur = neue Bestellung.
- Rabatte, Trinkgeld.

## Abhängigkeiten

- F01, F03, F04 (Angebot), F05 (Drucker), F06 (Tische), F07 (Abrechnung)

## Offene Fragen

- keine (Zieldrucker wird beim Bestellen **nicht** angezeigt, Entscheid)
