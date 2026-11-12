# Dokumentation dinoo

| Datei                                    | Inhalt                                                                                                                                                                                                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [00-overview.md](00-overview.md)         | Vision, Zielgruppe, Scope, Glossar                                                                                                                                                                                                                   |
| [01-roles.md](01-roles.md)               | Rollen & Berechtigungen                                                                                                                                                                                                                              |
| [02-domain-model.md](02-domain-model.md) | Entitäten, Beziehungen, Zustände                                                                                                                                                                                                                     |
| [03-tech-stack.md](03-tech-stack.md)     | Technologien & nicht-funktionale Anforderungen                                                                                                                                                                                                       |
| [features/](features/)                   | F01 Anmeldung, F02 Bestellung aufnehmen, F03 Druckwarteschlange, F04 Angebot, F05 Drucker/Warteschlange, F06 Benutzer/Tische/Einstellungen, F07 Abrechnen, F08 Bestellsuche, F09 Dashboard, F10 Datenbank, F11 Druckvorlage; Vorlage: `_template.md` |
| [decisions/](decisions/)                 | ADR-001 Monolith, 002 svelte-ui, 003 SQLite/Drizzle, 004 Services/Repositories, 005 Druck-Library, 006 SQLite-Treiber, 007 Auth, 008 Druckvorlage, 009 ePOS-Print, 010 Druck-Worker-Lease, 011 Drucker umleiten; Vorlage: `_template.md`             |
| [open-questions.md](open-questions.md)   | Ungeklärte Punkte                                                                                                                                                                                                                                    |

## Konventionen

- Features fortlaufend nummerieren: `F01-menu-anzeigen.md`, `F02-bestellung-aufgeben.md`, …
- Begriffe immer so verwenden, wie sie in `02-domain-model.md` definiert sind.
- Lieber kleine, fokussierte Dateien als ein grosses Dokument.
