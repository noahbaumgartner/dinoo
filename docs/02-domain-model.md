# Domänenmodell

Zentrale Begriffe und Datenstrukturen. Alle Features verweisen hierauf, damit die Begriffe einheitlich bleiben. Bezeichner im Code sind Englisch (in Klammern).

## Entitäten

### Benutzer (`User`)

Person, die sich an der Web-Oberfläche anmeldet.

| Feld         | Typ                       | Pflicht | Beschreibung                                     |
| ------------ | ------------------------- | ------- | ------------------------------------------------ |
| id           | int                       | ✓       |                                                  |
| username     | string                    | ✓       | Eindeutig, Anmeldename                           |
| passwordHash | string                    | ✓       |                                                  |
| displayName  | string                    | ✓       | Anzeigename, z. B. auf Zettel/Übersichten        |
| role         | enum `service` \| `admin` | ✓       | Siehe `01-roles.md`                              |
| active       | bool                      | ✓       | Deaktivierte Benutzer können sich nicht anmelden |

### Drucker (`Printer`)

Ein per Ethernet erreichbarer Thermodrucker.

| Feld                        | Typ                            | Pflicht | Beschreibung                                                                                                                |
| --------------------------- | ------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| id                          | int                            | ✓       |                                                                                                                             |
| name                        | string                         | ✓       | Anzeigename, z. B. „Küche“, „Grill“                                                                                         |
| host                        | string                         | ✓       | IP-Adresse oder Hostname                                                                                                    |
| port                        | int                            | ✓       | Default 443 (HTTPS-Port von ePOS-Print)                                                                                     |
| model                       | enum `TM-T20IV` \| `TM-T20III` | ✓       | Für modellspezifische Eigenheiten                                                                                           |
| active                      | bool                           | ✓       | Inaktive Drucker erhalten keine Aufträge                                                                                    |
| lastSuccessAt / lastErrorAt | datetime                       | –       | Letzter erfolgreicher bzw. fehlgeschlagener Druck                                                                           |
| lastError                   | string                         | –       | Gesetzt, solange der Drucker fehlschlägt; ein erfolgreicher Druck löscht ihn. Grundlage für «erreichbar / nicht erreichbar» |

### Kategorie (`Category`)

Gruppiert Artikel und legt den **Standard-Drucker** fest.

| Feld             | Typ       | Pflicht | Beschreibung                                                                                                                                                             |
| ---------------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id               | int       | ✓       |                                                                                                                                                                          |
| name             | string    | ✓       | z. B. „Warme Küche“, „Getränke“                                                                                                                                          |
| sortOrder        | int       | ✓       | Reihenfolge in der Bestellansicht                                                                                                                                        |
| color            | enum      | ✓       | Eine von 10 Farben der Palette (`blue`, `sky`, `teal`, `green`, `yellow`, `orange`, `red`, `pink`, `violet`, `gray`); Erkennungsmerkmal in Verwaltung und Bestellansicht |
| defaultPrinterId | → Printer | –       | Wohin Artikel dieser Kategorie standardmässig gedruckt werden. Leer = kein Druck (z. B. Getränke, die der Service selbst holt)                                           |

### Artikel (`Article`)

Ein bestellbares Produkt.

| Feld        | Typ                      | Pflicht | Beschreibung                                                                      |
| ----------- | ------------------------ | ------- | --------------------------------------------------------------------------------- |
| id          | int                      | ✓       |                                                                                   |
| name        | string                   | ✓       |                                                                                   |
| priceCents  | int                      | ✓       | Preis in Rappen (CHF)                                                             |
| categoryId  | → Category               | ✓       |                                                                                   |
| printerId   | → Printer                | –       | Eigener Drucker. Leer = wie Kategorie                                             |
| sortOrder   | int                      | ✓       | Reihenfolge innerhalb der Kategorie                                               |
| active      | bool                     | ✓       | Inaktive Artikel sind nicht bestellbar (z. B. ausverkauft)                        |
| description | string                   | –       | Kurze Beschreibung für den Service, ≤ 200 Zeichen                                 |
| minAge      | enum `0` \| `16` \| `18` | ✓       | Mindestalter; `0` = keines. 16/18 erscheint beim Bestellen als Badge «16+»/«18+»  |
| options     | JSON                     | ✓       | Liste von **Optionen** (siehe unten), leer = keine. Gehören nur zu diesem Artikel |

**Option (`ArticleOption`)** – Teil des Artikels, kein eigenes Objekt. Jede Option hat eine stabile `id`, einen `name` und eine Art:

| Art (`kind`) | Felder                                                     | Beim Bestellen                                      | Auf Zettel/Position    |
| ------------ | ---------------------------------------------------------- | --------------------------------------------------- | ---------------------- |
| `count`      | `min`, `max` (0 ≤ min ≤ max ≤ 20), `priceCents` pro Stück  | Anzahl im Bereich `min`–`max`, Start bei `min`      | «2× Becher» (nur > 0)  |
| `toggle`     | `priceCents`                                               | Schalter ein/aus, Start aus                         | «ohne Sauce» (nur ein) |
| `choice`     | `required`, `choices` (≥ 1, je `id`, `name`, `priceCents`) | Genau ein Wert; ohne `required` auch keiner möglich | «Sorte: Schoggi»       |

Aufpreise (`priceCents` ≥ 0) kommen zum Artikelpreis dazu: `count` × Anzahl, `toggle` wenn ein, `choice` für den gewählten Wert. Höchstens 10 Optionen pro Artikel, 10 Werte pro Auswahl.

**Regel „effektiver Drucker“:**

```
article.printerId gesetzt → article.printerId
sonst                    → category.defaultPrinterId (leer = kein Druck)
```

### Tisch (`Table`)

Vom Admin vorkonfigurierte Tische, aus denen der Service beim Bestellen auswählt. Die meisten Tische liegen im **Saalplan**, einem Raster aus Zeilen und Spalten; daneben gibt es **freie Tische** ohne Platz im Raster (z. B. „Bar“, „Terrasse“).

| Feld       | Typ    | Pflicht | Beschreibung                                                          |
| ---------- | ------ | ------- | --------------------------------------------------------------------- |
| id         | int    | ✓       |                                                                       |
| label      | string | ✓       | Anzeige, z. B. „A01“, „101“, „Bar“; im Raster vorbelegt, umbenennbar  |
| gridRow    | int    | –       | Zeile im Saalplan (1 = oberste); leer = freier Tisch                  |
| gridColumn | int    | –       | Spalte im Saalplan (1 = linke); zusammen mit `gridRow` eindeutig      |
| sortOrder  | int    | ✓       | Reihenfolge der freien Tische (Rastertische: nach Zeile, dann Spalte) |
| active     | bool   | ✓       | Inaktive Rastertische sind Lücken im Plan (Gang, Bühne)               |

**Saalplan:** Die Grösse ergibt sich aus den Rastertischen (grösste Zeile × grösste Spalte); jede Zelle ist ein Tisch. Vorbelegte Bezeichnung je nach `Settings.tableNumbering`:

```
letter → Zeilenbuchstabe + zweistellige Spalte: A01, A02, …, B01   (max. 26 Zeilen)
number → Zeile × 100 + Spalte:                  101, 102, …, 201
```

### Bestellung (`Order`)

Eine vom Service-Personal aufgenommene Bestellung für einen Tisch.

| Feld            | Typ      | Pflicht | Beschreibung                                                                          |
| --------------- | -------- | ------- | ------------------------------------------------------------------------------------- |
| id              | int      | ✓       |                                                                                       |
| orderNumber     | int      | ✓       | Fortlaufend, menschenlesbar, steht auf dem Zettel                                     |
| clientRequestId | string   | ✓       | Vom Gerät erzeugte Kennung, macht das Abschicken idempotent (Doppeltap, Wiederholung) |
| tableId         | → Table  | ✓       |                                                                                       |
| tableLabel      | string   | ✓       | Snapshot des Tisch-Labels für Zettel und Historie                                     |
| createdByUserId | → User   | ✓       | Service-Mitarbeiter, der aufgenommen hat                                              |
| createdAt       | datetime | ✓       |                                                                                       |
| totalCents      | int      | ✓       | Summe der Positionen zum Bestellzeitpunkt                                             |

Abgeleitet (nicht gespeichert): `paidCents = Σ Payment.amountCents`, `openCents = totalCents − paidCents`, Status `offen` / `teilbezahlt` / `bezahlt`.

Eine Bestellung ist nach dem Abschicken **unveränderlich**: kein Storno, keine Änderung (Entscheid). Korrekturen erfolgen durch eine neue Bestellung.

### Einstellungen (`Settings`)

Einzelwerte für den Anlass, Key-Value.

| Key            | Typ    | Beschreibung                                                                                                                                  |
| -------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| eventName      | string | Name des Anlasses (Zettelkopf)                                                                                                                |
| tableNumbering | string | Nummerierung des Saalplans: `letter` (A01, Standard) oder `number` (101)                                                                      |
| twintQrContent | string | **Inhalt** des statischen TWINT-QR-Codes des Vereins (beim Einrichten gescannt oder eingefügt). Der QR wird daraus zur Anzeige neu generiert. |
| ticketTemplate | JSON   | Druckvorlage für alle Bestellzettel (Blöcke, Stil, Platzhalter, → F11). Leer = Standardvorlage.                                               |

Eine Datenbankdatei = genau ein Anlass. Für einen neuen Anlass wird eine neue Datei angelegt (F10).

### Bestellposition (`OrderItem`)

Ein Artikel in einer bestimmten Menge innerhalb einer Bestellung, optional mit gewählten Optionen und einer Notiz für die Küche. Name, Preis und Optionen werden **kopiert**, damit spätere Änderungen am Angebot alte Bestellungen nicht verändern. Jede unterschiedliche Kombination aus Optionen und Notiz ist eine eigene Position (z. B. 2× Kuchen «Sorte: Schoggi» und 1× Kuchen «Sorte: Zitrone»).

| Feld        | Typ       | Pflicht | Beschreibung                                                                                     |
| ----------- | --------- | ------- | ------------------------------------------------------------------------------------------------ |
| id          | int       | ✓       |                                                                                                  |
| orderId     | → Order   | ✓       |                                                                                                  |
| articleId   | → Article | ✓       | Referenz für Auswertungen                                                                        |
| articleName | string    | ✓       | Snapshot                                                                                         |
| priceCents  | int       | ✓       | Snapshot: Stückpreis inkl. Aufpreise der gewählten Optionen                                      |
| quantity    | int       | ✓       | ≥ 1                                                                                              |
| options     | JSON      | ✓       | Snapshot der gewählten Optionen als Texte, z. B. `["Sorte: Schoggi", "2× Becher"]`; leer = keine |
| note        | string    | –       | Freitext für die Küche zu dieser Position (z. B. «ohne Zwiebeln»), ≤ 200                         |
| printerId   | → Printer | –       | Effektiver Drucker zum Bestellzeitpunkt (Snapshot), leer = nicht gedruckt                        |

### Druckauftrag (`PrintJob`)

Ein Eintrag in der **Druckwarteschlange**: genau ein Zettel für genau einen Drucker. Alles, was gedruckt wird (Bestellzettel, Testdrucke), läuft über diese Warteschlange. Sie ist persistent: Ist ein Drucker nicht erreichbar, bleiben die Aufträge stehen und werden nach dem Wiederverbinden in Reihenfolge nachgedruckt.

| Feld                  | Typ                                                     | Pflicht | Beschreibung                                                                                                                                                              |
| --------------------- | ------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                    | int                                                     | ✓       |                                                                                                                                                                           |
| kind                  | enum `order` \| `test`                                  | ✓       | Art des Zettels; `test` = Drucker-Testdruck (F05) oder Testdruck der Druckvorlage (F11)                                                                                   |
| orderId               | → Order                                                 | –       | Bei `kind = order`                                                                                                                                                        |
| printerId             | → Printer                                               | ✓       | Zieldrucker                                                                                                                                                               |
| payload               | text                                                    | ✓       | Fertig aufbereiteter Zettel als JSON (Zeilen mit Stil), damit der Druck unabhängig von späteren Datenänderungen ist; erst das Drucker-Repository übersetzt ihn in ESC/POS |
| status                | enum `queued` \| `printing` \| `printed` \| `cancelled` | ✓       |                                                                                                                                                                           |
| attempts              | int                                                     | ✓       | Anzahl Druckversuche                                                                                                                                                      |
| lastError             | string                                                  | –       | Letzte Fehlermeldung                                                                                                                                                      |
| lastAttemptAt         | datetime                                                | –       |                                                                                                                                                                           |
| createdAt / printedAt | datetime                                                | ✓ / –   |                                                                                                                                                                           |

### Zahlung (`Payment`)

Eine (Teil-)Zahlung zu einer Bestellung. Mehrere Zahlungen pro Bestellung ermöglichen Splitting; eine Bestellung gilt als bezahlt, wenn die Summe der Zahlungen den Gesamtbetrag erreicht.

| Feld         | Typ                    | Pflicht | Beschreibung                |
| ------------ | ---------------------- | ------- | --------------------------- |
| id           | int                    | ✓       |                             |
| orderId      | → Order                | ✓       |                             |
| amountCents  | int                    | ✓       | > 0                         |
| method       | enum `cash` \| `twint` | ✓       |                             |
| paidAt       | datetime               | ✓       |                             |
| paidByUserId | → User                 | ✓       | Wer die Zahlung erfasst hat |

### Bezahlte Position (`PaymentItem`)

Welche Positionen (und wie viele davon) eine Zahlung abdeckt. Eine Teilzahlung entsteht durch Auswahl von Positionen (F07); `Payment.amountCents` ist dann die Summe der gewählten Mengen × `OrderItem.priceCents`. Eine Zahlung ohne Auswahl deckt alle noch offenen Mengen ab. Wird die Zahlung gelöscht, werden ihre Positionen wieder offen.

| Feld        | Typ         | Pflicht | Beschreibung                                   |
| ----------- | ----------- | ------- | ---------------------------------------------- |
| id          | int         | ✓       |                                                |
| paymentId   | → Payment   | ✓       |                                                |
| orderItemId | → OrderItem | ✓       |                                                |
| quantity    | int         | ✓       | ≥ 1; Summe pro Position ≤ `OrderItem.quantity` |

## Beziehungen

```
User 1 ──── n Order n ──── 1 Table
Order 1 ──── n OrderItem n ──── 1 Article n ──── 1 Category
Order 1 ──── n PrintJob n ──── 1 Printer
Order 1 ──── n Payment  n ──── 1 User
Payment 1 ──── n PaymentItem n ──── 1 OrderItem
Category n ──── 0..1 Printer   (Default)
Article  n ──── 0..1 Printer   (Override)
```

## Zustände / Lebenszyklen

**PrintJob (Warteschlange)**

```
queued ──(Worker nimmt ältesten Job des Druckers)──► printing ──(ok)──► printed
  ▲                                                      │
  └──────────(Fehler: attempts+1, lastError, Pause)──────┘
queued ──(Admin: abbrechen)──► cancelled
```

Es gibt keinen Endzustand „failed“: Ein Job bleibt `queued`, bis er gedruckt oder vom Admin abgebrochen wird. Pro Drucker wird strikt in Reihenfolge (`createdAt`) gedruckt; ein hängender Job blockiert nur seinen Drucker.

**Order (Bezahlung, abgeleitet aus `Payment`)**

```
offen (0 bezahlt) ──(Zahlung)──► teilbezahlt (0 < bezahlt < total) ──(Zahlung)──► bezahlt (bezahlt ≥ total)
```

Die Bezahlung folgt direkt auf das Absenden (Schritt 4, F07), kann aber auch später aus „Offene Bestellungen“ nachgeholt werden.

## Bestellzettel (Inhalt)

Pro effektivem Drucker ein Zettel. Aufbau, Reihenfolge und Grössen bestimmt die **Druckvorlage** (`Settings.ticketTemplate`, F11). Die Standardvorlage enthält:

1. Bestellnummer (gross), Datum/Zeit
2. Tisch (gross)
3. Positionen, die **auf diesen Drucker** gehören: Menge × Artikelname, darunter eingerückt je eine Zeile pro gewählter Option und die Notiz der Position (falls vorhanden)
4. Aufgenommen von: `User.displayName`

Positionen anderer Drucker erscheinen nicht und werden auch nicht erwähnt (Küche sieht nur, was sie zubereitet).
