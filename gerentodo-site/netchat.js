/* =====================================================================
   netchat.js — VERSÃO MÍNIMA (reconstruída)
   Fornece o objeto global "NC" usado por conta-app.js e 15_NetChat.html.

   O que funciona:
   - conversas de texto (e anexos pequenos) entre colegas da mesma empresa
   - contactos, ocultar, bloquear e permissões de ficheiro/áudio/vídeo
   - reações, mensagens não lidas e contador no botão 💬 da conta
   O que NÃO está nesta versão: reuniões e acordos oficiais (as funções
   existem, mas respondem "não disponível nesta versão").

   Aviso: os dados ficam no localStorage deste navegador. Só há conversa
   entre utilizadores que usam o mesmo navegador (não há servidor).
   ===================================================================== */
(function () {
  var KEY = 'authvault.netchat.v1';
  var K_USERS = 'authvault.users.v3';
  var K_SESSION = 'authvault.session.v3';
  var DIA = 864e5;
  var NAO = 'Não disponível nesta versão.';

  var listeners = [];
  var vigia = null;      /* { timer, cfg, ultimoN } */
  var iniciado = false;

  /* ---------- armazenamento ---------- */
  function ler() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!d || typeof d !== 'object') d = {};
      if (!Array.isArray(d.msgs)) d.msgs = [];
      if (!d.rules || typeof d.rules !== 'object') d.rules = {};
      return d;
    } catch (e) { return { msgs: [], rules: {} }; }
  }
  function gravar(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); }
    catch (e) { return false; }
    emitir();
    return true;
  }
  function emitir() {
    listeners.slice().forEach(function (f) { try { f(); } catch (e) { /* ignora */ } });
    sondar();
  }
  function regras(d, uid) {
    var r = d.rules[uid];
    if (!r) r = d.rules[uid] = {};
    if (!Array.isArray(r.bloq)) r.bloq = [];
    if (!Array.isArray(r.oculto)) r.oculto = [];
    if (!Array.isArray(r.ocultarDe)) r.ocultarDe = [];
    if (!r.perm || typeof r.perm !== 'object') r.perm = {};
    return r;
  }

  /* ---------- utilizadores ---------- */
  function utilizadores() {
    try { var u = JSON.parse(localStorage.getItem(K_USERS) || '[]'); return Array.isArray(u) ? u : []; }
    catch (e) { return []; }
  }
  function me() {
    var id = Number(sessionStorage.getItem(K_SESSION));
    if (!id) return null;
    return utilizadores().filter(function (u) { return u.id === id && u.status === 'Ativo'; })[0] || null;
  }
  function nomeDe(id) {
    var u = utilizadores().filter(function (x) { return x.id === id; })[0];
    return u ? u.name : 'Utilizador ' + id;
  }
  function colegas() {
    var eu = me();
    if (!eu) return [];
    return utilizadores().filter(function (u) {
      return u.id !== eu.id && u.status === 'Ativo' && u.companyId === eu.companyId;
    });
  }

  /* ---------- formatação ---------- */
  function fmt(ts) {
    var d = new Date(ts || Date.now());
    var hoje = new Date();
    var hora = d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    return d.toDateString() === hoje.toDateString() ? hora : d.toLocaleDateString('pt-PT') + ' ' + hora;
  }
  function dh(ts) { return new Date(ts || Date.now()).toLocaleString('pt-PT'); }

  /* ---------- contactos ---------- */
  function ultimaCom(d, a, b) {
    var t = 0;
    d.msgs.forEach(function (m) {
      if ((m.de === a && m.para === b) || (m.de === b && m.para === a)) if (m.ts > t) t = m.ts;
    });
    return t;
  }
  async function contactos() {
    var eu = me();
    if (!eu) return [];
    var d = ler(), minhas = regras(d, eu.id);
    return colegas().filter(function (u) {
      /* se o outro me ocultou, não o vejo na minha lista */
      var dele = d.rules[u.id];
      return !(dele && Array.isArray(dele.ocultarDe) && dele.ocultarDe.indexOf(eu.id) >= 0);
    }).map(function (u) {
      return {
        id: u.id, nome: u.name, tel: u.phone || '', role: u.role || '',
        oculto: minhas.oculto.indexOf(u.id) >= 0,
        bloq: minhas.bloq.indexOf(u.id) >= 0,
        ultima: ultimaCom(d, eu.id, u.id)
      };
    });
  }
  function categoria(c) { return c && c.ultima ? 'conversas' : 'novos'; }
  async function adicionarPorTelefone(tel) {
    var eu = me();
    if (!eu) return { ok: false, motivo: 'Inicie sessão.' };
    var dig = function (t) { return String(t || '').replace(/\D/g, '').slice(-9); };
    var n = dig(tel);
    if (n.length < 9) return { ok: false, motivo: 'Indique um telefone válido (9 dígitos).' };
    var u = utilizadores().filter(function (x) { return dig(x.phone) === n; })[0];
    if (!u) return { ok: false, motivo: 'Não existe nenhuma conta com esse telefone.' };
    if (u.id === eu.id) return { ok: false, motivo: 'Esse é o seu próprio número.' };
    if (u.companyId !== eu.companyId) return { ok: false, motivo: 'Só pode adicionar colegas da sua empresa.' };
    if (u.status !== 'Ativo') return { ok: false, motivo: 'Essa conta está inativa.' };
    var d = ler(), r = regras(d, eu.id);
    r.oculto = r.oculto.filter(function (x) { return x !== u.id; });
    gravar(d);
    return { ok: true, nome: u.name, id: u.id };
  }

  /* ---------- regras de privacidade ---------- */
  async function regrasDe(uid) {
    var r = regras(ler(), uid);
    return { perm: r.perm, ocultarDe: r.ocultarDe, bloq: r.bloq, oculto: r.oculto };
  }
  function trocar(lista, id, ligado) {
    var i = lista.indexOf(id);
    if (ligado && i < 0) lista.push(id);
    if (!ligado && i >= 0) lista.splice(i, 1);
  }
  async function mudarRegra(tipo, cid, ligado) {
    var eu = me();
    if (!eu) return false;
    var d = ler(), r = regras(d, eu.id);
    if (tipo === 'bloq') trocar(r.bloq, cid, ligado);
    else if (tipo === 'ocultarDeMim') trocar(r.ocultarDe, cid, ligado);
    else if (tipo === 'ficheiro' || tipo === 'audio' || tipo === 'video') {
      r.perm[cid] = r.perm[cid] || {};
      r.perm[cid][tipo] = !!ligado;
    } else return false;
    return gravar(d);
  }
  async function ocultoMeu(cid, ligado) {
    var eu = me();
    if (!eu) return false;
    var d = ler();
    trocar(regras(d, eu.id).oculto, cid, ligado);
    return gravar(d);
  }
  async function podeEnviar(de, para, tipo) {
    var d = ler(), rd = regras(d, de), rp = regras(d, para);
    if (rd.bloq.indexOf(para) >= 0) return { ok: false, motivo: 'Desbloqueie este contacto para enviar mensagens.' };
    if (rp.bloq.indexOf(de) >= 0) return { ok: false, motivo: 'Não foi possível enviar a mensagem a este contacto.' };
    var p = rp.perm[de] || {};
    var chave = tipo === 'ficheiro' || tipo === 'audio' || tipo === 'video' ? tipo : null;
    if (chave && p[chave] === false) return { ok: false, motivo: 'Este contacto não aceita ' + (chave === 'ficheiro' ? 'ficheiros' : chave === 'audio' ? 'áudios' : 'vídeos') + ' seus.' };
    return { ok: true };
  }

  /* ---------- mensagens ---------- */
  async function enviar(para, msg) {
    var eu = me();
    if (!eu) return { ok: false, motivo: 'Inicie sessão.' };
    msg = msg || {};
    var tipo = msg.tipo || 'texto';
    if (tipo === 'texto' && !String(msg.texto || '').trim()) return { ok: false, motivo: 'Escreva uma mensagem.' };
    var v = await podeEnviar(eu.id, para, tipo);
    if (!v.ok) return v;
    var d = ler(), agora = Date.now();
    var m = {
      id: 'm' + agora.toString(36) + Math.random().toString(36).slice(2, 7),
      de: eu.id, para: para, tipo: tipo, ts: agora, dh: dh(agora),
      status: 'entregue', dhRec: dh(agora), re: []
    };
    ['texto', 'data', 'nome', 'mime', 'transcricao'].forEach(function (k) { if (msg[k] != null) m[k] = msg[k]; });
    d.msgs.push(m);
    d.msgs = d.msgs.slice(-1000);
    if (!gravar(d)) return { ok: false, motivo: 'Sem espaço no navegador. Tente um ficheiro mais pequeno.' };
    return { ok: true, id: m.id };
  }
  async function conversa(cid) {
    var eu = me();
    if (!eu) return [];
    var corte = Date.now() - DIA;
    return ler().msgs.filter(function (m) {
      return m.ts >= corte && ((m.de === eu.id && m.para === cid) || (m.de === cid && m.para === eu.id));
    }).sort(function (a, b) { return a.ts - b.ts; });
  }
  async function marcarVistas(cid) {
    var eu = me();
    if (!eu) return false;
    var d = ler(), mudou = false, agora = Date.now();
    d.msgs.forEach(function (m) {
      if (m.de === cid && m.para === eu.id && m.status !== 'visualizado') {
        m.status = 'visualizado'; m.dhVisto = dh(agora); mudou = true;
      }
    });
    if (mudou) gravar(d);
    return mudou;
  }
  async function reagir(store, id, emoji) {
    var eu = me();
    if (!eu || store !== 'msgs') return false;
    var d = ler(), m = d.msgs.filter(function (x) { return x.id === id; })[0];
    if (!m) return false;
    m.re = Array.isArray(m.re) ? m.re : [];
    var i = -1;
    m.re.forEach(function (r, k) { if (r.u === eu.id && r.e === emoji) i = k; });
    if (i >= 0) m.re.splice(i, 1); else m.re.push({ e: emoji, u: eu.id });
    return gravar(d);
  }
  async function reencaminhar(id, para) {
    var eu = me();
    if (!eu) return { ok: false, motivo: 'Inicie sessão.' };
    var m = ler().msgs.filter(function (x) { return x.id === id; })[0];
    if (!m) return { ok: false, motivo: 'Mensagem não encontrada.' };
    if (para == null) return { ok: false, motivo: NAO };
    var c = { tipo: m.tipo };
    ['texto', 'data', 'nome', 'mime', 'transcricao'].forEach(function (k) { if (m[k] != null) c[k] = m[k]; });
    return enviar(para, c);
  }

  /* ---------- acesso genérico (stores) ---------- */
  async function all(store) {
    if (store === 'msgs') return ler().msgs;
    return [];   /* outbox, meets, presenca, mmsgs, mreac, acordos: vazios */
  }
  async function get(store, id) {
    var l = await all(store);
    return l.filter(function (x) { return x.id === id; })[0] || null;
  }

  /* ---------- não lidas / vigilância ---------- */
  function naoLidas() {
    var eu = me();
    if (!eu) return 0;
    return ler().msgs.filter(function (m) { return m.para === eu.id && m.status !== 'visualizado'; }).length;
  }
  function sondar() {
    if (!vigia) return;
    var n = naoLidas();
    if (n !== vigia.ultimoN) {
      vigia.ultimoN = n;
      try { if (vigia.cfg && vigia.cfg.onNaoLidas) vigia.cfg.onNaoLidas(n); } catch (e) { /* ignora */ }
    }
  }
  function vigiar(cfg) {
    parar();
    vigia = { cfg: cfg || {}, ultimoN: -1, timer: setInterval(sondar, 3000) };
    sondar();
    return parar;
  }
  function parar() {
    if (vigia) { clearInterval(vigia.timer); vigia = null; }
  }

  /* ---------- arranque ---------- */
  function init() {
    if (iniciado) return;
    iniciado = true;
    window.addEventListener('storage', function (e) { if (e.key === KEY || e.key === K_USERS) emitir(); });
  }
  async function open() { init(); return true; }
  function on(f) { if (typeof f === 'function') listeners.push(f); }

  /* ---------- ficheiros ---------- */
  function baixar(nome, blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nome;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function pdfBlob(linhas) {
    return new Blob([(linhas || []).join('\n')], { type: 'text/plain' });
  }

  /* ---------- reuniões e acordos (não incluídos) ---------- */
  var nao = async function () { return { ok: false, motivo: NAO }; };

  window.NC = {
    ALL: ['👍', '❤️', '😂', '😮', '🙏'],
    RN: { '👍': 'Gosto', '❤️': 'Adoro', '😂': 'Engraçado', '😮': 'Surpreendente', '🙏': 'Obrigado' },
    init: init, open: open, on: on, parar: parar, vigiar: vigiar,
    online: function () { return navigator.onLine !== false; },
    me: me, nomeDe: nomeDe, fmt: fmt,
    contactos: contactos, categoria: categoria, adicionarPorTelefone: adicionarPorTelefone,
    regrasDe: regrasDe, mudarRegra: mudarRegra, ocultoMeu: ocultoMeu, podeEnviar: podeEnviar,
    enviar: enviar, conversa: conversa, marcarVistas: marcarVistas, reagir: reagir, reencaminhar: reencaminhar,
    all: all, get: get, baixar: baixar, pdfBlob: pdfBlob,
    /* reuniões */
    criarReuniao: nao, eliminarReuniao: nao, encerrarReuniao: nao, entrarReuniao: nao, sairReuniao: nao,
    pingReuniao: nao, msgReuniao: nao, reagirPessoa: nao, alternarTarefa: nao,
    presente: function () { return false; },
    pontos: async function () { return {}; },
    minuta: async function () { return { ok: false, motivo: NAO }; },
    minutaLinhas: function () { return []; },
    /* acordos */
    fixarAcordo: nao, assinarAcordo: nao,
    acordoLinhas: function () { return []; },
    verificarCadeia: async function () { return { ok: true, total: 0, falhas: [] }; }
  };
})();
