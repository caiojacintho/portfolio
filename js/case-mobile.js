/* Phones (up to 860px): every project page takes the same order — the title, a
   cover picture, the text about the project in a larger type, the other pictures
   in a sideways carousel, then the facts (industry, contribution, year, skills).
   The page's own markup is the desktop one (sidebar + stacked media); this script
   rearranges it before the first frame and puts it back on a wider screen.
   Loaded in <head> after js/hero-transition.js: that script may first move the
   picture clicked on the featured grid to the front, so it becomes the cover. */
(function () {
  "use strict";
  var mq = window.matchMedia ? window.matchMedia("(max-width: 860px)") : null;
  if (!mq) return;
  var MEDIA = "img, video.case-video, video.case-phone, .w-background-video";
  var root = document.documentElement;

  // nothing shows in the desktop order first (never longer than 3s if this fails)
  root.classList.add("case-m-wait");
  setTimeout(function () { root.classList.remove("case-m-wait"); }, 3000);

  // the pictures of a block, leaving out the video inside a Webflow background video,
  // the next-project link and anything this screen hides
  function mediaIn(el) {
    return Array.prototype.filter.call(el.querySelectorAll(MEDIA), function (m) {
      if (m.parentNode.closest(".w-background-video")) return false;
      if (m.closest(".case-nav")) return false;
      return m.getClientRects().length > 0;
    });
  }
  function count(node) { return mediaIn(node).length + (node.matches(MEDIA) ? 1 : 0); }
  // the largest block around a picture that holds only that picture (a link around
  // it, its row, its section), so it moves with what belongs to it
  function cellOf(m, main) {
    var c = m;
    while (c.parentNode && c.parentNode !== main && count(c.parentNode) === 1) c = c.parentNode;
    return c;
  }

  // a mouse can drag the carousel too (a finger already scrolls it natively). It
  // stops wherever it is let go; a drag never counts as a click on a picture that
  // is a link.
  var drag = null;
  function dragging(track) {
    track.addEventListener("dragstart", function (e) { e.preventDefault(); });
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { track: track, x: e.clientX, left: track.scrollLeft, moved: false };
    });
    track.addEventListener("click", function (e) {
      if (track.dataset.dragged) { e.preventDefault(); e.stopPropagation(); delete track.dataset.dragged; return; }
      // a tap on a picture opens it whole (its link, if it has one, waits in the viewer)
      var slide = e.target.closest(".case-m-slide");
      if (!slide) return;
      e.preventDefault(); e.stopPropagation();
      view(track, Array.prototype.indexOf.call(track.querySelectorAll(".case-m-slide"), slide));
    }, true);
  }

  // the viewer: one picture at a time, whole, on white
  var viewer = null, vTrack = null, vIndex = 0;
  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html) n.innerHTML = html; return n; }
  var ICON = {
    close: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    prev: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
    next: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
    out: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>'
  };
  function build_viewer() {
    viewer = el("div", "case-viewer");
    viewer.setAttribute("role", "dialog"); viewer.setAttribute("aria-modal", "true");
    var stage = el("div", "case-viewer-stage");
    var close = el("button", "case-viewer-btn case-viewer-close", ICON.close); close.type = "button"; close.setAttribute("aria-label", "Close");
    var prev = el("button", "case-viewer-btn case-viewer-prev", ICON.prev); prev.type = "button"; prev.setAttribute("aria-label", "Previous");
    var next = el("button", "case-viewer-btn case-viewer-next", ICON.next); next.type = "button"; next.setAttribute("aria-label", "Next");
    var out = el("a", "case-viewer-btn case-viewer-out", ICON.out); out.target = "_blank"; out.rel = "noopener"; out.setAttribute("aria-label", "Open link");
    viewer.appendChild(stage); viewer.appendChild(close); viewer.appendChild(prev); viewer.appendChild(next); viewer.appendChild(out);
    close.addEventListener("click", hide);
    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    // a tap on the white around the picture closes (the picture fills the stage and
    // is drawn whole inside it, so work out where it actually is)
    stage.addEventListener("click", function (e) {
      var m = stage.firstElementChild;
      if (!m) { hide(); return; }
      var w = m.naturalWidth || m.videoWidth, h = m.naturalHeight || m.videoHeight, b = m.getBoundingClientRect();
      if (!w || !h) return;
      var fit = m.classList.contains("is-phone") ? Math.max : Math.min;   // a phone covers the stage
      var k = fit(b.width / w, b.height / h), dw = w * k, dh = h * k;
      var x = b.left + (b.width - dw) / 2, y = b.top + (b.height - dh) / 2;
      if (e.clientX < x || e.clientX > x + dw || e.clientY < y || e.clientY > y + dh) hide();
    });
    var sx = null;
    viewer.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    viewer.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    });
    document.addEventListener("keydown", function (e) {
      if (!viewer.classList.contains("is-open")) return;
      if (e.key === "Escape") hide();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    });
    document.body.appendChild(viewer);
  }
  function show(i) {
    var slides = vTrack.querySelectorAll(".case-m-slide");
    vIndex = (i + slides.length) % slides.length;
    var slide = slides[vIndex], stage = viewer.querySelector(".case-viewer-stage");
    stage.textContent = "";
    var img = slide.querySelector("img"), vid = slide.querySelector("video"), media;
    if (img) {
      // the largest version on offer (the page may have picked a small one for its card)
      var best = img.getAttribute("src"), bw = 0;
      (img.getAttribute("srcset") || "").split(",").forEach(function (c) {
        var m = c.trim().match(/^(\S+)\s+(\d+)w$/);
        if (m && +m[2] > bw) { bw = +m[2]; best = m[1]; }
      });
      media = el("img"); media.src = best || img.currentSrc || img.src; media.alt = img.alt || "";
    }
    else if (vid) {
      media = el("video");
      var src = vid.currentSrc || vid.getAttribute("src");
      if (!src) { var s = vid.querySelector("source"); src = s && (s.getAttribute("src") || s.getAttribute("data-src")); }
      media.src = src; media.muted = true; media.loop = true; media.autoplay = true; media.playsInline = true;
      media.setAttribute("playsinline", ""); media.setAttribute("muted", "");
    }
    // a phone mockup fills the viewer's height, so the phone shows large (its plain
    // background is what gets trimmed at the sides)
    // (judged on the viewer's own copy once it has loaded: the carousel card may not
    // have loaded yet; until then the picture shows whole)
    if (media && media.tagName === "IMG") {
      var judge = function () { if (isPhone(media, media.naturalWidth, media.naturalHeight)) media.classList.add("is-phone"); };
      if (media.complete && media.naturalWidth) judge(); else media.addEventListener("load", judge, { once: true });
    } else if (media && slide.classList.contains("is-wide") === false && slide.dataset.sorted === "phone") media.classList.add("is-phone");
    if (media) stage.appendChild(media);
    if (media && media.tagName === "VIDEO") { var p = media.play(); if (p && p.catch) p.catch(function () {}); }
    var link = slide.querySelector("a[href]"), out = viewer.querySelector(".case-viewer-out");
    if (link) { out.href = link.href; out.hidden = false; } else { out.removeAttribute("href"); out.hidden = true; }
    var many = slides.length > 1;
    viewer.querySelector(".case-viewer-prev").hidden = !many;
    viewer.querySelector(".case-viewer-next").hidden = !many;
  }
  function step(d) { show(vIndex + d); }
  function view(track, i) {
    if (!viewer) build_viewer();
    vTrack = track;
    show(i);
    viewer.classList.add("is-open");
    document.documentElement.classList.add("case-viewer-open");
    if (window.lenis) window.lenis.stop();
    viewer.querySelector(".case-viewer-close").focus({ preventScroll: true });
  }
  function hide() {
    viewer.classList.remove("is-open");
    document.documentElement.classList.remove("case-viewer-open");
    if (window.lenis) window.lenis.start();
    var v = viewer.querySelector("video"); if (v) v.pause();
  }
  window.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 5) { drag.moved = true; drag.track.classList.add("is-dragging"); }
    if (drag.moved) drag.track.scrollLeft = drag.left - dx;
  });
  window.addEventListener("pointerup", function () {
    if (!drag) return;
    var d = drag; drag = null;
    if (!d.moved) return;
    var t = d.track;
    t.dataset.dragged = "1";
    setTimeout(function () { delete t.dataset.dragged; }, 50);
    t.classList.remove("is-dragging");
  });

  // every slide is as tall as the others and as wide as its own picture: its
  // proportions are read from the picture (or the clip) once it has loaded
  // a phone mockup: a phone standing on a plain light background — the background
  // reaches both edges, and in the middle only a narrow band (the phone, under 35%
  // of the width) breaks it, starting with the phone's near-black frame
  // Tolerant of the small noise some browsers (Safari's fingerprinting protection) add
  // to pixels read back from a canvas: most edge samples, not all, must match the
  // background, rows are averaged, and an edge needs a run of pixels, not one.
  function isPhone(src, w, h) {
    try {
      var W = 200, H = Math.max(3, Math.round(W * h / w));
      var c = document.createElement("canvas"); c.width = W; c.height = H;
      var x = c.getContext("2d"); x.drawImage(src, 0, 0, W, H);
      var d = x.getImageData(0, 0, W, H).data;
      var L = function (px, py) { var i = (py * W + px) * 4; return (d[i] + d[i + 1] + d[i + 2]) / 3; };
      var edge = [], st = Math.max(1, Math.round(H / 12));
      for (var y = 0; y < H; y += st) edge.push(L(1, y), L(2, y), L(W - 2, y), L(W - 3, y));
      var bg = edge.slice().sort(function (a, b) { return a - b; })[Math.floor(edge.length / 2)];
      if (bg < 200) return false;
      if (edge.filter(function (v) { return Math.abs(v - bg) < 14; }).length < edge.length * .8) return false;
      var mid = Math.round(H / 2);
      var row = function (px) { return (L(px, mid - 1) + L(px, mid) + L(px, mid + 1)) / 3; };
      var off = function (px) { return Math.abs(row(px) - bg) > 25; };
      var l = -1, r = -1, xx;
      for (xx = 0; xx < W - 2; xx++) if (off(xx) && off(xx + 1) && off(xx + 2)) { l = xx; break; }
      for (xx = W - 1; xx > 1; xx--) if (off(xx) && off(xx - 1) && off(xx - 2)) { r = xx; break; }
      if (l < 0 || r <= l) return false;
      if ((r - l + 1) / W >= .35) return false;
      var dark = Math.min(row(l + 1), row(l + 2), row(r - 1), row(r - 2));
      return dark < 40;   // the phone's near-black frame
    } catch (e) { return false; }   // from another site, it cannot be read: not a phone
  }
  // a phone mockup keeps the narrow card; any other picture may run up to 120vw
  function sort(slide, src, w, h) {
    var phone = isPhone(src, w, h);
    slide.dataset.sorted = phone ? "phone" : "wide";
    if (!phone) slide.classList.add("is-wide");
  }

  function shape(slide, m) {
    function set(w, h) { if (w && h) slide.style.setProperty("--r", w + " / " + h); }
    if (m.tagName === "IMG") {
      var done = function () { set(m.naturalWidth, m.naturalHeight); sort(slide, m, m.naturalWidth, m.naturalHeight); };
      if (m.complete && m.naturalWidth) done();
      else m.addEventListener("load", done, { once: true });
      return;
    }
    var v = m.tagName === "VIDEO" ? m : m.querySelector("video");
    if (!v) { slide.classList.add("is-wide"); return; }
    if (v.readyState >= 1 && v.videoWidth) set(v.videoWidth, v.videoHeight);
    else v.addEventListener("loadedmetadata", function () { set(v.videoWidth, v.videoHeight); }, { once: true });
    // a clip is sorted on its first frame
    if (v.readyState >= 2 && v.videoWidth) sort(slide, v, v.videoWidth, v.videoHeight);
    else v.addEventListener("loadeddata", function () { sort(slide, v, v.videoWidth, v.videoHeight); }, { once: true });
  }

  var moves = null, added = [], wrap = null;
  function build() {
    if (moves) return;
    wrap = document.querySelector(".case-wrap");
    var main = document.querySelector(".case-media");
    if (!wrap || !main) return;
    var media = mediaIn(main);
    if (!media.length) return;
    moves = []; added = [];
    function move(node, into) {
      moves.push({ node: node, parent: node.parentNode, next: node.nextSibling });
      into.appendChild(node);
    }
    var cover = document.createElement("div");
    cover.className = "case-m-cover case-m-frame";
    var track = document.createElement("div");
    track.className = "case-m-carousel";
    main.insertBefore(track, main.firstChild);
    main.insertBefore(cover, track);
    added.push(cover, track);
    media.forEach(function (m, i) {
      var cell = cellOf(m, main);
      if (i === 0) { move(cell, cover); shape(cover, m); return; }   // the cover knows its picture's shape too (--r)
      var slide = document.createElement("div");
      slide.className = "case-m-slide case-m-frame";
      track.appendChild(slide);
      move(cell, slide);
      shape(slide, m);
    });
    if (!track.children.length) track.classList.add("case-m-empty");
    dragging(track);
    // blocks left with no picture and no text step aside
    Array.prototype.forEach.call(main.children, function (c) {
      if (added.indexOf(c) > -1 || c.matches(".case-nav, .case-facts")) return;
      if (!count(c) && !c.textContent.trim()) c.classList.add("case-m-empty");
    });
    wrap.classList.add("m-built");
  }
  function unbuild() {
    if (!moves) return;
    for (var i = moves.length - 1; i >= 0; i--) {
      var r = moves[i];
      r.parent.insertBefore(r.node, r.next && r.next.parentNode === r.parent ? r.next : null);
    }
    added.forEach(function (el) { if (el.parentNode) el.parentNode.removeChild(el); });
    Array.prototype.forEach.call(document.querySelectorAll(".case-m-empty"), function (el) { el.classList.remove("case-m-empty"); });
    if (wrap) wrap.classList.remove("m-built");
    moves = null; added = [];
  }
  function sync() {
    if (mq.matches) build(); else unbuild();
    root.classList.remove("case-m-wait");
  }

  // the "Next project" pill rolls its label to a copy of itself on hover (the copy
  // reads data-label): keep it in step with the language
  function labels() {
    Array.prototype.forEach.call(document.querySelectorAll(".case-nav-name"), function (n) {
      n.setAttribute("data-label", n.textContent.trim());
    });
  }
  document.addEventListener("langchange", labels);
  document.addEventListener("DOMContentLoaded", labels);

  // pagereveal comes before the first frame, after hero-transition.js's own handler
  if ("onpagereveal" in window) window.addEventListener("pagereveal", sync);
  else document.addEventListener("DOMContentLoaded", sync);
  if (mq.addEventListener) mq.addEventListener("change", sync); else mq.addListener(sync);
})();
