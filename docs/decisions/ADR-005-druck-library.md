# ADR-005 – Druckanbindung mit node-thermal-printer

**Datum:** 2026-11-06
**Status:** Angenommen

## Kontext

Die Epson TM-T20IV und TM-T20III sprechen ESC/POS über TCP (Port 9100). Es soll die bekannteste Library verwendet werden, statt ESC/POS-Bytes von Hand zu bauen.

## Entscheidung

`node-thermal-printer` als Grundlage des `PrinterRepository`. Sie ist die verbreitetste Node-Library für ESC/POS, unterstützt Epson explizit (Textgrössen, Ausrichtung, Schnitt, Zeichensätze) und spricht Netzwerkdrucker über `tcp://host:port` an.

## Alternativen

- **`escpos` + `escpos-network`:** Älter, weniger gepflegt.
- **Eigene ESC/POS-Implementierung:** Volle Kontrolle, aber Aufwand für Zeichensätze und Modellunterschiede ohne Nutzen.

## Konsequenzen

- Das `PrinterRepository` kapselt die Library vollständig; Services kennen nur `printTicket(printer, payload)`.
- Umlaute: Zeichensatz `PC858`/`WPC1252` im Repository setzen und auf beiden Modellen testen.
- `payload` im `PrintJob` wird als strukturierter Zettel (JSON: Zeilen mit Stil) gespeichert und erst im Repository in ESC/POS übersetzt, damit die Vorschau in der Warteschlange lesbar bleibt.
