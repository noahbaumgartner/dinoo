# Rollen & Berechtigungen

## Rollen

| Rolle | Code | Beschreibung |
|-------|------|--------------|
| Service | `service` | Vereinsmitglied, das am Tisch Bestellungen aufnimmt (F02) und abrechnet (F07). Muss angemeldet sein. |
| Admin | `admin` | Verwaltet Angebot, Drucker, Benutzer, Tische und Einstellungen des Anlasses. Kann alles, was Service kann. Zugriff von jedem Gerät im Netz. |

Gäste haben keinen eigenen Zugang; sie bestellen über das Service-Personal.

<!-- Weitere Rollen (z. B. Küche mit Bildschirmansicht) sind nicht definiert; nur ergänzen, wenn fachlich nötig. -->

## Berechtigungsmatrix

| Aktion | Service | Admin |
|--------|---------|-------|
| Anmelden / Abmelden | ✓ | ✓ |
| Bestellung aufnehmen und abschicken | ✓ | ✓ |
| Bestellung abrechnen (Bar / TWINT) | ✓ | ✓ |
| Offene Bestellungen einsehen | ✓ | ✓ |
| Druckstatus der eigenen Bestellung sehen | ✓ | ✓ |
| Eigene letzte Zahlung rückgängig machen (5 min) | ✓ | ✓ |
| Beliebige Zahlung löschen | – | ✓ |
| Angebot pflegen (Kategorien, Artikel, Druckzuordnung) | – | ✓ |
| Drucker verwalten, Testdruck, Druckwarteschlange einsehen und eingreifen | – | ✓ |
| Benutzer, Tische, Einstellungen verwalten | – | ✓ |
| Bestellungen suchen (Tisch, Personal, Bestellnummer) | – | ✓ |
| Dashboard | – | ✓ |
| Datenbank anlegen, wechseln, sichern | – | ✓ |

## Authentifizierung
- Jede Nutzung erfordert eine Anmeldung (F01). Nur `/login` ist öffentlich.
- Das Admin-Interface (`/admin/*`) ist nur mit Rolle `admin` erreichbar. Der Server-Laptop ist dabei nicht privilegiert.
