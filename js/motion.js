/**
 * cloudStr — scroll motion layer
 * --------------------------------
 * - [data-reveal]        fade/slide-in when scrolled into view
 *                        (variants: "left" | "right" | "scale"; stagger via
 *                        a [data-reveal-group] parent)
 * - [data-story]         sticky scrolling section; writes scroll progress to
 *                        the CSS variable --p on its .mo-stage and switches
 *                        the active [data-step]
 * - [data-parallax=".1"] smooth parallax drift (speed = fraction of scroll)
 *
 * Motion is skipped entirely when the visitor prefers reduced motion (and
 * switches off live if that preference changes). In that case the page keeps
 * its normal, fully visible, static layout.
 */
(() => {
  "use strict";

  const root = document.documentElement;
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canObserve = "IntersectionObserver" in window;
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));
  const stories = Array.from(document.querySelectorAll("[data-story]")).map((track) => ({
    track,
    stage: track.querySelector(".mo-stage"),
    steps: Array.from(track.querySelectorAll("[data-step]")),
    count: track.querySelector("[data-step-count]"),
    p: 0,
    idx: -1,
    visible: false,
  })).filter((s) => s.stage && s.steps.length);

  const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]")).map((el) => ({
    el,
    speed: parseFloat(el.getAttribute("data-parallax")) || 0.1,
    host: el.parentElement,
    story: stories.find((s) => s.track.contains(el)) || null,
    visible: false,
  }));

  // Stagger children of a reveal group
  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    group.querySelectorAll("[data-reveal]").forEach((el, i) => {
      el.style.setProperty("--mo-delay", i * 90 + "ms");
    });
  });

  let running = false;
  let ticking = false;
  let revealObserver = null;
  let viewObserver = null;
  const watched = new Map(); // element -> records whose .visible it drives

  const watch = (el, record) => {
    if (!el) return;
    if (!watched.has(el)) watched.set(el, []);
    watched.get(el).push(record);
    viewObserver.observe(el);
  };

  /* ---- Product showcase --------------------------------------------
     The 3D scene shows real products from the admin-managed catalog
     (js/products.js + js/featured.js), one per step. Their photos come
     from the "Product images" field in admin.html. With no usable
     product the original orb is left in place. */
  const SHOT_COUNT = 3;
  const usableUrl = (u) => typeof u === "string" && u.trim() !== "" && !/^\s*(javascript|vbscript):/i.test(u);

  const pickProducts = () => {
    try {
      if (typeof getAllProducts !== "function") return [];
      const out = [];
      const seen = new Set();
      const add = (p) => {
        if (!p || seen.has(p.id) || out.length >= SHOT_COUNT) return;
        if (!Array.isArray(p.images) || !usableUrl(p.images[0])) return;
        seen.add(p.id);
        out.push(p);
      };
      if (typeof getBestProducts === "function") getBestProducts(SHOT_COUNT).forEach(add);
      getAllProducts().forEach(add);
      return out;
    } catch (e) {
      return [];
    }
  };

  const syncShots = (story, idx) => {
    const shots = story.track.querySelectorAll(".mo-shot");
    shots.forEach((shot, i) => shot.classList.toggle("is-active", i === idx % shots.length));
  };

  const renderShots = (story) => {
    const wrap = story.track.querySelector(".mo-orb-wrap");
    const host = wrap && wrap.querySelector(".mo-par");
    if (!host) return;
    const products = pickProducts();
    let shots = host.querySelector(".mo-shots");
    if (!shots) {
      shots = document.createElement("div");
      shots.className = "mo-shots";
      host.appendChild(shots);
    }
    shots.textContent = "";
    products.forEach((p, i) => {
      const fig = document.createElement("figure");
      fig.className = "mo-shot";
      const img = new Image();
      img.src = p.images[0].trim();
      img.alt = "";
      img.decoding = "async";
      if (i > 0) img.loading = "lazy";
      fig.appendChild(img);
      shots.appendChild(fig);
    });
    wrap.classList.toggle("has-shots", products.length > 0);

    // One "Shop <product>" link per step (the scene itself stays decorative)
    story.steps.forEach((step, i) => {
      let link = step.querySelector(".mo-link");
      const p = products.length ? products[i % products.length] : null;
      if (!p || !p.slug) {
        if (link) link.remove();
        return;
      }
      if (!link) {
        link = document.createElement("a");
        link.className = "mo-link";
        step.appendChild(link);
      }
      link.href = "/product/" + encodeURIComponent(p.slug);
      const price = typeof formatPrice === "function" ? " · " + formatPrice(p.price) : "";
      link.textContent = "Shop " + p.name + price + " →";
    });
    syncShots(story, story.idx >= 0 ? story.idx : 0);
  };

  const setActiveStep = (story, idx) => {
    story.idx = idx;
    story.steps.forEach((step, i) => step.classList.toggle("is-active", i === idx));
    syncShots(story, idx);
    if (story.count) story.count.textContent = "0" + (idx + 1) + " / 0" + story.steps.length;
  };

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;

    stories.forEach((s) => {
      if (!s.visible) return;
      const rect = s.track.getBoundingClientRect();
      const span = Math.max(1, rect.height - s.stage.offsetHeight);
      s.p = clamp((-rect.top + 88) / span, 0, 1);
      s.stage.style.setProperty("--p", s.p.toFixed(4));
      const idx = Math.min(s.steps.length - 1, Math.floor(s.p * s.steps.length));
      if (idx !== s.idx) setActiveStep(s, idx);
    });

    parallaxItems.forEach((it) => {
      const on = it.story ? it.story.visible : it.visible;
      if (!on) return;
      let offset;
      if (it.story) {
        // Inside a pinned stage the box itself never moves: use story progress
        offset = (it.story.p - 0.5) * it.speed * 700;
      } else {
        const r = it.host.getBoundingClientRect();
        offset = (r.top + r.height / 2 - vh / 2) * -it.speed;
      }
      it.el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
    });
  };

  const schedule = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  const start = () => {
    if (running || !canObserve) return;
    running = true;
    root.classList.add("mo-ready");

    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach((el) => revealObserver.observe(el));

    viewObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        (watched.get(entry.target) || []).forEach((rec) => { rec.visible = entry.isIntersecting; });
      });
      schedule();
    }, { rootMargin: "20% 0px 20% 0px" });
    stories.forEach((s) => watch(s.track, s));
    parallaxItems.forEach((it) => { if (!it.story) watch(it.host, it); });

    stories.forEach((s) => setActiveStep(s, 0));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();
  };

  const stop = () => {
    if (!running) return;
    running = false;
    root.classList.remove("mo-ready");
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (revealObserver) revealObserver.disconnect();
    if (viewObserver) viewObserver.disconnect();
    revealObserver = viewObserver = null;
    watched.clear();
    revealEls.forEach((el) => el.classList.add("is-visible"));
    parallaxItems.forEach((it) => { it.el.style.transform = ""; });
    stories.forEach((s) => {
      s.stage.style.removeProperty("--p");
      s.steps.forEach((step) => step.classList.remove("is-active"));
      s.idx = -1;
      s.visible = false;
      syncShots(s, 0);
    });
  };

  // Products render whether or not motion is on; the catalog can also arrive
  // (or change) after first paint when Firestore hydrates.
  stories.forEach(renderShots);
  window.addEventListener("cloudstr-products-updated", () => stories.forEach(renderShots));

  const apply = () => (mq.matches ? stop() : start());
  apply();
  if (mq.addEventListener) mq.addEventListener("change", apply);
  else if (mq.addListener) mq.addListener(apply);
})();
