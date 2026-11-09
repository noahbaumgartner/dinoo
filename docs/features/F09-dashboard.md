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
- [ ] **Zeitraum (global):** Ein Von/Bis-Filter (Datum und Uhrzeit, auf die Minute) gilt für das ganze Dashboard: Kennzahlen, Einnahmenverlauf und verkaufte Artikel. Standardmässig sind die **letzten 6 Stunden bis jetzt** aktiv (rollierend, folgt dem Polling). Ein leeres Feld bedeutet keine Einschränkung auf dieser Seite; «Letzte 6 Stunden» setzt den Standard zurück. Der Zeitraum steht in der URL (`from`, `to`). Die Zeiten sind Ortszeit des Servers. Basis ist `Order.createdAt` (Grenzen inklusive); ist «Von» nach «Bis», bleibt das Dashboard leer.
- [ ] **Einnahmenverlauf (Liniendiagramm):** Umsatz pro Intervall (15 min / 30 min / 1 h wählbar) über den gewählten Zeitraum (Lücken als 0, höchstens bis jetzt), Basis `Order.totalCents` nach `createdAt`. Ohne Startzeit beginnt das Diagramm bei der ersten Bestellung.
- [ ] **Verkaufte Artikel (Balkendiagramm):** Stückzahl pro Artikel (`Σ OrderItem.quantity`), absteigend sortiert, nach Kategorie filterbar.
- [ ] **Summe der verkauften Artikel:** Gesamtstückzahl als Kennzahl über dem Balkendiagramm; dazu Gesamtumsatz als zweite Kennzahl.
- [ ] Aktualisiert sich automatisch (Polling, ~30 s).
- [ ] Alle Zahlen basieren auf Snapshots (`OrderItem.priceCents`, `quantity`), nicht auf aktuellen Artikelpreisen.

## Daten / API

- Liest: `Order`, `OrderItem`, `Article`, `Category`
- `StatsService.dashboard(interval, range, categoryId?)` mit `range = { from?, to? }` (`undefined` = Standard, `null` = unbegrenzt)

## UI

- Zeitraum-Filter (Von/Bis mit Datums-/Zeitwahl) oben, darunter Kennzahlen als zwei Kacheln, darunter Liniendiagramm in voller Breite, darunter Balkendiagramm.
- Diagramme: Svelte-Chart-Bibliothek ohne Internetabhängigkeit (z. B. `layerchart`) oder eigenes SVG.

## Nicht im Scope

- Bar/TWINT-Aufteilung, Bar pro Mitarbeiter, Drucker-Status (bei Bedarf später; Drucker-Status ist in F05).
- Export (CSV/PDF).
- Vergleich zwischen Anlässen (eine Datenbank = ein Anlass).

## Abhängigkeiten

- F02

## Offene Fragen

- keine
