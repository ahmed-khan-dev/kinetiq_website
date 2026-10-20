(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cfg = window.KINETIQ_CONFIG || {};
  document.documentElement.classList.add("js");

  /* ------------------------------------------------------------------
     Screens (real screenshots from the app documentation)
  ------------------------------------------------------------------- */
  const SHOTS = {
    "home":           ["Home dashboard", "Home dashboard with calorie ring, macro bars and today’s scheduled workout"],
    "home-log":       ["Streak and meal breakdown", "Lower home dashboard with logging streak, meals logged and meal breakdown"],
    "targets":        ["Calculated targets", "Calculated targets preview with BMR, TDEE, daily calorie goal and macro split"],
    "profile-body":   ["Setup: physical metrics", "Profile setup step 1: age, gender, height and weight"],
    "profile-goals":  ["Setup: goals", "Profile setup step 2: goal, fitness level, activity level, equipment and session length"],
    "profile-health":  ["Setup: nutrition and health", "Profile setup step 3: dietary preference, allergies, injuries and the fitness disclaimer"],
    "plan":           ["Weekly plan", "Five-day push, pull and legs weekly plan with today’s session"],
    "session-plan":   ["Scheduled session", "Scheduled session with exercise list, Start Workout and Export Weekly PDF Report buttons"],
    "session":        ["Active workout", "Active workout with coach form cue, rest time, reps, load and effort level"],
    "meal-scan":      ["Meal log", "Manual meal logging screen"],
    "meal-log":       ["Meal log", "Meal log form with dish title, meal timing, macronutrients and recent logged meals"],
    "progress":       ["Body progress", "Body progress and analytics with waist, chest, body fat and a four-week trajectory"],
    "progress-photo": ["Progress photos", "Weight trend chart and progress photo capture with angle selection"],
    "lock":           ["App lock", "Kinetiq App Lock with biometric unlock and a four-digit PIN keypad"]
  };
  const src = (k) => `assets/screens/${k}.webp`;

  /* ------------------------------------------------------------------
     Navigation, scroll progress
  ------------------------------------------------------------------- */
  const nav = $("#nav"), navToggle = $("#navToggle"), navLinks = $("#navLinks"), bar = $("#progressBar");
  const closeNav = () => { navLinks.classList.remove("open"); navToggle.setAttribute("aria-expanded", "false"); navToggle.setAttribute("aria-label", "Open menu"); };
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) closeNav(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });

  const stepsEl = $("#steps");
  const stepItems = $$(".step", stepsEl);
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const h = document.documentElement;
      const max = h.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1) : 0})`;
      nav.classList.toggle("scrolled", scrollY > 24);
      // timeline fill
      const r = stepsEl.getBoundingClientRect();
      const p = clamp((innerHeight * 0.72 - r.top) / r.height, 0, 1);
      stepsEl.style.setProperty("--p", p.toFixed(3));
      stepItems.forEach((s, i) => s.classList.toggle("is-on", p >= i / stepItems.length + 0.02));
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ------------------------------------------------------------------
     Reveal on scroll (kept to a few elements)
  ------------------------------------------------------------------- */
  const revealEls = [...$$(".about-facts > div"), ...$$(".step"), $(".dl-card"), $(".install"), ...$$(".faq-list details")];
  revealEls.forEach((el, i) => { el.classList.add("reveal"); el.style.setProperty("--i", String(i % 4)); });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  revealEls.forEach((el) => io.observe(el));

  /* ------------------------------------------------------------------
     Hero: pointer-reactive 3D rig + screen cycling (paused when off-screen)
  ------------------------------------------------------------------- */
  const heroStage = $("#heroStage"), heroRig = $("#heroRig"), heroGlare = $("#heroGlare");
  const heroImgs = $$("#heroScreens img");
  let heroVisible = true, tgt = { x: 0, y: -14 }, cur = { x: 0, y: -14 }, raf = 0;

  const loop = () => {
    cur.x += (tgt.x - cur.x) * 0.09;
    cur.y += (tgt.y - cur.y) * 0.09;
    heroRig.style.setProperty("--rx", cur.x.toFixed(2) + "deg");
    heroRig.style.setProperty("--ry", cur.y.toFixed(2) + "deg");
    heroGlare.style.setProperty("--gx", (50 + (cur.y + 14) * 2.2).toFixed(1) + "%");
    if (heroVisible && (Math.abs(tgt.x - cur.x) > 0.02 || Math.abs(tgt.y - cur.y) > 0.02)) raf = requestAnimationFrame(loop);
    else raf = 0;
  };
  const kick = () => { if (!raf && heroVisible) raf = requestAnimationFrame(loop); };

  if (!reduce) {
    addEventListener("pointermove", (e) => {
      if (!heroVisible) return;
      const r = heroStage.getBoundingClientRect();
      const nx = clamp((e.clientX - (r.left + r.width / 2)) / (innerWidth / 2), -1, 1);
      const ny = clamp((e.clientY - (r.top + r.height / 2)) / (innerHeight / 2), -1, 1);
      tgt.y = -14 + nx * 18;
      tgt.x = -ny * 9;
      kick();
    }, { passive: true });
  } else {
    heroRig.style.setProperty("--ry", "-12deg");
  }

  let cycle = 0, cycleTimer = 0;
  const startCycle = () => {
    if (reduce || cycleTimer) return;
    cycleTimer = setInterval(() => {
      heroImgs[cycle].classList.remove("is-active");
      cycle = (cycle + 1) % heroImgs.length;
      heroImgs[cycle].classList.add("is-active");
    }, 4200);
  };
  const stopCycle = () => { clearInterval(cycleTimer); cycleTimer = 0; };

  new IntersectionObserver(([en]) => {
    heroVisible = en.isIntersecting;
    heroStage.classList.toggle("is-paused", !heroVisible);
    if (heroVisible) { startCycle(); kick(); } else stopCycle();
  }, { threshold: 0.05 }).observe(heroStage);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopCycle(); else if (heroVisible) startCycle(); });

  /* ------------------------------------------------------------------
     Features: scroll-linked screen on the sticky phone
  ------------------------------------------------------------------- */
  const featureImgs = $$("#featureScreens img");
  const features = $$(".feature");
  const setFeature = (key) => {
    features.forEach((f) => f.classList.toggle("is-active", f.dataset.key === key));
    featureImgs.forEach((i) => i.classList.toggle("is-active", i.dataset.key === key));
  };
  features[0].classList.add("is-active");
  const fio = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setFeature(e.target.dataset.key); });
  }, { rootMargin: "-45% 0px -45% 0px" });
  features.forEach((f) => fio.observe(f));

  /* ------------------------------------------------------------------
     Interactive preview: drag-to-rotate phone, tabs, hotspots
  ------------------------------------------------------------------- */
  const PREVIEW = [
    { key: "home", label: "Dashboard", title: "Your day at a glance",
      body: "Tap a dot to see what each part of the dashboard does.",
      spots: [
        { x: 33, y: 27, t: "Calorie ring", b: "Calories eaten against your daily target, with the number left shown underneath." },
        { x: 91, y: 28, t: "Macro bars", b: "Protein, carbs and fats each track against their own daily target." },
        { x: 90, y: 44.5, t: "Daily guidance", b: "A short coaching note to help guide today's training." },
        { x: 88, y: 82, t: "Open Workout", b: "Starts today’s scheduled session, with its sets and reps listed above." }
      ] },
    { key: "session", label: "Workout", title: "Log a set in seconds",
      body: "Tap a dot to see how a set is tracked.",
      spots: [
        { x: 66, y: 9.7, t: "Session timer", b: "Keeps time for the session, with an End button when you’re done." },
        { x: 89, y: 33.5, t: "Coach form cue", b: "A short tip on technique for the exercise you’re on." },
        { x: 50, y: 57.5, t: "Reps and load", b: "Set the reps you finished and the load in kilograms with plus and minus buttons." },
        { x: 94, y: 66.5, t: "Effort level", b: "Rate how hard the set felt from 7 to 10 (RPE)." }
      ] },
    { key: "meal-scan", label: "Meal log", title: "Log a meal manually",
      body: "Enter the meal details, timing and macros, then save it to your daily record.", spots: [] },
    { key: "progress", label: "Progress", title: "See the trend",
      body: "Waist, chest and body fat with trend arrows, a four-week trajectory, weight logging and estimated 1RM strength.", spots: [] },
    { key: "session-plan", label: "Weekly plan", title: "Plan the week",
      body: "A five-day push, pull and legs plan. Start a new week, repeat the plan, add a custom exercise or export a weekly PDF.", spots: [] },
    { key: "lock", label: "App lock", title: "Keep it private",
      body: "Unlock with biometrics, or enter a four-digit PIN on the on-screen keypad.", spots: [] }
  ];
  const pScreens = $("#previewScreens"), pTabs = $("#previewTabs"), pSpots = $("#hotspots");
  const noteTitle = $("#noteTitle"), noteBody = $("#noteBody"), noteCard = $("#previewNote");
  let pIndex = 0;

  PREVIEW.forEach((p, i) => {
    const img = document.createElement("img");
    img.src = src(p.key); img.alt = SHOTS[p.key][1]; img.width = 540; img.height = 1200;
    img.decoding = "async"; if (i > 0) img.loading = "lazy";
    if (i === 0) img.className = "is-active";
    pScreens.appendChild(img);
    const t = document.createElement("button");
    t.type = "button"; t.className = "tab"; t.role = "tab"; t.textContent = p.label;
    t.setAttribute("aria-selected", i === 0 ? "true" : "false");
    t.addEventListener("click", () => showPreview(i));
    pTabs.appendChild(t);
  });
  const flash = () => { noteCard.classList.remove("flash"); void noteCard.offsetWidth; if (!reduce) noteCard.classList.add("flash"); };
  function showPreview(i) {
    pIndex = i;
    const p = PREVIEW[i];
    $$("img", pScreens).forEach((im, k) => im.classList.toggle("is-active", k === i));
    $$(".tab", pTabs).forEach((t, k) => t.setAttribute("aria-selected", String(k === i)));
    pSpots.innerHTML = "";
    p.spots.forEach((s, k) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "hotspot"; b.setAttribute("aria-label", s.t); b.setAttribute("aria-pressed", "false");
      b.style.left = s.x + "%"; b.style.top = s.y + "%";
      b.addEventListener("pointerdown", (e) => e.stopPropagation());
      b.addEventListener("click", () => {
        $$(".hotspot", pSpots).forEach((h) => h.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        noteTitle.textContent = s.t; noteBody.textContent = s.b; flash();
      });
      pSpots.appendChild(b);
    });
    noteTitle.textContent = p.title; noteBody.textContent = p.body; flash();
  }
  showPreview(0);

  const pRig = $("#previewRig"), pStage = $("#previewStage"), pGlare = $("#previewGlare");
  const REST = { x: 0, y: -12 };
  let pc = { ...REST }, pt = { ...REST }, praf = 0, dragging = false, last = null, pVisible = false;
  const pApply = () => {
    pRig.style.setProperty("--rx", pc.x.toFixed(2) + "deg");
    pRig.style.setProperty("--ry", pc.y.toFixed(2) + "deg");
    pGlare.style.setProperty("--gx", (50 + (pc.y + 12) * 1.6).toFixed(1) + "%");
  };
  const pLoop = () => {
    pc.x += (pt.x - pc.x) * 0.14; pc.y += (pt.y - pc.y) * 0.14; pApply();
    if (pVisible && (dragging || Math.abs(pt.x - pc.x) > 0.02 || Math.abs(pt.y - pc.y) > 0.02)) praf = requestAnimationFrame(pLoop); else praf = 0;
  };
  const pKick = () => { if (!praf) praf = requestAnimationFrame(pLoop); };
  pApply();
  new IntersectionObserver(([en]) => { pVisible = en.isIntersecting; pStage.classList.toggle("is-paused", !pVisible); if (pVisible) pKick(); }, { threshold: 0.05 }).observe(pStage);

  pRig.addEventListener("pointerdown", (e) => { dragging = true; last = { x: e.clientX, y: e.clientY }; pRig.setPointerCapture(e.pointerId); pKick(); });
  pRig.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    pt.y = clamp(pt.y + (e.clientX - last.x) * 0.45, -55, 55);
    pt.x = clamp(pt.x - (e.clientY - last.y) * 0.25, -18, 18);
    last = { x: e.clientX, y: e.clientY };
  });
  const endDrag = () => { if (!dragging) return; dragging = false; if (!reduce) { pt = { ...REST }; } pKick(); };
  pRig.addEventListener("dragstart", (e) => e.preventDefault());
  pRig.addEventListener("pointerup", endDrag);
  pRig.addEventListener("pointercancel", endDrag);
  pRig.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") pt.y = clamp(pt.y - 10, -55, 55);
    else if (e.key === "ArrowRight") pt.y = clamp(pt.y + 10, -55, 55);
    else if (e.key === "ArrowUp") pt.x = clamp(pt.x + 6, -18, 18);
    else if (e.key === "ArrowDown") pt.x = clamp(pt.x - 6, -18, 18);
    else return;
    e.preventDefault(); pKick();
  });

  /* ------------------------------------------------------------------
     Gallery + lightbox
  ------------------------------------------------------------------- */
  const GALLERY = Object.keys(SHOTS);
  const track = $("#galleryTrack");
  GALLERY.forEach((k, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "shot"; b.setAttribute("aria-label", "Enlarge: " + SHOTS[k][0]);
    b.innerHTML = `<img src="${src(k)}" alt="${SHOTS[k][1]}" width="540" height="1200" loading="lazy" decoding="async"><span>${SHOTS[k][0]}</span>`;
    b.addEventListener("click", () => openLb(i));
    track.appendChild(b);
  });
  $("#galleryCount").textContent = `${GALLERY.length} screens from the app. Tap one to enlarge it.`;
  const step = () => Math.max(240, track.clientWidth * 0.8);
  $("#galPrev").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }));
  $("#galNext").addEventListener("click", () => track.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }));
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { track.scrollBy({ left: 200 }); e.preventDefault(); }
    if (e.key === "ArrowLeft") { track.scrollBy({ left: -200 }); e.preventDefault(); }
  });

  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  let lbIndex = 0;
  const paintLb = () => { const k = GALLERY[lbIndex]; lbImg.src = src(k); lbImg.alt = SHOTS[k][1]; lbCap.textContent = SHOTS[k][1]; };
  function openLb(i) { lbIndex = i; paintLb(); if (lb.showModal) lb.showModal(); else lb.setAttribute("open", ""); }
  const lbStep = (d) => { lbIndex = (lbIndex + d + GALLERY.length) % GALLERY.length; paintLb(); };
  $("#lbClose").addEventListener("click", () => lb.close());
  $("#lbPrev").addEventListener("click", () => lbStep(-1));
  $("#lbNext").addEventListener("click", () => lbStep(1));
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") lbStep(-1); if (e.key === "ArrowRight") lbStep(1); });

  /* ------------------------------------------------------------------
     APK download — only enabled for a real, reachable file
  ------------------------------------------------------------------- */
  const apk = cfg.apk || {};
  const dlBtn = $("#dlButton"), dlStatus = $("#dlStatus"), dlMeta = $("#dlMeta"), dlFile = $("#dlFile");
  const fmtSize = (b) => b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB";
  const row = (k, v) => { const d = document.createElement("div"); d.innerHTML = "<dt></dt><dd></dd>"; d.firstChild.textContent = k; d.lastChild.textContent = v; dlMeta.appendChild(d); };
  $("#dlName").textContent = cfg.appName || "Kinetiq";

  const disable = (msg, cls) => {
    dlBtn.setAttribute("aria-disabled", "true"); dlBtn.removeAttribute("download"); dlBtn.setAttribute("href", "#download");
    dlBtn.addEventListener("click", (e) => e.preventDefault());
    dlStatus.textContent = msg; dlStatus.className = "dl-status " + (cls || "");
  };
  const enable = (size) => {
    const name = apk.fileName || apk.url.split("/").pop().split("?")[0];
    dlBtn.setAttribute("href", apk.url);
    dlBtn.setAttribute("download", name);
    dlBtn.setAttribute("type", "application/vnd.android.package-archive");
    dlBtn.removeAttribute("aria-disabled");
    dlFile.textContent = name;
    dlStatus.textContent = "Ready to download."; dlStatus.className = "dl-status ok";
    dlMeta.innerHTML = "";
    row("File", name);
    if (apk.version) row("Version", apk.version);
    if (size) row("File size", fmtSize(size));
    if (apk.minAndroid) row("Minimum Android", "Android " + apk.minAndroid + " or newer");
    if (apk.sha256) row("SHA-256", apk.sha256);
  };

  if (!apk.url) {
    disable("The APK isn’t available yet. Check back soon.");
    console.info("[Kinetiq] No APK configured. Put the file in /downloads and set apk.url in config.js.");
  } else {
    dlStatus.textContent = "Checking the file…";
    fetch(apk.url, { method: "HEAD", cache: "no-store" })
      .then((r) => {
        if (!r.ok) { disable("The download file couldn’t be found. Please try again later.", "warn"); return; }
        const len = parseInt(r.headers.get("content-length") || "0", 10);
        enable(apk.sizeBytes || (len > 0 ? len : null));
      })
      .catch(() => enable(apk.sizeBytes || null)); // can't verify (e.g. opened from disk or cross-origin): enable without a size
  }

  /* ------------------------------------------------------------------
     FAQ, footer details from config (nothing invented)
  ------------------------------------------------------------------- */
  if (apk.minAndroid) $("#faqMin").textContent = `It needs Android ${apk.minAndroid} or newer.`;
  const links = cfg.links || {}, contact = cfg.contact || {};
  if (links.privacy) $("#faqPrivacy").innerHTML = ` (<a href="${encodeURI(links.privacy)}">read the privacy policy</a>)`;
  else $("#faqPrivacy").textContent = " (a link will appear here once one is published)";
  const meta = $("#footerMeta");
  const addLink = (label, href) => { const a = document.createElement("a"); a.href = href; a.textContent = label; meta.appendChild(a); };
  if (contact.email) addLink(contact.email, "mailto:" + contact.email);
  if (contact.website) addLink("Website", contact.website);
  if (links.privacy) addLink("Privacy policy", links.privacy);
  if (links.terms) addLink("Terms", links.terms);
  $("#copy").textContent = `© ${new Date().getFullYear()} ${cfg.appName || "Kinetiq"}.`;
})();
