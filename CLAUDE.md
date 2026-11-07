# dinoo – food ordering for club events

## Project

Offline ordering system: a laptop on site is the server (Wi-Fi, web app, SQLite) and prints kitchen tickets on Epson receipt printers (TM-T20IV/TM-T20III) in the same network (ESC/POS over TCP/9100). Every device in the network uses the same web interface; the admin area is part of it and only for the `admin` role. Details: `docs/00-overview.md`.

## Specification

The functional and technical specification lives in `docs/` (index: `docs/README.md`). `docs/` is written in German.

- Before implementing a feature, read its file in `docs/features/` and `docs/02-domain-model.md`.
- Acceptance criteria are the definition of done and the basis for tests.
- If something is unclear or contradictory, do not guess: ask, or add it to `docs/open-questions.md`.
- Record architecture decisions as ADRs in `docs/decisions/`.

## Commands

```bash
npm run dev         # Vite+ dev server on all interfaces (real printers)
npm run dev:fake    # same, printers replaced by a console logger
npm run seed        # demo data into ./data (database «demo»), see scripts/seed.ts
npm test            # vp test run (service tests)
npm run check       # svelte-check
npm run lint        # vp fmt --check && vp lint
npm run db:generate # new SQL migration in drizzle/ after changing the schema
npm run build && npm start   # production via server.js (any host, plain HTTP)
```

Environment: `DATA_DIR` (default `./data`), `PRINTER_DRIVER=fake`, `PORT`/`HOST` for `npm start`.

## Tech stack (details: `docs/03-tech-stack.md`)

- **SvelteKit monolith** with **Vite+**, Svelte 5 (runes), TypeScript, adapter-node.
- **UI:** `@noahbaumgartner/svelte-ui` (local at `../svelte-ui`, linked with `npm link`; `npm i @noahbaumgartner/svelte-ui` for production builds). No other UI library. Tokens are imported once in the root layout. Icons: `@lucide/svelte`.
- **DB:** SQLite (`better-sqlite3`) + Drizzle ORM. Schema in `src/lib/server/repositories/db/schema.ts`, migrations in `drizzle/`. One database file per event.
- **Auth:** Better Auth (username plugin), used server-side only through `AuthRepository`.
- **Printing:** `node-thermal-printer` behind `PrinterDeviceRepository`; persistent queue worked off by `PrintWorker`.

## Architecture rules (ADR-004)

- `src/lib/server/repositories/`: all I/O. **The database and the printers are repositories.** No business rules.
- `src/lib/server/services/`: business logic; gets repositories injected (testable with fakes).
- `src/lib/server/runtime.ts`: composition root; rebuilds repositories and services when the event database is switched.
- `src/routes/`: only calls services (`locals.services`). Never Drizzle or printers directly.
- Dependencies point down only: route → service → repository.
- Domain errors are `DomainError` with a user-facing (German) message; `action()` in `src/lib/server/forms.ts` turns them into `fail()`.
- Money is integer Rappen everywhere (`src/lib/money.ts`).

## Components: svelte-ui or dinoo? (ADR-002)

- A missing **generic** component (no domain terms, usable in any project) goes into `../svelte-ui`, exported from `src/lib/index.ts`, with a story, and built (`npm run build` there) so the link picks it up.
- Anything with domain meaning (order, article, printer, TWINT) stays in dinoo under `src/lib/components/`.
- **Contrast:** a container must never have the same background as the controls inside it. Inputs, selects, checkboxes, secondary buttons and steppers use `--color-surface`, so never put them on a `--color-surface` background (`Card variant="secondary"`, highlighted rows, info boxes). Use the default `Card`, a border, or an accent bar (`.accent-bar` in `src/app.css`, colour via `--accent-bar-color`) instead.

## Conventions

- **Language:** everything outside `docs/` is **English**: code, file names, identifiers, comments, commit messages, PR descriptions, README, configuration. Only `docs/` (the specification) and UI texts are **German (Switzerland)**, `ss` instead of `ß`. This also applies when the conversation is in German.
- Mobile first: the main clients are phones and tablets in the local network.
- No runtime dependency on the internet or external services; plain HTTP in the local network.
- Formatting: tabs, single quotes, no trailing commas, 100 columns (Oxfmt via `vp fmt`).
- **Commits:** always commit automatically after finishing a change, without asking first (one commit per coherent change, English message). Do not commit machine-specific or temporary files (e.g. scratchpad paths in `.claude/launch.json`). Pushing still needs an explicit request.
