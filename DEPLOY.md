# Deploying on the college server

The website is a single Node.js app. Everything it stores lives in one folder, the **data folder**:

```
data/
  site.db        all content, admin users, applications (SQLite)
  uploads/       photos and files uploaded in the admin
```

Back up that folder and you have backed up the whole site. Everything else can be rebuilt from git.

## What the server needs

| | Minimum |
|---|---|
| OS | Linux (Ubuntu 22.04/24.04, Debian 12, RHEL/Rocky 9) or Windows Server 2019+ |
| Node.js | **22.13 or later** (22 LTS or 24 LTS) |
| RAM / disk | 1 GB RAM, 2 GB free disk plus space for photos |
| Network | A hostname such as `ieee.rmkec.ac.in` pointing at the server, and ports 80 and 443 open |

No database server, no outside accounts and no internet access are needed at runtime (the only external content is YouTube thumbnails and embeds on album pages).

## Option A — Linux with systemd and nginx (recommended)

```bash
# 1. A dedicated user and the code
sudo useradd --system --create-home --shell /usr/sbin/nologin ieeesb
sudo git clone https://github.com/sanjanasenthilkumar15/ieee-website.git /opt/ieee-sb-rmkec
sudo chown -R ieeesb:ieeesb /opt/ieee-sb-rmkec
cd /opt/ieee-sb-rmkec

# 2. Settings
sudo -u ieeesb cp .env.example .env
sudo -u ieeesb nano .env        # set SITE_URL and DATA_DIR=/opt/ieee-sb-rmkec/data

# 3. Build
sudo -u ieeesb npm ci
sudo -u ieeesb npm run build

# 4. First admin account (asks for name, email and password)
sudo -u ieeesb npm run admin:create

# 5. Run it as a service
sudo cp deploy/ieee-sb.service /etc/systemd/system/
sudo nano /etc/systemd/system/ieee-sb.service    # check User, WorkingDirectory, SITE_URL, DATA_DIR
sudo systemctl daemon-reload
sudo systemctl enable --now ieee-sb
curl http://127.0.0.1:3000/api/health            # → {"ok":true,...}
```

Then put nginx in front for HTTPS: copy `deploy/nginx.conf` to `/etc/nginx/sites-available/ieee-sb`, set the certificate paths, link it into `sites-enabled`, and run `sudo nginx -t && sudo systemctl reload nginx`. Use the college's own certificate or a free one from Let's Encrypt (`sudo certbot --nginx -d ieee.rmkec.ac.in`).

Keep `client_max_body_size 60m;` in the nginx config, because the admin uploads several photos at once. With Apache, set `LimitRequestBody 62914560` and use `ProxyPass / http://127.0.0.1:3000/` together with `RequestHeader set X-Forwarded-Proto https`.

Logs: `journalctl -u ieee-sb -f`.

## Option B — Windows Server

1. Install Node.js 22 LTS from nodejs.org and Git for Windows.
2. Clone the repo into a folder such as `C:\ieee-sb-rmkec`, then run the following in that folder:
   ```bat
   copy .env.example .env
   notepad .env
   npm ci
   npm run build
   npm run admin:create
   ```
   In `.env`, set `SITE_URL`, and set `DATA_DIR=C:\ieee-sb-rmkec\data`.
3. Run it as a Windows service so it starts at boot. The simplest way is [NSSM](https://nssm.cc): `nssm install ieee-sb "C:\Program Files\nodejs\npm.cmd" start`, set the startup directory to `C:\ieee-sb-rmkec`, then run `nssm start ieee-sb`.
4. For HTTPS, use IIS with the URL Rewrite and ARR modules as a reverse proxy to `http://127.0.0.1:3000`. Raise the request size limit to 60 MB (`maxAllowedContentLength="62914560"`), and forward the `X-Forwarded-Proto` header.

## Option C — Docker

```bash
docker compose up -d --build                                          # edit SITE_URL in docker-compose.yml first
docker compose exec web node --no-warnings scripts/create-admin.mjs   # first admin
```

The data folder is `./data` on the host, mounted at `/data`. Put nginx in front for HTTPS as in option A.

## Settings

| Variable | Default | Purpose |
|---|---|---|
| `SITE_URL` | `http://localhost:3000` | The public address. Used in the sitemap, robots.txt and social previews |
| `DATA_DIR` | `./data` | Database and uploads. **Use an absolute path in production** |
| `PORT` | `3000` | Port for Node. Keep it behind nginx/IIS; don't expose it directly |
| `SITE_NOINDEX` | – | `true` on test copies, which keeps them out of search engines |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | – | Only for hosts without a terminal (e.g. Vercel). Creates this admin automatically when no accounts exist yet |

These can go in `.env` in the project folder, in the systemd unit, or in `docker-compose.yml`.

## Backups

```bash
npm run backup           # → backups/2026-09-25_0200/ (site.db + uploads), keeps the last 14
```

This is safe to run while the site is live: it uses SQLite's `VACUUM INTO`, which takes a consistent snapshot. Schedule it every night:

- **Linux (cron):** `sudo crontab -u ieeesb -e`, then add
  `0 2 * * * cd /opt/ieee-sb-rmkec && /usr/bin/npm run backup >> /opt/ieee-sb-rmkec/backups/backup.log 2>&1`
- **Windows:** in Task Scheduler, create a daily task that runs `npm.cmd run backup` with "Start in" set to `C:\ieee-sb-rmkec`.
- **Docker:** from cron on the host, run `docker compose exec -e BACKUP_DIR=/data/backups web node --no-warnings scripts/backup.mjs`. The backups then appear in `./data/backups` on the host.

To write backups somewhere else, such as a mounted network share, set `BACKUP_DIR=/mnt/share/ieee-backups`.

**Copy the backups off the server** as well: to a college file share, or to a branch-owned drive once a week. A backup on the same disk won't help if that disk fails.

### Restore

1. Stop the site (`sudo systemctl stop ieee-sb`).
2. Replace `DATA_DIR/site.db` and `DATA_DIR/uploads/` with the copies from the backup folder. Delete any `site.db-wal` and `site.db-shm` files that are left behind.
3. Start the site again.

## Updating the code

```bash
cd /opt/ieee-sb-rmkec
sudo -u ieeesb npm run backup
sudo -u ieeesb git pull
sudo -u ieeesb npm ci
sudo -u ieeesb npm run build
sudo systemctl restart ieee-sb
```

Content and uploads are never touched by a rebuild. The database updates its own structure on start when needed.

## Security checklist

- Serve the site over HTTPS only. Login cookies are marked `Secure` automatically when nginx sends `X-Forwarded-Proto: https`.
- Give out one admin account per person: never share a login. Remove accounts when people leave (Admin → Users).
- Keep the server patched, and keep Node on a supported LTS version.
- Only ports 80 and 443 should be open to the outside; don't open port 3000.
- The login is rate-limited (8 tries per 15 minutes per email and IP), as is the Join form (5 per hour per IP).
- If an admin forgets their password, another admin can reset it under Admin → Users. If no admin can sign in, anyone with server access can run `npm run admin:create` with that email to set a new password.

## Temporary / review copies (Vercel etc.)

The site can run on hosts like Vercel for a quick review, but they have **no permanent disk**. The admin then shows a yellow banner, and any edits or uploads disappear when the host restarts. Set `SITE_NOINDEX=true` on such copies. Use the college server for the real site.

These hosts have no terminal for `npm run admin:create`. Instead, set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (at least 10 characters) and optionally `ADMIN_NAME` in the host's environment variables, then redeploy. On Vercel that's Project → Settings → Environment Variables. The admin account is recreated each time the host starts fresh. You may occasionally be signed out when the host switches instances; just sign in again.
