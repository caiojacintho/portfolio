/* Bilingual site toggle (EN default, PT optional).
   Static pages (Work / About) are translated here by a normalized text-node
   dictionary. The Mentions page renders its own dynamic content and only relies
   on this file for the nav labels + the PT/EN buttons (it listens to `langchange`). */
(function () {
  "use strict";
  var KEY = "site-lang";
  var lang = localStorage.getItem(KEY) || "en";

  // English -> Portuguese, keyed by the exact rendered text-node fragments
  // (some paragraphs are split across <strong> + text; headers are lower-case
  //  in the DOM and upper-cased by CSS).
  var PT = {
    // nav
    "FEATURED": "DESTAQUES",
    "ABOUT": "SOBRE",
    "WORK": "PROJETOS",
    // work — intro (split across <strong> + text) and section labels
    "A Brazilian multiform designer working at the intersection of design, data and communication.":
      "Designer brasileiro multiforme, atuando na interseção entre design, dados e comunicação.",
    "I lead the Design team at IplanRio, the technology agency of Rio de Janeiro City Hall, shaping the city's digital future.":
      "Lidero o time de Design da IplanRio, a agência de tecnologia da Prefeitura do Rio de Janeiro, moldando o futuro digital da cidade.",
    "Storytelling": "Narrativas",
    "Data visualization": "Visualização de dados",
    "Architecture": "Arquitetura",
    // about — three intro paragraphs (each a single text node)
    "Hello, my name is Caio. I'm from Campinas, Brazil, and I graduated in Architecture and Urbanism from the University of São Paulo in 2016. Since then, I have built my career around designing and developing digital products.":
      "Olá, meu nome é Caio. Sou de Campinas, Brasil, e me formei em Arquitetura e Urbanismo pela Universidade de São Paulo em 2016. Desde então, construí minha carreira em torno da concepção e do desenvolvimento de produtos digitais.",
    "I started out in architectural visualization, where I learned how to translate complex ideas into clear and compelling visual experiences. Over time, this evolved into a broader focus on digital product design, combining storytelling, data, and technology to create tools that improve how people interact with information and services.":
      "Comecei na visualização arquitetônica, onde aprendi a traduzir ideias complexas em experiências visuais claras e envolventes. Com o tempo, isso evoluiu para um foco mais amplo em design de produtos digitais, combinando narrativa, dados e tecnologia para criar ferramentas que melhoram a forma como as pessoas interagem com informações e serviços.",
    "I am currently Head of Design at IplanRio, the municipal technology company of Rio de Janeiro City Hall, where I lead a multidisciplinary team of designers, developers, and content creators. My work spans from defining design systems and user experiences to building platforms, apps, dashboards, and data-driven stories that connect citizens with public services.":
      "Atualmente sou Head de Design na IplanRio, a empresa municipal de tecnologia da Prefeitura do Rio de Janeiro, onde lidero um time multidisciplinar de designers, desenvolvedores e criadores de conteúdo. Meu trabalho vai da definição de design systems e experiências do usuário à construção de plataformas, aplicativos, dashboards e histórias baseadas em dados que conectam os cidadãos aos serviços públicos.",
    // about — section headers (lower-case in DOM, CSS upper-cases them)
    "experience": "experiência",
    "education": "formação",
    "Special Thanks": "Agradecimentos especiais",
    // about — experience entries
    "Head of Design": "Head de Design",
    "Iplanrio at Rio de Janeiro City Hall": "IplanRio na Prefeitura do Rio de Janeiro",
    "Product Designer": "Designer de Produto",
    "Data Office at Rio de Janeiro City Hall": "Escritório de Dados da Prefeitura do Rio de Janeiro",
    "Designer UI": "Designer de UI",
    "Graphic Design & Archtect": "Design Gráfico e Arquitetura",
    "Multiple": "Diversos",
    // about — education entries
    "Bachelor’s Degree in Architecture and Urbanism": "Bacharelado em Arquitetura e Urbanismo",
    "Spanish B2 Level Certificate": "Certificado de Espanhol Nível B2",
    "Advanced English Proficiency": "Proficiência Avançada em Inglês",
    // about — thanks (split across two nodes)
    "This journey was only possible thanks to the incredible people who supported me:":
      "Esta jornada só foi possível graças às pessoas incríveis que me apoiaram:",
    "Marisa Rodrigues, Durval Jacintho, Mylenna Linares, João Carabetta, Júnior Magalhães, Pedro Meneghel, Mateus Lana, Fernando Santana, Lucas Tavares, Diego Oliveira, Frederico Zolio, Gabriel Milan, Adriano Borges Costa and Mauricio Bouskela.":
      "Marisa Rodrigues, Durval Jacintho, Mylenna Linares, João Carabetta, Júnior Magalhães, Pedro Meneghel, Mateus Lana, Fernando Santana, Lucas Tavares, Diego Oliveira, Frederico Zolio, Gabriel Milan, Adriano Borges Costa e Mauricio Bouskela."
  };

  function norm(s) {
    return s
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/\s+/g, " ")
      .trim();
  }
  // normalized lookup so curly quotes / whitespace never break a match
  var PTN = {};
  Object.keys(PT).forEach(function (k) { PTN[norm(k)] = PT[k]; });

  // snapshot the original (English) text nodes once, skipping dynamic regions
  var nodes = [];
  function collect() {
    if (!document.body) return;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.nodeName === "SCRIPT" || p.nodeName === "STYLE") return NodeFilter.FILTER_REJECT;
        // the Mentions list / detail / filter are managed by that page's own script
        if (p.closest && p.closest("#ttcl, #mFilter, [data-i18n-skip]")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walker.nextNode())) nodes.push({ node: n, en: n.nodeValue });
  }

  function apply() {
    for (var i = 0; i < nodes.length; i++) {
      var rec = nodes[i], t = rec.en;
      if (lang === "pt") {
        var parts = t.match(/^(\s*)([\s\S]*?)(\s*)$/);
        var pt = PTN[norm(parts[2])];
        rec.node.nodeValue = pt != null ? parts[1] + pt + parts[3] : rec.en;
      } else {
        rec.node.nodeValue = rec.en;
      }
    }
    document.documentElement.lang = lang;
    updateButtons();
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang } }));
  }

  function updateButtons() {
    var btns = document.querySelectorAll("[data-lang-btn]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle("is-on", btns[i].getAttribute("data-lang-btn") === lang);
    }
  }

  function setLang(l) {
    if (l === lang) { updateButtons(); return; }
    lang = l;
    localStorage.setItem(KEY, l);
    apply();
  }

  // expose for the Mentions page
  window.SiteLang = { get: function () { return lang; }, set: setLang };

  function injectStyle() {
    // same treatment as the filter chips: unselected inherits the nav grey,
    // the selected language turns black (#111)
    var css =
      ".lang-switch{display:inline-flex;align-items:center;margin-left:14px}" +
      ".lang-switch .lang-btn{opacity:1;cursor:pointer}" +
      ".lang-switch .lang-btn.is-on{color:#111}" +
      // in the collapsed menu the nav is a block with text-align:center, which
      // would centre an inline-flex box: go block-level so it stacks flush left
      // with the other nav items
      "@media screen and (max-width:991px){" +
      ".lang-switch{display:flex;justify-content:flex-start;margin-left:0}}";
    var s = document.createElement("style");
    s.textContent = css;
    document.head.appendChild(s);
  }

  function init() {
    injectStyle();
    collect();
    document.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-lang-btn]") : null;
      if (b) { e.preventDefault(); setLang(b.getAttribute("data-lang-btn")); }
    });
    apply();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
