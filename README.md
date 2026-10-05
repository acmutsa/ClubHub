# ClubHub
Reimagining the best parts of ClubKit as a multi-tenant SaaS application. A platform that gives any student organization on your campus the ability to manage membership and events.

## Getting Started

```bash
pnpm install
cp .env.example .env   # fill in BETTER_AUTH_SECRET
pnpm db:up             # local libSQL server on :8080 (docker compose)
pnpm db:migrate
pnpm db:seed           # optional
pnpm dev
```

Stop the database with `pnpm db:down` (data persists in the `libsql-data` volume; add `-v` to wipe it).

## Tests

```bash
pnpm test         # run once
pnpm test:watch   # watch mode
```

Tests live next to the code as `*.test.ts` under `src/`.

## Test Multi-tenant Subdomain

1. Navigate to https://acm-utsa.localhost:3000 in the browser.
2. If successful, you should see "Club acm-utsa" on the `/` route

## Todo

- [x] Make sign-in/sign-up functional
- [x] Make club creation
- [ ] Make club admin functionality
- [x] Make membership management functional
- [ ] Make saas admin functionality
- [x] Make at least one db call with WHERE clause for demo
