# ADR-002 – svelte-ui als Komponentenbibliothek, lokal via npm link

**Datum:** 2026-11-06
**Status:** Angenommen

## Kontext
Es existiert eine eigene Komponentenbibliothek `@noahbaumgartner/svelte-ui` (Svelte 5, Runes, CSS Custom Properties) unter `/Users/noah/Developer/personal/svelte-ui`. dinoo soll darauf aufbauen und die Bibliothek bei Bedarf weiterentwickeln.

## Entscheidung
- dinoo verwendet `@noahbaumgartner/svelte-ui` für alle UI-Bausteine.
- In der Entwicklung wird die **lokale Version per `npm link`** eingebunden, damit Änderungen an der Bibliothek sofort in dinoo sichtbar sind.
- **Fehlende generelle Komponenten werden in svelte-ui ergänzt**, nicht in dinoo. Voraussetzung: Die Komponente ist verallgemeinert (keine dinoo-spezifischen Begriffe, Daten oder Logik).
- dinoo-spezifische Zusammensetzungen (z. B. eine Bestellkarte mit Artikel + Menge + Preis) bleiben in dinoo unter `src/lib/components/`.

## Faustregel: wohin gehört eine Komponente?
| Frage | svelte-ui | dinoo |
|-------|-----------|-------|
| Wäre sie in einem anderen Projekt ohne Anpassung brauchbar? | ✓ | |
| Enthält sie Fachbegriffe (Bestellung, Artikel, Drucker)? | | ✓ |
| Greift sie auf dinoo-Daten oder -Services zu? | | ✓ |

## Alternativen
- **Fremde Bibliothek (shadcn-svelte, Skeleton, Melt):** Schneller Start, aber kein Mehrwert für die eigene Bibliothek und ein zweites Designsystem.
- **svelte-ui als veröffentlichtes npm-Paket einbinden:** Sauberer für Produktion, aber jede Änderung bräuchte einen Release-Zyklus. Kann später für Produktions-Builds umgestellt werden.

## Konsequenzen
- Setup-Schritt: `npm link` in svelte-ui, danach `npm link @noahbaumgartner/svelte-ui` in dinoo. Zu dokumentieren in der README.
- svelte-ui muss gebaut sein (`npm run build`), da `exports` auf `dist/` zeigt; alternativ `npm run dev`/Watch in svelte-ui laufen lassen.
- Für den Produktions-Build auf dem Server-Laptop wird das veröffentlichte Paket verwendet: `npm i @noahbaumgartner/svelte-ui`. Änderungen an svelte-ui, die dinoo braucht, müssen also vorher veröffentlicht sein.
