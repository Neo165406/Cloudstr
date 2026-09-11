/**
 * VOLT//VOID — Product Data Layer
 * --------------------------------
 * Fictional catalog data + query helpers. Pages call the functions
 * at the bottom of this file rather than touching MOCK_PRODUCTS
 * directly, so a future Firestore-backed version can drop in
 * underneath without changing shop.html / product.html / admin.html.
 */

const MOCK_PRODUCTS = [
  {
    id: "p1",
    slug: "void-x1",
    name: "VOID X1",
    category: "devices",
    price: 59,
    rating: 4.8,
    reviewCount: 132,
    stock: 24,
    featured: true,
    isNew: true,
    description: "A minimalist flagship device with a matte-black shell and a single cyan status ring.",
    images: [
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
    ],
    specs: {
      "Battery": "900mAh",
      "Charge time": "45 min",
      "Weight": "38g",
      "Material": "Anodized aluminum",
      "Indicator": "Cyan status ring",
    },
    reviews: [
      { author: "K. Marsh", rating: 5, text: "Build quality feels genuinely premium, not gimmicky." },
      { author: "R. Ito", rating: 4, text: "Great design, wish the ring had more brightness settings." },
    ],
  },
  {
    id: "p2",
    slug: "nova-pro",
    name: "NOVA PRO",
    category: "devices",
    price: 79,
    rating: 4.6,
    reviewCount: 98,
    stock: 12,
    featured: true,
    isNew: false,
    description: "The performance-tier device in the lineup, built around a reinforced dark-alloy frame.",
    images: [
      "https://images.unsplash.com/photo-1622037022824-0c71d511ef3c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop",
    ],
    specs: {
      "Battery": "1200mAh",
      "Charge time": "50 min",
      "Weight": "46g",
      "Material": "Dark alloy composite",
      "Indicator": "Dual-tone LED",
    },
    reviews: [
      { author: "D. Alvarez", rating: 5, text: "Heavier than expected but it feels solid in hand." },
    ],
  },
  {
    id: "p3",
    slug: "volt-mini",
    name: "VOLT MINI",
    category: "devices",
    price: 39,
    rating: 4.4,
    reviewCount: 61,
    stock: 40,
    featured: false,
    isNew: true,
    description: "A compact silhouette built for portability, without losing the brand's signature glow detail.",
    images: [
      "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
    ],
    specs: {
      "Battery": "550mAh",
      "Charge time": "30 min",
      "Weight": "24g",
      "Material": "Soft-touch polymer",
      "Indicator": "Single LED dot",
    },
    reviews: [
      { author: "J. Petrov", rating: 4, text: "Perfect for a pocket. Wish battery lasted a bit longer." },
    ],
  },
  {
    id: "p4",
    slug: "cyber-pod",
    name: "CYBER POD",
    category: "pods",
    price: 18,
    rating: 4.5,
    reviewCount: 210,
    stock: 5,
    featured: false,
    isNew: false,
    description: "Replacement pod cartridge engineered for consistent output across the VOID X1 and NOVA PRO.",
    images: [
      "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?q=80&w=800&auto=format&fit=crop",
    ],
    specs: {
      "Compatibility": "VOID X1, NOVA PRO",
      "Capacity": "2ml",
      "Material": "Medical-grade polymer",
    },
    reviews: [],
  },
  {
    id: "p5",
    slug: "nightfall-device",
    name: "NIGHTFALL DEVICE",
    category: "devices",
    price: 89,
    rating: 4.9,
    reviewCount: 47,
    stock: 8,
    featured: true,
    isNew: true,
    description: "Limited after-dark edition with a violet-shift finish that reacts subtly to ambient light.",
    images: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580522154071-c6ca47a859ba?q=80&w=800&auto=format&fit=crop",
    ],
    specs: {
      "Battery": "1000mAh",
      "Charge time": "45 min",
      "Weight": "40g",
      "Material": "Violet-shift alloy",
      "Edition": "Limited run",
    },
    reviews: [
      { author: "S. Whitfield", rating: 5, text: "The finish genuinely shifts color depending on the light. Worth it." },
    ],
  },
  {
    id: "p6",
    slug: "neon-core",
    name: "NEON CORE",
    category: "accessories",
    price: 24,
    rating: 4.3,
    reviewCount: 34,
    stock: 60,
    featured: false,
    isNew: true,
    description: "A magnetic charging dock with an ambient cyan base light for nightstand or desk.",
    images: [
      "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=800&auto=format&fit=crop",
    ],
    specs: {
      "Input": "USB-C",
      "Output": "5W magnetic",
      "Material": "Brushed metal + glass",
    },
    reviews: [],
  },
  {
    id: "p7",
    slug: "drift-pod",
    name: "DRIFT POD",
    category: "pods",
    price: 18,
    rating: 4.1,
    reviewCount: 29,
    stock: 0,
    featured: false,
    isNew: false,
    description: "A lighter-output pod variant tuned for a smoother pull. Fits VOLT MINI.",
    images: [
      "https://images.unsplash.com/photo-1615529162924-f8605388461d?q=80&w=800&auto=format&fit=crop",
    ],
    specs: {
      "Compatibility": "VOLT MINI",
      "Capacity": "1.5ml",
      "Material": "Medical-grade polymer",
    },
    reviews: [],
  },
  {
    id: "p8",
    slug: "grid-case",
    name: "GRID CASE",
    category: "accessories",
    price: 22,
    rating: 4.7,
    reviewCount: 15,
    stock: 33,
    featured: false,
    isNew: false,
    description: "A protective carry case with a laser-etched grid pattern and interior pod storage.",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
    ],
    specs: {
      "Material": "Recycled EVA shell",
      "Capacity": "1 device + 2 pods",
    },
    reviews: [],
  },
];

const CATEGORY_LABELS = {
  devices: "Devices",
  pods: "Pods",
  accessories: "Accessories",
};

/* ---------------------------------------------------------------
   Query helpers — the stable API the rest of the app calls.
   Swap the implementation for Firestore later without touching
   callers.
--------------------------------------------------------------- */
function getAllProducts() {
  return MOCK_PRODUCTS.slice();
}

function getProductBySlug(slug) {
  return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
}

function getFeaturedProducts(limit = 4) {
  return MOCK_PRODUCTS.filter((p) => p.featured).slice(0, limit);
}

function getNewProducts(limit = 8) {
  return MOCK_PRODUCTS.filter((p) => p.isNew).slice(0, limit);
}

function queryProducts({ search = "", category = "all", minPrice = 0, maxPrice = 999, featuredOnly = false, sort = "relevance" } = {}) {
  let results = MOCK_PRODUCTS.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || p.category === category;
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    const matchesFeatured = !featuredOnly || p.featured;
    return matchesSearch && matchesCategory && matchesPrice && matchesFeatured;
  });

  switch (sort) {
    case "price-asc":
      results.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      results.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      results.sort((a, b) => b.rating - a.rating);
      break;
    case "new":
      results.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    default:
      break; // relevance / insertion order
  }
  return results;
}

function stockStatus(stock) {
  if (stock <= 0) return { label: "Out of stock", cls: "out-stock" };
  if (stock <= 8) return { label: "Low stock", cls: "low-stock" };
  return { label: "In stock", cls: "in-stock" };
}

/* ---------------------------------------------------------------
   Rendering helpers shared by shop.html / index.html
--------------------------------------------------------------- */
function starSVG() {
  return '<svg viewBox="0 0 20 20"><path d="M10 1l2.6 6.3 6.4.5-5 4.4 1.6 6.6-5.6-3.6-5.6 3.6 1.6-6.6-5-4.4 6.4-.5z"/></svg>';
}

function heartSVG() {
  return '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-10-9.4C.4 7.8 2 4.5 5.3 4c2-.3 3.8.6 4.7 2.2C10.9 4.6 12.7 3.7 14.7 4c3.3.5 4.9 3.8 3.3 7.1-2.5 4.8-10 9.4-10 9.4z"/></svg>';
}

function renderProductCard(p) {
  const badges = [];
  if (p.isNew) badges.push('<span class="tag tag-neon">New</span>');
  if (p.featured) badges.push('<span class="tag tag-purple">Featured</span>');
  const wished = isWishlisted(p.id);
  return `
    <article class="product-card reveal in-view" data-id="${p.id}">
      <div class="product-media">
        <a class="card-link" href="product.html?slug=${p.slug}" aria-label="View ${p.name}"></a>
        <div class="product-badges">${badges.join("")}</div>
        <button class="wishlist-btn ${wished ? "active" : ""}" data-wishlist-id="${p.id}" aria-label="Toggle wishlist for ${p.name}" aria-pressed="${wished}">
          ${heartSVG()}
        </button>
        <img src="${p.images[0]}" alt="${p.name} — ${CATEGORY_LABELS[p.category]}" loading="lazy">
      </div>
      <div class="product-info">
        <span class="product-cat">${CATEGORY_LABELS[p.category]}</span>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.description}</p>
        <div class="product-meta">
          <span class="product-price">$${p.price.toFixed(2)}</span>
          <span class="product-rating">${starSVG()} ${p.rating.toFixed(1)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedCard(p) {
  return `
    <a class="featured-card reveal in-view" href="product.html?slug=${p.slug}">
      <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
      <div class="featured-body">
        <span class="tag tag-neon">Featured</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
      </div>
    </a>
  `;
}

function renderSkeletonCards(count = 8) {
  return Array.from({ length: count }, () => '<div class="skeleton skeleton-card"></div>').join("");
}
