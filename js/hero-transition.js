/* Project-page side of the card transition. The featured grid leaves a note of
   the picture that was clicked; here that same picture is moved to the first slot
   of the page and named "hero", so the view transition glides it into place.
   Loaded in <head>: it has to run before the page's first frame is drawn. */
(function () {
  "use strict";
  var KEY = "hero-from-grid";

  // the sidebar text waits hidden for js/text-in.js; never longer than 5s if that fails
  if (!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    document.documentElement.classList.add("text-wait");
    setTimeout(function () { document.documentElement.classList.remove("text-wait"); }, 5000);
  }

  // settles once the picture has landed (or straight away when nothing glides), so
  // the text entrance plays once on the live page, not under the transition
  var settle;
  window.heroSettled = new Promise(function (r) { settle = r; });
  setTimeout(function () { settle(); }, 2500);

  // a media file's own name, whatever URL form it comes in (Webflow escapes the /)
  function fileOf(url) {
    if (!url) return "";
    try { url = decodeURIComponent(url); } catch (e) {}
    return url.split("?")[0].split("/").pop().toLowerCase();
  }
  function keyOf(el) {
    if (!el) return "";
    if (el.tagName === "IMG") return fileOf(el.getAttribute("src"));
    if (el.tagName === "VIDEO") {
      var src = el.getAttribute("src"), s = el.querySelector("source");
      if (!src && s) src = s.getAttribute("data-src") || s.getAttribute("src");
      return fileOf(src);
    }
    var urls = el.getAttribute("data-video-urls");
    if (urls) return fileOf(urls.split(",")[0]);
    return keyOf(el.querySelector("video"));
  }

  function take() {
    var note = null;
    try { note = JSON.parse(sessionStorage.getItem(KEY) || "null"); sessionStorage.removeItem(KEY); } catch (e) {}
    if (!note || Date.now() - note.t > 15000) return null;
    var here = location.pathname.split("/").pop() || "index.html";
    return note.page === here ? note.key : null;
  }

  function place(key) {
    var main = document.querySelector(".case-media");
    if (!main) return null;
    var media = Array.prototype.slice.call(main.querySelectorAll("img, video.case-video, video.case-phone, .w-background-video"));
    var hit = null;
    for (var i = 0; key && i < media.length; i++) {
      if (keyOf(media[i]) === key) { hit = media[i]; break; }
    }
    if (!hit) return media[0] || null;      // not on this page: glide into the first slot instead

    // the row the picture sits in goes to the top, and the picture to its first cell
    var row = hit.closest(".div-block") || hit;
    var cell = hit;
    while (cell.parentNode && cell.parentNode !== row) cell = cell.parentNode;
    if (cell !== row && row.firstElementChild !== cell) row.insertBefore(cell, row.firstElementChild);
    if (main.firstElementChild !== row) main.insertBefore(row, main.firstElementChild);
    return hit;
  }

  if ("onpagereveal" in window) {
    // the page's <link rel="expect" blocking="render"> holds the first frame until
    // the media column is parsed, so it is all there when this runs
    window.addEventListener("pagereveal", function (e) {
      if (e.viewTransition) e.viewTransition.finished.finally(settle);
      else settle();
      var key = take();
      if (!e.viewTransition && !key) return;
      var hero = place(key);
      if (!hero || !e.viewTransition) return;
      hero.style.viewTransitionName = "hero";
      e.viewTransition.finished.finally(function () { hero.style.viewTransitionName = ""; });
    });
  } else {
    // no view transitions here: still open the page on the picture that was clicked
    document.addEventListener("DOMContentLoaded", function () {
      settle();
      var key = take();
      if (key) place(key);
    });
  }
})();
