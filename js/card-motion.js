/**
 * cloudStr — Product card motion
 * Adds `.card-in` to product cards as they scroll into view, and re-arms
 * for cards injected later (grids are rendered client-side).
 */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function markAll(cards) {
    for (var i = 0; i < cards.length; i++) cards[i].classList.add("card-in");
  }

  var observer = null;
  if (!reduce && "IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var card = entry.target;
          var grid = card.parentElement;
          var index = grid ? Array.prototype.indexOf.call(grid.children, card) : 0;
          card.style.transitionDelay = (index % 4) * 0.07 + "s";
          card.classList.add("card-in");
          observer.unobserve(card);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
  }

  function scan() {
    var cards = document.querySelectorAll(".product-card:not(.card-in)");
    if (!cards.length) return;
    if (!observer) { markAll(cards); return; }
    for (var i = 0; i < cards.length; i++) observer.observe(cards[i]);
  }

  function start() {
    scan();
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
