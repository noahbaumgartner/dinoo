# F03 – Bestellzettel drucken

**Status:** Bereit
**Priorität:** Muss

## Ziel
Jede Bestellung wird automatisch auf die zuständigen Küchendrucker verteilt; pro Drucker ein Zettel mit genau den Positionen, die dort zubereitet werden.

## User Stories
- Als Küche möchte ich pro Bestellung einen Zettel mit Bestellnummer, Tisch, Name und meinen Positionen, damit ich ohne Bildschirm arbeiten kann.
- Als Admin möchte ich fehlgeschlagene Drucke sehen und wiederholen können, damit keine Bestellung verloren geht.

## Akzeptanzkriterien
- [ ] Beim Abschicken wird pro **effektivem Drucker** (Regel in `02-domain-model.md`) genau ein `PrintJob` (`pending`) erzeugt; Positionen ohne Drucker erzeugen keinen Job.
- [ ] Zettelinhalt gemäss „Bestellzettel“ in `02-domain-model.md`: Anlassname, Bestellnummer, Datum/Zeit, Tisch, Name des Bestellers, Positionen (Menge × Name), Notiz, aufgenommen von.
- [ ] Bestellnummer und Tisch in doppelter Grösse; Zettel endet mit Schnitt.
- [ ] Umlaute (ä ö ü) werden korrekt ausgegeben.
- [ ] Druck läuft asynchron nach dem Speichern; die Antwort an den Service wartet nicht auf den Drucker. Druckstatus wird per Polling auf der Bestätigung angezeigt.
- [ ] Bei Fehler: `attempts` +1, bis zu 3 automatische Versuche mit kurzer Pause, danach `failed` mit `lastError`.
- [ ] Admin kann fehlgeschlagene Jobs erneut drucken (→ `pending`) oder auf einen anderen Drucker umleiten.
- [ ] Testdruck pro Drucker aus dem Admin-Interface (F05).
- [ ] In Entwicklung und Tests ersetzt ein Fake-`PrinterRepository` die Hardware (loggt Zettel als Text).

## Daten / API
- Liest: `Order`, `OrderItem`, `Printer`, `Settings.eventName`
- Schreibt: `PrintJob`
- `PrintService` nutzt `PrintJobRepository` (DB) und `PrinterRepository` (ESC/POS über TCP, Port 9100).

## UI
- Kein eigenes UI im Normalfall. Druckstatus auf der Bestätigung (F02) und in der Admin-Druckübersicht (F05).

## Nicht im Scope
- Bildschirm-Küchenansicht (offen).
- Quittung für den Gast.

## Abhängigkeiten
- F02, F05

## Offene Fragen
- Vermerk auf dem Zettel, dass weitere Positionen an anderen Druckern liegen („+ 2 Positionen Grill“)?
- Druck-Library vs. direktes ESC/POS → `open-questions.md`
- Bei längerem Druckerausfall: Jobs automatisch umleiten oder nur manuell?
