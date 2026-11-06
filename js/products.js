/**
 * cloudStr — Product Data Layer
 * Catalog source of truth: Firestore `products`.
 * localStorage is only a cache so the first paint is not blank.
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

const SEED_PRODUCTS = [];

const PRODUCTS_STORAGE_KEY = "cloudstr_products";
const PRODUCTS_COLLECTION = "products";

function cleanProductList(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((product) => product && product.id && !/^p(?:[1-9]|1[0-9]|2[0-2])$/.test(String(product.id)));
}

function readLocalProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY));
    const clean = cleanProductList(saved);
    if (Array.isArray(saved) && clean.length !== saved.length) {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(clean));
    }
    return clean;
  } catch (e) {
    return SEED_PRODUCTS.slice();
  }
}

function writeLocalProducts(list) {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    return false;
  }
}

function firestoreSafe(product) {
  const copy = JSON.parse(JSON.stringify(product));
  copy.id = String(copy.id);
  return copy;
}

const MOCK_PRODUCTS = readLocalProducts();
window.__cloudstrCatalogReady = false;
window.cloudstrProductSync = Promise.resolve(true);

function replaceCatalog(list, { persistLocal = true, notify = true } = {}) {
  const next = cleanProductList(list);
  MOCK_PRODUCTS.splice(0, MOCK_PRODUCTS.length, ...next);
  if (persistLocal) writeLocalProducts(next);
  window.__cloudstrCatalogReady = true;
  if (notify) window.dispatchEvent(new CustomEvent("cloudstr-products-updated"));
  return next;
}

async function syncProductsToFirestore(list) {
  const ready = await (window.cloudstrFirestoreReady || Promise.resolve(false));
  const db = window.CloudStrDB && window.CloudStrDB.db;
  if (!ready || !db) return false;
  const col = db.collection(PRODUCTS_COLLECTION);
  const snap = await col.get();
  const keep = new Set(list.map((product) => String(product.id)));
  let batch = db.batch();
  let ops = 0;
  async function flush() {
    if (!ops) return;
    await batch.commit();
    batch = db.batch();
    ops = 0;
  }
  for (const doc of snap.docs) {
    if (!keep.has(doc.id)) {
      batch.delete(doc.ref);
      ops += 1;
      if (ops >= 400) await flush();
    }
  }
  for (const product of list) {
    batch.set(col.doc(String(product.id)), firestoreSafe(product));
    ops += 1;
    if (ops >= 400) await flush();
  }
  await flush();
  return true;
}

function saveProducts(list) {
  const saved = writeLocalProducts(cleanProductList(list));
  if (!saved) return false;
  replaceCatalog(list, { persistLocal: false, notify: false });
  window.cloudstrProductSync = syncProductsToFirestore(MOCK_PRODUCTS.slice()).catch((err) => {
    console.warn("[cloudStr] Firestore product sync failed:", err);
    window.dispatchEvent(new CustomEvent("cloudstr-products-sync-error", { detail: err }));
    return false;
  });
  return true;
}

function loadProducts() {
  return MOCK_PRODUCTS.slice();
}

(async function hydrateProductsFromFirestore() {
  try {
    const ready = await (window.cloudstrFirestoreReady || Promise.resolve(false));
    const db = window.CloudStrDB && window.CloudStrDB.db;
    if (!ready || !db) {
      window.__cloudstrCatalogReady = true;
      return;
    }
    const snap = await db.collection(PRODUCTS_COLLECTION).get();
    if (snap.empty) {
      if (MOCK_PRODUCTS.length) await syncProductsToFirestore(MOCK_PRODUCTS.slice());
      window.__cloudstrCatalogReady = true;
      window.dispatchEvent(new CustomEvent("cloudstr-products-updated"));
      return;
    }
    replaceCatalog(snap.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  } catch (err) {
    console.warn("[cloudStr] Could not load products from Firestore:", err);
    window.__cloudstrCatalogReady = true;
  }
})();

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
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    const matchesStock = !inStockOnly || p.stock > 0;
    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });

  switch (sort) {
    case "customized": break;
    case "price-asc": results.sort((a, b) => a.price - b.price); break;
    case "price-desc": results.sort((a, b) => b.price - a.price); break;
    case "new": results.sort((a, b) => Number(b.isNew) - Number(a.isNew)); break;
    default: break;
  }
  return results;
}

function formatPrice(n) {
  return `${CURRENCY}${Number(n || 0).toLocaleString("en-US")}.00`;
}

function cartIconSVG() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>';
}

function renderProductCard(p) {
  const inStock = p.stock > 0;
  const discount = p.compareAt && p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : null;
  const image = (p.images && p.images[0]) || "";
  return `
    <article class="product-card reveal in-view" data-id="${p.id}">
      <div class="product-media">
        <a class="card-link" href="product.html?slug=${p.slug}" aria-label="View ${p.name}"></a>
        <span class="product-status badge-pill ${inStock ? "badge-instock" : "badge-outstock"}">${inStock ? "In Stock" : "Out of Stock"}</span>
        ${discount ? `<span class="product-discount">-${discount}%</span>` : ""}
        <img src="${image}" alt="${p.name}" loading="lazy">
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
