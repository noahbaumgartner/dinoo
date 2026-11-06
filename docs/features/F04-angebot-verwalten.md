# F04 – Angebot verwalten (Kategorien & Artikel)

**Status:** Bereit
**Priorität:** Muss

## Ziel
Der Admin pflegt Kategorien und Artikel inkl. Preisen, legt pro Kategorie den Standard-Drucker fest und kann ihn pro Artikel überschreiben.

## User Stories
- Als Admin möchte ich vor dem Anlass Kategorien und Artikel mit Preisen erfassen, damit der Service sofort bestellen kann.
- Als Admin möchte ich während des Anlasses einen Artikel als ausverkauft markieren.
- Als Admin möchte ich festlegen, dass „Warme Küche“ auf den Küchendrucker geht, die „Bratwurst“ daraus aber auf den Grilldrucker.

## Akzeptanzkriterien
- [ ] Nur Rolle `admin` (`/admin/menu`).
- [ ] Kategorien: anlegen, umbenennen, sortieren, Standard-Drucker wählen (inkl. „kein Druck“); löschen nur ohne Artikel.
- [ ] Artikel: anlegen, bearbeiten (Name, Preis in CHF mit Rappen, Kategorie, Sortierung), aktiv/inaktiv.
- [ ] Artikel-Druckerwahl über `printerMode`: „Standard der Kategorie (= X)“ (`inherit`), konkreter Drucker (`custom`), „kein Druck“ (`none`).
- [ ] Effektiver Drucker wird in der Artikelliste angezeigt.
- [ ] Artikel mit bestehenden Bestellungen werden deaktiviert statt gelöscht.
- [ ] Änderungen wirken sofort auf neue Bestellungen.

## Daten / API
- `Category`, `Article`, `Printer` (lesen)
- `MenuService` mit `CategoryRepository`, `ArticleRepository`

## UI
1. Kategorienliste mit Drucker-Badge; ausklappbar die Artikel.
2. Drawer/Dialog zum Bearbeiten.
3. Schnellaktion „Ausverkauft“ (Toggle) in der Liste.

## Nicht im Scope
- CSV-Import/Export.
- Varianten/Optionen (Grösse, Beilage).

## Abhängigkeiten
- F01, F05

## Offene Fragen
- keine
