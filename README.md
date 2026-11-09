<img src="assets/header.png" alt="dinoo" width="100%">

# dinoo

Food ordering for club events. A laptop on site runs the server: service staff take orders on their phones in the local Wi-Fi, kitchen tickets come out of Epson receipt printers, and payment is cash (with change calculator) or the club's TWINT code. Everything works offline.

The specification (in German) is in [`docs/`](docs/README.md).

## Features

- Order in four steps: table → items → send → pay (cash with change, TWINT, split payments)
- Kitchen tickets per printer: category default with per-article override
- Persistent print queue: an unreachable printer keeps its tickets and prints them once it is back
- Admin: menu, printers and queue, tables, users, TWINT QR code, order search, dashboard
- One SQLite database per event; create, switch, download and upload in the admin area

## Quick start

Requires [Node.js](https://nodejs.org) 24 or newer.

```bash
npm install
npm run seed       # demo data (optional)
npm run dev:fake   # http://localhost:5173, printers are simulated
```

Demo logins: `admin` / `admin1234`, `anna` / `anna1234`, `ben` / `ben1234`. Without seed data, the first visit opens a setup page that creates the first admin.

## Running at an event

1. Connect the laptop and the printers to the same network and give the laptop a fixed IP.
2. `npm install && npm run build && npm start` (port 3000, set `PORT` to change).
3. In the admin area: add the printers by IP address, print a test ticket, add tables, menu and users, scan the TWINT QR code.
4. Staff open `http://<laptop-ip>:3000` on their phones and sign in.

Event databases live in `./data`. Download a backup after every event under _Admin → Datenbank_.

## Development

```bash
npm test          # service tests (Vitest via vp test)
npm run check     # svelte-check
npm run lint      # Oxfmt + Oxlint
npm run db:generate   # after changing src/lib/server/repositories/db/schema.ts
```

Architecture: routes → services → repositories (database, printers, auth). See [`CLAUDE.md`](CLAUDE.md) and [`docs/decisions/`](docs/decisions/).
