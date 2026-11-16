/* =====================================================================
   preferencias.js — preferências visuais de cada utilizador
   Carregar em todas as páginas (login + módulos):
     <script src="preferencias.js"></script>

   Cada utilizador guarda as suas preferências em "authvault.prefs.v1"
   (por ID de utilizador): tema claro/escuro, fundo (cor ou imagem),
   brilho, tamanho e cor da letra, tipo de letra, cor de destaque e
   transparência dos cartões. Só afetam o utilizador que as alterou.
   O módulo 13_Configuracao.html é o ecrã para as alterar.
   ===================================================================== */
(function () {
  var PK = 'authvault.prefs.v1', SK = 'authvault.session.v3';
  var root = document.documentElement, framed = window.self !== window.top;
  var DEF = { tema: '', fundo: 'nenhum', cor: '', img: '', ajuste: 'cover', brilho: 100, fonte: 100, corTexto: '', destaque: '', familia: 'padrao', cartoes: 0 };
  var FAMILIAS = {
    padrao: '', serifada: "Georgia,'Times New Roman',serif", mono: "'Courier New',Consolas,monospace",
    arredondada: "'Trebuchet MS','Segoe UI',sans-serif", legivel: "Verdana,Geneva,sans-serif"
  };

  /* imagens de fundo incluídas (SVG gerados, sem ficheiros externos) */
  function svg(inner) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">' + inner + '</svg>');
  }
  function grad(id, a, b, c, vert) {
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="' + (vert ? 0 : 1) + '" y2="' + (vert ? 1 : 1) + '"><stop offset="0" stop-color="' + a + '"/>' + (c ? '<stop offset=".55" stop-color="' + b + '"/><stop offset="1" stop-color="' + c + '"/>' : '<stop offset="1" stop-color="' + b + '"/>') + '</linearGradient></defs><rect width="1600" height="900" fill="url(#' + id + ')"/>';
  }
  var stars = ''; for (var i = 0; i < 70; i++) stars += '<circle cx="' + ((i * 137) % 1600) + '" cy="' + ((i * 71) % 560) + '" r="' + (1 + (i % 3) * .8) + '" fill="#fff" opacity="' + (.35 + (i % 5) * .13) + '"/>';
  var trees = ''; for (var j = 0; j < 14; j++) trees += '<polygon points="' + (j * 120 - 40) + ',900 ' + (j * 120 + 20) + ',' + (560 + (j % 3) * 40) + ' ' + (j * 120 + 80) + ',900" fill="#14532d" opacity="' + (.55 + (j % 3) * .15) + '"/>';
  var GALERIA = [
    { id: 'aurora', nome: 'Aurora', url: svg(grad('a', '#0f2027', '#203a43', '#2c5364') + '<ellipse cx="400" cy="300" rx="520" ry="260" fill="#34d399" opacity=".28"/><ellipse cx="1150" cy="420" rx="560" ry="280" fill="#a78bfa" opacity=".30"/>') },
    { id: 'oceano', nome: 'Oceano', url: svg(grad('o', '#0077b6', '#00b4d8', '#caf0f8', true) + '<path d="M0 620 Q400 540 800 620 T1600 620 V900 H0Z" fill="#0369a1" opacity=".55"/><path d="M0 720 Q400 650 800 720 T1600 720 V900 H0Z" fill="#075985" opacity=".7"/>') },
    { id: 'poente', nome: 'Pôr do sol', url: svg(grad('p', '#ff512f', '#f09819', '#ffd194', true) + '<circle cx="1100" cy="560" r="150" fill="#fff7d6" opacity=".9"/><path d="M0 700 Q300 600 600 690 T1200 680 T1600 700 V900 H0Z" fill="#3b0a1f" opacity=".85"/>') },
    { id: 'savana', nome: 'Savana', url: svg(grad('s', '#f6d365', '#fda085', null, true) + '<circle cx="300" cy="260" r="110" fill="#fff3c4" opacity=".9"/><path d="M0 720 Q500 660 900 730 T1600 700 V900 H0Z" fill="#7c4a1e"/><rect x="1180" y="520" width="14" height="190" fill="#3b2410"/><ellipse cx="1187" cy="510" rx="150" ry="38" fill="#3b2410"/>') },
    { id: 'floresta', nome: 'Floresta', url: svg(grad('f', '#134e4a', '#166534', '#bbf7d0', true) + trees) },
    { id: 'noite', nome: 'Noite estrelada', url: svg(grad('n', '#070b1f', '#1b2a5e', null, true) + stars + '<circle cx="1320" cy="170" r="70" fill="#fef9c3"/>') },
    { id: 'montanhas', nome: 'Montanhas', url: svg(grad('m', '#355c7d', '#6c5b7b', '#c06c84', true) + '<polygon points="0,900 380,420 700,900" fill="#2b2d52" opacity=".8"/><polygon points="400,900 900,300 1400,900" fill="#1f2144" opacity=".9"/><polygon points="1000,900 1350,480 1600,900" fill="#2b2d52" opacity=".85"/>') },
    { id: 'geometria', nome: 'Geometria', url: svg('<rect width="1600" height="900" fill="#eef2ff"/><circle cx="260" cy="220" r="190" fill="#c7d2fe"/><circle cx="1340" cy="700" r="260" fill="#ddd6fe"/><rect x="620" y="260" width="360" height="360" rx="40" fill="#fbcfe8" opacity=".7" transform="rotate(18 800 440)"/>') },
    { id: 'claro', nome: 'Minimalista claro', url: svg(grad('c', '#f8fafc', '#e2e8f0')) },
    { id: 'grafite', nome: 'Grafite', url: svg(grad('g', '#1f2937', '#030712')) }
  ];

  function uid() { try { var v = sessionStorage.getItem(SK); return v ? Number(v) : 0; } catch (e) { return 0; } }
  function all() { try { var a = JSON.parse(localStorage.getItem(PK) || '{}'); return a && typeof a === 'object' && !Array.isArray(a) ? a : {}; } catch (e) { return {}; } }
  function get() { var p = all()[uid()] || {}, o = {}, k; for (k in DEF) o[k] = DEF[k]; for (k in p) o[k] = p[k]; return o; }
  function save(a) { try { localStorage.setItem(PK, JSON.stringify(a)); return true; } catch (e) { return false; } }
  function set(patch) {
    var u = uid(); if (!u) return false;
    var a = all(), cur = a[u] || {}, k; for (k in patch) cur[k] = patch[k]; a[u] = cur;
    if (!save(a)) return false;
    apply(); return true;
  }
  function reset() { var u = uid(), a = all(); if (!u) return; delete a[u]; save(a); apply(); }

  function rgba(hex, al) {
    var h = String(hex).replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&');
    var n = parseInt(h, 16); return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + al + ')';
  }
  var applying = false, ready = false, lastT = '';
  var VARS = ['--bg', '--sf', '--tx', '--mu', '--ac', '--ac2', '--fs'];
  function systemTheme() { return window.matchMedia && matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'; }

  function apply() {
    applying = true;
    try {
      var u = uid(), p = get(), st = document.getElementById('pref-style');
      if (!st) { st = document.createElement('style'); st.id = 'pref-style'; (document.head || root).appendChild(st); }
      VARS.forEach(function (v) { root.style.removeProperty(v); });
      if (!u) { /* sem sessão: aspeto normal */
        st.textContent = '';
        try { lastT = localStorage.getItem('tema') || systemTheme(); if (root.dataset.t !== lastT) root.dataset.t = lastT; } catch (e) { /* ignora */ }
        return;
      }
      var t = p.tema || systemTheme(); lastT = t; if (root.dataset.t !== t) root.dataset.t = t;
      var css = '';
      if (p.fonte && +p.fonte !== 100) root.style.setProperty('--fs', String(p.fonte / 100));
      if (p.corTexto) { root.style.setProperty('--tx', p.corTexto); root.style.setProperty('--mu', rgba(p.corTexto, .65)); }
      if (p.destaque) { root.style.setProperty('--ac', p.destaque); root.style.setProperty('--ac2', rgba(p.destaque, t === 'dark' ? .22 : .13)); }
      if (+p.cartoes > 0) root.style.setProperty('--sf', rgba(t === 'dark' ? '#131b2e' : '#ffffff', 1 - p.cartoes / 100));
      if (p.fundo === 'cor' && p.cor) root.style.setProperty('--bg', p.cor);
      if (p.fundo === 'img' && p.img) {
        css += 'body{background-image:url("' + String(p.img).replace(/"/g, '%22') + '")!important;' +
          (p.ajuste === 'repetir' ? 'background-size:auto;background-repeat:repeat;' : 'background-size:cover;background-repeat:no-repeat;') +
          'background-position:center;background-attachment:fixed}';
      }
      if (FAMILIAS[p.familia]) css += 'html body,body button,body input,body select,body textarea{font-family:' + FAMILIAS[p.familia] + '!important}';
      /* brilho: película por cima da página (só na janela principal, para não contar duas vezes) */
      if (!framed && +p.brilho !== 100) {
        var b = +p.brilho, bg = b < 100 ? 'rgba(0,0,0,' + ((100 - b) / 100 * .8).toFixed(3) + ')' : 'rgba(255,255,255,' + ((b - 100) / 100 * .8).toFixed(3) + ')';
        css += 'html::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:2147483647;background:' + bg + '}';
      }
      st.textContent = css;
    } finally { applying = false; }
  }

  /* o utilizador mudou o tema com o botão Claro/Escuro de qualquer página → guarda só para ele */
  try {
    new MutationObserver(function () {
      if (!ready || applying || !uid()) return;
      var t = root.dataset.t;
      if (t === lastT) return;                       /* mudança feita por apply(), não pelo utilizador */
      if (t === 'dark' || t === 'light') set({ tema: t });
    }).observe(root, { attributes: true, attributeFilter: ['data-t'] });
  } catch (e) { /* ignora */ }

  window.addEventListener('storage', function (e) { if (e.key === PK) apply(); });
  window.addEventListener('load', function () { apply(); setTimeout(function () { ready = true; }, 0); });
  document.addEventListener('DOMContentLoaded', apply);
  apply();

  /* utilizador com sessão iniciada (nome usado em históricos e vendas) */
  function who() {
    var id = uid(); if (!id) return null;
    try {
      var U = JSON.parse(localStorage.getItem('authvault.users.v3') || '[]');
      var u = U.find(function (x) { return x.id === id; });
      return u ? { id: u.id, name: u.name, role: u.role, company: u.company } : null;
    } catch (e) { return null; }
  }
  window.__who = who;

  window.__prefs = { uid: uid, get: get, set: set, reset: reset, apply: apply, DEF: DEF, GALERIA: GALERIA, FAMILIAS: FAMILIAS };
})();
