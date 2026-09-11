/**
 * cloudStr — App Shell
 * ----------------------
 * Shared behavior for every page: age gate, category drawer,
 * search overlay, toasts, reveal-on-scroll, page loader.
 */

const AGE_KEY = "cs_age_verified";

/* ---------------------------------------------------------------
   Age gate
--------------------------------------------------------------- */
function initAgeGate() {
  const gate = document.getElementById("age-gate");
  if (!gate) return;

  if (localStorage.getItem(AGE_KEY) === "true") {
    gate.hidden = true;
    return;
  }
  document.body.style.overflow = "hidden";

  document.getElementById("age-enter")?.addEventListener("click", () => {
    localStorage.setItem(AGE_KEY, "true");
    gate.hidden = true;
    document.body.style.overflow = "";
  });
  document.getElementById("age-exit")?.addEventListener("click", () => {
    window.location.href = "https://www.google.com";
  });
}

/* ---------------------------------------------------------------
   Category drawer (left slide-in menu)
--------------------------------------------------------------- */
function initDrawer() {
  const drawer = document.getElementById("category-drawer");
  const scrim = document.getElementById("drawer-scrim");
  const openBtn = document.getElementById("menu-btn");
  const closeBtn = document.getElementById("drawer-close");
  if (!drawer || !scrim) return;

  const open = () => { drawer.classList.add("open"); scrim.classList.add("open"); };
  const close = () => { drawer.classList.remove("open"); scrim.classList.remove("open"); };

  openBtn?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  scrim.addEventListener("click", close);

  document.querySelectorAll(".drawer-group-head").forEach((head) => {
    head.addEventListener("click", () => {
      head.closest(".drawer-group").classList.toggle("open");
    });
  });

  // Active link highlighting
  const path = window.location.pathname.split("/").pop() || "index.html";
  drawer.querySelectorAll(".drawer-link").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.split("?")[0] === path) a.classList.add("active");
  });
}

/* ---------------------------------------------------------------
   Search overlay
--------------------------------------------------------------- */
function initSearchOverlay() {
  const overlay = document.getElementById("search-overlay");
  const openBtn = document.getElementById("search-btn");
  if (!overlay || !openBtn) return;

  const open = () => {
    overlay.classList.add("open");
    setTimeout(() => overlay.querySelector("input")?.focus(), 100);
  };
  const close = () => overlay.classList.remove("open");

  openBtn.addEventListener("click", open);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  const form = overlay.querySelector("form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = form.querySelector("input").value.trim();
    window.location.href = q ? `shop.html?q=${encodeURIComponent(q)}` : "shop.html";
  });
}

/* ---------------------------------------------------------------
   Toasts
--------------------------------------------------------------- */
function showToast(message, type = "default") {
  let region = document.getElementById("toast-region");
  if (!region) {
    region = document.createElement("div");
    region.id = "toast-region";
    region.setAttribute("aria-live", "polite");
    document.body.appendChild(region);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "error" : ""}`.trim();
  toast.textContent = message;
  region.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

/* ---------------------------------------------------------------
   Reveal-on-scroll
--------------------------------------------------------------- */
function initRevealObserver() {
  const targets = document.querySelectorAll(".reveal:not(.in-view)");
  if (!targets.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    targets.forEach((t) => t.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  targets.forEach((t) => observer.observe(t));
}
function refreshReveal() { initRevealObserver(); }

/* ---------------------------------------------------------------
   Page loader
--------------------------------------------------------------- */
function initPageLoader() {
  const loader = document.getElementById("page-loader");
  if (!loader) return;
  window.addEventListener("load", () => setTimeout(() => loader.classList.add("hidden"), 150));
  if (document.readyState === "complete") setTimeout(() => loader.classList.add("hidden"), 150);
}

/* ---------------------------------------------------------------
   Boot
--------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initAgeGate();
  initDrawer();
  initSearchOverlay();
  initRevealObserver();
  initPageLoader();
});
