/* Mobile menu exit, the entrance in reverse (the entrance is CSS, in site.css):
   the links fade up and out, then the panel's curtain rolls back up.
   Webflow closes the menu instantly, on a click on its button and on a click on
   any "#" link inside it (the EN/PT switch). Those clicks are held back here in
   the capture phase, so Webflow never sees them; the exit plays, then a click on
   the button is handed on to Webflow to close the menu for real. */
(function () {
  "use strict";
  var btn = document.querySelector(".navigation .menu-button.w-nav-button:not(.brand-home)");
  var menu = document.querySelector(".navigation-items.w-nav-menu");
  if (!btn || !menu || !menu.animate) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE = "cubic-bezier(.65,0,.35,1)";
  var closing = false, handOn = false, leftovers = [];

  // drop the exit's end states, so the next opening starts clean
  function clearLeftovers() {
    leftovers.forEach(function (a) { a.cancel(); });
    leftovers = [];
  }
  // Webflow takes a few frames to hide the menu after the click: cancelling the
  // exit before that let the full panel flash back in for a moment
  function clearWhenHidden() {
    var overlay = document.querySelector(".w-nav-overlay");
    var t0 = performance.now();
    (function check() {
      var hidden = !overlay || getComputedStyle(overlay).display === "none";
      if (hidden || performance.now() - t0 > 1500) clearLeftovers();
      else requestAnimationFrame(check);
    })();
  }

  function closeAnimated() {
    if (closing) return;
    closing = true;

    var mine = [];
    var items = menu.querySelectorAll(".navigation-item");
    for (var i = 0; i < items.length; i++) {
      mine.push(items[i].animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-12px)" }],
        { duration: 220, delay: (items.length - 1 - i) * 18, easing: "ease-in", fill: "forwards" }
      ));
    }
    var curtain = menu.animate(
      [{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }],
      { duration: 420, delay: 140, easing: EASE, fill: "forwards" }
    );
    mine.push(curtain);

    var finished = false;
    function done() {
      if (finished) return;
      finished = true;
      leftovers = mine;
      handOn = true;
      btn.click();                 // now Webflow closes it
      handOn = false;
      closing = false;
      clearWhenHidden();
    }
    curtain.finished.then(done, done);
    setTimeout(done, 800);         // never leave the menu stuck open if animations stall
  }

  document.addEventListener("click", function (e) {
    // opening again before the last exit was cleared: clear it now
    if (!btn.classList.contains("w--open") && leftovers.length) clearLeftovers();
    if (handOn || reduce || !btn.classList.contains("w--open") || !e.target.closest) return;
    var onButton = e.target.closest(".menu-button.w-nav-button:not(.brand-home)");
    var lang = e.target.closest("[data-lang-btn]");
    if (!onButton && !(lang && menu.contains(lang))) return;
    e.stopPropagation();
    e.preventDefault();
    if (closing) return;
    // i18n.js would have switched the language on this click; it no longer sees it
    if (lang && window.SiteLang) window.SiteLang.set(lang.getAttribute("data-lang-btn"));
    closeAnimated();
  }, true);
})();
