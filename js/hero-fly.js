/**
 * cloudStr — Hero banner fly-through
 * Product cut-outs drift in from the top-right corner and curve out
 * toward the top-left corner, looping behind the hero banner content.
 */
(function () {
  var COUNT = 5;

  function pickImages() {
    var list = [];
    try {
      var products = (typeof getBestProducts === "function" && getBestProducts(10)) || [];
      if (!products.length && typeof getAllProducts === "function") products = getAllProducts();
      list = products.map(function (p) { return p.images && p.images[0]; }).filter(Boolean);
    } catch (e) { list = []; }
    return list;
  }

  function build() {
    var layer = document.getElementById("hero-fly");
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      layer.remove();
      return;
    }
    var images = pickImages();
    if (!images.length) return;

    layer.innerHTML = "";
    for (var i = 0; i < COUNT; i++) {
      var src = images[i % images.length];
      var flyer = document.createElement("span");
      flyer.className = "hero-flyer";
      flyer.style.animationDuration = 7 + i * 1.6 + "s";
      flyer.style.animationDelay = i * 2.1 + "s";
      flyer.style.setProperty("--fly-size", 46 + ((i * 13) % 34) + "px");
      flyer.style.setProperty("--fly-top", 4 + ((i * 17) % 26) + "%");

      var inner = document.createElement("span");
      inner.className = "hero-flyer-inner";
      inner.style.animationDuration = flyer.style.animationDuration;
      inner.style.animationDelay = flyer.style.animationDelay;

      var img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";

      inner.appendChild(img);
      flyer.appendChild(inner);
      layer.appendChild(flyer);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(build, 0); });
  } else {
    setTimeout(build, 0);
  }
})();
