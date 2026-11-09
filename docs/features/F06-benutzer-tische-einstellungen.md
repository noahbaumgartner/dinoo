# F06 – Benutzer, Tische und Einstellungen verwalten

**Status:** Umgesetzt
**Priorität:** Muss

## Ziel

Der Admin legt Benutzer (Service, Admin), die Tische des Anlasses und allgemeine Einstellungen (Anlassname, TWINT-QR) fest.

## User Stories

- Als Admin möchte ich für jeden Helfer einen Benutzer anlegen, damit Bestellungen nachvollziehbar sind.
- Als Admin möchte ich die Tische des Anlasses erfassen, damit der Service sie nur noch antippen muss.
- Als Admin möchte ich die Tische in mehrere Bereiche (z. B. Saal, Festzelt) aufteilen, damit jeder Bereich seinen eigenen, übersichtlichen Plan hat.
- Als Admin möchte ich den TWINT-QR-Code des Vereins einmal abscannen, damit er beim Bezahlen angezeigt wird.

## Akzeptanzkriterien

**Benutzer** (`/admin/users`)

- [ ] Anlegen/bearbeiten: `username` (eindeutig), `displayName`, `role`, `active`; Passwort setzen/zurücksetzen.
- [ ] Der letzte aktive Admin kann nicht deaktiviert oder zu `service` geändert werden.
- [ ] Bei leerer Datenbank (erster Start, neuer Anlass) wird ein initialer Admin per Setup-Seite angelegt.

**Eigenes Profil** (Avatar oben rechts → „Profil bearbeiten“, Dialog; alle Rollen)

- [ ] Zeigt den `username` (nur lesbar, ändert nur der Admin).
- [ ] Der Benutzer ändert seinen `displayName` selbst.
- [ ] Optional neues Passwort (mind. 4 Zeichen); dafür muss das aktuelle Passwort angegeben werden. Bei falschem aktuellem Passwort wird nichts gespeichert. Die Sitzung bleibt bestehen.

**Tische** (`/admin/tables`)

- [ ] **Bereiche:** Die Tische sind in Bereiche aufgeteilt; jeder Bereich hat einen eigenen Tischplan, eine eigene Nummerierung und eigene freie Tische. Es gibt immer mindestens einen Bereich (neue Datenbank: „Saal“).
- [ ] Bereich erfassen (Name), umbenennen und löschen. Ein Bereich wird nur gelöscht, wenn keiner seiner Tische Bestellungen hat (sonst: Tische ausschalten, dann erscheint er beim Bestellen nicht mehr); der letzte Bereich kann nicht gelöscht werden. Ein neuer Bereich wird sofort angelegt; sein Plan wird wie unten bearbeitet.
- [ ] Gibt es mehrere Bereiche, wählen Tabs oben auf der Seite den bearbeiteten Bereich; mit nur einem Bereich gibt es keine Tabs. Der Wechsel geht sofort und **ohne Nachfrage, auch mit ungespeicherten Änderungen**: Jeder Bereich hat seinen eigenen Entwurf, der beim Wechseln erhalten bleibt. Bereiche mit ungespeicherten Änderungen tragen im Tab einen Punkt («Saal •»). Der gewählte Bereich steht in der Adresse (`?area=<id>`), damit Neuladen ihn behält.
- [ ] **Tischplan** (je Bereich): Der Admin gibt Anzahl Zeilen und Spalten sowie die Nummerierung an (`A01, A02, …` oder `101, 102, …`). Jede Zelle des Rasters ist ein Tisch; fehlende Zellen werden mit vorbelegter Bezeichnung angelegt.
- [ ] Grenzen: 1–26 Zeilen, 1–30 Spalten.
- [ ] Wird das Raster verkleinert, fallen Tische ausserhalb weg: ohne Bestellungen werden sie gelöscht, mit Bestellungen deaktiviert und zu freien Tischen.
- [ ] Wechselt die Nummerierung, erhalten Rastertische mit unveränderter Bezeichnung die neue; umbenannte Tische behalten ihren Namen.
- [ ] Der Plan wird als Raster angezeigt. **Jeder Tisch** (im Raster und frei) kann aktiviert/deaktiviert und umbenannt werden. Ein deaktivierter Rastertisch ist eine Lücke im Plan (Gang, Bühne); die Bezeichnungen der anderen bleiben gleich.
- [ ] **Entwurf:** Alle Änderungen an den Tischen (Rastergrösse, Nummerierung, Ein/Aus, Umbenennen, Ein/Aus der freien Tische) wirken zuerst nur als Vorschau auf der Seite. Erst **Speichern** übernimmt alles auf einmal, **über alle geänderten Bereiche** (ganz oder gar nicht; solange ein geänderter Bereich eine ungültige Grösse hat, ist Speichern gesperrt); **Verwerfen** stellt den gespeicherten Stand aller Bereiche wieder her. Beim Verlassen mit ungespeicherten Änderungen wird nachgefragt.
- [ ] Bearbeitung des Plans ohne Dialog, umschaltbar zwischen zwei Modi:
  - **Ein/Aus** (Standard): Antippen eines Tisches schaltet ihn ein oder aus. **Griffe** am oberen Rand (je Spalte) und am linken Rand (je Zeile, beschriftet mit A/B/… bzw. 1/2/…) schalten die ganze Spalte oder Zeile: ist darin mindestens ein Tisch aktiv, wird alles ausgeschaltet, sonst alles eingeschaltet.
  - **Umbenennen**: Jeder Tisch ist direkt ein Eingabefeld; Verlassen des Feldes übernimmt den Namen in den Entwurf, Enter springt zum nächsten Tisch.
- [ ] Rastertische werden nicht einzeln gelöscht (nur deaktiviert oder per Verkleinern entfernt).
- [ ] **Freie Tische** ausserhalb des Rasters (z. B. „Bar“), je Bereich: anlegen/bearbeiten mit `label`, `sortOrder`, `active`; löschen.
- [ ] Tische mit Bestellungen werden deaktiviert statt gelöscht.

**Einstellungen** (`/admin/settings`)

- [ ] `eventName` setzen (erscheint auf Zetteln).
- [ ] TWINT-QR erfassen: Kamera-Scan des Vereins-QR (Sticker/Ausdruck) liest den **Inhalt** aus → `Settings.twintQrContent`. Alternativ Inhalt als Text einfügen.
- [ ] Kamera-Scan funktioniert nur in sicherem Kontext; ohne HTTPS also direkt am Server-Laptop über `http://localhost`. Die Seite weist darauf hin, wenn keine Kamera verfügbar ist.
- [ ] Aus `twintQrContent` wird ein QR-Code generiert und als Vorschau angezeigt; derselbe Generator wird in F07 verwendet.

## Daten / API

- `User`, `Area`, `Table`, `Settings`
- `UserService`, `TableService`, `SettingsService`
- QR: Scan clientseitig (z. B. `BarcodeDetector`/`jsQR`), Generierung clientseitig (z. B. `qrcode`).

## Nicht im Scope

- Mehrere Anlässe parallel (→ F10: eine Datenbank pro Anlass).

## Abhängigkeiten

- F01

## Offene Fragen

- keine
