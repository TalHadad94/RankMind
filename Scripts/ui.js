/* =========================================================
   RankMind - Shared UI Script (ui.js)
   - Mobile menu toggle
   - Scroll fade-in animations
   - Floating Action Button (FAB)
   - Language handling (EN/HE):
     * Auto-redirect only on root "/" (first visit, no stored preference)
     * Manual toggle anywhere (globe + EN/HE label)
   ========================================================= */

/* ---------------------------
   Mobile menu toggle
---------------------------- */
function toggleMenu() {
  const menu = document.getElementById("main-nav");
  const burger = document.querySelector(".burger-icon");
  if (!menu || !burger) return;

  menu.classList.toggle("open");
  document.body.classList.toggle("menu-open");
  burger.classList.toggle("open");
}

/* ---------------------------
   Scroll fade-in effect
---------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const fadeEls = document.querySelectorAll(".scroll-fade");
  if (!fadeEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.1 }
  );

  fadeEls.forEach((el) => observer.observe(el));
});

/* ---------------------------
   Floating action button
---------------------------- */
(function initFab() {
  const fabToggle = document.getElementById("fabToggle");
  const fabOptions = document.getElementById("fabOptions");
  if (!fabToggle || !fabOptions) return;

  fabToggle.addEventListener("click", () => {
    fabOptions.classList.toggle("show");
  });
})();

/* =========================================================
   Language handling (EN / HE)
   Spec (final):
   1) English is default root "/"
   2) Hebrew is under "/he/..."
   3) Auto redirect ONLY on homepage "/" (or "/index.html"):
      - If localStorage has preference => respect it
      - Else if browser is Hebrew => redirect to "/he/"
   4) Language toggle:
      - Click switches EN <-> HE
      - Saves preference in localStorage
      - Navigates to parallel path (fallback to target homepage)
   ========================================================= */

const RM_LANG_KEY = "rm_lang"; // values: "en" | "he"

/** Returns "en" | "he" | null */
function getStoredLang() {
  try {
    const v = localStorage.getItem(RM_LANG_KEY);
    return v === "he" || v === "en" ? v : null;
  } catch {
    return null;
  }
}

function setStoredLang(lang) {
  try {
    localStorage.setItem(RM_LANG_KEY, lang);
  } catch {
    // ignore storage failures (private mode, blocked, etc.)
  }
}

/** Detect if browser prefers Hebrew */
function browserPrefersHebrew() {
  const langs = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language || ""];

  return langs.some((l) => String(l).toLowerCase().startsWith("he"));
}

/** True when user is on Hebrew section by URL */
function isHebrewPath(pathname) {
  return pathname === "/he" || pathname.startsWith("/he/");
}

/**
 * Build the parallel URL in the target language.
 * Returns a string path (e.g. "/he/Pricing/" or "/Pricing/").
 * If we can't safely map, returns target homepage ("/" or "/he/").
 */
function buildParallelPath(targetLang) {
  const path = window.location.pathname || "/";
  const targetIsHebrew = targetLang === "he";

  // Normalize common homepage variants
  const isRoot =
    path === "/" ||
    path === "/index.html" ||
    path === "" ||
    path === "/he" ||
    path === "/he/" ||
    path === "/he/index.html";

  if (isRoot) {
    return targetIsHebrew ? "/he/" : "/";
  }

  const currentlyHebrew = isHebrewPath(path);

  // If already in target language, keep as-is.
  if ((targetIsHebrew && currentlyHebrew) || (!targetIsHebrew && !currentlyHebrew)) {
    return path;
  }

  // EN -> HE: prefix with "/he"
  if (targetIsHebrew && !currentlyHebrew) {
    // Ensure single slash join: "/he" + "/Pricing/" => "/he/Pricing/"
    return "/he" + (path.startsWith("/") ? path : "/" + path);
  }

  // HE -> EN: remove leading "/he"
  if (!targetIsHebrew && currentlyHebrew) {
    // "/he/Pricing/" => "/Pricing/"
    const stripped = path.replace(/^\/he(\/|$)/, "/");
    return stripped || "/";
  }

  // Fallback
  return targetIsHebrew ? "/he/" : "/";
}

/**
 * Homepage-only auto redirect.
 * Runs on DOMContentLoaded.
 */
function maybeRedirectHomeByPreference() {
  const path = window.location.pathname || "/";
  const isEnglishHome = path === "/" || path === "/index.html" || path === "";

  // Only redirect when the user explicitly lands on the English root.
  if (!isEnglishHome) return;

  const stored = getStoredLang();
  if (stored === "he") {
    // User previously chose Hebrew
    window.location.replace("/he/");
    return;
  }
  if (stored === "en") {
    // User previously chose English: do nothing
    return;
  }

  // First visit (no stored preference): use browser language
  if (browserPrefersHebrew()) {
    window.location.replace("/he/");
  }
}

/**
 * Initialize language toggle buttons.
 * Any element with class "lang-toggle" will work.
 */
function initLanguageToggles() {
  const toggles = document.querySelectorAll(".lang-toggle");
  if (!toggles.length) return;

  toggles.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const currentPath = window.location.pathname || "/";
      const currentlyHebrew = isHebrewPath(currentPath);
      const nextLang = currentlyHebrew ? "en" : "he";

      setStoredLang(nextLang);

      const nextPath = buildParallelPath(nextLang);
      window.location.href = nextPath;
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // 1) Auto redirect only on root "/"
  maybeRedirectHomeByPreference();

  // 2) Enable manual toggles everywhere
  initLanguageToggles();
});
