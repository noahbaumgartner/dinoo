# Domänenmodell

Zentrale Begriffe und Datenstrukturen. Alle Features verweisen hierauf, damit die Begriffe einheitlich bleiben. Bezeichner im Code sind Englisch (in Klammern).

## Entitäten

### Benutzer (`User`)
Person, die sich an der Web-Oberfläche anmeldet.

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | int | ✓ | |
| username | string | ✓ | Eindeutig, Anmeldename |
| passwordHash | string | ✓ | |
| displayName | string | ✓ | Anzeigename, z. B. auf Zettel/Übersichten |
| role | enum `service` \| `admin` | ✓ | Siehe `01-roles.md` |
| active | bool | ✓ | Deaktivierte Benutzer können sich nicht anmelden |

### Drucker (`Printer`)
Ein per Ethernet erreichbarer Thermodrucker.

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | int | ✓ | |
| name | string | ✓ | Anzeigename, z. B. „Küche“, „Grill“ |
| host | string | ✓ | IP-Adresse oder Hostname |
| port | int | ✓ | Default 9100 |
| model | enum `TM-T20IV` \| `TM-T20III` | ✓ | Für modellspezifische Eigenheiten |
| active | bool | ✓ | Inaktive Drucker erhalten keine Aufträge |

### Kategorie (`Category`)
Gruppiert Artikel und legt den **Standard-Drucker** fest.

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | int | ✓ | |
| name | string | ✓ | z. B. „Warme Küche“, „Getränke“ |
| sortOrder | int | ✓ | Reihenfolge in der Bestellansicht |
| defaultPrinterId | → Printer | – | Wohin Artikel dieser Kategorie standardmässig gedruckt werden. Leer = kein Druck (z. B. Getränke, die der Service selbst holt) |

### Artikel (`Article`)
Ein bestellbares Produkt.

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | int | ✓ | |
| name | string | ✓ | |
| priceCents | int | ✓ | Preis in Rappen (CHF) |
| categoryId | → Category | ✓ | |
| printerId | → Printer | – | **Überschreibt** den Standard-Drucker der Kategorie. Leer = Kategorie-Default gilt |
| sortOrder | int | ✓ | Reihenfolge innerhalb der Kategorie |
| active | bool | ✓ | Inaktive Artikel sind nicht bestellbar (z. B. ausverkauft) |

**Regel „effektiver Drucker“:** `article.printerId ?? category.defaultPrinterId`. Ist beides leer, wird der Artikel nicht gedruckt.

### Tisch (`Table`)
Vom Admin vorkonfigurierte Tische, aus denen der Service beim Bestellen auswählt.

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | int | ✓ | |
| label | string | ✓ | Anzeige, z. B. „12“, „12a“, „Bar“ |
| sortOrder | int | ✓ | |
| active | bool | ✓ | |

### Bestellung (`Order`)
Eine vom Service-Personal aufgenommene Bestellung für einen Tisch.

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | int | ✓ | |
| orderNumber | int | ✓ | Fortlaufend, menschenlesbar, steht auf dem Zettel |
| tableId | → Table | ✓ | |
| tableLabel | string | ✓ | Snapshot des Tisch-Labels für Zettel und Historie |
| customerName | string | ✓ | Name des Bestellers (Gast) |
| createdByUserId | → User | ✓ | Service-Mitarbeiter, der aufgenommen hat |
| createdAt | datetime | ✓ | |
| note | string | – | Freitext für die Küche, falls nötig |
| totalCents | int | ✓ | Summe der Positionen zum Bestellzeitpunkt |
| paymentMethod | enum `cash` \| `twint` | – | Leer = noch nicht bezahlt |
| paidAt | datetime | – | Zeitpunkt der Bezahlung |
| paidByUserId | → User | – | Wer die Bezahlung erfasst hat |

### Einstellungen (`Settings`)
Einzelwerte für den Anlass, Key-Value.

| Key | Typ | Beschreibung |
|-----|-----|--------------|
| eventName | string | Name des Anlasses (Zettelkopf) |
| twintQrImage | blob/Pfad | Statischer TWINT-QR-Code des Vereins, wird beim Bezahlen angezeigt |

### Bestellposition (`OrderItem`)
Ein Artikel in einer bestimmten Menge innerhalb einer Bestellung. Name und Preis werden **kopiert**, damit spätere Preisänderungen alte Bestellungen nicht verändern.

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | int | ✓ | |
| orderId | → Order | ✓ | |
| articleId | → Article | ✓ | Referenz für Auswertungen |
| articleName | string | ✓ | Snapshot |
| priceCents | int | ✓ | Snapshot |
| quantity | int | ✓ | ≥ 1 |
| printerId | → Printer | – | Effektiver Drucker zum Bestellzeitpunkt (Snapshot), leer = nicht gedruckt |

### Druckauftrag (`PrintJob`)
Ein Bestellzettel für genau einen Drucker. Wird persistiert, damit bei Druckerausfall nichts verloren geht und wiederholt werden kann.

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| id | int | ✓ | |
| orderId | → Order | ✓ | |
| printerId | → Printer | ✓ | |
| status | enum `pending` \| `printed` \| `failed` | ✓ | |
| attempts | int | ✓ | Anzahl Druckversuche |
| lastError | string | – | Letzte Fehlermeldung |
| createdAt / printedAt | datetime | ✓ / – | |

## Beziehungen
```
User 1 ──── n Order n ──── 1 Table
Order 1 ──── n OrderItem n ──── 1 Article n ──── 1 Category
Order 1 ──── n PrintJob n ──── 1 Printer
Category n ──── 0..1 Printer   (Default)
Article  n ──── 0..1 Printer   (Override)
```

## Zustände / Lebenszyklen

**PrintJob**
```
pending ──(Druck ok)──► printed
   │
   └──(Fehler)──► failed ──(Admin: erneut drucken)──► pending
```

**Order (Bezahlung)**
```
offen (paymentMethod leer) ──(Bar kassiert / TWINT bestätigt)──► bezahlt (paymentMethod, paidAt gesetzt)
```
Die Bezahlung folgt direkt auf das Absenden (Schritt 4 im Bestellablauf, F07), kann aber auch später aus der Bestellübersicht nachgeholt werden. Storno/Änderung sind offen (→ `open-questions.md`).

## Bestellzettel (Inhalt)
Pro effektivem Drucker ein Zettel mit:
1. Bestellnummer (gross), Datum/Zeit
2. Tisch (gross)
3. Name des Bestellers
4. Positionen, die **auf diesen Drucker** gehören: Menge × Artikelname
5. Notiz (falls vorhanden)
6. Aufgenommen von: `User.displayName`

Positionen anderer Drucker erscheinen nicht (Küche sieht nur, was sie zubereitet). Ob ein Hinweis „+ 2 Positionen am Grill“ nötig ist, ist offen.
