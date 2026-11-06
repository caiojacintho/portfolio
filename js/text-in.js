/* Case sidebar entrance: the title rises letter by letter out of a mask, the year
   fades in, and the description and link come in line by line.
   Runs after i18n.js has put the page in the chosen language. The animation plays
   on throwaway copies of the text; the original text nodes are set aside and put
   back at the end, because i18n.js keeps hold of them to switch language later. */
(function () {
  "use strict";
  var EASE = "cubic-bezier(.22,.7,.2,1)";
  var root = document.documentElement;

  function reveal() { root.classList.remove("text-wait"); }

  // swaps an element's children for animated copies; returns a function that puts
  // the original children back
  function stage(el) {
    var keep = document.createDocumentFragment();
    while (el.firstChild) keep.appendChild(el.firstChild);
    return function restore() {
      el.textContent = "";
      el.appendChild(keep);
    };
  }

  // title: where the font sets every letter, kerning included, measured on the real
  // text before it is set aside
  function glyphs(el) {
    var box = el.getBoundingClientRect(), out = [], range = document.createRange();
    var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), node;
    while ((node = walk.nextNode())) {
      for (var i = 0; i < node.nodeValue.length; i++) {
        var ch = node.nodeValue[i];
        if (/\s/.test(ch)) continue;
        range.setStart(node, i); range.setEnd(node, i + 1);
        var r = range.getClientRects()[0];
        if (r) out.push({ ch: ch, x: r.left - box.left, y: r.top - box.top, h: r.height });
      }
    }
    return out;
  }
  // one mask per letter, each at the exact place the letter holds in the real text,
  // so nothing moves when the real text comes back
  function letters(el, places) {
    return places.map(function (g) {
      var mask = document.createElement("span"); mask.className = "ti-mask";
      mask.style.left = g.x + "px"; mask.style.top = g.y + "px";
      var c = document.createElement("span"); c.className = "ti-char";
      c.textContent = g.ch; c.style.lineHeight = g.h + "px";
      mask.appendChild(c); el.appendChild(mask);
      return c;
    });
  }

  // paragraph: one block per rendered line, measured from the laid-out words
  function lines(el, text) {
    var words = [];
    text.trim().split(/\s+/).forEach(function (w, i) {
      if (i) el.appendChild(document.createTextNode(" "));
      var s = document.createElement("span"); s.textContent = w;
      el.appendChild(s); words.push(s);
    });
    var rows = [], top = null;
    words.forEach(function (w) {
      if (w.offsetTop !== top) { rows.push([]); top = w.offsetTop; }
      rows[rows.length - 1].push(w.textContent);
    });
    el.textContent = "";
    return rows.map(function (r) {
      var line = document.createElement("span"); line.className = "ti-line";
      line.textContent = r.join(" ");
      el.appendChild(line);
      return line;
    });
  }

  function run() {
    var side = document.querySelector(".case-side");
    if (!side || !root.classList.contains("text-wait") || !Element.prototype.animate) { reveal(); return; }
    var h1 = side.querySelector(".case-title h1");
    var year = side.querySelector(".case-year");
    var paras = Array.prototype.slice.call(side.querySelectorAll(".case-sub"));
    var link = side.querySelector(".case-ext");
    var restores = [], anims = [];
    function play(el, frames, opts) {
      anims.push(el.animate(frames, Object.assign({ duration: 700, easing: EASE, fill: "backwards" }, opts)));
    }

    if (h1) {
      // the title keeps its own box while its letters stand in for the text
      var box = h1.getBoundingClientRect(), places = glyphs(h1);
      h1.style.position = "relative";
      h1.style.width = box.width + "px";
      h1.style.height = box.height + "px";
      restores.push(function () { h1.style.position = ""; h1.style.width = ""; h1.style.height = ""; });
      restores.push(stage(h1));
      var chars = letters(h1, places);
      chars.forEach(function (c, i) {
        play(c, [{ transform: "translateY(110%)" }, { transform: "none" }], { duration: 750, delay: i * 35 });
      });
    }
    if (year) play(year, [{ opacity: 0 }, { opacity: 1 }], { delay: 450 });

    var n = 0;
    paras.forEach(function (p) {
      var t = p.textContent;
      restores.push(stage(p));
      lines(p, t).forEach(function (l) {
        play(l, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { delay: 420 + n++ * 90 });
      });
    });
    var linkAt = 420 + n * 90;
    if (link) play(link, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { delay: linkAt });
    // the facts (industry, contribution, year, skills) follow the link
    var facts = side.querySelector(".case-facts");
    if (facts) play(facts, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { delay: linkAt + (link ? 90 : 0) });
    // the back arrow comes in with the title: from the right, fading up
    var arrow = side.querySelector(".case-arrow");
    if (arrow) play(arrow, [{ opacity: 0, transform: "translateX(18px)" }, { opacity: 1, transform: "none" }], { duration: 650 });

    reveal();
    Promise.all(anims.map(function (a) { return a.finished; })).then(function () {
      restores.forEach(function (r) { r(); });
    }, function () {
      restores.forEach(function (r) { r(); });
    });
  }

  // DM Sans comes in through WebFont.load, which marks <html> wf-active (or
  // wf-inactive) when done. Splitting before that would measure and animate the
  // fallback font, then redraw the title when the real one lands.
  function fontsReady() {
    // the serif title (Source Serif 4) comes from its own stylesheet: wait for it too
    var serif = document.fonts && document.fonts.load
      ? Promise.race([document.fonts.load('400 40px "Source Serif 4"'), new Promise(function (r) { setTimeout(r, 2000); })]).catch(function () {})
      : Promise.resolve();
    return Promise.all([serif, new Promise(function (done) {
      var settled = /\bwf-(active|inactive)\b/;
      if (!window.WebFont || settled.test(root.className)) return done();
      var mo = new MutationObserver(function () {
        if (settled.test(root.className)) { mo.disconnect(); done(); }
      });
      mo.observe(root, { attributes: true, attributeFilter: ["class"] });
      setTimeout(function () { mo.disconnect(); done(); }, 2000);
    })]);
  }

  var once = false;
  function start() {
    Promise.all([window.heroSettled || Promise.resolve(), fontsReady()]).then(function () {
      if (once) return;
      once = true;
      run();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
