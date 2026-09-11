/**
 * VOLT//VOID — App Shell
 * -----------------------
 * Shared behavior used on every page: age verification gate,
 * mobile navigation, wishlist state, toasts, scroll progress,
 * reveal-on-scroll, custom cursor, and the page loader.
 *
 * This file assumes products.js has already loaded when wishlist
 * helpers are needed.
 */

const STORAGE_KEYS = {
  ageVerified: "vv_age_verified",
  wishlist: "vv_wishlist",
};

/* ---------------------------------------------------------------
   Age gate
--------------------------------------------------------------- */
function initAgeGate() {
  const gate = document.getElementById("age-gate");
  if (!gate) return;

  const verified = localStorage.getItem(STORAGE_KEYS.ageVerified) === "true";
  if (verified) {
    gate.hidden = true;
    document.body.style.overflow = "";
    return;
  }

  document.body.style.overflow = "hidden";

  const enterBtn = document.getElementById("age-enter");
  const exitBtn = document.getElementById("age-exit");

  enterBtn?.addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEYS.ageVerified, "true");
    gate.hidden = true;
    document.body.style.overflow = "";
  });

  exitBtn?.addEventListener("click", () => {
    // Prototype-safe "exit": send the visitor away from adult content
    // rather than trapping them on the page.
    window.location.href = "https://www.google.com";
  });
}

/* ---------------------------------------------------------------
   Mobile navigation
--------------------------------------------------------------- */
function initMobileNav() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("mobile-nav");
  const scrim = document.getElementById("nav-scrim");
  if (!toggle || !nav || !scrim) return;

  const close = () => {
    toggle.classList.remove("open");
    nav.classList.remove("open");
    scrim.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };
  const open = () => {
    toggle.classList.add("open");
    nav.classList.add("open");
    scrim.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", () => {
    toggle.classList.contains("open") ? close() : open();
  });
  scrim.addEventListener("click", close);
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

/* ---------------------------------------------------------------
   Wishlist (persisted locally — prototype only, no backend order)
--------------------------------------------------------------- */
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.wishlist)) || [];
  } catch {
    return [];
  }
}

function isWishlisted(id) {
  return getWishlist().includes(id);
}

function toggleWishlistItem(id) {
  let list = getWishlist();
  let added;
  if (list.includes(id)) {
    list = list.filter((x) => x !== id);
    added = false;
  } else {
    list.push(id);
    added = true;
  }
  localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(list));
  updateWishlistBadge();
  return added;
}

function updateWishlistBadge() {
  const badge = document.getElementById("wishlist-count");
  if (!badge) return;
  const count = getWishlist().length;
  badge.textContent = count;
  badge.setAttribute("data-count", String(count));
}

function initWishlistDelegation() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-wishlist-id]");
    if (!btn) return;
    e.preventDefault();
    const id = btn.getAttribute("data-wishlist-id");
    const added = toggleWishlistItem(id);
    btn.classList.toggle("active", added);
    btn.setAttribute("aria-pressed", String(added));
    showToast(added ? "Added to wishlist" : "Removed from wishlist");
  });
}

/* ---------------------------------------------------------------
   Cart icon — prototype placeholder (no real checkout)
--------------------------------------------------------------- */
function initCartPlaceholder() {
  const cartBtn = document.getElementById("cart-btn");
  cartBtn?.addEventListener("click", () => {
    showToast("Prototype UI — checkout isn't implemented in this concept.");
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
  }, 2800);
}

/* ---------------------------------------------------------------
   Scroll progress bar
--------------------------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  const update = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    bar.style.width = height > 0 ? `${(scrolled / height) * 100}%` : "0%";
  };
  document.addEventListener("scroll", update, { passive: true });
  update();
}

/* ---------------------------------------------------------------
   Reveal-on-scroll (single intersection observer, reused everywhere)
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
    { threshold: 0.15 }
  );
  targets.forEach((t) => observer.observe(t));
}

// Re-run the observer after dynamic content (product grids) is injected.
function refreshReveal() {
  initRevealObserver();
}

/* ---------------------------------------------------------------
   Custom cursor (desktop pointer devices only)
--------------------------------------------------------------- */
function initCustomCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  const dot = document.getElementById("cursor-dot");
  const ring = document.getElementById("cursor-ring");
  if (!dot || !ring) return;

  let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  const animate = () => {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animate);
  };
  animate();

  document.querySelectorAll("a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      ring.style.width = "44px";
      ring.style.height = "44px";
      ring.style.opacity = "0.85";
    });
    el.addEventListener("mouseleave", () => {
      ring.style.width = "30px";
      ring.style.height = "30px";
      ring.style.opacity = "0.5";
    });
  });
}

/* ---------------------------------------------------------------
   Page loader
--------------------------------------------------------------- */
function initPageLoader() {
  const loader = document.getElementById("page-loader");
  if (!loader) return;
  window.addEventListener("load", () => {
    setTimeout(() => loader.classList.add("hidden"), 200);
  });
  // Safety net in case 'load' already fired
  if (document.readyState === "complete") {
    setTimeout(() => loader.classList.add("hidden"), 200);
  }
}

/* ---------------------------------------------------------------
   Nav search — redirects to shop.html with a query param
--------------------------------------------------------------- */
function initNavSearch() {
  const forms = document.querySelectorAll("[data-nav-search]");
  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const q = input.value.trim();
      window.location.href = q ? `shop.html?q=${encodeURIComponent(q)}` : "shop.html";
    });
  });
}

/* ---------------------------------------------------------------
   Boot
--------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  initAgeGate();
  initMobileNav();
  initWishlistDelegation();
  initCartPlaceholder();
  updateWishlistBadge();
  initScrollProgress();
  initRevealObserver();
  initCustomCursor();
  initPageLoader();
  initNavSearch();

  // Active nav link highlighting
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-nav a").forEach((a) => {
    if (a.getAttribute("href") === path) a.classList.add("active");
  });
});
