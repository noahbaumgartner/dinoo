# F09 – Dashboard

**Status:** Entwurf
**Priorität:** Soll

## Ziel
Der Admin sieht auf einen Blick, wie der Anlass läuft: Bestellverlauf über die Zeit als Graph, Einnahmen nach Zahlungsart, offene Beträge, meistbestellte Artikel und Zustand der Drucker.

## User Stories
- Als Admin möchte ich den Bestellverlauf (Anzahl Bestellungen und Umsatz pro Zeitabschnitt) als Kurve sehen, um Stosszeiten zu erkennen.
- Als Admin möchte ich sehen, wie viel bar und wie viel per TWINT eingenommen wurde und wie viel noch offen ist.
- Als Admin möchte ich wissen, welche Artikel wie oft bestellt wurden, um Nachschub zu planen.

## Akzeptanzkriterien
- [ ] Nur Rolle `admin` (`/admin`, Startseite des Admin-Bereichs).
- [ ] **Kennzahlen oben:** Bestellungen gesamt, Umsatz gesamt, davon Bar / TWINT, offen (Anzahl und Betrag).
- [ ] **Bestellverlauf als Liniendiagramm:** Anzahl Bestellungen und Umsatz pro Intervall (wählbar: 15 min / 30 min / 1 h) über die Dauer des Anlasses.
- [ ] **Artikel-Ranking:** Stückzahlen pro Artikel als Balkendiagramm oder Tabelle, nach Kategorie filterbar.
- [ ] **Bar pro Mitarbeiter:** Summe der Barzahlungen je `paidByUserId` (Kassenabschluss).
- [ ] **Drucker-Status:** pro Drucker erreichbar/nicht, wartende Jobs (Kurzform aus F05).
- [ ] Aktualisiert sich automatisch (Polling, ~30 s).
- [ ] Alle Zahlen basieren auf Snapshots (`OrderItem.priceCents`, `Payment`), nicht auf aktuellen Artikelpreisen.

## Daten / API
- Liest: `Order`, `OrderItem`, `Payment`, `PrintJob`, `Printer`, `Article`, `User`
- `StatsService.summary()`, `StatsService.timeline(interval)`, `StatsService.articleRanking()`

## UI
- Kennzahlen als Kacheln, darunter Verlaufsgraph in voller Breite, darunter zwei Spalten (Artikel, Mitarbeiter/Drucker).
- Diagramme: einfache Chart-Bibliothek ohne Internet-Abhängigkeit (z. B. `layerchart` für Svelte oder eigenes SVG).

## Nicht im Scope
- Export (CSV/PDF) – ggf. später.
- Vergleich zwischen Anlässen (eine Datenbank = ein Anlass).

## Abhängigkeiten
- F02, F03, F07

## Offene Fragen
- Genauer Umfang des Dashboards ist eine Annahme (Nachricht war abgeschnitten): Verlauf, Einnahmen, Artikel, Mitarbeiter, Drucker. Bitte bestätigen oder kürzen.
