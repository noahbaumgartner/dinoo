# F07 – Bestellung abrechnen

**Status:** Umgesetzt
**Priorität:** Muss

## Ziel

Direkt nach dem Abschicken kassiert der Service bar (mit Rechnungshilfe für das Rückgeld) oder zeigt dem Gast den TWINT-QR-Code. Teilzahlungen (Splitting) sind möglich, so einfach wie möglich: Betrag eingeben, Zahlungsart wählen, wiederholen bis der Restbetrag 0 ist.

## User Stories

- Als Service-Mitarbeiter möchte ich den erhaltenen Betrag eintippen und sofort das Rückgeld sehen, damit ich mich im Trubel nicht verrechne.
- Als Service-Mitarbeiter möchte ich dem Gast den TWINT-Code gross anzeigen, damit er mit dem Handy scannen kann.
- Als Service-Mitarbeiter möchte ich einen Tisch aufteilen („zwei zahlen bar 20.–, einer den Rest per TWINT“), ohne Positionen einzeln zuzuweisen.
- Als Admin möchte ich sehen, welche Bestellungen noch offen sind und wie viel bar bzw. per TWINT eingenommen wurde.

## Akzeptanzkriterien

**Grundablauf (Schritt 4)**

- [ ] Anzeige: Bestellnummer, Tisch, Gesamtbetrag und **Restbetrag** gross. Darunter die Positionen und zwei Buttons „Bar“ und „TWINT“.
- [ ] Ohne Auswahl wird der ganze Restbetrag bezahlt (inkl. aller noch offenen Positionen).
- [ ] **Teilzahlung (Splitting):** Jede noch nicht vollständig bezahlte Position hat einen „+“-Button. Sobald eine Position gewählt ist, ist die Teilzahlung aktiv: Betrag = Summe der gewählten Mengen × Preis. Die Menge pro Position ist bis zur noch offenen Menge änderbar; „Aufheben“ verwirft die Auswahl. Ein frei eingegebener Betrag ist nicht möglich.
- [ ] Bezahlte Mengen werden pro Position gespeichert und angezeigt („1 von 3 bezahlt“, „bezahlt“); bereits bezahlte Mengen können nicht nochmals gewählt werden.
- [ ] Jede bestätigte Zahlung erzeugt ein `Payment` mit den bezahlten Positionen (`PaymentItem`). Restbetrag wird neu berechnet; bei Rest > 0 bleibt die Ansicht für die nächste Teilzahlung offen.
- [ ] Bei Restbetrag 0: Bestätigung „Bezahlt“ und Button „Neue Bestellung“.
- [ ] Liste der bereits erfassten Zahlungen (Betrag, Art) ist sichtbar.

**Bar**

- [ ] Nach „Bar“ öffnet sich ein Drawer: Eingabe „Erhalten“ mit Schnellwahl (passend, 10, 20, 50, 100 CHF) und Zahlenfeld (numerische Tastatur des Geräts); Rückgeld = Erhalten − Betrag, live und gross, auf 5 Rappen gerundet.
- [ ] Button „Bar bezahlt“ schliesst die Teilzahlung ab.

**TWINT**

- [ ] Nach „TWINT“ öffnet sich ein Drawer mit grossem QR, generiert aus `Settings.twintQrContent`, mit dem zu zahlenden Betrag als Text; Button „TWINT bezahlt“ schliesst die Teilzahlung ab.
- [ ] Ohne hinterlegten QR-Inhalt ist „TWINT“ deaktiviert (ohne zusätzlichen Hinweistext).

**Später / Korrektur**

- [ ] „Später bezahlen“ lässt die Bestellung offen bzw. teilbezahlt; unter „Meine Bestellungen“ (F08, Filter „offen“) kann weiterkassiert werden.
- [ ] Admin kann Zahlungen einzeln löschen (Fehleingabe); Service kann nur die eigene letzte Zahlung innerhalb von 5 Minuten rückgängig machen. Die Positionen einer gelöschten Zahlung sind danach wieder offen.
- [ ] Summe der Zahlungen kann den Gesamtbetrag nicht überschreiten.

## Daten / API

- `Payment`, `Order.totalCents`, `Settings.twintQrContent`
- `PaymentService.addPayment(orderId, amountCents, method)`, `PaymentService.removePayment(paymentId)`

## UI

- Grosse Zahlen, kontrastreich; numerische Tastatur für Bar.
- Bar und TWINT sind Drawer (Handy: von unten, ab 768 px: Panel rechts); die Abrechnungsansicht bleibt dahinter, alles passt auf einen Bildschirm.
- Keine Fortschrittsanzeige und keine Navigations-Buttons oben. Erst wenn die Bestellung vollständig bezahlt ist, erscheint unten eine fixe Aktionsleiste mit „Bezahlt“ und dem primären Button „Neue Bestellung“.
- Die Karte „Druck“ erscheint nur, wenn es Zettel zu drucken gibt.

## Nicht im Scope

- Dynamischer TWINT-QR mit Betrag (bräuchte Internet/API); Zahlungsbestätigung durch TWINT.
- Zuordnung einzelner Positionen zu Personen beim Splitting.
- Kartenzahlung, Rabatte, Trinkgeld.

## Abhängigkeiten

- F02, F06

## Offene Fragen

- keine (Kassenabschluss pro Mitarbeiter ist nicht Teil des Dashboards; Daten via `Payment.paidByUserId` wären vorhanden)
