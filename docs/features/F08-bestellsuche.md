# F08 – Bestellungen suchen

**Status:** Bereit
**Priorität:** Muss

## Ziel
Der Admin findet jede Bestellung schnell wieder: nach Tisch, nach Service-Mitarbeiter oder nach Bestellnummer, und sieht alle Details inkl. Druck- und Zahlungsstatus.

## User Stories
- Als Admin möchte ich bei einer Reklamation („Tisch 12 hat keine Pommes bekommen“) sofort die Bestellungen von Tisch 12 sehen.
- Als Admin möchte ich zu einer Bestellnummer vom Zettel die Bestellung aufrufen.
- Als Admin möchte ich sehen, welche Bestellungen ein bestimmter Helfer aufgenommen hat.

## Akzeptanzkriterien
- [ ] Nur Rolle `admin` (`/admin/orders`).
- [ ] Ein Suchfeld plus Filter: **Tisch** (Auswahl), **Personal** (Auswahl), **Bestellnummer** (exakt). Freitext im Suchfeld trifft Bestellnummer und Name des Bestellers.
- [ ] Zusatzfilter: Zahlungsstatus (offen / teilbezahlt / bezahlt), Zeitraum.
- [ ] Ergebnisliste, neueste zuerst: Bestellnummer, Zeit, Tisch, Besteller, Personal, Betrag, Zahlungsstatus, Druckstatus (alle Zettel gedruckt / wartend).
- [ ] Detailansicht: Positionen, Zahlungen, PrintJobs mit Status; von dort: Zahlung erfassen/löschen (F07), Zettel erneut drucken (F05).
- [ ] Ergebnis wird paginiert oder begrenzt (z. B. 100), Suche antwortet unter 500 ms bei 5000 Bestellungen.

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
- Soll der Service (nicht nur Admin) seine eigenen Bestellungen suchen dürfen? Vorerst nur „Offene Bestellungen“ pro Tisch (F07).
