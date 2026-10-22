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

  // the way back: whichever picture fills most of the screen glides back into its
  // card on the featured grid (index.html picks the note up on pagereveal)
  function onScreen() {
    var main = document.querySelector(".case-media");
    if (!main) return null;
    var media = main.querySelectorAll("img, video.case-video, video.case-phone, .w-background-video");
    var best = null, most = 0, vw = window.innerWidth, vh = window.innerHeight;
    for (var i = 0; i < media.length; i++) {
      var r = media[i].getBoundingClientRect();
      var area = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) * Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
      if (area > most) { most = area; best = media[i]; }
    }
    return best || media[0] || null;
  }
  var leaving = null;
  function toGrid(url) {
    try { return (new URL(url, location.href).pathname.split("/").pop() || "index.html") === "index.html"; }
    catch (err) { return false; }
  }
  function leaveNote() {
    leaving = onScreen();
    if (!leaving) return;
    try {
      sessionStorage.setItem("hero-to-grid", JSON.stringify({
        page: location.pathname.split("/").pop(), key: keyOf(leaving), t: Date.now()
      }));
    } catch (err) {}
  }
  // written on the click itself, before the grid starts loading and looks for it
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (a && !a.target && toGrid(a.getAttribute("href"))) leaveNote();
  });
  window.addEventListener("pageswap", function (e) {
    if (!e.viewTransition || !e.activation || !e.activation.entry || !toGrid(e.activation.entry.url)) return;
    if (!leaving) leaveNote();          // the browser's own back button: best effort
    if (leaving) leaving.style.viewTransitionName = "hero";
  });
  // coming back to this page from the history cache: drop the name it left with
  window.addEventListener("pageshow", function () {
    if (leaving) { leaving.style.viewTransitionName = ""; leaving = null; }
  });

  if ("onpagereveal" in window) {
    // the page's <link rel="expect" blocking="render"> holds the first frame until
    // the media column is parsed, so it is all there when this runs
    window.addEventListener("pagereveal", function (e) {
      if (e.viewTransition) {
        e.viewTransition.ready.catch(function () {});   // a skipped glide (tab hidden, page resized) is not an error
        e.viewTransition.finished.then(settle, settle);
      }
      else settle();
      var key = take();
      if (!e.viewTransition && !key) return;
      var hero = place(key);
      if (!hero) return;
      if (hero.tagName === "IMG") hero.loading = "eager";   // it is now the first thing on the page
      if (!e.viewTransition) return;
      var root = document.documentElement;
      if (key && keyOf(hero) === key) root.classList.add("vt-same");   // see css/transitions.css
      hero.style.viewTransitionName = "hero";
      var unname = function () { hero.style.viewTransitionName = ""; root.classList.remove("vt-same"); };
      e.viewTransition.finished.then(unname, unname);
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
