# F03 – Bestellzettel drucken (Druckwarteschlange)

**Status:** Umgesetzt
**Priorität:** Muss

## Ziel

Jede Bestellung wird automatisch auf die zuständigen Küchendrucker verteilt; pro Drucker ein Zettel mit genau den Positionen, die dort zubereitet werden. Alles läuft über eine persistente Warteschlange: Ist ein Drucker nicht erreichbar, wartet alles und wird nach dem Wiederverbinden lückenlos nachgedruckt.

## User Stories

- Als Küche möchte ich pro Bestellung einen Zettel mit Bestellnummer, Tisch und meinen Positionen, damit ich ohne Bildschirm arbeiten kann.
- Als Admin möchte ich sehen, was in der Warteschlange hängt, und nach einem Druckerausfall sicher sein, dass nichts verloren ging.

## Akzeptanzkriterien

**Einreihen**

- [ ] Beim Abschicken wird pro **effektivem Drucker** (Regel in `02-domain-model.md`) genau ein `PrintJob` (`kind = order`, `status = queued`) erzeugt; Positionen ohne Drucker erzeugen keinen Job.
- [ ] Der Zettel wird beim Einreihen mit der aktuellen **Druckvorlage** (F11) fertig gerendert und als `payload` gespeichert (Inhalt gemäss „Bestellzettel“ in `02-domain-model.md`).
- [ ] Standardvorlage: Bestellnummer und Tisch in doppelter Grösse; jeder Zettel endet mit Schnitt; Umlaute korrekt.
- [ ] Testdrucke (F05) laufen ebenfalls als `PrintJob` (`kind = test`) über die Warteschlange.

**Abarbeiten**

- [ ] Ein Worker pro Drucker arbeitet die Jobs streng nach `createdAt` ab (FIFO); nur ein Job pro Drucker ist gleichzeitig `printing`.
- [ ] Bei Fehler (nicht erreichbar, Timeout, Verbindungsabbruch): `attempts` +1, `lastError`, `lastAttemptAt`; Job **bleibt `queued`**. Der Worker versucht es weiter, mit wachsendem Abstand (z. B. 2 s → 5 s → 15 s → max. 30 s), unbegrenzt.
- [ ] Sobald der Drucker wieder erreichbar ist, werden **alle** wartenden Jobs in Reihenfolge nachgedruckt, ohne manuelles Eingreifen.
- [ ] Ein Druck gilt nur als `printed`, wenn der Drucker den Druck bestätigt hat (ePOS-Print `success="true"`); Fehlercodes wie Deckel offen oder Papier leer erscheinen als `lastError`.
- [ ] Beim Start der Anwendung werden `printing`-Jobs auf `queued` zurückgesetzt (Absturz während des Drucks), und die Warteschlange läuft weiter.
- [ ] Die Antwort an den Service wartet nicht auf den Drucker.
- [ ] Pro Datenverzeichnis arbeitet nur ein Prozess die Warteschlange ab; ein Prozess mit Fake-Drucker druckt nie Jobs, solange ein Prozess mit echten Druckern dasselbe Verzeichnis nutzt (→ ADR-010).

**Einsehen und eingreifen** (UI in F05)

- [ ] Warteschlange ist einsehbar: pro Drucker Anzahl wartender Jobs, ältester Job, letzter Fehler.
- [ ] Admin kann einen Job abbrechen (`cancelled`) oder einen gedruckten Job erneut einreihen (Kopie als neuer Job).

**Entwicklung/Test**

- [ ] Ein Fake-`PrinterRepository` ersetzt die Hardware (loggt Zettel als Text, kann Fehler simulieren).

## Daten / API

- Liest: `Order`, `OrderItem`, `Printer`, `Settings.eventName`, `Settings.ticketTemplate`
- Schreibt: `PrintJob`
- `PrintQueueService` (Einreihen, Worker-Schleife, Admin-Aktionen) nutzt `PrintJobRepository` (DB) und `PrinterRepository` (ESC/POS via ePOS-Print über HTTPS, → ADR-005, ADR-009).

## UI

- Kein eigenes UI im Normalfall. Kein Druckstatus in der Bestellansicht; «Druck wartet» in der Bestellliste (F08); Warteschlange und Aktionen im Admin (F05).

## Nicht im Scope

- Bildschirm-Küchenansicht: **bewusst nicht** (Entscheid).
- Hinweis auf Positionen anderer Drucker: **nicht nötig** (Entscheid).
- Umleiten auf einen anderen Drucker: **nein**, weder automatisch noch manuell. Jobs bleiben in der Warteschlange, bis der Drucker wieder erreichbar ist, oder werden abgebrochen (Entscheid).
- Quittung für den Gast.

## Abhängigkeiten

- F02, F05, F11

## Offene Fragen

- keine
