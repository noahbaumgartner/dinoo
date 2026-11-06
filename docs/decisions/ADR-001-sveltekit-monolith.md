# ADR-001 – SvelteKit-Monolith

**Datum:** 2026-11-06
**Status:** Angenommen

## Kontext
Die Anwendung läuft auf einem einzelnen Laptop ohne Internet. Frontend, API, Datenbankzugriff und Druckeranbindung müssen zusammen gestartet und von Vereinsmitgliedern betrieben werden können.

## Entscheidung
Eine einzige SvelteKit-Anwendung (Node-Adapter) liefert die Web-Oberfläche, die serverseitige Logik und die Druckeranbindung. Kein separates Backend, kein Message-Broker.

## Alternativen
- **Getrenntes Frontend + Backend (z. B. Svelte + Express/Fastify):** Mehr Flexibilität, aber zwei Prozesse, zwei Deployments, mehr Setup-Aufwand auf dem Laptop.
- **Desktop-App (Electron/Tauri) mit eingebettetem Server:** Einfacher Start per Doppelklick, aber Zugriff von anderen Geräten im WLAN wäre trotzdem ein Webserver; Mehraufwand ohne klaren Gewinn.

## Konsequenzen
- Ein Prozess, ein Startbefehl, eine Codebasis.
- Serverseitige Logik muss intern sauber strukturiert werden, damit der Monolith nicht verwächst → [ADR-004](ADR-004-services-und-repositories.md).
