/* Eased, inertial wheel scrolling (Lenis). Touch keeps the device's own scrolling,
   and people who ask the system for reduced motion get the native scroll too. */
(function () {
  if (!window.Lenis) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var css = document.createElement("style");
  css.textContent =
    "html.lenis, html.lenis body { height: auto; }" +
    /* the case pages ask for CSS smooth scrolling, which would fight Lenis */
    ".lenis.lenis-smooth { scroll-behavior: auto !important; }" +
    ".lenis.lenis-stopped { overflow: hidden; }";
  document.head.appendChild(css);

  var lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    anchors: true
  });
  window.lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();
