/* =====================================================================
   modais.js — botão X (fechar) em todas as janelas (modals)
   Carregar em todas as páginas:  <script src="modais.js"></script>
   ===================================================================== */
(function () {
  var st = document.createElement('style');
  st.textContent = '.md .xclose{position:absolute;top:10px;right:12px;width:34px;height:34px;padding:0;border:0;border-radius:50%;' +
    'background:transparent;color:inherit;font:400 26px/1 sans-serif;cursor:pointer;opacity:.7;z-index:3;display:grid;place-items:center}' +
    '.md .xclose:hover{opacity:1;background:rgba(127,127,127,.2)}.md>h2:first-of-type{padding-right:38px}' +
    '.md>.x{display:none!important}.md>.x~h2{padding-left:0!important}';
  (document.head || document.documentElement).appendChild(st);

  function fechar(ov) {
    if (ov.id === 'ed' && typeof window.cancelEd === 'function') { window.cancelEd(); return; }   /* pergunta antes de descartar */
    var own = ov.querySelector('.md > .x');                                  
    if (own) { own.click(); return; }
    ov.classList.remove('on'); ov.classList.remove('open');
  }
  function addX(md) {
    if (md.querySelector(':scope > .xclose')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'xclose'; b.setAttribute('aria-label', 'Fechar'); b.title = 'Fechar'; b.textContent = '\u00d7';
    b.onclick = function (e) { e.preventDefault(); e.stopPropagation(); var ov = md.closest('.ov'); if (ov) fechar(ov); };
    md.insertBefore(b, md.firstChild);
  }
  var pend = false;
  function scan() { pend = false; document.querySelectorAll('.ov .md').forEach(addX); }
  function agenda() { if (!pend) { pend = true; (window.requestAnimationFrame || setTimeout)(scan); } }
  new MutationObserver(agenda).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', scan);
  scan();
})();
