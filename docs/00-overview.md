# Überblick

## Vision

dinoo ist ein Essensbestellsystem für Vereinsanlässe (Feste, Turniere, Beizli). Es läuft komplett offline auf einem Laptop vor Ort: Bestellungen werden über eine Web-Oberfläche im lokalen WLAN aufgegeben und landen als gedruckte Zettel direkt in der Küche.

## Zielgruppe

- **Vereine**, die an einem Anlass Essen und Getränke ausgeben.
- **Service-Personal / Gäste** bestellen über ihr eigenes Gerät (Smartphone, Tablet) oder ein Vereinsgerät.
- **Küche** arbeitet die gedruckten Bestellzettel ab.
- **Admin** (Verantwortliche des Anlasses) pflegt Angebot, Drucker und Benutzer.

## Betriebsszenario

```
┌──────────────────── lokales Netzwerk (WLAN vom Laptop aufgebaut, optional Kabel) ────────────────────┐
│                                                                                                      │
│   Smartphone ──┐                                                                                     │
│   Tablet ──────┼── http://<dns-name> ──►  Server-Laptop (fixe IP, DNS-Eintrag)                       │
│   Laptop ──────┘                             SvelteKit-Monolith + SQLite                             │
│                                                   │                                                  │
│                                                   │ HTTPS/443 (ePOS-Print, ESC/POS)                  │
│                                   ┌───────────────┴───────────────┐                                  │
│                            Epson TM-T20IV                   Epson TM-T20III                          │
│                            (Küchenzettel)                   (Küchenzettel)                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- Ein **Laptop ist der Server**: Er baut das WLAN auf, hat eine fixe IP und einen DNS-Eintrag, so dass die Oberfläche unter einem lesbaren Namen erreichbar ist.
- Die **Drucker** (Epson TM-T20IV und TM-T20III) hängen als normale Netzwerkteilnehmer im selben Netz wie Server und Clients, per Kabel oder WLAN. Der Server spricht sie über ihre IP-Adresse an (ePOS-Print-Webdienst des Druckers über HTTPS, Port 443; der Zettel selbst ist ESC/POS, → ADR-009).
- **Alle Clients** im WLAN greifen auf dieselbe Web-Oberfläche zu. Es gibt keine separate App, keinen Internetzugang und keinen Cloud-Dienst.
- Das **Admin-Interface** ist Teil derselben Web-Oberfläche und nur mit der Rolle _Admin_ nutzbar, egal ob direkt am Server-Laptop oder von einem anderen Gerät im WLAN.

## Kernfunktionen

<!-- Details in docs/features/ -->

- Service: Bestellung in 4 Schritten aufnehmen (Tisch → Artikel → abschicken → abrechnen)
- Bestellzettel über eine persistente Druckwarteschlange auf die zuständigen Küchendrucker verteilen
- Abrechnung bar (mit Rückgeldhilfe) oder per TWINT-QR, Teilzahlungen möglich
- Admin: Angebot (Kategorien, Artikel, Preise, Druckzuordnung) pflegen
- Admin: Drucker und Druckwarteschlange, Benutzer, Tische, Einstellungen verwalten
- Admin: Bestellungen suchen (Tisch, Personal, Bestellnummer), Dashboard mit Einnahmenverlauf und Artikelverkäufen; Service: eigene Bestellungen
- Admin: Datenbank pro Anlass anlegen, wechseln, sichern

## Nicht im Scope

- Internet-/Cloud-Anbindung, Online-Bezahlung, dynamischer TWINT-QR
- Native Mobile-Apps
- Mehrere Server-Laptops gleichzeitig (ein Anlass = ein Server = eine Datenbank)
- Storno oder Änderung abgeschickter Bestellungen
- Küchenansicht am Bildschirm (die Zettel sind die Küchenschnittstelle)

## Glossar

| Begriff       | Bedeutung                                                                  |
| ------------- | -------------------------------------------------------------------------- |
| Anlass        | Ein Vereinsevent, an dem dinoo eingesetzt wird                             |
| Server-Laptop | Der Laptop, der WLAN, Web-App, Datenbank und Druckeranbindung bereitstellt |
| Bestellzettel | Der Thermodruck-Beleg für die Küche zu einer Bestellung                    |
| Küchendrucker | Epson-Thermodrucker (TM-T20IV / TM-T20III) im lokalen Netz                 |
| Service       | Vereinsmitglied, das Bestellungen am Tisch aufnimmt und kassiert           |
