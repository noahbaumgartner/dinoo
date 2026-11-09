# ADR-010 – Ein Druck-Worker pro Datenverzeichnis

**Datum:** 2026-11-09
**Status:** Angenommen

## Kontext

Die Druckwarteschlange liegt in der Event-Datenbank. Mehrere dinoo-Prozesse können dieselbe Datenbank gleichzeitig öffnen, zum Beispiel ein Entwicklungsserver mit `dev:fake` neben dem Server mit echten Druckern. Jeder Prozess hat seinen eigenen `PrintWorker` und beansprucht Jobs aus derselben Tabelle. Ein Worker mit Fake-Treiber markierte dabei Jobs als «gedruckt», obwohl nichts gedruckt wurde: Die Warteschlange zeigte «Alles gedruckt», aber die letzten Zettel fehlten am Drucker.

## Entscheidung

Pro Datenverzeichnis arbeitet nur ein Prozess die Warteschlange ab. Er hält dafür eine Lease in der Datei `print-worker.lease` im Datenverzeichnis (Besitzer, Rang, Zeitstempel des letzten Herzschlags).

- Jeder Worker erneuert die Lease bei jedem Durchlauf (alle 1 s). Eine Lease ohne Herzschlag seit mehr als 10 s gilt als verwaist und kann übernommen werden.
- Ein Worker mit echten Druckern hat höheren Rang als einer mit simulierten Druckern (`PrinterDeviceRepository.simulated`). Er übernimmt die Lease von einem simulierten Worker; ein simulierter Worker überlässt sie einem echten.
- Bei gleichem Rang gewinnt, wer die Lease zuerst hält. Der andere Prozess bleibt untätig und schreibt eine Warnung ins Log.
- Beim Beenden gibt der Worker die Lease frei.
- Jobs eines untätigen Prozesses bleiben `queued`, bis der Besitzer der Lease sie druckt.

## Alternativen

- **Separates Datenverzeichnis für `dev:fake`:** Verhindert das Problem nur für diesen einen Fall; zwei echte Prozesse auf demselben Verzeichnis blieben möglich.
- **Treiber pro Job in der Datenbank festhalten:** Der Fake-Worker würde nur Jobs abarbeiten, die er selbst eingereiht hat; echte Jobs würden aber nach einem Neustart nicht zuverlässig dem richtigen Prozess zugeordnet.
- **SQLite-Sperre statt Datei:** Die Lease gilt für alle Event-Datenbanken zugleich und überlebt einen Datenbankwechsel.

## Konsequenzen

- Ein zweiter Prozess auf demselben Datenverzeichnis druckt nicht mehr, auch nicht aus Versehen. Seine Zettel erscheinen als wartend, bis der andere Prozess sie druckt.
- Stürzt der Besitzer ab, übernimmt ein anderer Prozess nach spätestens 10 s.
- Die Lease liegt in einer Datei; das Datenverzeichnis muss lokal sein (kein Netzlaufwerk).
