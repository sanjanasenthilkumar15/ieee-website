# IEEE Student Branch RMKEC — Website (SB61871)

Built with Next.js (App Router, TypeScript), Tailwind CSS v4 and Sanity. The Sanity Studio (the admin area) is part of this app, at `/studio`.

## Run locally (Windows / macOS / Linux)

Requires Node.js 20.9 or later (Node 22 LTS recommended). On Windows you can simply double-click `start-site.bat`: it installs packages on the first run, starts the site and opens it in your browser.

```bash
npm install
npm run dev
```

- Site: http://localhost:3000. It works straight away: until a Sanity project is set up, the site shows the content in `src/content/`, which holds the real 2026 events, Execom and societies, plus clearly labelled sample achievements, publications and posts.
- Admin (Sanity Studio): http://localhost:3000/studio (needs the Sanity setup below)
- Design tokens reference: http://localhost:3000/styleguide (hidden from search engines and not in the nav)

## Sanity setup (one time)

Use a **branch-owned Google account or email** for every step, not a personal one, so the next Execom inherits it.

1. Go to https://www.sanity.io/manage, sign in with the branch account, and click **Create project**. Name it "IEEE SB RMKEC" and create a dataset called `production` with **Public** visibility.
2. Copy the **Project ID** from the project page.
3. Create `.env.local` from `.env.example` and paste the ID into `NEXT_PUBLIC_SANITY_PROJECT_ID`.
4. In the project, go to **API → CORS origins → Add CORS origin**. Enter `http://localhost:3000` and tick **Allow credentials**. When the site is deployed, add its Vercel URL and final domain the same way.
5. Go to **API → Tokens → Add API token**. Name it `website-write` and give it **Editor** permissions. Paste the token into `SANITY_API_WRITE_TOKEN` in `.env.local`. **Never commit this file.**
6. Load the starter content with `npm run seed`, or `npm run seed:samples` to also add sample achievements, publications and posts. See `scripts/seed/README.md`.
7. Run `npm run dev`, open http://localhost:3000/studio and sign in.

Other admins: in sanity.io/manage go to **Members → Invite**. On Sanity's Free plan members can only be Administrator or Viewer, so office bearers who edit content need the Administrator role. Remove people when they leave the Execom.

## Instant updates after publishing (optional)

Pages refresh on their own every 5–60 minutes. To make an edit show up as soon as it's published, add a webhook in sanity.io/manage under **API → Webhooks**:

- URL: `https://<site>/api/revalidate`
- Triggers: create, update and delete
- Projection: `{_type}`
- Secret: a random string. Put the same string in `SANITY_REVALIDATE_SECRET` in Vercel.

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build (what Vercel runs) |
| `npm run lint` | ESLint |
| `npm run schema:validate` | Check the Sanity schemas for errors |
| `npm run seed:check` | Dry-run the seed script (no network) |

## Project layout

```
sanity.config.ts          Studio config (schemas, sidebar, singleton rules)
sanity.cli.ts             Config for `npx sanity …` commands
scripts/seed/             One-time seed: loads src/content + public/content into Sanity
scripts/content-manifest.mjs  Records image sizes for src/content (npm run content:manifest)
src/
  app/
    layout.tsx            Root: html/body, Inter font, default metadata
    globals.css           Design tokens (@theme) + base styles
    (site)/               Public site (header + footer)
    studio/[[...tool]]/   Embedded Sanity Studio (full screen, no site chrome)
  content/                Starter/offline content (JSON): events, execom, societies, albums…
  components/
    layout/               Header, Footer, Container, SocialIcons
    cards/                Event, Achievement, Post, Member, Society cards
    home/ about/ execom/ events/ gallery/ join/ filters/ ui/
  lib/
    content/              Data layer: getEvents(), getExecom()… (Sanity or JSON)
    options.ts            Shared option lists (departments, event types…)
    site.ts               Fallback branch info, nav
    categories.ts         Category → stripe colour mapping
  sanity/
    env.ts                Project ID / dataset from env vars
    lib/client.ts         Read client + sanityFetch() helper
    lib/writeClient.ts    Server-only write client (Join form)
    lib/image.ts          urlFor() image URL builder
    schemaTypes/          Content types (one file each)
    structure.ts          Studio sidebar layout
  fonts/                  Self-hosted Inter variable font (OFL)
public/
  logos/                  IEEE SB61871 mark, RMKEC crest
  images/                 Campus aerial, Execom group photo
  content/                Photos, posters and logos used by src/content
```

## Content types

| Type | Used on | Notes |
|---|---|---|
| Site Settings | Everywhere | Only one exists. Holds home-page numbers, History milestones, social links |
| Execom Member | /execom | `year` is required. A second year of data makes "Past Committees" appear |
| Society / Council | /execom | Society, council or affinity group |
| Event | /events | Upcoming vs past is worked out from the date. Photos live in a linked Gallery Album |
| Achievement | /achievements, home | Grouped by category, not department |
| Publication | /publications | |
| Post | /blog | Article, Event Report, Student Story, Newsletter, Resource |
| Gallery Album | /gallery, event pages | Photos + YouTube/Instagram links |
| Membership Application | Studio only | Created by the Join form. Never shown publicly |

## Design tokens

Tailwind v4 keeps its theme in CSS: see the `@theme static` block in `src/app/globals.css`. Every token is both a CSS variable and a Tailwind class (`bg-ieee-blue`, `text-rmkec-green`, `border-cat-award`, `max-w-site`).

## Still to supply

- A higher-resolution IEEE SB61871 logo, ideally SVG. The current PNG is only 161×72px.
- `src/lib/site.ts`: the branch email and real social URLs. These are fallbacks until Site Settings is filled in.
- The approved vision and mission text. The seed script puts in sample text.
