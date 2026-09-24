# Seed content

`seed.mjs` loads the branch's real 2026 content into Sanity. Run it once, after the Sanity project is set up (see the main README), and edit everything in the Studio after that.

| What | Source | Count |
|---|---|---|
| Site Settings | Branch details; vision/mission are **sample text to replace** | 1 |
| Societies & Councils, with logos | `IEEE SOCIETIES.docx` | 22 (14 societies, 8 councils) |
| Events, with speakers and posters | 2026 event list + webinar posters | 19 |
| Execom members | Only the people named on posters | 3 |
| Gallery albums | Photos supplied by the branch | 3 albums, 4 photos |

With `--with-samples` it also adds 3 achievements, 2 publications and 2 posts. These are clearly marked as samples, and every one has an ID starting with `sample-`.

## Commands

```bash
npm run seed:check     # dry run: checks every asset exists; no network needed
npm run seed           # real content
npm run seed:samples   # real content + sample entries
```

`seed` and `seed:samples` read `.env.local`, which needs `NEXT_PUBLIC_SANITY_PROJECT_ID` and `SANITY_API_WRITE_TOKEN`.

The script can be re-run safely because documents have fixed IDs. **But re-running overwrites any Studio edits to those documents.**

## Removing the samples

In the Studio, open each item marked "(sample entry)" or "(sample post)" and delete it. Or from the terminal:

```bash
npx sanity documents delete sample-achievement-hackathon sample-achievement-paper sample-achievement-award sample-publication-1 sample-publication-2 sample-post-welcome sample-post-webinar-report
```

## Things to check after seeding

- **EDS logo:** the logo in the docx reads "SIT Student Branch Chapter", so it belongs to another college's chapter. Replace it with the plain IEEE EDS logo.
- **Founding Execom 2026 album:** the date is set to 21 Aug (Inauguration), but that's a guess. Link it to the right event.
- **Branch Sessions 2026 album:** two photos whose events aren't known. Link them to their events.
- **Event times:** only webinars and the membership drive have times, taken from the posters. Other events are set to show the date only.
- **Webinar #2 "Cutting Edge":** no speaker or poster was supplied.
