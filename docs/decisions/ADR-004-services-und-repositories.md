# ADR-004 – Serverseitige Schichten: Services und Repositories

**Datum:** 2026-11-06
**Status:** Angenommen

## Kontext

Im Monolithen (→ [ADR-001](ADR-001-sveltekit-monolith.md)) treffen Fachlogik, Datenbankzugriff und Hardware-Ansteuerung (Drucker) aufeinander. Ohne klare Grenzen vermischt sich das schnell in Route-Handlern.

## Entscheidung

Der serverseitige Code unter `src/lib/server/` hat zwei Schichten:

- **Repositories** kapseln jeglichen Zugriff auf die Aussenwelt. Dazu zählen **die Datenbank und die Drucker** gleichermassen. Ein Repository bietet eine fachlich benannte Schnittstelle (z. B. `OrderRepository.create(order, items)`, `PrinterDeviceRepository.print(target, ticket)`) und enthält keine Geschäftsregeln.
- **Services** enthalten die Fachlogik und orchestrieren Repositories (z. B. `OrderService.place()` validiert, speichert über `OrderRepository` und stellt die Zettel über den `PrintQueueService` in die Warteschlange; der `PrintWorker` druckt sie über das `PrinterDeviceRepository`).
- **Benennung:** `PrinterRepository` ist die Drucker-Konfiguration in der Datenbank, `PrinterDeviceRepository` der Drucker selbst (ESC/POS über ePOS-Print, oder ein Fake in Entwicklung und Tests).
- **Zusammensetzung:** `src/lib/server/runtime.ts` erzeugt Verbindung, Repositories und Services für die aktive Anlass-Datenbank und baut sie beim Datenbankwechsel neu auf.
- **Routes** (`+page.server.ts`, `+server.ts`, Form Actions) rufen nur Services auf. Sie enthalten keine Fachlogik und keinen direkten Repository-Zugriff.

Abhängigkeiten zeigen nur nach unten: Route → Service → Repository. Services erhalten Repositories über Konstruktor/Factory, damit sie in Tests mit Fakes (z. B. In-Memory-DB, Fake-Drucker) laufen.

## Alternativen

- **Alles in Route-Handlern:** Schnell, aber bei zwei Druckern, Wiederholungslogik und Admin-Funktionen nicht mehr überschaubar.
- **Zusätzliche Schichten (Controller, DTO-Mapper, Domain-Entities):** Mehr Struktur, als ein Projekt dieser Grösse braucht.

## Konsequenzen

- Drucker lassen sich in Entwicklung und Tests durch einen Fake ersetzen, ohne Service-Code zu ändern.
- Jedes neue Feature beginnt mit der Frage: Welche Repositories braucht es, welcher Service orchestriert sie?
- Verzeichnisstruktur siehe `03-tech-stack.md`.
