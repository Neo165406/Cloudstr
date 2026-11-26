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

  const setActiveStep = (story, idx) => {
    story.idx = idx;
    story.steps.forEach((step, i) => step.classList.toggle("is-active", i === idx));
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
    });
  };

  const apply = () => (mq.matches ? stop() : start());
  apply();
  if (mq.addEventListener) mq.addEventListener("change", apply);
  else if (mq.addListener) mq.addListener(apply);
})();
