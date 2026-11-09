<p align="center">
  <img src="assets/header.png" alt="dinoo" width="640">
</p>

# dinoo

Food ordering for club events. A laptop on site runs the server: service staff take orders on their phones in the local Wi-Fi, kitchen tickets come out of Epson receipt printers, and payment is cash (with change calculator) or the club's TWINT code. Everything works offline.

The specification (in German) is in [`docs/`](docs/README.md).

## Features

- Order in four steps: table → items → send → pay (cash with change, TWINT, split payments)
- Kitchen tickets per printer: category default with per-article override
- Persistent print queue: an unreachable printer keeps its tickets and prints them once it is back
- Admin: menu, printers and queue, tables, users, TWINT QR code, order search, dashboard
- One SQLite database per event; create, switch, download and upload in the admin area

## Requirements

- Node.js 24 or newer
- [Vite+](https://viteplus.dev) (`vp`)
- The component library `@noahbaumgartner/svelte-ui`

## Setup for development

```bash
# once, in ../svelte-ui
npm install && npm run build && npm link

# in this repository
npm install
npm link @noahbaumgartner/svelte-ui
npm run seed       # optional demo data
npm run dev:fake   # http://localhost:5173, printers are simulated
```

Demo logins created by `npm run seed` (development only): `admin` / `admin1234`, `anna` / `anna1234`, `ben` / `ben1234`. The seeded printer «Grill» is offline on purpose, so the print queue has waiting tickets.

Without seed data, the first visit opens a setup page that creates the first admin.

## Running at an event

1. Connect the laptop and the printers to the same network (cable or Wi-Fi) and give the laptop a fixed IP and a DNS name.
2. Start the server: `npm run dev` (Vite+, port 5173), or `npm run build && npm start` (production build via `server.js`, port 3000, all interfaces; set `PORT`/`HOST` to change). Both accept requests by IP address and by DNS name. For a production build, install the published library with `npm i @noahbaumgartner/svelte-ui`.
3. In the admin area: add the printers by IP address and print a test ticket, add tables, menu and users, scan the TWINT QR code.
4. Staff open `http://<dns-name>:<port>` on their phones and sign in.

Event databases live in `./data` (`DATA_DIR`). Download a backup after every event under _Admin → Datenbank_.

## Development

```bash
npm test          # service tests (Vitest via vp test)
npm run check     # svelte-check
npm run lint      # Oxfmt + Oxlint
npm run db:generate   # after changing src/lib/server/repositories/db/schema.ts
```

Architecture: routes → services → repositories (database, printers, auth). See [`CLAUDE.md`](CLAUDE.md) and [`docs/decisions/`](docs/decisions/).
