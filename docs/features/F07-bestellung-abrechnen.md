# F07 – Bestellung abrechnen

**Status:** Bereit
**Priorität:** Muss

## Ziel
Direkt nach dem Abschicken kassiert der Service bar (mit Rechnungshilfe für das Rückgeld) oder zeigt dem Gast den TWINT-QR-Code. Die Bezahlung wird an der Bestellung festgehalten.

## User Stories
- Als Service-Mitarbeiter möchte ich den erhaltenen Betrag eintippen und sofort das Rückgeld sehen, damit ich mich im Trubel nicht verrechne.
- Als Service-Mitarbeiter möchte ich dem Gast den TWINT-Code gross anzeigen, damit er mit dem Handy scannen kann.
- Als Admin möchte ich am Ende sehen, welche Bestellungen noch offen sind und wie viel bar bzw. per TWINT eingenommen wurde.

## Akzeptanzkriterien
- [ ] Schritt 4 zeigt Bestellnummer, Tisch und Gesamtbetrag gross, darunter zwei Buttons: „Bar“ und „TWINT“.
- [ ] **Bar:** Eingabe „Erhalten“ mit Schnellwahl (passend, 10, 20, 50, 100 CHF) und Ziffernblock; Rückgeld wird live berechnet und gross angezeigt; Button „Bar bezahlt“ setzt `paymentMethod = cash`, `paidAt`, `paidByUserId`.
- [ ] Rückgeld-Rundung auf 5 Rappen (Schweiz) wird korrekt angezeigt.
- [ ] **TWINT:** Vollbild-Anzeige des hinterlegten QR-Codes (`Settings.twintQrImage`) mit Betrag als Text; Button „TWINT bezahlt“ setzt `paymentMethod = twint`. Ohne hinterlegten QR wird der Button mit Hinweis deaktiviert.
- [ ] „Später bezahlen“ lässt die Bestellung offen; offene Bestellungen sind für den Service unter „Offene Bestellungen“ (pro Tisch) auffindbar und können dort abgerechnet werden.
- [ ] Eine bezahlte Bestellung kann nicht erneut abgerechnet werden; Admin kann die Zahlung zurücksetzen.
- [ ] Admin-Übersicht: Summe Bar, Summe TWINT, Anzahl/Summe offen.

## Daten / API
- `Order` (Felder `paymentMethod`, `paidAt`, `paidByUserId`), `Settings.twintQrImage`
- `PaymentService.markPaid(orderId, method)`

## UI
- Grosse Zahlen, kontrastreich; Ziffernblock für Bar; QR füllt den Bildschirm.

## Nicht im Scope
- Dynamischer TWINT-QR mit Betrag (bräuchte Internet/API); Zahlungsbestätigung durch TWINT.
- Kartenzahlung, Rabatte, Trinkgeld, Splitting.

## Abhängigkeiten
- F02, F06 (TWINT-QR, Tische)

## Offene Fragen
- Kassenabschluss pro Service-Mitarbeiter (wer hat wie viel Bargeld) gewünscht?
- Teilzahlungen/Splitting am Tisch nötig?
