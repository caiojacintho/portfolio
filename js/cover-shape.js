/* The shape a cover takes — the one rule the featured grid and the project pages
   both follow, so a card on the home and the cover the project page opens with are
   the same box, and the picture glides from one page to the other without changing
   size. Loaded in <head> on both, before the scripts that use it.

   A picture keeps its own proportions, with two exceptions:
     - a phone mockup is blown up until the phone itself is half the card wide, the
       same in every mockup on the site, whatever slice of its picture it takes up;
     - a cover may ask for a shape of its own with data-cover-ratio="16/9" on the
       picture, and then both pages crop it to that. */
(function () {
  "use strict";

  var PHONE_W = .5;   // a phone mockup's phone, as a share of the card's width
  /* On a phone every cover is a square — picture or clip, whatever its own shape —
     so the cards down the grid all stand the same height, and a card and the cover
     the project page opens with are the same box. The pictures under a cover keep
     their own shapes; only the cover is squared. */
  var COVER_R = 1;

  // A phone mockup: a phone standing on a plain light background — the background
  // reaches both edges, and across the picture's whole height only a narrow band
  // (the phone, under 35% of the width) breaks it, edged by the phone's near-black
  // frame, standing in the middle.
  // Five rows are read, not one, so a single dark thing on a pale page — a photo in
  // a browser window, say — cannot pass for a phone; and four of the five must agree,
  // so a phone whose top or bottom is cropped still counts.
  // Tolerant of the small noise some browsers (Safari's fingerprinting protection) add
  // to pixels read back from a canvas: most edge samples, not all, must match the
  // background, rows are averaged, and an edge needs a run of pixels, not one.
  // Returns where the phone is — { f: its share of the width, c: its centre } — or null.
  function phoneBand(src, w, h) {
    // Only a picture marked in the page is a phone mockup (data-phone="share,centre",
    // measured once with the reading below). Reading pixels back from a canvas gave
    // iPhones a different answer from Chrome (Safari adds noise to them), so the same
    // page came out with a different layout on each. A new phone mockup needs the mark.
    var mark = src && src.getAttribute && src.getAttribute("data-phone");
    if (mark) { var p = mark.split(","); return { f: parseFloat(p[0]) || .22, c: parseFloat(p[1]) || .5 }; }
    if (!(src && src.__measure)) return null;   // the reading itself, kept for measuring new ones
    try {
      var W = 200, H = Math.max(3, Math.round(W * h / w));
      var c = document.createElement("canvas"); c.width = W; c.height = H;
      var x = c.getContext("2d"); x.drawImage(src, 0, 0, W, H);
      var d = x.getImageData(0, 0, W, H).data;
      var L = function (px, py) { var i = (py * W + px) * 4; return (d[i] + d[i + 1] + d[i + 2]) / 3; };
      var edge = [], st = Math.max(1, Math.round(H / 12));
      for (var y = 0; y < H; y += st) edge.push(L(1, y), L(2, y), L(W - 2, y), L(W - 3, y));
      var bg = edge.slice().sort(function (a, b) { return a - b; })[Math.floor(edge.length / 2)];
      if (bg < 200) return null;
      if (edge.filter(function (v) { return Math.abs(v - bg) < 14; }).length < edge.length * .8) return null;
      // the band the phone makes on one row of the picture
      function at(py) {
        py = Math.min(H - 2, Math.max(1, py));
        var row = function (px) { return (L(px, py - 1) + L(px, py) + L(px, py + 1)) / 3; };
        var off = function (px) { return Math.abs(row(px) - bg) > 25; };
        var l = -1, r = -1, xx;
        for (xx = 0; xx < W - 2; xx++) if (off(xx) && off(xx + 1) && off(xx + 2)) { l = xx; break; }
        for (xx = W - 1; xx > 1; xx--) if (off(xx) && off(xx - 1) && off(xx - 2)) { r = xx; break; }
        if (l < 0 || r <= l) return null;
        if ((r - l + 1) / W >= .35) return null;
        if (Math.min(row(l + 1), row(l + 2), row(r - 1), row(r - 2)) >= 40) return null;   // the near-black frame
        return { f: (r - l + 1) / W, c: ((l + r) / 2) / W };
      }
      var found = [.2, .35, .5, .65, .8].map(function (p) { return at(Math.round(H * p)); })
        .filter(function (b) { return b; });
      if (found.length < 4) return null;
      var mid = function (key) {
        var v = found.map(function (b) { return b[key]; }).sort(function (a, b) { return a - b; });
        return v[Math.floor(v.length / 2)];
      };
      var band = { f: mid("f"), c: mid("c") };
      if (Math.abs(band.c - .5) > .12) return null;   // a phone mockup stands in the middle
      return band;
    } catch (e) { return null; }   // from another site, it cannot be read: not a phone
  }

  // "16/9", "16 / 9" or "1.78" from data-cover-ratio, as a number
  function asked(el) {
    var v = el && el.getAttribute && el.getAttribute("data-cover-ratio");
    if (!v) return 0;
    var p = v.split("/");
    var n = p.length === 2 ? parseFloat(p[0]) / parseFloat(p[1]) : parseFloat(v);
    return isFinite(n) && n > 0 ? n : 0;
  }

  /* The card this picture belongs in: { phone, r: width / height, x: how far across
     the picture to sit, as a percentage, when it had to be blown up }. */
  function shapeOf(src, w, h) {
    if (!w || !h) return null;
    var want = asked(src);
    if (want) return { phone: false, r: want, x: null };
    var band = phoneBand(src, w, h);
    if (!band) return { phone: false, r: w / h, x: null };
    // The phone fills a different slice of each mockup, so a card at the picture's
    // own shape would show it a different size every time. This is the shape that
    // blows the picture up until the phone is PHONE_W of the card's width; the
    // picture's height then fits the card exactly and its plain sides are cropped.
    var zoom = PHONE_W / band.f;
    return { phone: true, r: (w / h) / zoom, x: 100 * (.5 - band.c * zoom) / (1 - zoom) };
  }

  window.coverShape = { phoneBand: phoneBand, shapeOf: shapeOf, PHONE_W: PHONE_W, COVER_R: COVER_R };
})();
