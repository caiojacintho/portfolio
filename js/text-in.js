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

  // title: one mask per letter, letters grouped by word so lines still break at spaces
  function letters(el, text) {
    var spans = [];
    text.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(" ")); return; }
      var word = document.createElement("span");
      word.className = "ti-word";
      Array.prototype.forEach.call(part, function (ch) {
        var mask = document.createElement("span"); mask.className = "ti-mask";
        var c = document.createElement("span"); c.className = "ti-char"; c.textContent = ch;
        mask.appendChild(c); word.appendChild(mask); spans.push(c);
      });
      el.appendChild(word);
    });
    return spans;
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
      var text = h1.textContent;
      // split letters lose their kerning and run ~2px wider: hold a one-line title
      // to its real width so the year beside it does not shift when the text returns
      var box = h1.getBoundingClientRect();
      var oneLine = box.height < parseFloat(getComputedStyle(h1).lineHeight) * 1.5;
      if (oneLine) {
        h1.style.width = box.width + "px";
        h1.style.whiteSpace = "nowrap";
        restores.push(function () { h1.style.width = ""; h1.style.whiteSpace = ""; });
      }
      restores.push(stage(h1));
      letters(h1, text).forEach(function (c, i) {
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
    if (link) play(link, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { delay: 420 + n * 90 });

    reveal();
    Promise.all(anims.map(function (a) { return a.finished; })).then(function () {
      restores.forEach(function (r) { r(); });
    }, function () {
      restores.forEach(function (r) { r(); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
