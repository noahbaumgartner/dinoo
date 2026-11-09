# F09 – Dashboard

**Status:** Umgesetzt
**Priorität:** Soll

## Ziel

Der Admin sieht auf einen Blick, wie der Anlass läuft: Einnahmenverlauf als Liniendiagramm, verkaufte Artikel als Balkendiagramm, die Summe der verkauften Artikel sowie Umsatz pro Personal und pro Tisch.

## User Stories

- Als Admin möchte ich den Einnahmenverlauf über die Zeit sehen, um Stosszeiten zu erkennen.
- Als Admin möchte ich sehen, welche Artikel wie oft verkauft wurden, um Nachschub zu planen.
- Als Admin möchte ich sehen, wer wie viel Umsatz eingebracht hat und welche Tische am meisten bestellen.

## Akzeptanzkriterien

- [ ] Nur Rolle `admin` (`/admin`, Startseite des Admin-Bereichs).
- [ ] **Zeitraum (global):** Ein Von/Bis-Filter (Datum und Uhrzeit, auf die Minute) gilt für das ganze Dashboard: Kennzahlen, Einnahmenverlauf und verkaufte Artikel. Standardmässig sind die **letzten 6 Stunden bis jetzt** aktiv (rollierend, folgt dem Polling). Ein leeres Feld bedeutet keine Einschränkung auf dieser Seite; «Letzte 6 Stunden» setzt den Standard zurück. Der Zeitraum steht in der URL (`from`, `to`). Die Zeiten sind Ortszeit des Servers. Basis ist `Order.createdAt` (Grenzen inklusive); ist «Von» nach «Bis», bleibt das Dashboard leer.
- [ ] **Einnahmenverlauf (Liniendiagramm):** Umsatz pro Intervall (15 min / 30 min / 1 h wählbar) über den gewählten Zeitraum (Lücken als 0, höchstens bis jetzt), Basis `Order.totalCents` nach `createdAt`. Ohne Startzeit beginnt das Diagramm bei der ersten Bestellung.
- [ ] **Umsatz oder Anzahl:** Ein Umschalter («Umsatz» / «Anzahl», URL-Parameter `metric`, Standard Umsatz) gilt für alle Diagramme. «Anzahl» heisst: Bestellungen pro Intervall, Stück pro Artikel, Bestellungen pro Person und pro Tisch. Das jeweils andere Mass steht als Zusatz neben dem Balken. Sortiert wird nach dem gewählten Mass.
- [ ] **Verkaufte Artikel (Balkendiagramm):** Stückzahl (`Σ OrderItem.quantity`) bzw. Umsatz (`Σ quantity × priceCents`) pro Artikel, absteigend sortiert, nach Kategorie filterbar. Waagrechte Balken, damit die Namen lesbar bleiben.
- [ ] **Personal (Balkendiagramm):** Umsatz (`Σ Order.totalCents`) und Anzahl Bestellungen pro Service-Mitarbeiter (`Order.createdByUserId`), im gewählten Zeitraum. Unter den Artikeln.
- [ ] **Tische (Balkendiagramm):** Umsatz und Anzahl Bestellungen pro Tisch (`Order.tableId`, Bezeichnung als Snapshot), nur Tische mit Bestellungen im Zeitraum. Zuunterst. Gibt es mehrere Bereiche, steht der Bereich in Klammern hinter dem Tisch.
- [ ] **Summe der verkauften Artikel:** Gesamtstückzahl als Kennzahl über dem Balkendiagramm; dazu Gesamtumsatz als zweite Kennzahl.
- [ ] Aktualisiert sich automatisch (Polling, ~30 s).
- [ ] Alle Zahlen basieren auf Snapshots (`OrderItem.priceCents`, `quantity`), nicht auf aktuellen Artikelpreisen.

## Daten / API

- Liest: `Order`, `OrderItem`, `Article`, `Category`, `User`
- `StatsService.dashboard(interval, range, categoryId?)` liefert Kennzahlen, Verlauf, Artikel, Personal und Tische; `range = { from?, to? }` (`undefined` = Standard, `null` = unbegrenzt)

## UI

- Zeitraum-Filter (Von/Bis mit Datums-/Zeitwahl) oben, darunter Kennzahlen als zwei Kacheln, darunter der Umschalter Umsatz/Anzahl, Liniendiagramm in voller Breite, Balkendiagramm der Artikel, Personal und zuunterst die Tische.
- Diagramme: Svelte-Chart-Bibliothek ohne Internetabhängigkeit (z. B. `layerchart`) oder eigenes SVG.

## Nicht im Scope

- Bar/TWINT-Aufteilung, Drucker-Status (bei Bedarf später; Drucker-Status ist in F05).
- Export (CSV/PDF).
- Vergleich zwischen Anlässen (eine Datenbank = ein Anlass).

## Abhängigkeiten

- F02

## Offene Fragen

- keine
