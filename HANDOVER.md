# Handover guide — IEEE SB RMKEC website

This is for the office bearers and faculty who keep the website up to date. You don't need to know any code. Everything is done in the admin panel.

**Admin panel:** `https://<site address>/admin`. There's also an "Admin" link at the bottom of every page.

## Who owns what

The website belongs to the **branch**, not to any one student. Before each Execom hands over, make sure the following are recorded somewhere the next team and the Branch Counsellor can reach, such as a shared password vault the branch controls or a sealed note with the Counsellor:

| Item | Where | Owner |
|---|---|---|
| Admin logins | Admin → Users | One per person. The Counsellor should always have an admin account |
| Server access | College IT / server room | College IT + Branch Counsellor |
| Domain / DNS (e.g. ieee.rmkec.ac.in) | College IT | College IT |
| Code repository | GitHub | TODO: move it to a branch-owned GitHub organisation or account, and add the Counsellor as an owner |
| Backups | Server `backups/` folder + an off-server copy | College IT / Webmaster |

> TODO: choose where the branch keeps its credentials (for example a Bitwarden organisation owned by the branch email) and write it here.

## Signing in

1. Go to `/admin` and sign in with your email and password.
2. First time? An admin gives you a temporary password. Change it right away: click your name at the bottom of the menu.
3. You stay signed in for 7 days on that browser. Always **Sign out** on shared or lab computers.

Forgot your password? Ask any admin to reset it (**Users → Reset password**).

## Roles

- **Editor**: can add, edit and delete all content and applications.
- **Admin**: everything an editor can do, plus adding and removing people (**Users**).

Keep 2–3 admins at most: usually the Chair, the Webmaster and the Counsellor. Everyone else should be an editor.

## Everyday tasks

The **Dashboard** shows new membership applications, upcoming events and recent changes (who changed what). Saved changes appear on the website immediately.

### Add an event

**Events → New event.** Fill in the title, type, start date and time (Indian time), venue and a short summary. Add the poster, speakers, organising societies and a registration link if there is one.

- The site works out **Upcoming** or **Past** from the date by itself. You don't need to move anything after the event.
- Tick **Feature on the home page** to show it in the big card on the home page. If several are featured, the soonest one is shown.
- The registration link is only shown while the event is upcoming.
- After the event, fill in the **Report (after the event)** tab (write-up, report PDF, attendance), and add photos as a Gallery album linked to the event (see below).

### Add photos after an event

**Gallery → New album.** Give it a title, choose the **event** it belongs to, and upload the photos (you can pick many at once). Photos are shrunk and converted automatically, so phone photos are fine. Add YouTube or Instagram links under **Videos & reels**.

The photos then appear on the Gallery page **and** at the bottom of that event's page.

### Achievements, publications, blog posts

- **Achievements**: student or faculty wins, awards, papers and reviewer roles. You can upload a certificate as proof. It stays private unless you tick "Show certificate link publicly". Tick "Highlight on home page" for the best ones.
- **Publications**: papers by members. Add the authors in the order printed on the paper, and a DOI or link.
- **Blog & Newsletter**: articles, event reports, student stories, newsletters (you can attach a PDF) and resources.

Longer text boxes (description, report, post body) support headings, bold, lists and links. Use the small toolbar, then click **Preview** to check.

### Membership applications

When someone submits the **Join** form, their application appears under **Applications** with a green "New" count in the menu.

1. Open the application, then contact the student by email or phone.
2. Add notes if you like, and mark it **Reviewed**.
3. **Download CSV (Excel)** gives you everything in one spreadsheet.

Applications contain students' phone numbers and emails. They are never shown on the public site, so don't share the CSV outside the Execom. Delete old applications once they've been handled.

### Site settings

The tagline, vision and mission, the numbers on the home page, the history timeline on the About page, recognitions, contact details, social links and media coverage are all in **Site settings**.

In the numbers strip, leave "Events" or "Societies" empty to have them **counted automatically**. Leave any other number empty to hide it.

## Yearly Execom handover

1. **Add the new Execom**: under **Execom**, add a member for each new office bearer with the **new year** (e.g. 2027). Upload a square head-and-shoulders photo. Set the Display order (1 = Chair, 2 = Vice Chair…). Faculty (Counsellor, Advisor) need a new entry for the new year too.
2. The Execom page automatically shows the newest year, and the previous year moves under **Past committees**. Don't delete the old year's members: they are the branch's history.
3. **Accounts**: the outgoing admin creates accounts for the incoming Chair and Webmaster (**Users → Add user**), makes at least one of them **admin**, and then the new team **removes the accounts of people who have left**.
4. **Site settings**: update the numbers strip, and add a timeline milestone for anything notable that year.
5. Update the recorded credentials (see "Who owns what" above) and check that last night's backup exists.

## Good practice

- **Photos**: use landscape images for event posters and albums, and square ones for Execom portraits. Always fill in the "Image description" under each photo, because it's needed for screen readers.
- **Don't delete by mistake**: deleting cannot be undone from the admin. If something important is deleted, ask the person who manages the server to restore last night's backup (see DEPLOY.md). That will also undo any changes made since then.
- **Starter content**: some achievements, publications and posts that came with the site have "(sample entry)" or "(sample post)" in their titles. Replace or delete them once you have real ones.

## For whoever maintains the server

See **DEPLOY.md** for installing, HTTPS, updating, nightly backups and restoring, and **README.md** for how the code is organised.
