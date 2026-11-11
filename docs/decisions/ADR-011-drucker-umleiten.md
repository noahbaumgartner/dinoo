# ADR-011 – Drucker manuell umleiten

**Datum:** 2026-11-11
**Status:** Angenommen

## Kontext

F03 hatte entschieden: Fällt ein Drucker aus, bleiben seine Zettel in der Warteschlange, ohne Umleiten. Papier leer oder Deckel offen sind so in Sekunden behoben. Ist ein Drucker aber länger weg (defekt, Strom, WLAN), bekommt seine Station bei einem grossen Anlass minutenlang keine Zettel, während die Bestellungen weiterlaufen (Issue #3).

## Entscheidung

Der Admin kann einen Drucker unter `/admin/printers` auf einen anderen Drucker umleiten (F05).

- Die Umleitung ist ein Feld am Drucker (`redirectToPrinterId`, `redirectedAt`) und damit persistent.
- Beim Setzen verschiebt `PrintQueueService.redirect` alle `queued` Jobs zum Ziel. `createdAt` bleibt, die Reihenfolge also auch.
- Neue Jobs (Bestellung, Nachdruck) werden beim Einreihen direkt dem Ziel zugewiesen.
- Der `PrintWorker` druckt nie auf einem umgeleiteten Drucker. Jobs, die trotzdem dort landen (ein Job war beim Umleiten `printing` und schlug danach fehl), schiebt er bei jedem Durchlauf zum Ziel. Ein `printing`-Job wird nie verschoben, deshalb druckt nichts doppelt.
- Der Hinweis «FÜR: <STATION>» wird beim Verschieben bzw. Einreihen als Zusatzblock vorne in den bestehenden `payload` geschrieben (ADR-008: der Zettel ist fertig gerendert). `Ticket.redirectedFrom` hält die ursprüngliche Station fest, damit ein Zettel, der mehrmals verschoben wird, den Hinweis nur einmal und mit der richtigen Station trägt. Der Zettel wird nicht neu gerendert.
- Keine Ketten und Schleifen: Ziel ist nur ein aktiver, nicht umgeleiteter Drucker; ein Drucker, auf den umgeleitet wird, kann selbst nicht umgeleitet, deaktiviert oder gelöscht werden.
- Testdrucke eines umgeleiteten Druckers sind gesperrt, weil sie den Drucker selbst prüfen sollen.

## Alternativen

- **Kein Feature, nur Betriebsanleitung:** Beim ausgefallenen Drucker die IP eines anderen Druckers eintragen. Funktioniert ohne Code, ist aber fehleranfällig (IP merken, zurückstellen) und zeigt nirgends an, dass umgeleitet ist. Der Zettel trägt nur dann den Stationsnamen, wenn `{drucker}` in der Vorlage steht.
- **Zettel neu rendern:** Mit der aktuellen Vorlage und einem Platzhalter für die Station. Widerspricht ADR-008 (Zettel unabhängig von späteren Änderungen) und braucht die Bestelldaten erneut.
- **Ursprünglichen Drucker am Job speichern:** Eigene Spalte statt Feld im `payload`. Mehr Schema für eine reine Anzeige; der Hinweis muss ohnehin im `payload` stehen.
- **Automatisches Umleiten:** Nicht gewünscht; der Admin soll entscheiden, wohin die Zettel gehen.

## Konsequenzen

- Die Station des ausgefallenen Druckers bekommt ihre Zettel wieder, muss sie aber am Zieldrucker abholen.
- Nach dem Aufheben bleiben schon verschobene Zettel beim Ziel; das ist gewollt, damit nichts doppelt gedruckt wird.
- Ob der Drucker wieder läuft, sieht der Admin erst nach dem Aufheben (Testdruck oder nächster Zettel).
