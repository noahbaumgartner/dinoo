# Offene Fragen

Ungeklärte Punkte, die vor oder während der Umsetzung entschieden werden müssen. Erledigte Fragen mit Antwort (und ggf. Verweis auf ADR/Feature) abhaken.

## Fachlich
- [x] Besteller anmelden? → **Ja, Service-Personal meldet sich an, Gäste bestellen über den Service** (01-roles, F01).
- [x] Bestellidentifikation / Zettelinhalt? → **Bestellnummer, Tisch, Name des Bestellers, Positionen** (02-domain-model „Bestellzettel“).
- [x] Druckzuordnung? → **Default pro Kategorie, Override pro Artikel** (02-domain-model, F04).
- [x] Bezahlung? → **Bar mit Rückgeldhilfe oder statischer TWINT-QR, als Schritt 4 des Bestellablaufs** (F07).
- [ ] Ist der **Name des Bestellers** Pflicht oder optional (F02)?
- [ ] **Küchenansicht am Bildschirm** zusätzlich zu den Zetteln?
- [ ] **Storno / Änderung** einer Bestellung nach dem Druck: nötig? Wie erfährt es die Küche?
- [ ] Zettel-Hinweis auf Positionen an anderen Druckern („+ 2 Positionen Grill“) (F03)?
- [ ] **Kassenabschluss** pro Service-Mitarbeiter, Teilzahlungen/Splitting (F07)?
- [ ] **Mehrere Anlässe** in einer Installation (Historie) oder pro Anlass frische Datenbank?
- [ ] **Auswertungen** (Stückzahlen pro Artikel, Umsatz pro Stunde) gewünscht?

## Technisch
- [ ] **Druck-Library:** ESC/POS direkt über TCP/9100 oder Library (`node-thermal-printer`, `escpos`)? Zeichensatz für Umlaute?
- [ ] **Druckerausfall:** Nach 3 Fehlversuchen nur manuell umleiten, oder automatisch auf einen Ersatzdrucker?
- [ ] **Tri-State Drucker-Override** am Artikel: zusätzliches Feld `printerMode` (`inherit` | `custom` | `none`) (F04)?
- [ ] **SQLite-Treiber:** `better-sqlite3` oder `@libsql/client`?
- [ ] **Auth-Umsetzung:** eigene Session-Tabelle + argon2 oder Library?
- [ ] **TWINT-QR-Bild:** Blob in SQLite oder Datei im Datenverzeichnis (F06)?
- [ ] **svelte-ui im Produktions-Build:** `npm link`, `npm pack`-Tarball oder veröffentlichtes Paket?
- [ ] **Betrieb auf dem Laptop:** OS? Start als Dienst oder Skript? Gehört die Einrichtung von WLAN-Hotspot und DNS zur dinoo-Doku?
- [ ] **HTTPS** im lokalen Netz nötig (PWA, Kamera) oder reicht HTTP?
