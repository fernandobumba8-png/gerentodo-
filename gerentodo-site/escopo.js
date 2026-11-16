/* =====================================================================
   escopo.js (v3) — separa os dados de cada empresa
   Carregar como PRIMEIRO script de cada módulo (1 a 9):
     <script src="escopo.js"></script>

   Todo o localStorage que o módulo usa (produtos, clientes, documentos,
   fornecedores, vitrine…) passa a ter o prefixo "e<ID da empresa>:".
   Assim cada empresa tem a sua própria base de dados, independente.

   Cobre:  getItem / setItem / removeItem / clear e o evento "storage".
           (O código dos módulos usa getItem/setItem; o localStorage continua
           a ser o objeto original do navegador, para máxima compatibilidade.)
   Fora do escopo ficam: "tema" e todas as chaves "authvault.*"
   (utilizadores, empresas, sessão, histórico).
   Sem empresa (conta principal do sistema) nada muda: usa os dados antigos.
   A empresa vem da sessão do separador ou do endereço (?e=ID), que é como
   a vitrine aberta num novo separador sabe de que empresa é.
   ===================================================================== */
(function () {
  try {
    var KEY = 'authvault.empresa.v1';
    var S = window.sessionStorage;
    var q = new URLSearchParams(location.search).get('e');
    if (q && /^\d+$/.test(q)) S.setItem(KEY, q);
    var id = S.getItem(KEY) || '';
    window.__empresa = id;
    if (!id) return;

    var real = window.localStorage, pre = 'e' + id + ':';
    var own = function (k) { k = String(k); return k === 'tema' || k.indexOf('authvault.') === 0; };

    /* Altera só os métodos do Storage: localStorage continua a ser o objeto original do navegador,
       por isso é compatível com qualquer código (incluindo faturacao-core.js). */
    var P = Storage.prototype, g = P.getItem, s = P.setItem, d = P.removeItem, c = P.clear;
    var mine = function (o) { return o === real; };
    P.getItem = function (k) { return mine(this) && !own(k) ? g.call(this, pre + k) : g.call(this, k); };
    P.setItem = function (k, v) { return mine(this) && !own(k) ? s.call(this, pre + k, v) : s.call(this, k, v); };
    P.removeItem = function (k) { return mine(this) && !own(k) ? d.call(this, pre + k) : d.call(this, k); };
    /* clear() só apaga os dados desta empresa, nunca os das outras nem os utilizadores */
    P.clear = function () {
      if (!mine(this)) return c.call(this);
      var del = [], i, k;
      for (i = 0; i < this.length; i++) { k = this.key(i); if (k && k.indexOf(pre) === 0) del.push(k); }
      del.forEach(function (x) { d.call(real, x); });
    };

    /* eventos "storage": ignora os de outras empresas e mostra a chave sem prefixo */
    window.addEventListener('storage', function (e) {
      var k = e.key;
      if (k === null || own(k)) return;
      if (k.indexOf(pre) === 0) { try { Object.defineProperty(e, 'key', { value: k.slice(pre.length) }); } catch (x) { /* ignora */ } return; }
      e.stopImmediatePropagation();
    }, true);
  } catch (e) { /* sem escopo: usa os dados gerais */ }
})();
