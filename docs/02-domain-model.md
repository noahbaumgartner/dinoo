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
| port                        | int                            | ✓       | Default 9100                                                                                                                |
| model                       | enum `TM-T20IV` \| `TM-T20III` | ✓       | Für modellspezifische Eigenheiten                                                                                           |
| active                      | bool                           | ✓       | Inaktive Drucker erhalten keine Aufträge                                                                                    |
| lastSuccessAt / lastErrorAt | datetime                       | –       | Letzter erfolgreicher bzw. fehlgeschlagener Druck                                                                           |
| lastError                   | string                         | –       | Gesetzt, solange der Drucker fehlschlägt; ein erfolgreicher Druck löscht ihn. Grundlage für «erreichbar / nicht erreichbar» |

### Kategorie (`Category`)

Gruppiert Artikel und legt den **Standard-Drucker** fest.

| Feld             | Typ       | Pflicht | Beschreibung                                                                                                                   |
| ---------------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| id               | int       | ✓       |                                                                                                                                |
| name             | string    | ✓       | z. B. „Warme Küche“, „Getränke“                                                                                                |
| sortOrder        | int       | ✓       | Reihenfolge in der Bestellansicht                                                                                              |
| defaultPrinterId | → Printer | –       | Wohin Artikel dieser Kategorie standardmässig gedruckt werden. Leer = kein Druck (z. B. Getränke, die der Service selbst holt) |

### Artikel (`Article`)

Ein bestellbares Produkt.

| Feld        | Typ                                  | Pflicht | Beschreibung                                                                                    |
| ----------- | ------------------------------------ | ------- | ----------------------------------------------------------------------------------------------- |
| id          | int                                  | ✓       |                                                                                                 |
| name        | string                               | ✓       |                                                                                                 |
| priceCents  | int                                  | ✓       | Preis in Rappen (CHF)                                                                           |
| categoryId  | → Category                           | ✓       |                                                                                                 |
| printerMode | enum `inherit` \| `custom` \| `none` | ✓       | `inherit` = Kategorie-Default, `custom` = eigener Drucker (`printerId`), `none` = nicht drucken |
| printerId   | → Printer                            | –       | Nur bei `printerMode = custom`                                                                  |
| sortOrder   | int                                  | ✓       | Reihenfolge innerhalb der Kategorie                                                             |
| active      | bool                                 | ✓       | Inaktive Artikel sind nicht bestellbar (z. B. ausverkauft)                                      |

**Regel „effektiver Drucker“:**

```
inherit → category.defaultPrinterId (leer = kein Druck)
custom  → article.printerId
none    → kein Druck
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
| note            | string   | –       | Freitext für die Küche, falls nötig                                                   |
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

Eine Datenbankdatei = genau ein Anlass. Für einen neuen Anlass wird eine neue Datei angelegt (F10).

### Bestellposition (`OrderItem`)

Ein Artikel in einer bestimmten Menge innerhalb einer Bestellung. Name und Preis werden **kopiert**, damit spätere Preisänderungen alte Bestellungen nicht verändern.

| Feld        | Typ       | Pflicht | Beschreibung                                                              |
| ----------- | --------- | ------- | ------------------------------------------------------------------------- |
| id          | int       | ✓       |                                                                           |
| orderId     | → Order   | ✓       |                                                                           |
| articleId   | → Article | ✓       | Referenz für Auswertungen                                                 |
| articleName | string    | ✓       | Snapshot                                                                  |
| priceCents  | int       | ✓       | Snapshot                                                                  |
| quantity    | int       | ✓       | ≥ 1                                                                       |
| printerId   | → Printer | –       | Effektiver Drucker zum Bestellzeitpunkt (Snapshot), leer = nicht gedruckt |

### Druckauftrag (`PrintJob`)

Ein Eintrag in der **Druckwarteschlange**: genau ein Zettel für genau einen Drucker. Alles, was gedruckt wird (Bestellzettel, Testdrucke), läuft über diese Warteschlange. Sie ist persistent: Ist ein Drucker nicht erreichbar, bleiben die Aufträge stehen und werden nach dem Wiederverbinden in Reihenfolge nachgedruckt.

| Feld                  | Typ                                                     | Pflicht | Beschreibung                                                                                                                                                              |
| --------------------- | ------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                    | int                                                     | ✓       |                                                                                                                                                                           |
| kind                  | enum `order` \| `test`                                  | ✓       | Art des Zettels                                                                                                                                                           |
| orderId               | → Order                                                 | –       | Bei `kind = order`                                                                                                                                                        |
| printerId             | → Printer                                               | ✓       | Zieldrucker (bei Umleitung geändert)                                                                                                                                      |
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

## Beziehungen

```
User 1 ──── n Order n ──── 1 Table
Order 1 ──── n OrderItem n ──── 1 Article n ──── 1 Category
Order 1 ──── n PrintJob n ──── 1 Printer
Order 1 ──── n Payment  n ──── 1 User
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

Pro effektivem Drucker ein Zettel mit:

1. Bestellnummer (gross), Datum/Zeit
2. Tisch (gross)
3. Positionen, die **auf diesen Drucker** gehören: Menge × Artikelname
4. Notiz (falls vorhanden)
5. Aufgenommen von: `User.displayName`

Positionen anderer Drucker erscheinen nicht und werden auch nicht erwähnt (Küche sieht nur, was sie zubereitet).
