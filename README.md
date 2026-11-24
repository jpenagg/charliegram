# charliegram

A private photo album for our family: soccer games, trips, birthdays. Family members sign in
with a shared password; I upload and organize photos into albums.

Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, and Vercel Blob. Hosted on Vercel.

## Using it

- **Family:** open the site and enter the family password. Albums are listed with the most recently
  updated first. Open a photo to browse with arrows, swipe, or the keyboard; **Download** saves the
  full-size copy. The phone's back button closes a photo.
- **Admin:** sign in with the admin password in the same box. You'll see **Upload** in the menu and
  **Delete** in the photo viewer. To make a new album, choose "New album" on the upload page and
  name it. Albums exist as long as they have photos.

## How it works

```
browser ──► proxy.ts ──► app/(site)/*  ──► lib/photos.ts ──► Vercel Blob (private store)
              │            pages             (cached list)        photos/<album>/<name>.jpg
              │                                                    thumbs/<album>/<name>.jpg
              ├──► /api/photo/[...path]  streams one private blob to a signed-in viewer
              └──► /api/upload           issues upload tokens (admin only); the browser
                                         then uploads straight to Blob
```

- **No database.** Each photo's name encodes when it was taken and its size
  (`<takenMs>-<random>-<w>x<h>.jpg`), so a single Blob listing has everything needed to sort,
  group by month, and lay out the gallery without layout shift. That listing is cached with
  `unstable_cache` and invalidated when photos are uploaded or deleted.
- **Private by default.** Blobs are stored with private access, and every photo request goes through
  `/api/photo`, which checks the session. There are no public image URLs to leak.
- **Auth.** One password box: `FAMILY_PASSWORD` signs you in as family, `ADMIN_PASSWORD` as admin.
  Sessions are signed JWT cookies (`jose`, HS256, 90 days). Each session records a fingerprint of the
  password it was created with, so changing a password signs out everyone who used the old one.
  `proxy.ts` redirects signed-out visitors, and pages, data access, server actions, and route
  handlers each re-check the session, so the proxy is not the only gate.
- **Uploads stay small and scrubbed.** The upload page reads the capture date from EXIF, then
  re-encodes each photo in the browser (2560px full size, 800px thumbnail). Re-encoding drops all
  metadata, including GPS location, before anything leaves the device.
- **Not indexed.** Every response carries `X-Robots-Tag: noindex, nofollow, noarchive, noimageindex`,
  and pages also set the `robots` meta tag.

### Project layout

```
app/
  (site)/             signed-in pages: albums (/), albums/[album], about, upload
  login/              the album "cover" and password form
  api/photo/          private photo streaming
  api/upload/         Blob client-upload token endpoint
  actions.ts          server actions: login, logout, deletePhoto, finishUpload
components/           album stack, gallery (justified rows), photo viewer, nav
lib/
  paths.ts            blob naming scheme, parsing, date formatting (shared client/server)
  token.ts            password check and session tokens (pure, unit tested)
  session.ts          cookie session helpers (server only)
  photos.ts           cached Blob listing + session-checked getters (server only)
proxy.ts              redirects signed-out visitors before anything renders
```

## Setup

### Vercel (production)

1. **Storage → Create → Blob**, choose **private** access, and connect it to the project. This sets
   `BLOB_READ_WRITE_TOKEN`.
2. In **Settings → Environment Variables**, add `SESSION_SECRET`, `FAMILY_PASSWORD`, and
   `ADMIN_PASSWORD` (see [`.env.example`](.env.example)).
3. Deploy. Sign in with the admin password and upload the first album at `/upload`.

### Local development

Requires Node 20.9+.

```bash
npm install
cp .env.example .env.local   # fill it in; use a separate dev Blob store
npm run dev                  # http://localhost:3000
```

There is no local Blob emulator, so development needs a real store. Create a second private store
(e.g. `charliegram-dev`) and use its token, so experiments never touch the family's photos.

### Scripts

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Dev server                      |
| `npm run build`     | Production build                |
| `npm run lint`      | ESLint (Next.js config)         |
| `npm run typecheck` | TypeScript, no emit             |
| `npm test`          | Unit tests (Vitest)             |

## Maintenance

- **Someone shared the family password:** change `FAMILY_PASSWORD` in Vercel and redeploy. Every
  family session ends; your admin session doesn't.
- **Sign everyone out:** rotate `SESSION_SECRET`.
- **Rename or merge albums:** albums are just folders in the Blob store. Move the blobs under
  `photos/<album>/` and `thumbs/<album>/` together (same file names). The site notices within an hour,
  or right away after the next upload or delete. (The photo list cache survives redeploys on purpose.)
- **Back up:** the Blob store is the only copy of uploaded files. Download the `photos/` folder from
  the Vercel dashboard's Blob browser now and then.
