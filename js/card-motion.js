/**
 * cloudStr — Product card motion
 * Staggered entrance when products scroll into view.
 * Works for product-grid, best-slider, and dynamically injected cards.
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function markAll(cards) {
    for (var i = 0; i < cards.length; i++) {
      cards[i].style.transitionDelay = (i % 6) * 0.08 + "s";
      cards[i].classList.add("card-in");
    }
  }

  var observer = null;
  if (!reduce && "IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var card = entry.target;
          var parent = card.parentElement;
          var index = parent ? Array.prototype.indexOf.call(parent.children, card) : 0;
          card.style.transitionDelay = (index % 6) * 0.09 + "s";
          card.classList.add("card-in");
          observer.unobserve(card);
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -6% 0px" }
    );
  }

  function scan() {
    var cards = document.querySelectorAll(".product-card:not(.card-in)");
    if (!cards.length) return;
    if (!observer) {
      markAll(cards);
      return;
    }
    for (var i = 0; i < cards.length; i++) observer.observe(cards[i]);
  }

  function start() {
    scan();
    // Re-scan shortly after DOMContentLoaded grids render
    setTimeout(scan, 120);
    setTimeout(scan, 400);
    if ("MutationObserver" in window) {
      new MutationObserver(function () {
        window.requestAnimationFrame(scan);
      }).observe(document.body, { childList: true, subtree: true });
    }
    window.addEventListener("load", scan);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
