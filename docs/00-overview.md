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
┌──────────────────────── lokales WLAN (vom Laptop aufgebaut) ────────────────────────┐
│                                                                                     │
│   Smartphone ──┐                                                                    │
│   Tablet ──────┼── http://<dns-name> ──►  Server-Laptop (fixe IP, DNS-Eintrag)      │
│   Laptop ──────┘                             │  SvelteKit-Monolith + SQLite         │
│                                              │                                      │
└──────────────────────────────────────────────┼──────────────────────────────────────┘
                                               │ Ethernet
                               ┌───────────────┴───────────────┐
                        Epson TM-T20IV                   Epson TM-T20III
                        (Küchenzettel)                   (Küchenzettel)
```

- Ein **Laptop ist der Server**: Er baut das WLAN auf, hat eine fixe IP und einen DNS-Eintrag, so dass die Oberfläche unter einem lesbaren Namen erreichbar ist.
- Die **Drucker** (Epson TM-T20IV und TM-T20III) sind per Ethernet mit dem Laptop verbunden und drucken die Bestellzettel für die Küche.
- **Alle Clients** im WLAN greifen auf dieselbe Web-Oberfläche zu. Es gibt keine separate App, keinen Internetzugang und keinen Cloud-Dienst.
- Das **Admin-Interface** ist Teil derselben Web-Oberfläche und nur mit der Rolle *Admin* nutzbar, egal ob direkt am Server-Laptop oder von einem anderen Gerät im WLAN.

## Kernfunktionen
<!-- Details in docs/features/ -->
- Bestellung aufgeben (Web-Oberfläche)
- Bestellzettel automatisch auf Küchendrucker ausgeben
- Admin: Angebot (Artikel, Preise, Kategorien) pflegen
- Admin: Drucker und Druckzuordnung verwalten
- Admin: Benutzer und Rollen verwalten

## Nicht im Scope
- Internet-/Cloud-Anbindung, Online-Bezahlung
- Native Mobile-Apps
- Mehrere Server-Laptops gleichzeitig (ein Anlass = ein Server)

## Glossar
| Begriff | Bedeutung |
|---------|-----------|
| Anlass | Ein Vereinsevent, an dem dinoo eingesetzt wird |
| Server-Laptop | Der Laptop, der WLAN, Web-App, Datenbank und Druckeranbindung bereitstellt |
| Bestellzettel | Der Thermodruck-Beleg für die Küche zu einer Bestellung |
| Küchendrucker | Epson-Thermodrucker (TM-T20IV / TM-T20III) am Ethernet |
