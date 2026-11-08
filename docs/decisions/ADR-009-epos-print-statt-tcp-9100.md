# ADR-009 – Drucken über ePOS-Print statt TCP/9100

**Datum:** 2026-11-08
**Status:** Angenommen

## Kontext

Bisher wurden die ESC/POS-Bytes direkt über TCP an Port 9100 geschickt (ADR-005). Ein TM-T20IV im Testnetz nahm die Verbindung und die Daten an, druckte aber nichts und antwortete nicht auf Statusabfragen (`DLE EOT`), obwohl Selbsttest, Papier und Netzwerk in Ordnung waren. Weil ein erfolgreiches Schreiben auf den Socket als «gedruckt» galt, zeigte dinoo die Zettel trotzdem als gedruckt an.

Der eingebaute ePOS-Print-Webdienst desselben Druckers (`https://<ip>/cgi-bin/epos/service.cgi`) druckte dagegen zuverlässig. ePOS-Print ist auf beiden Modellen (TM-T20IV, TM-T20III) vorhanden und aktiv.

## Entscheidung

`PrinterDeviceRepository` sendet die Zettel per SOAP-Request an ePOS-Print (`devid=local_printer`) über HTTPS. Die Zettel werden weiterhin mit `node-thermal-printer` als ESC/POS gebaut und im `<command>`-Element (hex) übergeben, damit Vorlage und Darstellung (F11) unverändert bleiben.

- Ein Druck gilt erst als gedruckt, wenn ePOS-Print `success="true"` meldet. Der Drucker antwortet erst nach dem Druck.
- Fehlercodes (`EPTR_COVER_OPEN`, `EPTR_REC_EMPTY`, `EX_TIMEOUT` …) werden als deutsche Meldung in `lastError` übernommen.
- `port` des Druckers ist neu der HTTPS-Port von ePOS-Print (Default 443); bestehende Drucker mit 9100 werden migriert.
- Die Drucker haben nur selbst signierte Zertifikate; im Offline-Netz ohne CA wird das Zertifikat nicht geprüft.

## Alternativen

- **TCP/9100 mit Statusabfrage vor und nach dem Zettel:** Erkennt einen hängenden Drucker, druckt aber nicht. Real-time-Status bestätigt zudem nicht, dass der Zettel tatsächlich gedruckt wurde.
- **Zettel als ePOS-XML (`<text>`, `<feed>`, …) statt ESC/POS:** Möglich, aber eine zweite Darstellung neben der bestehenden ESC/POS-Umsetzung.

## Konsequenzen

- ePOS-Print muss am Drucker aktiv sein (Weboberfläche des Druckers).
- Pro Zettel ein HTTPS-Request; der Worker wartet, bis der Drucker fertig ist (max. ca. 15 s), statt nur bis die Daten gesendet sind.
- Port 9100 wird nicht mehr verwendet.
