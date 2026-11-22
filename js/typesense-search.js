/**
 * cloudStr — Typesense search (client)
 * Loaded by app.js only when js/typesense-config.js has a host and a search-only key.
 * If Typesense is unreachable, the site silently keeps using the local search.
 */
(function () {
  const cfg = window.CLOUDSTR_TYPESENSE || {};
  if (!cfg.host || !cfg.searchKey) return;

  const port = Number(cfg.port) || 443;
  const protocol = cfg.protocol || "https";
  const base = `${protocol}://${cfg.host}${[80, 443].includes(port) ? "" : ":" + port}`;
  const endpoint = `${base}/collections/${cfg.collection || "products"}/documents/search`;

  async function search(q, perPage, signal) {
    const params = new URLSearchParams({
      q,
      query_by: "name,specs_text,description",
      query_by_weights: "4,2,1",
      prefix: "true",
      num_typos: "2",
      per_page: String(perPage || 8),
    });
    const res = await fetch(`${endpoint}?${params}`, {
      headers: { "X-TYPESENSE-API-KEY": cfg.searchKey },
      signal,
    });
    if (!res.ok) throw new Error("Typesense " + res.status);
    const data = await res.json();
    return (data.hits || []).map((hit) => hit.document);
  }

  const money = (n) => (typeof formatPrice === "function" ? formatPrice(n) : "৳" + Number(n || 0).toLocaleString("en-US"));

  const style = document.createElement("style");
  style.textContent = `
.ts-results{margin-top:.6rem;max-height:60vh;overflow:auto;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:12px;background:var(--surface,rgba(18,18,18,.97));text-align:left}
.ts-item{display:flex;align-items:center;gap:.75rem;padding:.6rem .8rem;color:inherit;text-decoration:none}
.ts-item:hover{background:rgba(255,255,255,.06)}
.ts-item img{width:44px;height:44px;object-fit:cover;border-radius:8px;flex:none}
.ts-name{flex:1;font-size:.9rem}
.ts-price{font-size:.85rem;opacity:.8;white-space:nowrap}
.ts-all,.ts-empty{display:block;padding:.7rem .8rem;font-size:.85rem;opacity:.85;color:inherit;text-decoration:none}
`;
  document.head.appendChild(style);

  /* ---- Instant suggestions in the search overlay ---- */
  function initOverlay() {
    const overlay = document.getElementById("search-overlay");
    const input = overlay && overlay.querySelector("input");
    const box = overlay && overlay.querySelector(".search-box");
    if (!input || !box) return;

    const list = document.createElement("div");
    list.className = "ts-results";
    list.hidden = true;
    box.appendChild(list);

    let timer = 0;
    let ctrl = null;

    function render(q, docs) {
      list.textContent = "";
      const items = docs.filter((d) => d && d.slug);
      if (!items.length) {
        const empty = document.createElement("p");
        empty.className = "ts-empty";
        empty.textContent = `No products found for “${q}”.`;
        list.appendChild(empty);
      } else {
        items.forEach((d) => {
          const a = document.createElement("a");
          a.className = "ts-item";
          a.href = "/product/" + encodeURIComponent(d.slug);
          if (d.image) {
            const img = document.createElement("img");
            img.src = d.image;
            img.alt = "";
            img.loading = "lazy";
            a.appendChild(img);
          }
          const name = document.createElement("span");
          name.className = "ts-name";
          name.textContent = d.name;
          const price = document.createElement("span");
          price.className = "ts-price";
          price.textContent = d.in_stock ? money(d.price) : "Out of stock";
          a.append(name, price);
          list.appendChild(a);
        });
        const all = document.createElement("a");
        all.className = "ts-all";
        all.href = "/shop?q=" + encodeURIComponent(q);
        all.textContent = "See all results";
        list.appendChild(all);
      }
      list.hidden = false;
    }

    input.addEventListener("input", () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (ctrl) ctrl.abort();
      if (q.length < 2) {
        list.hidden = true;
        return;
      }
      timer = setTimeout(async () => {
        ctrl = new AbortController();
        try {
          render(q, await search(q, 6, ctrl.signal));
        } catch (err) {
          if (err.name !== "AbortError") list.hidden = true;
        }
      }, 120);
    });
  }

  /* ---- Typo-tolerant ranking on the shop page (?q=...) ---- */
  function initShop() {
    const original = window.queryProducts;
    if (typeof original !== "function") return;

    const ranks = new Map(); // query -> Map(productId -> rank)
    const asked = new Set(); // queries already requested (success or failure)

    async function loadRanks(q) {
      const key = q.toLowerCase();
      if (asked.has(key)) return;
      asked.add(key);
      try {
        const docs = await search(q, 100);
        ranks.set(key, new Map(docs.map((d, i) => [String(d.id), i])));
        document.dispatchEvent(new CustomEvent("cloudstr-products-updated", { bubbles: true }));
      } catch (err) {
        console.warn("[cloudStr] Typesense unavailable, using local search:", err.message);
      }
    }

    window.queryProducts = function (opts) {
      const options = opts || {};
      const q = String(options.search || "").trim();
      if (!q) return original(options);
      const found = ranks.get(q.toLowerCase());
      if (!found) {
        loadRanks(q);
        return original(options);
      }
      const filtered = original(Object.assign({}, options, { search: "" }))
        .filter((p) => found.has(String(p.id)));
      if (!options.sort || options.sort === "relevance") {
        filtered.sort((a, b) => found.get(String(a.id)) - found.get(String(b.id)));
      }
      return filtered;
    };
  }

  initOverlay();
  initShop();
})();
