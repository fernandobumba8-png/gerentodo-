/* =====================================================================
   supabase-sync.js — objeto global "GS": liga o sistema ao Supabase.

   1) Conta: entrar/sair, perfil, empresa e pacote vivem no Supabase. Ao entrar,
      "hidratar" copia-os para o localStorage no formato antigo, por isso os
      módulos que leem utilizadores/empresas continuam a funcionar.
   2) Dados dos módulos (produtos, clientes, documentos...): não é preciso mexer
      nos módulos. Cada gravação num módulo gera um evento "storage" nesta
      página, e este ficheiro envia a alteração para a tabela "dados".
      Alterações de outros aparelhos chegam por tempo real.
   Carregar só em conta.html (a página que contém os módulos).
   ===================================================================== */
(function () {
  var real = window.localStorage;
  var KU = 'authvault.users.v3', KC = 'authvault.companies.v1', KS = 'authvault.session.v3';
  var KE = 'authvault.empresa.v1', KLAST = 'authvault.sb.last', KPEND = 'authvault.sb.pend.';

  var emp = null, chan = null, pend = {}, timer = null, enviando = false, saindo = false, avisou = 0;

  /* ---------- utilitários ---------- */
  function rede(e) {
    var m = String((e && (e.message || e)) || '');
    return !!e && (e.name === 'TypeError' || /failed to fetch|networkerror|network request|load failed|fetch/i.test(m));
  }
  function msg(e) {
    var m = String((e && e.message) || ''), c = String((e && e.code) || '');
    if (c === '23505' || /duplicate key/i.test(m)) return 'Já existe uma conta com este contacto.';
    if (/already registered|already been registered/i.test(m)) return 'Já existe uma conta com este e-mail ou contacto.';
    if (/rate limit/i.test(m)) return 'Demasiados pedidos. Aguarde um minuto e tente de novo.';
    if (rede(e)) return 'Sem ligação ao servidor. Verifique a internet.';
    if (/row-level security|permission denied/i.test(m)) return 'Sem permissão para esta operação.';
    return m || 'Erro inesperado.';
  }
  function avisar(t) {
    if (Date.now() - avisou < 60000) return;
    avisou = Date.now();
    try { if (typeof window.toast === 'function') window.toast(t); } catch (e) { /* ignora */ }
  }
  function ler(k, def) { try { var v = JSON.parse(real.getItem(k) || 'null'); return v == null ? def : v; } catch (e) { return def; } }

  /* ---------- conta ---------- */
  async function emailDeLogin(id) {
    var r = await sb.rpc('email_de_login', { p_id: String(id || '') });
    if (r.error) throw r.error;
    return r.data || null;
  }
  function mapUser(p, e) {
    return { id: p.num, uuid: p.id, name: p.nome, email: p.email || '', phone: p.telefone, loginEmail: p.email_login,
      company: e.nome, companyId: e.id, role: p.role, principal: !!p.principal, status: p.estado,
      isDefault: false, avatar: p.avatar || '', criadoEm: p.criado_em };
  }
  function mapEmpresa(e, perfis) {
    var a = perfis.filter(function (p) { return p.principal; })[0] || perfis[0] || {};
    return { id: e.id, nome: e.nome, nif: e.nif || '', tel1: e.tel1 || '', tel2: e.tel2 || '', email: e.email || '',
      nacionalidade: e.nacionalidade || '', provincia: e.provincia || '', endereco: e.endereco || '', logo: e.logo || '',
      semDados: !!e.sem_dados, adminId: a.num || 0, adminNome: a.nome || '', adminTel: a.telefone || '', adminEmail: a.email || '',
      criadoEm: e.criado_em, plano: e.plano, valor: Number(e.valor) || 0, inicio: e.inicio, fim: e.fim,
      pacote: e.pacote || undefined, pagamentos: [] };
  }

  /* Lê a conta no servidor e copia para o localStorage. Devolve {user, offline} ou null. */
  async function hidratar() {
    var s = await sb.auth.getSession();
    var sess = s && s.data && s.data.session;
    if (!sess) return null;
    var rs = await Promise.all([sb.from('perfis').select('*').order('num'), sb.from('empresas').select('*')]);
    if (rs[0].error) throw rs[0].error;
    if (rs[1].error) throw rs[1].error;
    var perfis = rs[0].data || [];
    var meP = perfis.filter(function (p) { return p.id === sess.user.id; })[0];
    if (!meP || meP.estado !== 'Ativo') return null;
    var e = (rs[1].data || []).filter(function (x) { return x.id === meP.empresa_id; })[0];
    if (!e) return null;
    var us = perfis.map(function (p) { return mapUser(p, e); });
    var u = us.filter(function (x) { return x.uuid === sess.user.id; })[0];
    real.setItem(KU, JSON.stringify(us));
    real.setItem(KC, JSON.stringify([mapEmpresa(e, perfis)]));
    real.setItem(KLAST, String(u.id));
    sessionStorage.setItem(KS, String(u.id));
    sessionStorage.setItem(KE, String(e.id));
    await ligarDados(e.id);
    return { user: u, offline: false };
  }
  /* Como hidratar, mas sem internet usa a cópia guardada neste aparelho */
  async function entrar() {
    try { return await hidratar(); }
    catch (err) {
      if (!rede(err)) throw err;
      var last = Number(real.getItem(KLAST) || 0), u = ler(KU, []).filter(function (x) { return x.id === last && x.status === 'Ativo'; })[0];
      if (!u) throw err;
      sessionStorage.setItem(KS, String(u.id));
      sessionStorage.setItem(KE, String(u.companyId));
      emp = { id: u.companyId }; pend = lerPend(emp.id); iniciarSync();
      return { user: u, offline: true };
    }
  }
  /* Relê só os utilizadores da empresa (depois de criar/editar/eliminar um funcionário) */
  async function atualizarEquipa() {
    var e = ler(KC, [])[0];
    if (!e) return;
    var r = await sb.from('perfis').select('*').order('num');
    if (r.error) throw r.error;
    real.setItem(KU, JSON.stringify((r.data || []).map(function (p) { return mapUser(p, { id: e.id, nome: e.nome }); })));
  }
  async function confirmarSenha(emailLogin, senha) {
    var r = await sb.auth.signInWithPassword({ email: emailLogin, password: senha });
    if (r.error) { if (rede(r.error)) throw r.error; return false; }
    return true;
  }
  async function alterarSenha(nova) {
    var r = await sb.auth.updateUser({ password: nova });
    if (r.error) throw r.error;
  }
  async function salvarPerfil(p) {
    var s = await sb.auth.getSession();
    var r = await sb.from('perfis').update(p).eq('id', s.data.session.user.id);
    if (r.error) throw r.error;
  }
  async function salvarEmpresa(p) {
    if (!emp) throw new Error('Sem sessão.');
    var r = await sb.from('empresas').update(p).eq('id', emp.id);
    if (r.error) throw r.error;
  }
  async function escolherPacote(p) {
    var P = window.PACOTES;
    var pacote = { id: p.id, cat: p.cat, catNome: p.catNome, nome: p.nome, ciclo: p.ciclo, cicloNome: p.cicloNome, un: p.un,
      valor: p.valor, trialDias: p.trial, titulo: p.catNome + ' · ' + p.cicloNome, ciclos: P ? P.PRECOS[p.cat] : {},
      escolhidoEm: new Date().toISOString() };
    var r = await sb.rpc('escolher_pacote', { p_pacote: pacote, p_trial_dias: p.trial });
    if (r.error) throw r.error;
  }
  async function sair() {
    saindo = true;
    try { await Promise.race([flush(), new Promise(function (ok) { setTimeout(ok, 4000); })]); } catch (e) { /* ignora */ }
    pararSync(); emp = null;
    real.removeItem(KU); real.removeItem(KC); real.removeItem(KLAST);
    try { await sb.auth.signOut(); } catch (e) { /* ignora */ }
    saindo = false;
  }

  /* ---------- dados dos módulos ---------- */
  function lerPend(id) {
    var o = {}; (ler(KPEND + id, []) || []).forEach(function (k) { o[k] = 1; }); return o;
  }
  function guardarPend() {
    if (!emp) return;
    try { real.setItem(KPEND + emp.id, JSON.stringify(Object.keys(pend))); } catch (e) { /* ignora */ }
  }
  function agendar(ms) {
    clearTimeout(timer); timer = setTimeout(function () { timer = null; flush(); }, ms);
  }
  async function flush() {
    if (enviando || !emp || !Object.keys(pend).length) return;
    enviando = true;
    var pre = 'e' + emp.id + ':', ok = false;
    try {
      var up = [], del = [];
      Object.keys(pend).forEach(function (k) {
        var v = real.getItem(pre + k);
        if (v === null) del.push(k); else up.push({ empresa_id: emp.id, chave: k, valor: v });
      });
      for (var i = 0; i < up.length; i += 10) {
        var lote = up.slice(i, i + 10);
        var r = await sb.from('dados').upsert(lote, { onConflict: 'empresa_id,chave' });
        if (r.error) throw r.error;
        lote.forEach(function (x) { if (real.getItem(pre + x.chave) === x.valor) delete pend[x.chave]; });
      }
      if (del.length) {
        var r2 = await sb.from('dados').delete().eq('empresa_id', emp.id).in('chave', del);
        if (r2.error) throw r2.error;
        del.forEach(function (k) { if (real.getItem(pre + k) === null) delete pend[k]; });
      }
      ok = true;
    } catch (e) {
      avisar(rede(e) ? 'Sem ligação: as alterações ficam guardadas neste aparelho e serão enviadas quando houver internet.' : 'Não foi possível guardar no servidor: ' + msg(e));
      agendar(8000);
    } finally {
      enviando = false;
      guardarPend();
      if (ok && Object.keys(pend).length) agendar(300);
    }
  }
  function onStorage(ev) {
    if (!emp || ev.storageArea !== real || !ev.key) return;
    var pre = 'e' + emp.id + ':';
    if (ev.key.indexOf(pre) !== 0) return;
    pend[ev.key.slice(pre.length)] = 1;
    guardarPend();
    agendar(800);
  }
  /* Só descarrega o que mudou desde a última vez (o resto já está neste aparelho). */
  async function puxarDados(id) {
    var pre = 'e' + id + ':', KSY = 'authvault.sb.sync.' + id, ultimo = real.getItem(KSY) || '', maxTs = ultimo;
    var meta = {}, de = 0, passo = 1000;
    for (;;) {
      var r = await sb.from('dados').select('chave,atualizado_em').eq('empresa_id', id).order('chave').range(de, de + passo - 1);
      if (r.error) throw r.error;
      (r.data || []).forEach(function (x) { meta[x.chave] = x.atualizado_em || ''; if ((x.atualizado_em || '') > maxTs) maxTs = x.atualizado_em; });
      if ((r.data || []).length < passo) break;
      de += passo;
    }
    var buscar = [];
    Object.keys(meta).forEach(function (k) {
      if (k in pend) return;                                   /* alteração local ainda por enviar: não apagar */
      if (!ultimo || meta[k] > ultimo || real.getItem(pre + k) === null) buscar.push(k);
    });
    for (var j = 0; j < buscar.length; j += 5) {
      var lote = buscar.slice(j, j + 5);
      var r2 = await sb.from('dados').select('chave,valor').eq('empresa_id', id).in('chave', lote);
      if (r2.error) throw r2.error;
      (r2.data || []).forEach(function (x) {
        try { if (real.getItem(pre + x.chave) !== x.valor) real.setItem(pre + x.chave, x.valor); } catch (e) { /* sem espaço */ }
      });
    }
    for (var i = 0; i < real.length; i++) {                     /* o que só existe neste aparelho sobe para o servidor */
      var key = real.key(i);
      if (key && key.indexOf(pre) === 0) { var k = key.slice(pre.length); if (!(k in meta)) pend[k] = 1; }
    }
    guardarPend();
    if (maxTs) real.setItem(KSY, maxTs);
  }
  function iniciarSync() {
    pararSync(true);
    window.addEventListener('storage', onStorage);
    window.addEventListener('online', onOnline);
    if (!emp || !window.sb) return;
    var id = emp.id, pre = 'e' + id + ':';
    try {
      chan = sb.channel('dados-' + id).on('postgres_changes',
        { event: '*', schema: 'public', table: 'dados', filter: 'empresa_id=eq.' + id },
        function (p) {
          try {
            if (p.eventType === 'DELETE') { var k = p.old && p.old.chave; if (k && !(k in pend)) real.removeItem(pre + k); return; }
            var n = p.new; if (!n || n.chave in pend) return;
            if (typeof n.valor !== 'string') {      /* o Supabase omite valores muito grandes no tempo real: vai buscá-lo */
              sb.from('dados').select('valor').eq('empresa_id', id).eq('chave', n.chave).maybeSingle().then(function (r) {
                try { if (r.data && typeof r.data.valor === 'string' && !(n.chave in pend) && real.getItem(pre + n.chave) !== r.data.valor) real.setItem(pre + n.chave, r.data.valor); } catch (e) { /* ignora */ }
              });
              return;
            }
            if (real.getItem(pre + n.chave) !== n.valor) real.setItem(pre + n.chave, n.valor);
          } catch (e) { /* ignora */ }
        }).subscribe();
    } catch (e) { /* sem tempo real: continua a funcionar ao recarregar */ }
    if (Object.keys(pend).length) agendar(500);
  }
  function onOnline() { if (Object.keys(pend).length) agendar(300); }
  function pararSync(manter) {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('online', onOnline);
    clearTimeout(timer); timer = null;
    if (chan) { try { sb.removeChannel(chan); } catch (e) { /* ignora */ } chan = null; }
    if (!manter) pend = {};
  }
  async function ligarDados(id) {
    emp = { id: id };
    pend = lerPend(id);
    await flush();                  /* primeiro envia o que ficou pendente (ex.: trabalho sem internet) */
    await puxarDados(id);
    iniciarSync();
  }

  /* sessão terminada noutro separador */
  try {
    if (window.sb) sb.auth.onAuthStateChange(function (ev) {
      if (ev === 'SIGNED_OUT' && emp && !saindo && typeof window.forceLogout === 'function') window.forceLogout('A sessão terminou. Entre novamente.');
    });
  } catch (e) { /* ignora */ }
  window.addEventListener('beforeunload', function () { guardarPend(); });

  window.GS = { rede: rede, msg: msg, emailDeLogin: emailDeLogin, entrar: entrar, hidratar: hidratar, confirmarSenha: confirmarSenha,
    alterarSenha: alterarSenha, salvarPerfil: salvarPerfil, salvarEmpresa: salvarEmpresa, escolherPacote: escolherPacote, atualizarEquipa: atualizarEquipa,
    sair: sair, flush: flush, pendentes: function () { return Object.keys(pend).length; } };
})();
