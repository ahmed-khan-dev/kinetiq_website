# Kinetiq – Android app showcase and APK download site

A static, dependency-free website (HTML, CSS, JavaScript) with CSS 3D phone mockups built from the app's real screenshots.
No build step. Works on any static host.

## Preview locally
```bash
cd kinetiq-site
python3 -m http.server 8000      # then open http://localhost:8000
```
Open it through a server (not by double-clicking `index.html`) so the download check works.

## What to edit: `config.js`
| Setting | Purpose |
|---|---|
| `apk.url`, `apk.fileName` | Path or https URL of the APK, and the name it saves as |
| `apk.version`, `apk.minAndroid`, `apk.sizeBytes`, `apk.sha256` | Shown in the download card (hidden when empty) |
| `contact.email`, `contact.website` | Shown in the footer when set |
| `links.privacy`, `links.terms` | Footer and FAQ links, hidden until you add real pages |

Current values were read from the supplied APK: version 1.0, minSdk 24 (Android 7.0), 12,145,377 bytes.
The download button only enables if the file at `apk.url` is reachable. If you replace the APK, update `url`, `fileName`, `version`, `sizeBytes` and `sha256`
(`sha256sum downloads/yourfile.apk`).

## Deploy
Upload the whole folder to Netlify, Cloudflare Pages, Vercel, GitHub Pages or any web host.
`_headers` (Netlify/Cloudflare), `vercel.json` and `.htaccess` (Apache) serve `.apk` files with the type `application/vnd.android.package-archive`.
After deploying, open the live site on an Android phone and download the file once to confirm.
For link previews, change the `og:image` URL in `index.html` to an absolute URL (for example `https://your-site/assets/brand/og-image.png`) and add `og:url`.
Large files: GitHub Pages limits files to 100 MB; you can instead host the APK as a GitHub Release asset and put that https URL in `apk.url`.

## Structure
`index.html` page · `styles.css` design system · `main.js` interactions · `config.js` settings · `assets/screens` screenshots (WebP) · `assets/brand` logo and share image · `downloads/` the APK

## Notes
- Screenshots were redacted: the progress photo and the injury field are hidden. Don't swap in unredacted ones for a public site.
- Fonts load from Google Fonts (Archivo) with system fallbacks. Self-host them if you need to avoid third-party requests.
- Animations respect `prefers-reduced-motion`; the preview is also keyboard-operable (arrow keys rotate the phone).
