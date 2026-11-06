# Offene Fragen

Ungeklärte Punkte, die vor oder während der Umsetzung entschieden werden müssen. Erledigte Fragen mit Antwort (und ggf. Verweis auf ADR/Feature) abhaken.

## Offen
- [ ] **Dashboard-Umfang** (F09): Verlauf, Einnahmen, Artikel-Ranking, Bar pro Mitarbeiter, Drucker-Status. Annahme, da Nachricht abgeschnitten war. Bestätigen oder kürzen?
- [ ] Soll der **Service** eigene Bestellungen suchen dürfen (F08), oder nur Admin?
- [ ] Zieldrucker beim Bestellen als Badge anzeigen (F02)?

## Entschieden
### Fachlich
- [x] Besteller anmelden? → **Service-Personal meldet sich an, Gäste bestellen über den Service** (01-roles, F01).
- [x] Zettelinhalt? → **Bestellnummer, Tisch, Name des Bestellers, Positionen** (02-domain-model).
- [x] Druckzuordnung? → **Default pro Kategorie, Override pro Artikel** (F04).
- [x] Bezahlung? → **Bar mit Rückgeldhilfe oder statischer TWINT-QR, Schritt 4 des Bestellablaufs** (F07).
- [x] Name des Bestellers → **Pflicht** (F02).
- [x] Küchenansicht am Bildschirm → **Nein** (F03).
- [x] Storno / Änderung → **Nicht möglich**, Bestellung ist unveränderlich (02-domain-model, F02).
- [x] Zettel-Hinweis auf andere Drucker → **Nicht nötig** (F03).
- [x] Teilzahlungen / Splitting → **Ja, so einfach wie möglich**: Betrag pro Zahlung frei wählbar, mehrere `Payment`s pro Bestellung (F07).
- [x] Mehrere Anlässe → **Genau ein Anlass pro Datenbank; Datenbank im Admin austauschbar** (F10).
- [x] Auswertungen → **Ja, als Graph mit Verlauf** (F09).

### Technisch
- [x] Druck-Library → **die bekannteste: `node-thermal-printer`** (ADR-005).
- [x] Druckerausfall → **Jobs bleiben in der Warteschlange**, kein automatisches Umleiten (F03).
- [x] Tri-State Drucker-Override → **`printerMode` (`inherit` | `custom` | `none`)** (02-domain-model, F04).
- [x] SQLite-Treiber → **`better-sqlite3`** (ADR-006).
- [x] Auth → **Library: Better Auth** (ADR-007, vorgeschlagen).
- [x] TWINT-QR → **QR-Inhalt speichern** (scannen oder einfügen), QR daraus generieren (F06, F07).
- [x] svelte-ui im Produktions-Build → **`npm i @noahbaumgartner/svelte-ui`**, in Entwicklung `npm link` (ADR-002).
- [x] Betrieb → **einfach via Vite/Node starten**, keine Dienst-Installation; WLAN/DNS-Setup nicht Teil von dinoo.
- [x] HTTPS → **vorerst nicht nötig**; Kamera-Scan daher nur über `localhost` am Server-Laptop (F06).
