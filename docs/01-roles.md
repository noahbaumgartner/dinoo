# Rollen & Berechtigungen

## Rollen

| Rolle | Beschreibung |
|-------|--------------|
| Besteller | Gibt Bestellungen über die Web-Oberfläche auf. Unklar, ob anonym oder angemeldet (siehe offene Fragen). |
| Admin | Verwaltet Angebot, Drucker, Benutzer und Einstellungen des Anlasses. Zugriff auf das Admin-Interface von jedem Gerät im WLAN. |

<!-- Weitere Rollen (z. B. Küche mit Bildschirmansicht, Kasse) sind nicht definiert; nur ergänzen, wenn fachlich nötig. -->

## Berechtigungsmatrix

| Aktion | Besteller | Admin |
|--------|-----------|-------|
| Angebot ansehen | ✓ | ✓ |
| Bestellung aufgeben | ✓ | ✓ |
| Angebot pflegen (Artikel, Preise, Kategorien) | – | ✓ |
| Drucker verwalten und zuordnen | – | ✓ |
| Benutzer und Rollen verwalten | – | ✓ |
| Admin-Interface aufrufen | – | ✓ |

## Authentifizierung
- Das Admin-Interface ist nur nach Anmeldung mit einem Benutzer der Rolle *Admin* erreichbar.
- Die Anmeldung erfolgt in der Web-Oberfläche; der Server-Laptop ist dabei nicht privilegiert, auch dort muss man sich als Admin anmelden.
- Ob Besteller sich anmelden müssen, ist offen (→ `open-questions.md`).
