/* =====================================================================
   senha.js — campos de senha mais práticos (entrar, criar conta, recuperar):
   - botão "olho" dentro do campo para mostrar/ocultar a senha     [data-pw]
   - barra que mostra se a senha é segura                          [data-forca]
   - barra que mostra se a confirmação é igual à senha             [data-conf="id da senha"]
   - não deixa copiar, cortar, colar nem arrastar texto no campo   [data-nocopy]
   ===================================================================== */
(function () {
  var st = document.createElement('style');
  st.textContent =
    '.pwf{position:relative;display:block}.pwf>input{width:100%;padding-right:44px!important}' +
    '.pwe{position:absolute;right:4px;top:50%;transform:translateY(-50%);width:38px;height:38px;padding:0;border:0;border-radius:10px;background:transparent;color:var(--mu);display:grid;place-items:center;cursor:pointer}' +
    '.pwe:hover{color:var(--tx)}' +
    '.pwb{display:flex;gap:4px;margin:6px 0 2px}.pwb i{flex:1;height:5px;border-radius:99px;background:var(--bd);transition:background .2s}' +
    '.pwm{height:5px;border-radius:99px;background:var(--bd);margin:6px 0 2px;transition:background .2s}' +
    '.pwt{font-size:12.5px;margin:0 0 6px;color:var(--mu)}';
  (document.head || document.documentElement).appendChild(st);
  var EYE = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10.5 7 10.5 7a17 17 0 0 1-3.2 3.9M6.5 6.6C3.4 8.5 1.5 12 1.5 12S5.5 19 12 19c1.6 0 3-.4 4.3-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
  var forca = function (p) {
    var n = [p.length >= 10, /[A-Z]/.test(p), /[a-z]/.test(p), /\d/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
    return n;
  };
  var NIV = [['Muito fraca', '#e11d48'], ['Muito fraca', '#e11d48'], ['Fraca', '#e11d48'], ['Razoável', '#d97706'], ['Boa, falta um requisito', '#2563eb'], ['Segura ✓', '#059669']];

  function enhance(inp) {
    if (inp.__pw) return; inp.__pw = 1;
    var w = document.createElement('span'); w.className = 'pwf';
    inp.parentNode.insertBefore(w, inp); w.appendChild(inp);
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pwe'; b.innerHTML = EYE;
    b.setAttribute('aria-label', 'Mostrar senha'); b.title = 'Mostrar senha';
    b.onclick = function () {
      var show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      b.innerHTML = show ? EYE_OFF : EYE; b.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha'); b.title = b.getAttribute('aria-label');
      inp.focus();
    };
    w.appendChild(b);
    if (inp.hasAttribute('data-nocopy')) {
      ['copy', 'cut', 'paste', 'drop', 'dragstart', 'contextmenu'].forEach(function (ev) { inp.addEventListener(ev, function (e) { e.preventDefault(); }); });
      inp.addEventListener('keydown', function (e) {
        var k = String(e.key).toLowerCase();
        if (((e.ctrlKey || e.metaKey) && (k === 'v' || k === 'c' || k === 'x' || k === 'insert')) || (e.shiftKey && k === 'insert')) e.preventDefault();
      });
      inp.setAttribute('autocomplete', 'new-password');
    }
    if (inp.hasAttribute('data-forca')) {
      var box = document.createElement('div');
      box.innerHTML = '<div class="pwb"><i></i><i></i><i></i><i></i><i></i></div><div class="pwt">Mín. 10 caracteres, com maiúscula, minúscula, número e símbolo.</div>';
      w.parentNode.insertBefore(box, w.nextSibling);
      var up = function () {
        var p = inp.value, n = forca(p), bars = box.querySelectorAll('i'), t = box.querySelector('.pwt');
        bars.forEach(function (x, i) { x.style.background = p && i < n ? NIV[n][1] : ''; });
        t.textContent = p ? 'Segurança da senha: ' + NIV[n][0] : 'Mín. 10 caracteres, com maiúscula, minúscula, número e símbolo.';
        t.style.color = p ? NIV[n][1] : '';
      };
      inp.addEventListener('input', up); inp.__up = up;
    }
    if (inp.hasAttribute('data-conf')) {
      var cb = document.createElement('div');
      cb.innerHTML = '<div class="pwm"></div><div class="pwt">Repita a senha para confirmar.</div>';
      w.parentNode.insertBefore(cb, w.nextSibling);
      var upc = function () {
        var o = document.getElementById(inp.getAttribute('data-conf')), a = o ? o.value : '', c = inp.value, bar = cb.querySelector('.pwm'), t = cb.querySelector('.pwt');
        if (!c) { bar.style.background = ''; t.textContent = 'Repita a senha para confirmar.'; t.style.color = ''; return; }
        var ok = c === a;
        bar.style.background = ok ? '#059669' : '#e11d48'; t.textContent = ok ? 'As senhas coincidem ✓' : 'As senhas não coincidem'; t.style.color = ok ? '#059669' : '#e11d48';
      };
      inp.addEventListener('input', upc);
      var o2 = document.getElementById(inp.getAttribute('data-conf')); if (o2) o2.addEventListener('input', upc);
      inp.__up = upc;
    }
    var f = inp.form;
    if (f && !f.__pwr) { f.__pwr = 1; f.addEventListener('reset', function () { setTimeout(function () { f.querySelectorAll('input[data-pw]').forEach(function (x) { x.type = 'password'; if (x.__up) x.__up(); }); }, 0); }); }
  }
  function init() { document.querySelectorAll('input[data-pw]').forEach(enhance); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
