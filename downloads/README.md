# Put your APK here

1. Copy your real, signed release APK into this folder (for example `kinetiq-1.0.0.apk`).
2. Open `../config.js` and set `apk.url` to `downloads/kinetiq-1.0.0.apk`
   (plus `fileName`, `version`, `minAndroid` and, optionally, `sha256`).
3. Reload the site. The Download button only turns on if the file can be reached.

Never put keystores, `.jks` files, passwords or `local.properties` in this folder or anywhere in the site.
APKs larger than your host's file limit (GitHub: 100 MB, Netlify: 100 MB per file on some plans) can be
hosted as a GitHub Release asset instead. Put that https URL in `apk.url`.
