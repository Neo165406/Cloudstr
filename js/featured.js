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
function renderHeroBanners(trackId) {
  const el = document.getElementById(trackId);
  if (!el) return;
  const banners = getHeroBanners();
  const carousel = el.closest(".hero-carousel");
  if (!banners.length) { if (carousel) carousel.style.display = "none"; return; }
  if (carousel) carousel.style.display = "";
  el.innerHTML = banners
    .map((b) => `<div class="hero-slide"><img src="${b.image}" alt="${b.alt || ""}"></div>`)
    .join("");
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
