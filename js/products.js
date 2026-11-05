/**
 * cloudStr — Product Data Layer
 * --------------------------------
 * Fictional catalog data + query helpers, modeled on a real
 * multi-category vape retailer's structure (disposables, nic salts,
 * pod devices, podmod devices, coils/cartridges, freebase e-liquid).
 *
 * SEED_PRODUCTS is the built-in catalog. Admin edits are saved to
 * localStorage (see saveProducts) and take priority over the seed on
 * every page load, so the storefront and admin share one catalog.
 * Swap the implementation for Firestore later without touching callers.
 */

const CURRENCY = "৳";

const CATEGORY_LABELS = {
  disposables: "Disposables",
  "nic-salts": "Nic Salts",
  "pod-devices": "Pod Devices",
  "podmod-devices": "Podmod Devices",
  "coils-cartridges": "Coils & Cartridges",
  "freebase-eliquid": "Freebase E-liquid",
};

const SEED_PRODUCTS = []; // No demo products are shipped with the storefront.

/* ---------------------------------------------------------------
   Persistence (localStorage)
   Admin edits are written with saveProducts(); every page loads the
   saved catalog here, falling back to the seed on first run or if
   storage is unavailable/corrupt.
--------------------------------------------------------------- */
const PRODUCTS_STORAGE_KEY = "cloudstr_products";

function loadProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY));
    if (Array.isArray(saved)) {
      // Remove the original p1–p22 demo catalog from browsers that cached it.
      // Preserve products added later through the admin dashboard.
      const clean = saved.filter((product) => !/^p(?:[1-9]|1[0-9]|2[0-2])$/.test(String(product?.id || "")));
      if (clean.length !== saved.length) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(clean));
      }
      return clean;
    }
  } catch (e) {}
  return SEED_PRODUCTS.slice();
}

function saveProducts(list) {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    return false;
  }
}

// The live catalog used by every helper below.
const MOCK_PRODUCTS = loadProducts();

/* ---------------------------------------------------------------
   Query helpers
--------------------------------------------------------------- */
function getAllProducts() {
  return MOCK_PRODUCTS.slice();
}

function getProductBySlug(slug) {
  return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
}

function getProductsByCategory(category, limit = 4) {
  return MOCK_PRODUCTS.filter((p) => p.category === category).slice(0, limit);
}

function getNewArrivals(limit = 8) {
  return MOCK_PRODUCTS.filter((p) => p.isNew).slice(0, limit);
}

function queryProducts({ search = "", category = "all", minPrice = 0, maxPrice = 6000, inStockOnly = false, sort = "relevance" } = {}) {
  let results = MOCK_PRODUCTS.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    const matchesStock = !inStockOnly || p.stock > 0;
    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });

  switch (sort) {
    case "customized": break; // Keep the catalog's curated product order.
    case "price-asc": results.sort((a, b) => a.price - b.price); break;
    case "price-desc": results.sort((a, b) => b.price - a.price); break;
    case "new": results.sort((a, b) => Number(b.isNew) - Number(a.isNew)); break;
    default: break;
  }
  return results;
}

function formatPrice(n) {
  return `${CURRENCY}${n.toLocaleString("en-US")}.00`;
}

/* ---------------------------------------------------------------
   Rendering helpers
--------------------------------------------------------------- */
function cartIconSVG() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>';
}

function renderProductCard(p) {
  const inStock = p.stock > 0;
  const discount = p.compareAt && p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : null;
  return `
    <article class="product-card reveal in-view" data-id="${p.id}">
      <div class="product-media">
        <a class="card-link" href="product.html?slug=${p.slug}" aria-label="View ${p.name}"></a>
        <span class="product-status badge-pill ${inStock ? "badge-instock" : "badge-outstock"}">${inStock ? "In Stock" : "Out of Stock"}</span>
        ${discount ? `<span class="product-discount">-${discount}%</span>` : ""}
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        ${p.specs && Object.keys(p.specs).length ? `<ul class="product-specs">${Object.entries(p.specs).slice(0, 3).map(([key, value]) => `<li><span>${key}</span><strong>${value}</strong></li>`).join("")}</ul>` : ""}
        <div class="product-price-row">
          <span class="product-price">${formatPrice(p.price)}</span>
          ${p.compareAt ? `<span class="product-price-strike">${formatPrice(p.compareAt)}</span>` : ""}
        </div>
        <button class="product-cta ${inStock ? "in-stock" : "out-stock"}" data-add-to-cart="${p.id}" ${inStock ? "" : "disabled"}>
          ${inStock ? cartIconSVG() + " Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </article>
  `;
}

function renderSkeletonCards(count = 8) {
  return Array.from({ length: count }, () => '<div class="skeleton skeleton-card"></div>').join("");
}

function renderCategoryRow(categoryKey) {
  const products = getProductsByCategory(categoryKey, 4);
  if (!products.length) return "";
  return `
    <div class="section-strip reveal in-view">
      <h2>${CATEGORY_LABELS[categoryKey]}</h2>
      <a class="see-all" href="shop.html?category=${categoryKey}">See All</a>
    </div>
    <div class="product-grid">${products.map(renderProductCard).join("")}</div>
  `;
}
