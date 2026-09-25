# IEEE Student Branch RMKEC — Website (STB61871)

Repository: https://github.com/sanjanasenthilkumar15/ieee-website

One self-contained app: the public website **and** its admin panel (`/admin`). Built with Next.js (App Router, TypeScript) and Tailwind CSS v4. Content is stored in a single SQLite database file, and uploaded photos and files sit in a folder next to it. No outside services, accounts or subscriptions are needed, so it can run entirely on a college server.

- **DEPLOY.md** explains how to put it on the college server, with HTTPS and backups.
- **HANDOVER.md** is for office bearers: how to use the admin panel and hand over each year.

## Run locally (Windows / macOS / Linux)

Requires **Node.js 22.13 or later** (Node 22 LTS or 24 LTS). On Windows you can double-click `start-site.bat`: it installs packages on the first run, starts the site and opens it in your browser.

```bash
npm install
npm run admin:create     # first time only: create your admin login
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin
- Design tokens reference: http://localhost:3000/styleguide (hidden from search engines and not in the nav)

On the first start, the database is created in `data/site.db` and filled from `src/content/`: the real 2026 events, Execom and societies, plus some clearly labelled sample achievements, publications and posts that you can delete in the admin. The `data/` folder is never committed to git.

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server with live reload |
| `npm run build` | Production build (`.next/standalone`) |
| `npm start` | Run the production build (data in `./data` or `DATA_DIR`) |
| `npm run admin:create` | Create an admin account, or reset someone's password |
| `npm run backup` | Snapshot the database and uploads into `backups/` (keeps the last 14) |
| `npm run lint` | ESLint |
| `npm run content:manifest` | Record image sizes for `src/content` (only needed if you edit the starter content) |

## How it works

```
Browser ──► Node (Next.js) ──► DATA_DIR/site.db       content, admin users, sessions, applications
                          └──► DATA_DIR/uploads/…     photos (converted to WebP) and PDFs, served at /media/…
```

- Every page reads from the database on each request, so edits show up as soon as you save them.
- Admin logins belong to the branch. Passwords are hashed with scrypt, and sessions use an HttpOnly cookie that lasts 7 days. There are two roles: **admin** can manage users, and **editor** can do everything else.
- The admin forms are generated from `src/admin/schema.ts`. To add a field, add it there and the public page that shows it. Nothing else needs to change.

## Project layout

```
scripts/
  start.mjs               Production start (sets DATA_DIR, runs the standalone server)
  postbuild.mjs           Copies public/ and static files into .next/standalone
  create-admin.mjs        CLI: create an admin / reset a password
  backup.mjs              CLI: consistent backup of site.db + uploads
  content-manifest.mjs    Image sizes for src/content
deploy/                   systemd service + nginx example
Dockerfile, docker-compose.yml   Optional container setup
src/
  app/
    (site)/               Public site (header + footer)
    admin/                Admin panel: login, dashboard, content, applications, users, account
    api/join/             Join form → saved as an application
    api/health/           Health check for monitoring
    media/[...path]/      Serves uploaded files
    sitemap.ts, robots.ts, icon.png, apple-icon.png
  admin/
    schema.ts             Content types and their fields (drives the admin forms)
    validate.ts           Server-side checks for admin saves
    actions.ts            Server actions: save/delete, login, users
    components/           Admin UI (DocForm, AdminShell, …)
  server/
    config.ts             DATA_DIR, limits
    db.ts                 SQLite (node:sqlite), migrations, first-run seed
    auth.ts               Users, password hashing, sessions
    media.ts              Upload handling (sharp → WebP)
    seed.ts               Turns src/content into the starting database
  lib/content/            Data layer used by the pages: getEvents(), getExecom()…
  content/                Starter content (JSON), used only when the database is first created
  components/             Site UI: cards, layout, home, events, gallery…
public/                   Logos, images, starter photos and posters
```

## Content types

| Type | Used on | Notes |
|---|---|---|
| Site settings | Everywhere | Only one exists. Holds the tagline, home-page numbers, History milestones, contact details and social links |
| Execom member | /execom | Year is required. Once there is a second year, "Past committees" appears |
| Society / council | /execom, events | Society, council or affinity group |
| Event | /events, home | Upcoming or past is worked out from the date. Photos come from a linked gallery album |
| Achievement | /achievements, home | Grouped by category |
| Publication | /publications | |
| Post | /blog | Article, event report, student story, newsletter, resource |
| Gallery album | /gallery, event pages | Photos plus YouTube and Instagram links |
| Application | Admin only | Created by the Join form. Never shown publicly. Can be exported as CSV |

## Design tokens

Tailwind v4 keeps its theme in CSS: see the `@theme static` block in `src/app/globals.css`. Every token is available both as a CSS variable and as a Tailwind class (`bg-ieee-blue`, `text-rmkec-green`, `border-cat-award`, `max-w-site`).

## Still to supply

- A higher-resolution IEEE STB61871 logo, ideally SVG. The current PNG is only 161×72px, so the favicon is soft.
- Real social media URLs (Admin → Site settings).
- Approved vision and mission text (Admin → Site settings).
