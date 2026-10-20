/* ------------------------------------------------------------------
   Kinetiq site configuration — the ONLY file you need to edit
   to publish the APK, contact details and legal links.
   Leave a value as "" (or null) and that part of the page is
   hidden or shown as "not published yet". Nothing is invented.
------------------------------------------------------------------- */
window.KINETIQ_CONFIG = {
  appName: "Kinetiq",

  apk: {
    // 1. Put your real APK in /downloads (e.g. downloads/kinetiq.apk)
    // 2. Set the path (or a full https URL, e.g. a GitHub Release asset) here.
    url: "downloads/kinetiq-1.0.apk",
    fileName: "kinetiq-1.0.apk", // name the browser saves it as, e.g. "kinetiq-1.0.0.apk"
    version: "1.0",     // e.g. "1.0.0"  (only shown when set)
    minAndroid: "7.0",  // e.g. "8.0"    (only shown when set)
    sizeBytes: 2821604, // real file size in bytes
    sha256: "87a789bfb4d83e6300ab19e94b00bf78db4a93ee9b90c22ead1c43349ec36670" // optional checksum so people can verify the file
  },

  contact: {
    email: "",            // e.g. "support@yourdomain.com"
    website: ""           // optional
  },

  links: {
    privacy: "",          // real privacy policy URL/page — link hidden if empty
    terms: ""             // real terms URL/page — link hidden if empty
  }
};
