# IEEE Student Branch RMKEC — Website (SB #61871)

Next.js (App Router, TypeScript) + Tailwind CSS v4 + Sanity (Studio embedded at `/studio`, from Phase 2).

## Run locally (Windows / macOS / Linux)

Requires Node.js 20.9+ (Node 22 LTS recommended).

```bash
npm install
npm run dev
```

Open http://localhost:3000. Design tokens reference page: http://localhost:3000/styleguide (noindex, not in nav).

## Project layout

```
src/
  app/
    layout.tsx            Root: html/body, Inter font, default metadata
    globals.css           Design tokens (@theme) + base styles
    (site)/               Public site (header + footer chrome)
      layout.tsx
      page.tsx            Home (Phase 1 placeholder)
      styleguide/         Internal token reference
    # studio/ route added in Phase 2 (outside (site) so it renders full-screen)
  components/layout/      Header, Footer, Container, SocialIcons
  lib/
    site.ts               Branch name, nav, contact/social fallbacks
    categories.ts         Category → stripe colour mapping
  fonts/                  Self-hosted Inter variable font (OFL)
public/logos/             PLACEHOLDER logos — replace with official files
```

## Design tokens

Tailwind v4 keeps its theme in CSS: see the `@theme static` block in `src/app/globals.css`.
Every token is a CSS variable and a utility (`bg-ieee-blue`, `text-rmkec-green`, `border-cat-award`, `max-w-site`).

## Placeholders to replace

- `public/logos/ieee-sb.svg`, `public/logos/rmkec-crest.svg`: official marks
- `--color-rmkec-green` hex: confirm from the crest
- `src/lib/site.ts`: branch email, social URLs, address check
- `.env.example` → `.env.local`: Sanity project values (Phase 2)
