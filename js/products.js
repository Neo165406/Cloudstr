/**
 * cloudStr — Product Data Layer
 * --------------------------------
 * Fictional catalog data + query helpers, modeled on a real
 * multi-category vape retailer's structure (disposables, nic salts,
 * pod devices, podmod devices, coils/cartridges, freebase e-liquid).
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

const MOCK_PRODUCTS = [
  // ---- Disposables ----
  {
    id: "p1", slug: "streak-bar-mango-ice", name: "Streak Bar 40000 Puffs — Mango Ice",
    category: "disposables", price: 2600, compareAt: null, stock: 24, isNew: true,
    description: "Dual-mesh disposable with interactive glow display, tuned for a cold mango finish.",
    images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop"],
    specs: { "Puffs": "40000", "Battery": "1100mAh", "Charging": "Type-C", "Coil": "Dual mesh" },
    reviews: [{ author: "R. Chowdhury", rating: 5, text: "Glow display is a nice touch, flavor holds up the whole way through." }],
  },
  {
    id: "p2", slug: "streak-bar-blue-razz", name: "Streak Bar 40000 Puffs — Blue Razz Ice",
    category: "disposables", price: 2600, compareAt: null, stock: 18, isNew: true,
    description: "Same 40000-puff platform in a tart blue raspberry ice profile.",
    images: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop"],
    specs: { "Puffs": "40000", "Battery": "1100mAh", "Charging": "Type-C", "Coil": "Dual mesh" },
    reviews: [],
  },
  {
    id: "p3", slug: "lumen-switch-gradient", name: "Lumen Switch — Gradient Edition",
    category: "disposables", price: 1800, compareAt: 1900, stock: 30, isNew: false,
    description: "A compact switch-style disposable in an eye-catching gradient shell.",
    images: ["https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=800&auto=format&fit=crop"],
    specs: { "Puffs": "12000", "Battery": "550mAh", "Charging": "Type-C" },
    reviews: [],
  },
  {
    id: "p4", slug: "lumen-mini-strawberry", name: "Lumen Mini — Strawberry Kiwi",
    category: "disposables", price: 1500, compareAt: null, stock: 0, isNew: false,
    description: "Pocket-sized disposable in a bright strawberry-kiwi blend.",
    images: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop"],
    specs: { "Puffs": "8000", "Battery": "400mAh" },
    reviews: [],
  },

  // ---- Nic Salts ----
  {
    id: "p5", slug: "harborcrest-cuban-tobacco", name: "Harborcrest Cuban Tobacco Salt 30ML",
    category: "nic-salts", price: 1600, compareAt: null, stock: 40, isNew: false,
    description: "A rich Cuban-leaf tobacco profile with a faint sweetness on the exhale.",
    images: ["https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800&auto=format&fit=crop"],
    specs: { "Bottle size": "30ml", "Nic strength": "25/50mg", "VG/PG": "50/50" },
    reviews: [{ author: "S. Islam", rating: 5, text: "Closest to an actual cigar flavor I've tried in a salt nic." }],
  },
  {
    id: "p6", slug: "harborcrest-dry-tobacco", name: "Harborcrest Dry Tobacco Salt 30ML",
    category: "nic-salts", price: 1600, compareAt: null, stock: 33, isNew: false,
    description: "A drier, woodier tobacco with a vanilla undertone.",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop"],
    specs: { "Bottle size": "30ml", "Nic strength": "25/50mg", "VG/PG": "50/50" },
    reviews: [],
  },
  {
    id: "p7", slug: "orchid-mango-honeydew", name: "Orchid Nicotine Salt — Iced Mango Honeydew",
    category: "nic-salts", price: 1600, compareAt: null, stock: 27, isNew: true,
    description: "A melon-forward iced salt nic with a mango top note.",
    images: ["https://images.unsplash.com/photo-1615529162924-f8605388461d?q=80&w=800&auto=format&fit=crop"],
    specs: { "Bottle size": "30ml", "Nic strength": "25/50mg" },
    reviews: [],
  },
  {
    id: "p8", slug: "orchid-mango-passionfruit", name: "Orchid Nicotine Salt — Iced Mango Passion Fruit",
    category: "nic-salts", price: 1600, compareAt: null, stock: 21, isNew: true,
    description: "A tropical passion-fruit twist on the mango-ice base.",
    images: ["https://images.unsplash.com/photo-1622037022824-0c71d511ef3c?q=80&w=800&auto=format&fit=crop"],
    specs: { "Bottle size": "30ml", "Nic strength": "25/50mg" },
    reviews: [],
  },

  // ---- Pod Devices ----
  {
    id: "p9", slug: "aero-air-25w", name: "Aero Air 25W Pod System",
    category: "pod-devices", price: 2200, compareAt: null, stock: 15, isNew: false,
    description: "An entry-level 25W pod kit with adjustable airflow and a soft-touch shell.",
    images: ["https://images.unsplash.com/photo-1620288627223-53302f4e8c74?q=80&w=800&auto=format&fit=crop"],
    specs: { "Wattage": "25W max", "Battery": "1000mAh", "Pod capacity": "3ml" },
    reviews: [],
  },
  {
    id: "p10", slug: "aero-g5-kit", name: "Aero G5 Pod System Kit",
    category: "pod-devices", price: 4500, compareAt: null, stock: 9, isNew: false,
    description: "The flagship pod kit in the Aero line — mesh coils and a full-color display.",
    images: ["https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?q=80&w=800&auto=format&fit=crop"],
    specs: { "Wattage": "45W max", "Battery": "1200mAh", "Display": "Color screen" },
    reviews: [],
  },
  {
    id: "p11", slug: "kumiho-thoth-lite", name: "Kumiho Thoth G Lite Kit",
    category: "pod-devices", price: 1200, compareAt: null, stock: 0, isNew: false,
    description: "A lightweight starter pod kit with a fixed low-wattage output.",
    images: ["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop"],
    specs: { "Wattage": "Fixed 11W", "Battery": "650mAh" },
    reviews: [],
  },

  // ---- Podmod Devices ----
  {
    id: "p12", slug: "aero-luxe-xr-max2", name: "Aero LUXE XR Max 2 Pod Mod Kit",
    category: "podmod-devices", price: 5500, compareAt: null, stock: 0, isNew: false,
    description: "A high-wattage podmod with dual battery support for all-day sessions.",
    images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop"],
    specs: { "Wattage": "90W max", "Battery": "Dual 18650 (not included)" },
    reviews: [],
  },
  {
    id: "p13", slug: "aero-luxe-x-pro", name: "Aero LUXE X PRO Pod System Kit",
    category: "podmod-devices", price: 4500, compareAt: 4600, stock: 0, isNew: false,
    description: "A pro-tier podmod with a smart chip for consistent power delivery.",
    images: ["https://images.unsplash.com/photo-1622037022824-0c71d511ef3c?q=80&w=800&auto=format&fit=crop"],
    specs: { "Wattage": "80W max", "Battery": "1800mAh built-in" },
    reviews: [],
  },
  {
    id: "p14", slug: "vinci-3-mod-1800", name: "VINCI 3 Mod Pod Kit 1800mAh",
    category: "podmod-devices", price: 3800, compareAt: null, stock: 0, isNew: false,
    description: "A rugged aluminum-body podmod built for daily carry.",
    images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop"],
    specs: { "Wattage": "68W max", "Battery": "1800mAh built-in" },
    reviews: [],
  },

  // ---- Coils & Cartridges ----
  {
    id: "p15", slug: "pnp-vm6-coil", name: "PnP-VM6 Replacement Coil (5-pack)",
    category: "coils-cartridges", price: 400, compareAt: null, stock: 60, isNew: false,
    description: "Mesh replacement coils compatible with PnP-series pod tanks.",
    images: ["https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop"],
    specs: { "Pack size": "5 coils", "Resistance": "0.15–0.6Ω options" },
    reviews: [],
  },
  {
    id: "p16", slug: "corex-2-mesh-pod", name: "Corex 2.0 Luxe X/XR Mesh Pod Cartridge",
    category: "coils-cartridges", price: 500, compareAt: null, stock: 45, isNew: false,
    description: "Replacement mesh pod cartridges for the Luxe X/XR series.",
    images: ["https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=800&auto=format&fit=crop"],
    specs: { "Compatibility": "Luxe X, Luxe XR", "Resistance": "0.4Ω" },
    reviews: [],
  },
  {
    id: "p17", slug: "argus-v2-cartridge", name: "Argus V2 Top-Fill Cartridge 3ml",
    category: "coils-cartridges", price: 450, compareAt: null, stock: 38, isNew: false,
    description: "Top-fill replacement cartridge for the Argus pod line.",
    images: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop"],
    specs: { "Capacity": "3ml", "Fill style": "Top fill" },
    reviews: [],
  },
  {
    id: "p18", slug: "gpp-caliburn-cartridge", name: "GPP Cartridge for Caliburn (2-pack)",
    category: "coils-cartridges", price: 450, compareAt: null, stock: 50, isNew: false,
    description: "Replacement GPP-style cartridges for Caliburn-compatible devices.",
    images: ["https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800&auto=format&fit=crop"],
    specs: { "Pack size": "2 cartridges", "Capacity": "2ml each" },
    reviews: [],
  },

  // ---- Freebase E-liquid ----
  {
    id: "p19", slug: "white-chocolate-mocha-coldbrew", name: "White Chocolate Mocha — Cold Brew 100mL",
    category: "freebase-eliquid", price: 2300, compareAt: null, stock: 20, isNew: false,
    description: "A dessert-style cold brew coffee freebase blend with white chocolate.",
    images: ["https://images.unsplash.com/photo-1580522154071-c6ca47a859ba?q=80&w=800&auto=format&fit=crop"],
    specs: { "Bottle size": "100ml", "Nic strength": "0mg", "VG/PG": "70/30" },
    reviews: [],
  },
  {
    id: "p20", slug: "harborcrest-watermelon-lemonade", name: "Harborcrest Watermelon Lemonade Ice 120ML",
    category: "freebase-eliquid", price: 2600, compareAt: null, stock: 14, isNew: false,
    description: "A summery watermelon-lemonade blend with a cooling finish.",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop"],
    specs: { "Bottle size": "120ml", "Nic strength": "0mg", "VG/PG": "70/30" },
    reviews: [],
  },
  {
    id: "p21", slug: "the-milk-jax", name: "The Milk Jax 100mL",
    category: "freebase-eliquid", price: 400, compareAt: null, stock: 55, isNew: false,
    description: "A creamy cereal-milk blend from the Milk series.",
    images: ["https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?q=80&w=800&auto=format&fit=crop"],
    specs: { "Bottle size": "100ml", "Nic strength": "0mg" },
    reviews: [],
  },
  {
    id: "p22", slug: "harborcrest-tobacco-dry", name: "Harborcrest Tobacco Dry 120ML",
    category: "freebase-eliquid", price: 400, compareAt: 400, stock: 12, isNew: false,
    description: "A dry tobacco freebase blend with a light vanilla background note.",
    images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop"],
    specs: { "Bottle size": "120ml", "Nic strength": "0mg" },
    reviews: [],
  },
];

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
