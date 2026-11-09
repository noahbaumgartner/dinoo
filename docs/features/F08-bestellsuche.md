# F08 – Bestellungen suchen

**Status:** Umgesetzt
**Priorität:** Muss

## Ziel

Der Admin findet jede Bestellung schnell wieder: nach Tisch, nach Service-Mitarbeiter oder nach Bestellnummer, und sieht alle Details inkl. Druck- und Zahlungsstatus. Der Service sieht eine reduzierte Variante nur für seine eigenen Bestellungen.

## User Stories

- Als Admin möchte ich bei einer Reklamation („Tisch 12 hat keine Pommes bekommen“) sofort die Bestellungen von Tisch 12 sehen.
- Als Admin möchte ich zu einer Bestellnummer vom Zettel die Bestellung aufrufen.
- Als Admin möchte ich sehen, welche Bestellungen ein bestimmter Helfer aufgenommen hat.

## Akzeptanzkriterien

**Admin** (`/admin/orders`)

- [ ] Filter: **Tisch** (Auswahl), **Personal** (Auswahl), **Bestellnummer** (exakt). Gibt es mehrere Bereiche, steht in der Tischauswahl der Bereich hinter dem Tisch (z. B. „A01 · Festzelt“), weil Tischnamen mehrfach vorkommen dürfen.
- [ ] Zusatzfilter: Zahlungsstatus (offen / teilbezahlt / bezahlt), Zeitraum.
- [ ] Ergebnisliste, neueste zuerst: Bestellnummer, Zeit, Tisch, Personal, Betrag, Zahlungsstatus, Druckstatus (alle Zettel gedruckt / wartend).
- [ ] Detailansicht: Positionen, Zahlungen, PrintJobs mit Status; von dort: Zahlung erfassen/löschen (F07), Zettel erneut drucken (F05).
- [ ] Ergebnis wird paginiert oder begrenzt (z. B. 100), Suche antwortet unter 500 ms bei 5000 Bestellungen.

**Service, reduziert** (`/orders`, „Meine Bestellungen“)

- [ ] Zeigt ausschliesslich Bestellungen mit `createdByUserId = aktueller Benutzer`; kein Personal-Filter.
- [ ] Filter: Tisch, Bestellnummer, Zahlungsstatus. Liste: Bestellnummer, Zeit, Tisch, Betrag, Zahlungsstatus.
- [ ] Detailansicht: Positionen und Zahlungen; einzige Aktion: Zahlung erfassen (F07). Keine PrintJob-Aktionen, kein Löschen von Zahlungen.
- [ ] Ersetzt die bisherige Ansicht „Offene Bestellungen“ aus F07 (dort als Standardfilter „offen“).

## Daten / API

- Liest: `Order`, `OrderItem`, `Payment`, `PrintJob`, `Table`, `User`
- `OrderQueryService.search(filter)`

## UI

- Suchleiste oben, Filter als Chips, Tabelle darunter; auf Mobile Karten statt Tabelle.

## Nicht im Scope

- Volltextsuche in Positionen.
- Export (→ F09 falls gewünscht).

## Abhängigkeiten

- F01, F02, F07

## Offene Fragen

- keine
