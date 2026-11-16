/* =====================================================================
   filtros.js — no telemóvel e no tablet (largura até 1024 px) as barras de
   filtros (.filters) ficam assim: o campo de pesquisa com o botão de filtros
   DENTRO dele, e ao lado um botão só com ícone para limpar os filtros. O botão
   de filtros abre uma janela com todos os outros filtros. No computador a
   barra fica como era. Não mexe nos ids nem nos eventos dos módulos.
   Para usar sempre (também no computador), troque 1024 por 99999.
   <div class="filters" data-sf="off">     -> não altera esta barra
   <div class="filters" data-sf="always">  -> usa sempre o botão (qualquer largura)
   ===================================================================== */
(function () {
  if (window.__filtros) return; window.__filtros = 1;
  var MQ = window.matchMedia('(max-width:1024px)');
  var SVG = function (d) { return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var ICON = SVG('<path d="M4 6h16M7 12h10M10 18h4"/>');
  var ICON_X = SVG('<path d="M3 5h13l-5 6v6l-3 2v-8L3 5z"/><path d="M16.5 14.5l5 5M21.5 14.5l-5 5"/>');
  var st = document.createElement('style');
  st.textContent =
    '.filters.sf-on{display:flex;align-items:center;gap:8px}.filters.sf-on .sfw{flex:1}' +
    '.sfw{position:relative;grid-column:1/-1;min-width:0}.sfw>input{width:100%;padding-right:78px!important}' +
    '.sfb{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 10px;border-radius:10px;border:1px solid var(--bd);background:var(--sf);color:var(--tx);font:inherit;font-size:13px;font-weight:600;cursor:pointer}' +
    '.sfw .sfb{position:absolute;right:5px;top:50%;transform:translateY(-50%)}.sfb.solo{flex:1;justify-content:center}' +
    '.sfx{flex:none;width:44px;height:44px;padding:0;display:inline-grid;place-items:center;border-radius:12px;border:1px solid var(--bd);background:var(--sf);color:var(--tx);cursor:pointer}' +
    '.sfn[hidden]{display:none}.sfn{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:var(--ac);color:#fff;font-size:11px}' +
    '.sfmd{max-width:480px;width:100%}.sfm .sff{margin-bottom:12px}.sfm .sl{display:block;font-size:12.5px;color:var(--mu);margin:0 0 4px}' +
    '.sfm select,.sfm input:not([type=checkbox]):not([type=radio]){width:100%}.sfov .acts{display:flex;justify-content:flex-end;gap:8px}';
  (document.head || document.documentElement).appendChild(st);

  var regs = [];
  var isSearch = function (el) { return el.tagName === 'INPUT' && /^(text|search|)$/.test((el.getAttribute('type') || '').toLowerCase()); };
  var isClear = function (el) { return el.tagName === 'BUTTON' && /limpar/i.test(el.textContent + ' ' + (el.title || '')); };
  var ctrl = function (el) { return el.tagName === 'LABEL' ? el.querySelector('input,select') : el; };
  var want = function (o) { return MQ.matches || o.bar.getAttribute('data-sf') === 'always'; };

  function labelOf(el, o) {
    var t = el.getAttribute('aria-label') || el.title || el.placeholder || '';
    if (!t && el.tagName === 'SELECT' && el.options.length && el.options[0].value === '') t = el.options[0].textContent;
    if (!t && el.type === 'date') { o.d = (o.d || 0) + 1; t = o.d === 1 ? 'Data inicial' : 'Data final'; }
    return t || 'Filtro';
  }
  function count(o) {
    var n = 0;
    o.orig.forEach(function (el) {
      if (el === o.search || el.tagName === 'BUTTON') return;
      var c = ctrl(el); if (!c) return;
      if (c.type === 'checkbox' || c.type === 'radio') { if (c.checked) n++; }
      else if (c.tagName === 'SELECT') { if (c.selectedIndex > 0 && c.value !== '') n++; }
      else if (String(c.value || '').trim() !== '') n++;
    });
    return n;
  }
  function refresh() {
    regs.forEach(function (o) {
      if (!o.compact || !o.badge) return;
      var n = count(o); o.badge.textContent = n; o.badge.hidden = !n;
    });
  }
  function fire(el, t) { el.dispatchEvent(new Event(t, { bubbles: true })); }
  function limparTudo(o) {
    o.orig.forEach(function (el) {
      if (el.tagName === 'BUTTON') return;
      var c = ctrl(el); if (!c) return;
      if (c.type === 'checkbox' || c.type === 'radio') { c.checked = false; fire(c, 'change'); }
      else if (c.tagName === 'SELECT') { c.selectedIndex = 0; fire(c, 'change'); }
      else { c.value = ''; fire(c, 'input'); fire(c, 'change'); }
    });
    refresh();
  }
  function abrir(o) {
    o.d = 0;
    o.body.querySelectorAll('.sff[data-lb]').forEach(function (f) {
      var c = f.querySelector('select,input'); f.querySelector('.sl').textContent = labelOf(c, o);
    });
    o.ov.classList.add('on');
  }
  function enter(o) {
    if (o.compact) return; o.compact = true;
    var bar = o.bar;
    bar.classList.add('sf-on');
    var ov = document.createElement('div'); ov.className = 'ov sfov';
    ov.innerHTML = '<div class="md sfmd" role="dialog" aria-modal="true" aria-label="Filtros"><h2>Filtros</h2><div class="sfm"></div><div class="acts"><button type="button" class="btn p sfok">Aplicar</button></div></div>';
    document.body.appendChild(ov);
    o.ov = ov; o.body = ov.querySelector('.sfm');
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) ov.classList.remove('on'); });
    ov.querySelector('.sfok').onclick = function () { ov.classList.remove('on'); refresh(); };
    ov.addEventListener('click', function () { setTimeout(refresh, 60); });
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'sfb'; btn.setAttribute('aria-label', 'Filtros');
    btn.innerHTML = ICON + (o.search ? '' : '<span>Filtros</span>') + '<span class="sfn" hidden></span>';
    o.btn = btn; o.badge = btn.querySelector('.sfn');
    btn.onclick = function () { abrir(o); };
    if (o.search) {
      var w = document.createElement('div'); w.className = 'sfw';
      bar.insertBefore(w, o.search); w.appendChild(o.search); w.appendChild(btn); o.wrap = w;
    } else { btn.className += ' solo'; bar.insertBefore(btn, bar.firstChild); }
    /* botão de limpar: só ícone, ao lado do campo de pesquisa */
    var clr = o.orig.filter(isClear)[0];
    if (clr) { o.clrSave = { h: clr.innerHTML, c: clr.className, t: clr.title }; }
    else { clr = document.createElement('button'); clr.type = 'button'; clr.onclick = function () { limparTudo(o); }; o.syn = clr; }
    clr.innerHTML = ICON_X; clr.className = 'sfx'; clr.title = 'Limpar filtros'; clr.setAttribute('aria-label', 'Limpar filtros');
    bar.appendChild(clr); o.clr = clr;
    clr.addEventListener('click', o.clrH = function () { setTimeout(refresh, 80); });
    o.orig.forEach(function (el) {
      if (el === o.search || el === clr) return;
      if (el.tagName === 'BUTTON') { o.body.appendChild(el); return; }
      var f = document.createElement('div'); f.className = 'sff';
      if (el.tagName !== 'LABEL') { f.setAttribute('data-lb', '1'); var l = document.createElement('label'); l.className = 'sl'; if (el.id) l.htmlFor = el.id; f.appendChild(l); }
      f.appendChild(el); o.body.appendChild(f);
    });
    refresh();
  }
  function exit(o) {
    if (!o.compact) return; o.compact = false;
    o.orig.forEach(function (el) { o.bar.appendChild(el); });
    if (o.clrSave && o.clr) { o.clr.innerHTML = o.clrSave.h; o.clr.className = o.clrSave.c; o.clr.title = o.clrSave.t; o.clr.removeAttribute('aria-label'); }
    if (o.clr && o.clrH) o.clr.removeEventListener('click', o.clrH);
    if (o.syn) o.syn.remove();
    if (o.wrap) o.wrap.remove();
    if (o.btn && o.btn.parentNode) o.btn.remove();
    if (o.ov) o.ov.remove();
    o.bar.classList.remove('sf-on');
    o.wrap = o.btn = o.badge = o.ov = o.body = o.syn = o.clr = o.clrSave = null;
  }
  function scan() {
    document.querySelectorAll('.filters').forEach(function (b) {
      if (b.__sf || b.getAttribute('data-sf') === 'off') return;
      b.__sf = 1;
      var orig = [].slice.call(b.children), o = { bar: b, orig: orig, search: orig.filter(isSearch)[0] || null, compact: false };
      regs.push(o); if (want(o)) enter(o);
    });
    /* barras que o módulo deitou fora (ex.: vitrine) levam consigo a janela */
    regs = regs.filter(function (o) { if (o.bar.isConnected) return true; if (o.ov) o.ov.remove(); return false; });
  }
  var pend = 0;
  function agenda() { if (pend) return; pend = 1; (window.requestAnimationFrame || setTimeout)(function () { pend = 0; scan(); }); }
  new MutationObserver(agenda).observe(document.documentElement, { childList: true, subtree: true });
  var onMQ = function () { regs.forEach(function (o) { want(o) ? enter(o) : exit(o); }); };
  if (MQ.addEventListener) MQ.addEventListener('change', onMQ); else MQ.addListener(onMQ);
  document.addEventListener('input', function () { setTimeout(refresh, 0); }, true);
  document.addEventListener('change', function () { setTimeout(refresh, 0); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') document.querySelectorAll('.sfov.on').forEach(function (x) { x.classList.remove('on'); }); });
  setInterval(refresh, 900);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
})();
