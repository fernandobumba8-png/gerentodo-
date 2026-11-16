/* =====================================================================
   pacotes.js — catálogo de pacotes e limites de módulos de cada um.
   Usado pelo módulo 18_Pacotes.html (escolha do pacote) e por conta-app.js
   (que mostra só os módulos permitidos pelo pacote escolhido).
   ===================================================================== */
window.PACOTES = (function () {
  var BASE = ['produtos', 'departamentos', 'clientes', 'fornecedores', 'faturacao', 'documentos', 'gastos'];
  var CATS = {
    fat: { nome: 'Faturação', icone: '🧾', trial: 30, mods: BASE,
      desc: 'Emita faturas e recibos, controle o stock e acompanhe clientes, fornecedores e gastos.',
      recursos: ['Faturas, recibos, proformas e notas de crédito', 'Produtos, categorias e stock', 'Clientes e fornecedores', 'Documentos e gastos', 'Equipa com vários utilizadores'] },
    onl: { nome: 'Faturação e venda online', icone: '🛒', trial: 30, mods: BASE.concat(['vitrinegerir', 'vitrinecompra']),
      desc: 'Tudo da faturação, mais uma vitrine online para os clientes verem e encomendarem os seus produtos.',
      recursos: ['Tudo do pacote Faturação', 'Vitrine online de produtos', 'Encomendas dos clientes ligadas ao stock', 'Área de compra para clientes'] },
    hos: { nome: 'Gestão hospitalar / clínica', icone: '🏥', trial: 60, mods: BASE, breve: true,
      desc: 'Para hospitais e clínicas: faturação e gestão do dia a dia da unidade de saúde.',
      recursos: ['Tudo do pacote Faturação', 'Módulo clínico (pacientes e consultas) — em preparação'] },
    esc: { nome: 'Gestão escolar', icone: '🎓', trial: 60, mods: BASE, breve: true,
      desc: 'Para escolas e centros de formação: faturação e gestão administrativa.',
      recursos: ['Tudo do pacote Faturação', 'Módulo escolar (alunos e turmas) — em preparação'] }
  };
  /* as chaves 1m / 6m / 1a são as mesmas do módulo Pagamento */
  var CICLOS = { '1m': { nome: 'Mensal', un: 'mês', meses: 1 }, '6m': { nome: 'Semestral', un: 'semestre', meses: 6 }, '1a': { nome: 'Anual', un: 'ano', meses: 12 } };
  var PRECOS = {
    fat: { '1m': 4000, '6m': 15000, '1a': 25000 },
    onl: { '1m': 6500, '6m': 20000, '1a': 35000 },
    hos: { '6m': 30000, '1a': 50000 },
    esc: { '6m': 20000, '1a': 34000 }
  };
  var lista = [];
  Object.keys(CATS).forEach(function (cat) {
    Object.keys(PRECOS[cat]).forEach(function (ciclo, i) {
      var p = PRECOS[cat][ciclo], c = CICLOS[ciclo], mensal = PRECOS[cat]['1m'], sem = PRECOS[cat]['6m'];
      var ref = ciclo === '6m' && mensal ? mensal * 6 : ciclo === '1a' ? (mensal ? mensal * 12 : sem ? sem * 2 : 0) : 0;   /* quanto custaria pagando no ciclo menor */
      lista.push({
        id: cat + '-' + ciclo, cat: cat, ciclo: ciclo, n: i + 1, nome: 'Pacote ' + (i + 1),
        catNome: CATS[cat].nome, cicloNome: c.nome, un: c.un, valor: p, trial: CATS[cat].trial,
        porMes: Math.round(p / c.meses), poupa: ref > p ? Math.round((1 - p / ref) * 100) : 0
      });
    });
  });

  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var kz = function (v) { return String(Math.round(Number(v) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' Kz'; };

  /* ---------- desenho dos cards (partilhado pela página pública e pelo módulo) ---------- */
  var CSS = '.pkroot{--pk-ac:var(--ac);--pk-on:#fff;--pk-sf:var(--sf);--pk-bd:var(--bd);--pk-tx:var(--tx);--pk-mu:var(--mu);--pk-soft:var(--ac2)}' +
    '.pk-chips{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 6px}' +
    '.pk-chips button{padding:8px 16px;border-radius:999px;border:1px solid var(--pk-bd);background:var(--pk-sf);color:var(--pk-tx);font:inherit;font-weight:600;cursor:pointer}' +
    '.pk-chips button.on{background:var(--pk-ac);color:var(--pk-on);border-color:var(--pk-ac)}' +
    '.pk-cat{margin:26px 0 12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;color:var(--pk-tx)}' +
    '.pk-cat .pk-ico{font-size:30px;line-height:1}.pk-cat h3{margin:0;font-size:19px}.pk-cat p{margin:2px 0 0;color:var(--pk-mu);font-size:14px}' +
    '.pk-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}.pk-grid.n2{max-width:760px}' +
    '.pk{position:relative;display:flex;flex-direction:column;border:1px solid var(--pk-bd);border-radius:18px;background:var(--pk-sf);color:var(--pk-tx);overflow:hidden;transition:transform .18s,box-shadow .18s;text-align:left}' +
    '.pk:hover{transform:translateY(-4px);box-shadow:0 14px 30px rgba(0,0,0,.16)}.pk.cur{border-color:var(--pk-ac);box-shadow:0 0 0 2px var(--pk-ac)}' +
    '.pk-top{padding:16px 18px 18px;color:var(--pk-on);background:var(--pk-ac) linear-gradient(135deg,rgba(255,255,255,.22),rgba(0,0,0,.22))}' +
    '.pk-nm{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;opacity:.95}' +
    '.pk-cy{font-size:20px;font-weight:800;margin:6px 0 2px}.pk-pr{font-size:32px;font-weight:800;line-height:1.1}' +
    '.pk-pr small{display:block;font-size:13px;font-weight:600;opacity:.9;margin-top:2px}.pk-eq{font-size:12.5px;opacity:.92;margin-top:2px}' +
    '.pk-tag{font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.25);text-transform:none;letter-spacing:0}' +
    '.pk-save{font-size:12px;font-weight:700;background:rgba(0,0,0,.28);padding:3px 9px;border-radius:999px}' +
    '.pk-body{padding:14px 18px 18px;display:flex;flex-direction:column;gap:12px;flex:1}' +
    '.pk-free{display:inline-flex;align-items:center;gap:6px;align-self:flex-start;padding:6px 12px;border-radius:999px;background:var(--pk-soft);color:var(--pk-ac);font-weight:700;font-size:13px}' +
    '.pk ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px;font-size:13.5px}.pk li{display:flex;gap:8px;align-items:flex-start}' +
    '.pk li::before{content:"\\2713";color:var(--pk-ac);font-weight:800}.pk li.soon{color:var(--pk-mu)}.pk li.soon::before{content:"\\2026";color:var(--pk-mu)}' +
    '.pk-go{margin-top:auto}.pk-go button{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--pk-ac);background:var(--pk-ac);color:var(--pk-on);font:inherit;font-weight:700;cursor:pointer}' +
    '.pk-go button:disabled{background:transparent;color:var(--pk-mu);border-color:var(--pk-bd);cursor:default}';
  function injetarCss() {
    if (document.getElementById('pk-css')) return;
    var st = document.createElement('style'); st.id = 'pk-css'; st.textContent = CSS; (document.head || document.documentElement).appendChild(st);
  }
  function cardHTML(p, atualId, fn) {
    var cur = atualId === p.id, c = CATS[p.cat];
    var popular = p.ciclo === '6m' && PRECOS[p.cat]['1m'], melhor = p.ciclo === '1a';
    var tag = cur ? '<span class="pk-tag">Pacote atual</span>' : popular ? '<span class="pk-tag">Mais popular</span>' : melhor ? '<span class="pk-tag">Melhor valor</span>' : '';
    return '<article class="pk' + (cur ? ' cur' : '') + '"><div class="pk-top"><div class="pk-nm"><span>' + p.nome + '</span>' + tag + '</div>' +
      '<div class="pk-cy">' + p.cicloNome + '</div><div class="pk-pr">' + kz(p.valor) + ' <small>/ ' + p.un + '</small></div>' +
      '<div class="pk-eq">' + (p.ciclo === '1m' ? 'Pagamento todos os meses' : 'Equivale a ' + kz(p.porMes) + ' por mês') + (p.poupa ? ' · <span class="pk-save">Poupa ' + p.poupa + '%</span>' : '') + '</div></div>' +
      '<div class="pk-body"><span class="pk-free">🎁 Primeiros ' + p.trial + ' dias grátis</span><ul>' +
      c.recursos.map(function (r) { return '<li class="' + (/preparação/.test(r) ? 'soon' : '') + '">' + esc(r) + '</li>'; }).join('') + '</ul>' +
      '<div class="pk-go"><button type="button"' + (cur ? ' disabled' : '') + ' onclick="' + fn + '(\'' + p.id + '\')">' + (cur ? 'Pacote em uso' : 'Escolher este pacote') + '</button></div></div></article>';
  }
  /* chips + secções de todos os pacotes; "fn" é o nome da função global chamada ao escolher, "filtrarFn" a do filtro */
  function secoesHTML(filtro, atualId, fn, filtrarFn) {
    var chips = [['', 'Todos']].concat(Object.keys(CATS).map(function (k) { return [k, CATS[k].nome]; })).map(function (x) {
      return '<button type="button" class="' + (filtro === x[0] ? 'on' : '') + '" onclick="' + filtrarFn + '(\'' + x[0] + '\')">' + esc(x[1]) + '</button>';
    }).join('');
    var secs = Object.keys(CATS).filter(function (k) { return !filtro || filtro === k; }).map(function (k) {
      var c = CATS[k], ps = lista.filter(function (p) { return p.cat === k; });
      return '<section><div class="pk-cat"><span class="pk-ico">' + c.icone + '</span><div><h3>' + esc(c.nome) + '</h3><p>' + esc(c.desc) + '</p></div></div><div class="pk-grid' + (ps.length < 3 ? ' n2' : '') + '">' + ps.map(function (p) { return cardHTML(p, atualId, fn); }).join('') + '</div></section>';
    }).join('');
    return '<div class="pk-chips">' + chips + '</div>' + secs;
  }
  /* aplica o pacote à empresa; o período grátis só é dado na primeira escolha */
  function aplicar(c, p) {
    var primeira = !c.pacote, agora = new Date();
    c.pacote = { id: p.id, cat: p.cat, catNome: p.catNome, nome: p.nome, ciclo: p.ciclo, cicloNome: p.cicloNome, un: p.un, valor: p.valor, trialDias: p.trial,
      titulo: p.catNome + ' · ' + p.cicloNome, ciclos: PRECOS[p.cat], escolhidoEm: agora.toISOString() };
    if (primeira) { c.plano = 'gratis'; c.valor = 0; c.inicio = agora.toISOString(); c.fim = new Date(agora.getTime() + p.trial * 864e5).toISOString(); }
    return primeira;
  }
  return {
    CATS: CATS, CICLOS: CICLOS, PRECOS: PRECOS, lista: lista, kz: kz, esc: esc, injetarCss: injetarCss, cardHTML: cardHTML, secoesHTML: secoesHTML, aplicar: aplicar,
    get: function (id) { return lista.filter(function (x) { return x.id === id; })[0] || null; },
    limite: function (cat) { return CATS[cat] ? CATS[cat].mods : null; }
  };
})();
