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
    "Featured": "Destaques",
    "About": "Sobre",
    "Work": "Projetos",
    // work — intro (split across <strong> + text) and section labels
    "Brazilian designer working on brands, websites and storytelling for startups and governments.":
      "Designer brasileiro, criando marcas, sites e narrativas para startups e governos.",
    "Design that helped startups raise more than R$100 million.":
      "Design que ajudou startups a captar mais de R$ 100 milhões.",
    "Let's talk": "Vamos conversar",
    "Storytelling": "Narrativas",
    "Data visualization": "Visualização de dados",
    "Housing Game": "Jogo da Habitação",
    "Cidados Portal": "Portal Cidados",
    "Digital Government Observatory": "Observatório de Governo Digital",
    // "Between Acts Institute" is left out on purpose: the name stays in English in Portuguese too
    "Architecture": "Arquitetura",
    // home — back to the top, under the last project
    "Up": "Topo",
    // case pages — the link to the next project
    "Next project": "Próximo projeto",
    // case pages — Storytelling's first paragraph
    "Data stories and interactive specials produced for the Data Office of Rio's City Hall and for Insper's Center for City Studies — turning public data into public narratives.":
      "Histórias de dados e especiais interativos produzidos para o Escritório de Dados da Prefeitura do Rio e para o Centro de Estudos das Cidades do Insper — transformando dados públicos em narrativas públicas.",
    // case pages — the paragraph under the cover on phones (second in the sidebar)
    "A space to test ideas outside client work — motion, interfaces and visual systems that often find their way into later projects.":
      "Um espaço para testar ideias fora dos trabalhos para clientes — motion, interfaces e sistemas visuais que muitas vezes chegam a projetos posteriores.",
    "Before moving to digital products, I worked in architecture and visualization — designing schools, housing and public spaces, and presenting them through drawings, models and renders.":
      "Antes de migrar para produtos digitais, trabalhei com arquitetura e visualização — projetando escolas, habitação e espaços públicos, e apresentando-os em desenhos, maquetes e renders.",
    // case pages — facts under the carousel
    "Industry": "Indústria",
    "Contribution": "Contribuição",
    "Year": "Ano",
    "Skills": "Habilidades",
    "Ongoing": "Em andamento",
    // industry
    "Architecture and urbanism": "Arquitetura e urbanismo",
    "Public sector, data": "Setor público, dados",
    "Landscape architecture": "Arquitetura paisagística",
    "Public sector": "Setor público",
    "Public sector, finance": "Setor público, finanças",
    "Public and private sector": "Setor público e privado",
    "Data journalism": "Jornalismo de dados",
    "Public sector, Private sector, Data journalism": "Setor público, Setor privado, Jornalismo de dados",
    "Public sector, Finance": "Setor público, Finanças",
    "Public sector, economic development": "Setor público, desenvolvimento econômico",
    "Public sector, technology": "Setor público, tecnologia",
    "Public sector, Technology": "Setor público, Tecnologia",
    "Public sector, education and employment": "Setor público, educação e emprego",
    "Personal projects": "Projetos pessoais",
    "Public sector, government services": "Setor público, serviços ao cidadão",
    "Renewable energy, nonprofit": "Energia renovável, ONG",
    "Renewable energy, Nonprofit": "Energia renovável, ONG",
    "Healthtech": "Healthtech",
    "Healthtech, Startup": "Healthtech, Startup",
    "Public sector, housing": "Setor público, habitação",
    "Public sector, Housing": "Setor público, Habitação",
    "Public sector, digital government": "Setor público, governo digital",
    "Public sector, Digital government": "Setor público, Governo digital",
    "Nonprofit, careers": "ONG, carreiras",
    "Nonprofit, Careers": "ONG, Carreiras",
    "Research, urban studies, storytelling, data visualization": "Pesquisa, estudos urbanos, narrativas, visualização de dados",
    "Research, Urban studies, Storytelling, Data visualization": "Pesquisa, Estudos urbanos, Narrativas, Visualização de dados",
    "Research, urban studies": "Pesquisa, estudos urbanos",
    "Research, Urban studies": "Pesquisa, Estudos urbanos",
    "Public sector, data journalism": "Setor público, jornalismo de dados",
    "Public sector, Data journalism": "Setor público, Jornalismo de dados",
    // contribution
    "Award-winning entries in national competitions": "Projetos premiados em concursos nacionais",
    "Research, Charts, Maps, Graphic design": "Pesquisa, Gráficos, Mapas, Design gráfico",
    "Branding and Website": "Branding e Site",
    "Website": "Site",
    "Website and Platform": "Site e Plataforma",
    "Design leadership, Branding, Design system, Product design and Website": "Liderança de design, Branding, Design system, Product design e Site",
    "Course platform design": "Design da plataforma de cursos",
    "Visual experiments and studies": "Experimentos e estudos visuais",
    "Design and digital communication": "Design e comunicação digital",
    "Product design and Pitch design": "Product design e Design de apresentação",
    "Script, Art direction, Design, 3D modeling, Front-end": "Roteiro, Direção de arte, Design, Modelagem 3D, Front-end",
    // skills
    "Architectural design, Urban design, 3D visualization": "Projeto arquitetônico, Desenho urbano, Visualização 3D",
    "Data visualization, Information design, Cartography": "Visualização de dados, Design da informação, Cartografia",
    "Branding, Web design, UI design, Art direction": "Branding, Web design, UI design, Direção de arte",
    "Web design, UI design, Content design": "Web design, UI design, Design de conteúdo",
    "Design leadership, Design systems, Web design": "Liderança de design, Design systems, Web design",
    "UX design, UI design, Web design": "UX design, UI design, Web design",
    "Visual design, Motion design, Prototyping": "Design visual, Motion design, Prototipagem",
    "UI design, Design systems, Digital communication": "UI design, Design systems, Comunicação digital",
    "Web design, UI design, Art direction": "Web design, UI design, Direção de arte",
    "Product design, UI design, Presentation design": "Design de produto, UI design, Design de apresentação",
    "Data storytelling, Data visualization, Interactive design, Motion design": "Narrativa de dados, Visualização de dados, Design interativo, Motion design",
    // case pages — sidebar descriptions
    "Created by Insper's Center for City Studies – Arq.Futuro Lab, the Cidados Portal presents the center's studies and research through data-driven narratives, bringing science closer to the public debate to support evidence-based urban policy.":
      "Criado pelo Centro de Estudos das Cidades – Laboratório Arq.Futuro do Insper, o Portal Cidados apresenta os estudos e pesquisas do centro por meio de narrativas baseadas em dados, aproximando a ciência do debate público para apoiar políticas urbanas baseadas em evidências.",
    "The first Brazilian institute dedicated to turning a career pause into a recognised part of a professional path. Almost two million qualified professionals are out of the job market in Brazil, and the institute works pro bono with them and with the companies that hire them.":
      "O primeiro instituto brasileiro dedicado a transformar a pausa de carreira em parte reconhecida de uma trajetória profissional. Quase 2 milhões de profissionais qualificados estão fora do mercado no Brasil, e o instituto atua pro bono com eles e com as empresas que contratam.",
    "An open-data platform that tracks how Brazil's federal government, states and capitals are doing on the National Digital Government Strategy, with a comparative ranking, indicators for each of its ten objectives and downloadable data from official sources.":
      "Uma plataforma de dados abertos que acompanha o desempenho do governo federal, dos estados e das capitais na Estratégia Nacional de Governo Digital, com ranking comparativo, indicadores para cada um dos dez objetivos e dados para download com fontes oficiais.",
    "A participatory game made for FDTE (Fundação para o Desenvolvimento Tecnológico da Engenharia) and Bahia's state housing plan. Residents pick the cards that show how they live today and the home they want, bringing their own voices into the plan.":
      "Um jogo participativo feito para a FDTE (Fundação para o Desenvolvimento Tecnológico da Engenharia) e o plano estadual de habitação da Bahia. Os moradores escolhem as cartas que mostram como vivem hoje e a casa que desejam, levando a própria voz para o plano.",
    "Rivio is a healthtech using artificial intelligence to transform the financial management of hospitals. The platform automates the entire hospital revenue cycle — from auditing to billing and post-billing — reducing claim denials, increasing operational efficiency and delivering greater financial predictability for healthcare institutions.":
      "Rivio é uma healthtech que utiliza inteligência artificial para transformar a gestão financeira de hospitais. A plataforma automatiza todo o ciclo de receita hospitalar — da auditoria ao faturamento e pós-faturamento — reduzindo glosas, aumentando a eficiência operacional e garantindo maior previsibilidade financeira para as instituições de saúde.",
    // about — three intro paragraphs (each a single text node)
    "Hello, my name is Caio. I'm from Campinas, Brazil, and I graduated in Architecture and Urbanism from the University of São Paulo in 2016. Since then, I have built my career around designing and developing digital products.":
      "Olá, meu nome é Caio. Sou de Campinas, Brasil, e me formei em Arquitetura e Urbanismo pela Universidade de São Paulo em 2016. Desde então, construí minha carreira em torno da concepção e do desenvolvimento de produtos digitais.",
    "I started out in architectural visualization, where I learned how to translate complex ideas into clear and compelling visual experiences. Over time, this evolved into a broader focus on digital product design, combining storytelling, data, and technology to create tools that improve how people interact with information and services.":
      "Comecei na visualização arquitetônica, onde aprendi a traduzir ideias complexas em experiências visuais claras e envolventes. Com o tempo, isso evoluiu para um foco mais amplo em design de produtos digitais, combinando narrativa, dados e tecnologia para criar ferramentas que melhoram a forma como as pessoas interagem com informações e serviços.",
    "I am currently Head of Design at IplanRio, the municipal technology company of Rio de Janeiro City Hall, where I lead a multidisciplinary team of designers, developers, and content creators. My work spans from defining design systems and user experiences to building platforms, apps, dashboards, and data-driven stories that connect citizens with public services.":
      "Atualmente sou Head de Design na IplanRio, a empresa municipal de tecnologia da Prefeitura do Rio de Janeiro, onde lidero um time multidisciplinar de designers, desenvolvedores e criadores de conteúdo. Meu trabalho vai da definição de design systems e experiências do usuário à construção de plataformas, aplicativos, dashboards e histórias baseadas em dados que conectam os cidadãos aos serviços públicos.",
    // about — section headers
    "Experience": "Experiência",
    "Education": "Formação",
    "Special thanks": "Agradecimentos especiais",
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
    "Marisa Rodrigues, Durval Jacintho, Mylenna Linares, João Carabetta, Júnior Magalhães, Pedro Meneghel, Mateus Lana, Fernando Santana, Lucas Tavares, Diego Oliveira, Frederico Zolio, Adriano Borges Costa and Mauricio Bouskela.":
      "Marisa Rodrigues, Durval Jacintho, Mylenna Linares, João Carabetta, Júnior Magalhães, Pedro Meneghel, Mateus Lana, Fernando Santana, Lucas Tavares, Diego Oliveira, Frederico Zolio, Adriano Borges Costa e Mauricio Bouskela."
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

  function fixBrandLink() {
    // Webflow also tags the mobile brand link as a nav toggle (w-nav-button),
    // so tapping "CAIO JACINTHO" opens/closes the menu instead of navigating.
    // Swallow the event before Webflow sees it: the link then behaves as a
    // plain link home, and only the X button toggles the menu.
    function block(e) {
      if (e.target.closest && e.target.closest("a.brand-home.w-nav-button")) e.stopPropagation();
    }
    document.addEventListener("click", block, true);
    document.addEventListener("mousedown", block, true);
    document.addEventListener("touchstart", block, true);
  }

  function init() {
    injectStyle();
    fixBrandLink();
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
