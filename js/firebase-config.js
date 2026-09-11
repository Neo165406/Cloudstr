<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VOLT//VOID — Enter the Afterglow</title>
  <meta name="description" content="VOLT//VOID is a futuristic lifestyle hardware concept — dark design, electric attitude. 18+ only. Prototype UI concept.">
  <meta name="robots" content="noindex, nofollow">
  <link rel="canonical" href="#">
  <meta property="og:title" content="VOLT//VOID — Enter the Afterglow">
  <meta property="og:description" content="Futuristic lifestyle hardware. Dark design. Electric attitude. A fictional brand concept — 18+ only.">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- ===================== Age Verification Gate ===================== -->
  <div id="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
    <div class="age-card">
      <span class="tag tag-purple">18+ Only</span>
      <h2 id="age-gate-title">Are you 18 years of age or older?</h2>
      <p>VOLT//VOID is a concept brand built around nicotine-adjacent lifestyle hardware. You must confirm your age to continue.</p>
      <div class="age-actions">
        <button class="btn btn-ghost" id="age-exit">Exit</button>
        <button class="btn btn-primary" id="age-enter">Yes, enter</button>
      </div>
      <p class="age-fine">This is a fictional design prototype, not a working store. Nicotine products are for adults only and carry health risks. Please follow all local age-verification laws.</p>
    </div>
  </div>

  <div class="grain"></div>
  <div id="scroll-progress"></div>
  <div id="cursor-dot"></div>
  <div id="cursor-ring"></div>

  <div id="page-loader"><div class="loader-ring"></div></div>

  <!-- ===================== Header / Nav ===================== -->
  <header class="site-header">
    <div class="wrap navbar">
      <a href="index.html" class="logo">VOLT<span>//</span>VOID</a>
      <nav class="nav-links" aria-label="Primary">
        <a href="shop.html">Shop</a>
        <a href="shop.html?filter=new">New Drops</a>
        <a href="shop.html?filter=featured">Collections</a>
        <a href="about.html">About</a>
        <a href="contact.html">Contact</a>
      </nav>
      <div class="nav-actions">
        <form class="nav-search" data-nav-search role="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input type="search" placeholder="Search products" aria-label="Search products">
        </form>
        <a href="shop.html?filter=wishlist" class="icon-btn" aria-label="Wishlist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20.5s-7.5-4.6-10-9.4C.4 7.8 2 4.5 5.3 4c2-.3 3.8.6 4.7 2.2C10.9 4.6 12.7 3.7 14.7 4c3.3.5 4.9 3.8 3.3 7.1-2.5 4.8-10 9.4-10 9.4z"/></svg>
          <span class="count-badge" id="wishlist-count" data-count="0">0</span>
        </a>
        <button class="icon-btn" id="cart-btn" aria-label="Cart (prototype)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
        </button>
        <button class="menu-toggle" id="menu-toggle" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>

  <div class="nav-scrim" id="nav-scrim"></div>
  <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile">
    <a href="shop.html">Shop</a>
    <a href="shop.html?filter=new">New Drops</a>
    <a href="shop.html?filter=featured">Collections</a>
    <a href="about.html">About</a>
    <a href="contact.html">Contact</a>
  </nav>

  <main>
    <!-- ===================== Hero ===================== -->
    <section class="hero">
      <div class="hero-visual">
        <div class="glow-a"></div>
        <div class="glow-b"></div>
        <div class="grid-bg"></div>
        <div class="particles" id="particles"></div>
        <img class="device-silhouette" src="https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=900&auto=format&fit=crop" alt="VOID X1 device silhouette lit with cyan and violet light" loading="eager">
      </div>
      <div class="wrap">
        <div class="hero-content">
          <span class="eyebrow">New drop — Nightfall edition</span>
          <h1>VOLT<span class="divider">//</span>VOID</h1>
          <p class="hero-tagline">Enter the afterglow.</p>
          <p class="lede">Futuristic lifestyle hardware. Dark design. Electric attitude. A concept brand built for the after-dark hours.</p>
          <div class="hero-ctas">
            <a href="shop.html" class="btn btn-primary">Explore collection</a>
            <a href="about.html" class="btn btn-ghost">Discover the brand</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== Featured ===================== -->
    <section class="section" id="featured">
      <div class="wrap">
        <div class="section-head reveal">
          <div>
            <span class="eyebrow">Limited</span>
            <h2>The Afterglow Collection</h2>
          </div>
          <a href="shop.html?filter=featured" class="btn btn-ghost">View all featured</a>
        </div>
        <div class="featured-grid" id="featured-grid"></div>
      </div>
    </section>

    <hr class="divider">

    <!-- ===================== Brand Story ===================== -->
    <section class="section">
      <div class="wrap editorial">
        <div class="editorial-copy reveal">
          <span class="eyebrow">The brand</span>
          <h2>Built for the after dark.</h2>
          <p>VOLT//VOID exists for the hours after the sun goes down — matte surfaces, low light, and hardware that looks like it belongs in a city that never fully sleeps.</p>
          <p>Every device is designed first as an object, then as a tool: something you'd want sitting on a desk under a single lamp, not hidden in a drawer.</p>
          <a href="about.html" class="btn btn-ghost" style="margin-top: 0.5rem;">Read the full story</a>
          <div class="editorial-stats">
            <div>
              <div class="stat-num">6</div>
              <div class="stat-label">Core devices</div>
            </div>
            <div>
              <div class="stat-num">4.6</div>
              <div class="stat-label">Avg. rating</div>
            </div>
            <div>
              <div class="stat-num">18+</div>
              <div class="stat-label">Age restricted</div>
            </div>
          </div>
        </div>
        <div class="editorial-media reveal">
          <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=900&auto=format&fit=crop" alt="Close-up of a matte black device with cyan edge lighting" loading="lazy">
        </div>
      </div>
    </section>

    <hr class="divider divider-glow">

    <!-- ===================== Horizontal Showcase ===================== -->
    <section class="section">
      <div class="wrap">
        <div class="section-head reveal">
          <div>
            <span class="eyebrow">Trending</span>
            <h2>Currently in rotation</h2>
          </div>
        </div>
        <div class="showcase-track" id="showcase-track"></div>
      </div>
    </section>
  </main>

  <!-- ===================== Footer ===================== -->
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-notice">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
        <span>Designed as a fictional UI concept. Follow all applicable laws and age restrictions regarding nicotine products. VOLT//VOID does not process real orders or payments.</span>
      </div>
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="logo">VOLT<span>//</span>VOID</a>
          <p>Enter the afterglow.</p>
        </div>
        <div class="footer-col">
          <h4>Shop</h4>
          <a href="shop.html">All products</a>
          <a href="shop.html?filter=new">New drops</a>
          <a href="shop.html?filter=featured">Featured</a>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
        <div class="footer-col">
          <h4>18+ Notice</h4>
          <p style="font-size:0.78rem;color:var(--muted);">This site is for adults 18+. Nicotine products are addictive.</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 VOLT//VOID. Prototype concept — not a real store.</span>
        <div class="social-row">
          <a href="#" aria-label="Instagram (placeholder)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></svg></a>
          <a href="#" aria-label="X (placeholder)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4l16 16M20 4L4 20"/></svg></a>
          <a href="#" aria-label="TikTok (placeholder)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg></a>
        </div>
      </div>
    </div>
  </footer>

  <div id="toast-region" aria-live="polite"></div>

  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics-compat.js"></script>
  <script src="js/firebase-config.js"></script>
  <script src="js/products.js"></script>
  <script src="js/app.js"></script>
  <script>
    // Homepage-specific rendering
    document.addEventListener("DOMContentLoaded", () => {
      const featuredGrid = document.getElementById("featured-grid");
      featuredGrid.innerHTML = getFeaturedProducts(4).map(renderFeaturedCard).join("");

      const showcase = document.getElementById("showcase-track");
      showcase.innerHTML = getAllProducts().map(renderProductCard).join("");

      refreshReveal();

      // Ambient particles in the hero
      const field = document.getElementById("particles");
      for (let i = 0; i < 18; i++) {
        const dot = document.createElement("span");
        dot.className = "particle";
        dot.style.left = `${Math.random() * 100}%`;
        dot.style.bottom = `${Math.random() * 20}%`;
        dot.style.setProperty("--dx", `${(Math.random() - 0.5) * 80}px`);
        dot.style.animationDelay = `${Math.random() * 10}s`;
        dot.style.animationDuration = `${9 + Math.random() * 6}s`;
        field.appendChild(dot);
      }
    });
  </script>
</body>
</html>
