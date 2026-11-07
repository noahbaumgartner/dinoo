# ADR-008 – Druckvorlage als Blockliste

**Datum:** 2026-11-07
**Status:** Angenommen

## Kontext

Der Bestellzettel soll konfigurierbar werden: was gedruckt wird, wo und in welcher Grösse (F11). Gedruckt wird auf Epson TM-T20III/IV über ESC/POS. Diese Drucker arbeiten zeilenweise im Standard-Modus; Grössen sind ganzzahlige Vervielfachungen der Zeichenbreite und -höhe. Bearbeitet wird die Vorlage auch auf dem Handy, und Fehler sollen nicht erst am Anlass auffallen.

## Entscheidung

Die Vorlage ist eine **geordnete Liste typisierter Blöcke** (`text`, `items`, `rule`, `feed`) mit Stil (Ausrichtung, Breite/Höhe 1–4, fett, unterstrichen, invertiert) und festen Platzhaltern (`{tisch}`, `{bestellnummer}`, …). Sie wird als JSON in `Settings.ticketTemplate` gespeichert, beim Speichern validiert und beim Einreihen vom `TicketService` zum bestehenden geräteunabhängigen `Ticket` gerendert. Pro Anlass gibt es genau eine Vorlage für alle Drucker.

## Alternativen

- **Freier Layout-Designer mit x/y-Positionen:** Passt nicht zum zeilenweisen Druck; der ESC/POS-Page-Mode ist umständlich und je Modell unterschiedlich. Am Handy kaum bedienbar.
- **Template-Sprache als Freitext** (z. B. Mustache mit Stil-Tags): Sehr flexibel, aber Syntaxfehler und unbekannte Felder fallen erst beim Drucken auf; schwer verständlich für Vereinsadmins.
- **Vorlage pro Drucker:** Mehr Aufwand in UI und Datenmodell ohne aktuellen Bedarf; als Override später ergänzbar.

## Konsequenzen

- Der Editor kann nur gültige Strukturen erzeugen; Validierung beschränkt sich auf Platzhalter und Wertebereiche.
- Vorschau im Browser und Druck nutzen dasselbe Rendern zum `Ticket`, die Vorschau ist daher verlässlich (bis auf die Schrift).
- Das `Ticket`-Format wird erweitert (`width`/`height`, `right`, `underline`, `invert`); alte `payload`s mit `size: 'large'` bleiben druckbar.
- Gerenderte Zettel sind Momentaufnahmen: Vorlagenänderungen wirken nur auf neue Jobs.
- Was die Blöcke nicht abbilden (Logos, Barcodes, Bedingungen), braucht später neue Blocktypen.
