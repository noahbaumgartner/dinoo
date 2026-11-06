# Offene Fragen

Ungeklärte Punkte, die vor oder während der Umsetzung entschieden werden müssen. Erledigte Fragen mit Antwort (und ggf. Verweis auf ADR/Feature) abhaken.

## Fachlich
- [ ] Müssen sich **Besteller anmelden** (z. B. Service-Personal mit Benutzer) oder bestellen Gäste anonym? Gibt es beides?
- [ ] Gibt es eine **Küchenansicht am Bildschirm** zusätzlich zu den Zetteln, oder sind die Drucke die einzige Küchenschnittstelle?
- [ ] Wie wird eine Bestellung **identifiziert** (Tischnummer, Bestellnummer, Name)? Was steht auf dem Zettel?
- [ ] **Druckzuordnung:** Welcher Drucker druckt was? Pro Kategorie (Küche/Grill/Bar), pro Artikel, oder immer beide?
- [ ] **Bezahlung:** Nur Erfassung des Betrags, Kassenfunktion (bar), oder gar nichts?
- [ ] **Storno / Änderung** einer Bestellung nach dem Druck: nötig? Wie sieht das die Küche?
- [ ] **Mehrere Anlässe** in einer Installation (Historie, Auswertung) oder pro Anlass eine frische Datenbank?
- [ ] **Auswertungen** für den Verein (Umsatz, Stückzahlen pro Artikel) gewünscht?

## Technisch
- [ ] **Druckerprotokoll/Library:** ESC/POS über TCP (Port 9100) direkt oder über eine Library (z. B. `node-thermal-printer`, `escpos`)? Wie werden Umlaute/CHF gehandhabt?
- [ ] **Druckerausfall:** Warteschlange mit Retry? Fallback auf den anderen Drucker? Benachrichtigung an Admin?
- [ ] **SQLite-Treiber:** `better-sqlite3` (synchron, nativ) oder `@libsql/client`?
- [ ] **Auth-Umsetzung:** Eigene Sessions mit Passwort-Hash (z. B. argon2) oder Library (Lucia-Pattern)?
- [ ] **svelte-ui im Produktions-Build:** weiterhin `npm link`, `npm pack`-Tarball oder veröffentlichtes Paket?
- [ ] **Betrieb auf dem Laptop:** Betriebssystem? Start als Dienst (systemd/launchd) oder Skript? WLAN-Hotspot und DNS-Eintrag: wie eingerichtet (gehört das zur Doku von dinoo)?
- [ ] **HTTPS** im WLAN nötig (z. B. für PWA-Features) oder reicht HTTP?
