# Offene Fragen

Ungeklärte Punkte, die vor oder während der Umsetzung entschieden werden müssen. Erledigte Fragen mit Antwort (und ggf. Verweis auf ADR/Feature) abhaken.

## Offen

- keine. Neue Fragen hier eintragen; sie entstehen typischerweise während der Umsetzung.

## Entschieden

### Fachlich

- [x] Dashboard-Umfang → **Einnahmenverlauf als Liniendiagramm, verkaufte Artikel als Balkendiagramm, Summe der verkauften Artikel** (F09).
- [x] Service eigene Bestellungen suchen → **Ja, reduziert** (nur eigene, Filter Tisch/Nummer/Zahlungsstatus, einzige Aktion: kassieren) (F08).
- [x] Zieldrucker beim Bestellen anzeigen → **Nein** (F02).
- [x] Besteller anmelden? → **Service-Personal meldet sich an, Gäste bestellen über den Service** (01-roles, F01).
- [x] Zettelinhalt? → **Bestellnummer, Tisch, Positionen** (Name des Bestellers wieder entfernt, siehe unten) (02-domain-model).
- [x] Druckzuordnung? → **Default pro Kategorie, Override pro Artikel** (F04).
- [x] Bezahlung? → **Bar mit Rückgeldhilfe oder statischer TWINT-QR, Schritt 4 des Bestellablaufs** (F07).
- [x] Name des Bestellers → ~~Pflicht~~ **wird nicht erfasst** (Entscheid 2026-11-07; F02).
- [x] Küchenansicht am Bildschirm → **Nein** (F03).
- [x] Storno / Änderung → **Nicht möglich**, Bestellung ist unveränderlich (02-domain-model, F02).
- [x] Zettel-Hinweis auf andere Drucker → **Nicht nötig** (F03).
- [x] Zettel konfigurierbar? → **Ja, eine Druckvorlage pro Anlass für alle Drucker**, als Blockliste mit Platzhaltern, Live-Vorschau und Testdruck mit Beispieldaten (F11, ADR-008).
- [x] Drucker-Testdruck → **Titel „Testdruck“ und ein zufälliger Witz** (100 Stück), ohne Druckvorlage (F05).
- [x] Teilzahlungen / Splitting → **Ja, so einfach wie möglich**: Betrag pro Zahlung frei wählbar, mehrere `Payment`s pro Bestellung (F07).
- [x] Mehrere Anlässe → **Genau ein Anlass pro Datenbank; Datenbank im Admin austauschbar** (F10).
- [x] Auswertungen → **Ja, als Graph mit Verlauf** (F09).
- [x] Tische erfassen → **Tischplan als Raster** (Zeilen × Spalten, Nummerierung `A01` oder `101`), zusätzlich freie Tische wie „Bar“; Lücken durch Deaktivieren, jeder Tisch umbenennbar (F06, 02-domain-model).
- [x] Mehrere Tischpläne → **Bereiche** (z. B. Saal, Festzelt), je mit eigenem Tischplan, Nummerierung und freien Tischen; beim Bestellen wird der Bereich gewählt und pro Gerät gemerkt, bei nur einem Bereich ändert sich nichts (F02, F06, 02-domain-model).
- [x] Bereich auf Zettel und in Listen → **Nein**, es wird nur die Tischbezeichnung gedruckt und angezeigt; der Admin vergibt bei Bedarf eindeutige Bezeichnungen (Entscheid 2026-11-09; F06, 02-domain-model).

### Technisch

- [x] Druck-Library → **die bekannteste: `node-thermal-printer`** (ADR-005).
- [x] Druckerausfall → **Jobs bleiben in der Warteschlange**, kein Umleiten auf einen anderen Drucker (F03).
- [x] Drucker-Override pro Artikel → **`printerId` (leer = wie Kategorie, sonst eigener Drucker)**; der frühere Tri-State mit „kein Druck“ pro Artikel wurde entfernt (02-domain-model, F04).
- [x] SQLite-Treiber → **`better-sqlite3`** (ADR-006).
- [x] Auth → **Library: Better Auth** (ADR-007, vorgeschlagen).
- [x] TWINT-QR → **QR-Inhalt speichern** (scannen oder einfügen), QR daraus generieren (F06, F07).
- [x] svelte-ui im Produktions-Build → **`npm i @noahbaumgartner/svelte-ui`**, in Entwicklung `npm link` (ADR-002).
- [x] Betrieb → **einfach via Vite/Node starten**, keine Dienst-Installation; WLAN/DNS-Setup nicht Teil von dinoo.
- [x] HTTPS → **vorerst nicht nötig**; Kamera-Scan daher nur über `localhost` am Server-Laptop (F06).
