# F04 – Angebot verwalten (Kategorien & Artikel)

**Status:** Umgesetzt
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
- [ ] Sortieren von Kategorien und von Artikeln innerhalb ihrer Kategorie per Drag & Drop über einen eigenen Griff (Handle) links am Eintrag; alternativ per Tastatur (Griff fokussieren, Pfeiltasten, Pos1/Ende). Die neue Reihenfolge wird sofort gespeichert. Wurde das Angebot inzwischen geändert, erscheint ein Hinweis und die aktuelle Reihenfolge wird neu geladen.
- [ ] Kategorien haben eine Farbe aus einer festen Palette von 10 Farben, passend zum Farbschema. Auswahl über ein Popover mit 10 Quadraten (Tastatur: Pfeiltasten). Neue Kategorien erhalten reihum eine noch passende Vorschlagsfarbe.
- [ ] Die Farbe erscheint in der Kategorienliste (Akzentbalken, Farbpunkt) und in der Bestellansicht (Kategorie-Chips und -Überschriften).
- [ ] Artikel: anlegen, bearbeiten (Name, Preis in CHF mit Rappen, Kategorie), aktiv/inaktiv (nur über die Schnellaktion in der Liste, nicht im Bearbeiten-Dialog). Neue oder in eine andere Kategorie verschobene Artikel kommen ans Ende der Kategorie.
- [ ] Artikel-Druckerwahl: „Wie Kategorie (= X)“ (`printerId` leer) oder ein konkreter Drucker. Ein Artikel kann den Druck nicht separat abschalten; „kein Druck“ wird über die Kategorie gesteuert.
- [ ] Artikel: optionale **Beschreibung** (≤ 200 Zeichen) und **Mindestalter** «Keines» / «16» / «18» (Auswahl, Standard «Keines»). In der Artikelliste erscheint ein Badge «16+»/«18+» und ein Hinweis auf die Anzahl Optionen.
- [ ] Artikel-**Optionen** (Domänenmodell `ArticleOption`) werden im Artikel-Dialog unter «Optionen» erfasst: «Option hinzufügen» mit Art «Anzahl», «Schalter» oder «Auswahl»; pro Option Name und Aufpreis in CHF (0 = gratis), entfernen per Papierkorb, Reihenfolge = Reihenfolge im Dialog (nach oben/unten verschiebbar).
  - «Anzahl»: zusätzlich Bereich von–bis (z. B. 0–4, höchstens 20); der Aufpreis gilt pro Stück.
  - «Schalter»: nur Name und Aufpreis (z. B. «ohne Sauce», «extra Käse +1.00»).
  - «Auswahl»: Schalter «Pflicht» und mindestens ein Wert mit Name und Aufpreis (Werte hinzufügen/entfernen).
  - Ungültige Eingaben (leerer Name, Bereich von > bis, Auswahl ohne Wert) werden beim Speichern mit einer Meldung abgelehnt.
- [ ] Optionen ändern wirkt nur auf neue Bestellungen; bestehende Positionen behalten ihre kopierten Optionstexte und Preise.
- [ ] Effektiver Drucker wird in der Artikelliste angezeigt.
- [ ] Artikel mit bestehenden Bestellungen werden deaktiviert statt gelöscht.
- [ ] Änderungen wirken sofort auf neue Bestellungen.

## Daten / API

- `Category`, `Article`, `Printer` (lesen)
- `MenuService` mit `CategoryRepository`, `ArticleRepository`

## UI

1. Kategorienliste mit Farbe und Drucker-Badge; ausklappbar die Artikel. Kategorien und Artikel haben je einen Drag-Griff zum Sortieren.
2. Drawer/Dialog zum Bearbeiten.
3. Schnellaktion „Ausverkauft“ (Toggle) in der Liste.

## Nicht im Scope

- CSV-Import/Export.
- Optionen, die von mehreren Artikeln gemeinsam genutzt werden (Vorlagen); Optionen gehören immer zu einem Artikel (Entscheid).
- Alterskontrolle beim Bestellen (Bestätigung o. ä.); das Mindestalter ist nur ein Hinweis (Entscheid).

## Abhängigkeiten

- F01, F05

## Offene Fragen

- keine
