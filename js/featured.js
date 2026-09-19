/**
 * cloudStr — Featured Content (admin-managed)
 * ----------------------------------------------
 * Best/New Products animated slider + Models collage. Both are
 * edited from admin.html and persisted in localStorage, same
 * per-browser pattern already used for the age gate and cart.
 */

const BEST_KEY = "cs_best_products";
const MODELS_KEY = "cs_models";
const HERO_KEY = "cs_hero_banners";

const DEFAULT_MODELS = [
  { id: "m1", name: "Studio Look 1", image: "https://images.unsplash.com/photo-1622037022824-0c71d511ef3c?q=80&w=800&auto=format&fit=crop", caption: "Aero LUXE series" },
  { id: "m2", name: "Studio Look 2", image: "https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?q=80&w=800&auto=format&fit=crop", caption: "Pod Devices lineup" },
  { id: "m3", name: "Studio Look 3", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop", caption: "Disposables in hand" },
  { id: "m4", name: "Studio Look 4", image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop", caption: "New drop preview" },
];

const DEFAULT_HERO_BANNERS = [
  { id: "h1", image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=900&auto=format&fit=crop", alt: "Nic salt bottles with tobacco leaf styling" },
  { id: "h2", image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=900&auto=format&fit=crop", alt: "Disposable device with cyan lighting" },
  { id: "h3", image: "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?q=80&w=900&auto=format&fit=crop", alt: "Pod device kit on a display stand" },
];

/* ---- Hero banners (admin-managed) ---- */
function getHeroBanners() {
  const raw = localStorage.getItem(HERO_KEY);
  if (raw === null) return DEFAULT_HERO_BANNERS.slice();
  try { return JSON.parse(raw) || []; } catch { return []; }
}
function saveHeroBanners(banners) {
  localStorage.setItem(HERO_KEY, JSON.stringify(banners));
}
/**
 * Renders hero slides and starts auto-play animation:
 * - smooth scroll-snap advance
 * - active slide scale + Ken Burns zoom on image
 * - progress dots + prev/next controls
 * - pauses on hover / focus / reduced-motion
 */
function renderHeroBanners(trackId) {
  const el = document.getElementById(trackId);
  if (!el) return;
  const carousel = el.closest(".hero-carousel");
  const banners = getHeroBanners();
  if (!banners.length) {
    if (carousel) carousel.style.display = "none";
    return;
  }
  if (carousel) carousel.style.display = "";

  el.innerHTML = banners
    .map((b) => `<div class="hero-slide"><img src="${b.image}" alt="${b.alt || ""}" loading="eager" decoding="async"></div>`)
    .join("");

  let dots = carousel.querySelector(".hero-dots");
  if (!dots) {
    dots = document.createElement("div");
    dots.className = "hero-dots";
    dots.setAttribute("role", "tablist");
    dots.setAttribute("aria-label", "Hero slides");
    carousel.appendChild(dots);
  }
  dots.innerHTML = banners
    .map((_, i) => `<button type="button" class="hero-dot${i === 0 ? " is-active" : ""}" role="tab" aria-label="Go to slide ${i + 1}" data-index="${i}"></button>`)
    .join("");

  let prevBtn = carousel.querySelector(".hero-nav.prev");
  let nextBtn = carousel.querySelector(".hero-nav.next");
  if (!prevBtn) {
    prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "hero-nav prev";
    prevBtn.setAttribute("aria-label", "Previous slide");
    prevBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`;
    carousel.appendChild(prevBtn);
  }
  if (!nextBtn) {
    nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "hero-nav next";
    nextBtn.setAttribute("aria-label", "Next slide");
    nextBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`;
    carousel.appendChild(nextBtn);
  }

  const slides = Array.from(el.querySelectorAll(".hero-slide"));
  const dotBtns = Array.from(dots.querySelectorAll(".hero-dot"));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let timer = null;
  const INTERVAL = 4200;

  function slideOffset(i) {
    const slide = slides[i];
    if (!slide) return 0;
    return slide.offsetLeft;
  }

  function setActive(i, smooth = true) {
    if (!slides.length) return;
    index = ((i % slides.length) + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle("is-active", n === index));
    dotBtns.forEach((d, n) => {
      d.classList.toggle("is-active", n === index);
      d.setAttribute("aria-selected", n === index ? "true" : "false");
    });
    if (smooth) {
      el.scrollTo({ left: slideOffset(index), behavior: reduce ? "auto" : "smooth" });
    } else {
      el.scrollLeft = slideOffset(index);
    }
  }

  function next() { setActive(index + 1); }
  function prev() { setActive(index - 1); }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function start() {
    stop();
    if (reduce || slides.length < 2) return;
    timer = setInterval(next, INTERVAL);
  }

  nextBtn.onclick = () => { next(); start(); };
  prevBtn.onclick = () => { prev(); start(); };
  dotBtns.forEach((btn) => {
    btn.onclick = () => {
      setActive(Number(btn.dataset.index));
      start();
    };
  });

  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", (e) => {
    if (!carousel.contains(e.relatedTarget)) start();
  });
  el.addEventListener("touchstart", stop, { passive: true });
  el.addEventListener("touchend", () => setTimeout(start, 2500), { passive: true });

  let scrollSync = null;
  el.addEventListener("scroll", () => {
    clearTimeout(scrollSync);
    scrollSync = setTimeout(() => {
      const left = el.scrollLeft;
      let best = 0;
      let bestDist = Infinity;
      slides.forEach((s, i) => {
        const d = Math.abs(s.offsetLeft - left);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      if (best !== index) {
        index = best;
        slides.forEach((s, n) => s.classList.toggle("is-active", n === index));
        dotBtns.forEach((d, n) => d.classList.toggle("is-active", n === index));
      }
    }, 80);
  }, { passive: true });

  setActive(0, false);
  start();

  window.addEventListener("resize", () => setActive(index, false));
}

/* ---- Best / New products ---- */
function getBestProductIds() {
  try { return JSON.parse(localStorage.getItem(BEST_KEY)) || []; } catch { return []; }
}
function setBestProductIds(ids) {
  localStorage.setItem(BEST_KEY, JSON.stringify(ids));
}
function getBestProducts(limit = 10) {
  const ids = getBestProductIds();
  const all = getAllProducts();
  const picks = ids.length ? all.filter((p) => ids.includes(p.id)) : all.filter((p) => p.isNew);
  return picks.slice(0, limit);
}

/* ---- Models collage ---- */
function getModels() {
  const raw = localStorage.getItem(MODELS_KEY);
  if (raw === null) return DEFAULT_MODELS.slice();
  try { return JSON.parse(raw) || []; } catch { return []; }
}
function saveModels(models) {
  localStorage.setItem(MODELS_KEY, JSON.stringify(models));
}

/* ---- Storefront rendering ---- */
function renderBestSlider(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const products = getBestProducts(10);
  const wrap = el.closest(".best-slider-wrap");
  if (!products.length) { if (wrap) wrap.style.display = "none"; return; }
  if (wrap) wrap.style.display = "";
  el.innerHTML = products.map(renderProductCard).join("") + products.map(renderProductCard).join("");
}

function renderModelsCollage(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const models = getModels();
  const wrap = el.closest(".models-wrap");
  if (!models.length) { if (wrap) wrap.style.display = "none"; return; }
  if (wrap) wrap.style.display = "";
  el.innerHTML = models
    .map((m, i) => `
      <figure class="collage-item ${i % 5 === 0 ? "span-2" : ""}">
        <img src="${m.image}" alt="${m.name}" loading="lazy">
        <figcaption>${m.caption || m.name}</figcaption>
      </figure>
    `)
    .join("");
}
