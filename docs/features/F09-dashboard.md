# F09 – Dashboard

**Status:** Umgesetzt
**Priorität:** Soll

## Ziel

Der Admin sieht auf einen Blick, wie der Anlass läuft: Einnahmenverlauf als Liniendiagramm, verkaufte Artikel als Balkendiagramm und die Summe der verkauften Artikel.

## User Stories

- Als Admin möchte ich den Einnahmenverlauf über die Zeit sehen, um Stosszeiten zu erkennen.
- Als Admin möchte ich sehen, welche Artikel wie oft verkauft wurden, um Nachschub zu planen.

## Akzeptanzkriterien

- [ ] Nur Rolle `admin` (`/admin`, Startseite des Admin-Bereichs).
- [ ] **Einnahmenverlauf (Liniendiagramm):** Umsatz pro Intervall (15 min / 30 min / 1 h wählbar) über die Dauer des Anlasses, Basis `Order.totalCents` nach `createdAt`.
- [ ] **Verkaufte Artikel (Balkendiagramm):** Stückzahl pro Artikel (`Σ OrderItem.quantity`), absteigend sortiert, nach Kategorie filterbar.
- [ ] **Summe der verkauften Artikel:** Gesamtstückzahl als Kennzahl über dem Balkendiagramm; dazu Gesamtumsatz als zweite Kennzahl.
- [ ] Aktualisiert sich automatisch (Polling, ~30 s).
- [ ] Alle Zahlen basieren auf Snapshots (`OrderItem.priceCents`, `quantity`), nicht auf aktuellen Artikelpreisen.

## Daten / API

- Liest: `Order`, `OrderItem`, `Article`, `Category`
- `StatsService.revenueTimeline(interval)`, `StatsService.articleSales(categoryId?)`

## UI

- Kennzahlen als zwei Kacheln, darunter Liniendiagramm in voller Breite, darunter Balkendiagramm.
- Diagramme: Svelte-Chart-Bibliothek ohne Internetabhängigkeit (z. B. `layerchart`) oder eigenes SVG.

## Nicht im Scope

- Bar/TWINT-Aufteilung, Bar pro Mitarbeiter, Drucker-Status (bei Bedarf später; Drucker-Status ist in F05).
- Export (CSV/PDF).
- Vergleich zwischen Anlässen (eine Datenbank = ein Anlass).

## Abhängigkeiten

- F02

## Offene Fragen

- keine
