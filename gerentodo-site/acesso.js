/* =====================================================================
   acesso.js — única parte do código da conta que é descarregada ANTES de
   entrar: ecrã de entrada (login, criar conta) e verificação da sessão.
   O resto (módulos, menus, perfil, empresa, chat) está em conta-app.js e só
   é pedido ao servidor depois de a sessão estar válida.
   ===================================================================== */
const KEY_USERS = 'authvault.users.v3';
const KEY_LOG = 'authvault.log.v3';
const KEY_SESSION = 'authvault.session.v3';
const KEY_THEME = 'tema';
const KEY_MENU = 'authvault.menu.v3';
const KEY_HIST = 'authvault.hist.v3';
const KEY_SSTART = 'authvault.sstart.v3';

let users = [];
let logs = [];
let me = null;
let failedLogins = 0;
let lockUntil = 0;
let toastTimer;
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = t => String(t).replace(/\s+/g, '').toLowerCase();
const strong = p => p.length >= 10 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p);
const WEAK_MSG = 'use 10+ caracteres com maiúscula, minúscula, número e símbolo.';

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.style.display = 'none'; }, 4000);
}

// Funções para gerir janelas modais
const openModal = id => $(id).classList.add('open');
const closeModal = id => $(id).classList.remove('open');
const closeAllModals = () => document.querySelectorAll('.ov.open').forEach(o => o.classList.remove('open'));

// Mostra ou esconde mensagens de erro nos formulários
function showError(id, msg) {
  const el = $(id);
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}


// Converte buffer para Hexadecimal
const toHex = buf => Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');

// Cria um salt aleatório para criptografia
const newSalt = () => toHex(crypto.getRandomValues(new Uint8Array(16)));

// Gera hash de senha usando PBKDF2 (Web Crypto API)
async function hashPassword(password, salt) {
  if (!crypto?.subtle) throw new Error('O navegador não suporta Web Crypto (use HTTPS ou localhost).');
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 210000, hash: 'SHA-256' }, key, 256);
  return toHex(bits);
}

// Cria novas credenciais seguras para o utilizador
async function newCredentials(password) {
  const salt = newSalt();
  return { salt, hash: await hashPassword(password, salt) };
}

// Valida se a senha inserida corresponde à hash guardada
async function checkPassword(user, password) {
  if (!user?.hash) return false;
  const h = await hashPassword(password, user.salt);
  let diff = h.length ^ user.hash.length;
  for (let i = 0; i < h.length; i++) diff |= h.charCodeAt(i) ^ (user.hash.charCodeAt(i) || 0);
  return diff === 0;
}

// Carrega os dados de utilizadores e logs do LocalStorage

function load() {
  try {
    users = JSON.parse(localStorage.getItem(KEY_USERS) || '[]');
    logs = JSON.parse(localStorage.getItem(KEY_LOG) || '[]');
  } catch (e) { users = []; logs = []; }
  if (!Array.isArray(users)) users = [];
  if (!Array.isArray(logs)) logs = [];
}

// Guarda os utilizadores e logs no LocalStorage
function saveUsers() {
  try {
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
    localStorage.setItem(KEY_LOG, JSON.stringify(logs));
  } catch (e) { toast('Não foi possível guardar neste navegador.'); }
}

// Regista ações importantes no sistema
function log(text) {
  try { logs = JSON.parse(localStorage.getItem(KEY_LOG) || '[]'); } catch (e) { logs = []; }
  if (!Array.isArray(logs)) logs = [];
  logs.unshift(new Date().toLocaleTimeString('pt-PT') + ' — ' + text);
  logs = logs.slice(0, 8);
  try { localStorage.setItem(KEY_LOG, JSON.stringify(logs)); } catch (e) {}
}


const KEY_COMP = 'authvault.companies.v1';
const loadComps = () => { try { const c = JSON.parse(localStorage.getItem(KEY_COMP) || '[]'); return Array.isArray(c) ? c : []; } catch (e) { return []; } };
const normTxt = t => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
const normNif = t => String(t).replace(/[\s.\-]/g, '').toUpperCase();
const digits = t => String(t).replace(/\D/g, '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const carregarScript = src => new Promise((ok, falha) => {
  const s = document.createElement('script');
  s.src = src; s.onload = ok; s.onerror = () => falha(new Error('Não foi possível carregar o sistema. Verifique a ligação e tente de novo.'));
  document.head.appendChild(s);
});
let appAberta = false;
/* Só aqui, com a sessão válida, é que o código da conta é pedido ao servidor. */
async function abrirConta(novo) {
  if (appAberta) return;
  appAberta = true;
  window.__novoLogin = !!novo;
  try {
    await Promise.all([carregarScript('netchat.js'), carregarScript('pacotes.js')]);
    await carregarScript('conta-app.js');
    fimBoot();
  } catch (e) { appAberta = false; fimBoot(); toast(e.message); }
}
function fimBoot() { document.documentElement.classList.remove('chk'); }

function abrirLogin() { showError('lErr', ''); openModal('mLogin'); $('lId').focus(); }
function openReg() {
  closeModal('mLogin');
  $('fReg').reset();
  showError('rErr', '');
  openModal('mReg');
  $('rAN').focus();
}
$('bReg2').onclick = openReg;
$('bRec').onclick = () => { location.href = '16_Recuperacao.html'; };

$('fLogin').onsubmit = async e => {
  e.preventDefault();
  if (!window.sb || !window.GS) return showError('lErr', 'Não foi possível ligar ao servidor. Recarregue a página.');
  if (Date.now() < lockUntil) return showError('lErr', `Demasiadas tentativas. Aguarde ${Math.ceil((lockUntil - Date.now()) / 1000)} s.`);
  const btn = $('fLogin').querySelector('.pri'), txt = btn.textContent;
  btn.disabled = true; btn.textContent = 'A entrar…'; showError('lErr', '');
  let h = null, semConta = false;
  try {
    const email = await GS.emailDeLogin($('lId').value.trim());
    if (!email) semConta = true;
    else {
      const r = await sb.auth.signInWithPassword({ email, password: $('lPw').value });
      if (r.error) { if (GS.rede(r.error)) throw r.error; semConta = true; }
      else h = await GS.entrar();
    }
  } catch (x) {
    btn.disabled = false; btn.textContent = txt;
    return showError('lErr', GS.msg(x));
  }
  btn.disabled = false; btn.textContent = txt;
  if (!h) {
    if (!semConta) { try { await sb.auth.signOut(); } catch (x) {} }
    failedLogins++;
    if (failedLogins >= 5) {
      failedLogins = 0;
      lockUntil = Date.now() + 30000;
      return showError('lErr', 'Conta bloqueada durante 30 segundos.');
    }
    return showError('lErr', 'Credenciais inválidas ou conta inativa.');
  }
  failedLogins = 0;
  me = h.user;
  $('fLogin').reset();
  closeModal('mLogin');
  log(`${me.name} iniciou sessão.`);
  toast(`Bem-vindo(a), ${me.name}.` + (h.offline ? ' (sem ligação ao servidor)' : ''));
  abrirConta(true);
};

/* Criar conta: um único cadastro (o administrador). Os dados da empresa ficam para depois, dentro da conta. */
$('fReg').onsubmit = async e => {
  e.preventDefault();
  const v = id => $(id).value.trim(), E = m => showError('rErr', m);
  const an = v('rAN'), at = v('rAT'), am = v('rAM'), pw = $('rPw').value, pw2 = $('rPw2').value;
  if (an.length < 2) return E('Introduza o nome completo.');
  if (digits(at).length < 9) return E('Introduza o contacto (mínimo 9 dígitos).');
  if (am && !EMAIL_RE.test(am)) return E('O e-mail é inválido.');
  if (!strong(pw)) return E('Senha fraca: ' + WEAK_MSG);
  if (pw !== pw2) return E('A confirmação não coincide com a senha.');
  if (!window.sb || !window.GS) return E('Não foi possível ligar ao servidor. Recarregue a página.');
  const btn = $('fReg').querySelector('.pri'), txt = btn.textContent;
  btn.disabled = true; btn.textContent = 'A criar…'; E('');
  try {
    if (am && await GS.emailDeLogin(am)) return E('Já existe uma conta com este e-mail.');
    if (await GS.emailDeLogin(at)) return E('Já existe uma conta com este contacto.');
    /* quem não tem e-mail entra com um e-mail gerado a partir do telefone (nunca recebe mensagens) */
    const loginEmail = am || ('u' + digits(at).slice(-9) + '@gerentodo.app');
    let r = await sb.auth.signUp({ email: loginEmail, password: pw });
    if (r.error && /already/i.test(r.error.message || '')) {
      r = await sb.auth.signInWithPassword({ email: loginEmail, password: pw });   /* tentativa anterior ficou a meio */
      if (r.error) return E('Já existe uma conta com este e-mail. Entre com ela ou use outro e-mail.');
    } else if (r.error) return E(GS.msg(r.error));
    if (!r.data || !r.data.session) return E('O Supabase ainda exige confirmação de e-mail. Desligue "Confirm email" em Authentication > Sign In / Providers > Email.');
    const rp = await sb.rpc('criar_conta_admin', { p_nome: an, p_telefone: at, p_email: am });
    if (rp.error && !/já está criada/i.test(rp.error.message || '')) {
      await sb.auth.signOut();
      return E(GS.msg(rp.error));
    }
    const h = await GS.entrar();
    if (!h) { await sb.auth.signOut(); return E('A conta foi criada mas não foi possível abri-la. Tente entrar.'); }
    me = h.user;
    $('fReg').reset();
    closeModal('mReg');
    log(`Conta do administrador ${an} criada.`);
    toast(`Conta criada. Bem-vindo(a), ${an}!`);
    abrirConta(true);
  } catch (x) { E(GS.msg(x)); }
  finally { btn.disabled = false; btn.textContent = txt; }
};

document.querySelectorAll('[data-close]').forEach(b => { b.onclick = () => b.closest('.ov').classList.remove('open'); });
document.querySelectorAll('.ov').forEach(o => o.addEventListener('mousedown', e => { if (e.target === o) o.classList.remove('open'); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllModals(); });

/* arranque: sessão do Supabase válida -> abre a conta; senão fica o ecrã de entrada */
(async function () {
  if (!(window.__prefs && window.__prefs.uid())) {
    let t = null; try { t = localStorage.getItem(KEY_THEME); } catch (x) {}
    document.documentElement.dataset.t = t || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  }
  let aviso = null; try { aviso = sessionStorage.getItem('authvault.aviso'); sessionStorage.removeItem('authvault.aviso'); } catch (x) {}
  if (aviso) toast(aviso);
  try {
    const pp = JSON.parse(localStorage.getItem('authvault.pacote.pendente') || 'null');
    if (pp && Date.now() - pp.em < 7 * 864e5) { $('gatePk').innerHTML = 'Pacote escolhido: <b>' + esc(pp.titulo) + '</b> (' + esc(pp.valor) + '). Crie a conta ou entre para o ativar.'; $('gatePk').classList.remove('hide'); }
  } catch (x) {}
  const h = location.hash;
  try { history.replaceState(null, '', location.pathname + location.search); } catch (x) {}
  let entrou = false;
  if (window.sb && window.GS) {
    try {
      const s = await sb.auth.getSession();
      if (s.data && s.data.session) {
        const hy = await GS.entrar();
        if (hy) { me = hy.user; entrou = true; if (hy.offline) toast('Sem ligação: a trabalhar com os dados guardados neste aparelho.'); }
        else await sb.auth.signOut();
      }
    } catch (x) { toast(GS.msg(x)); }
  } else toast('Não foi possível ligar ao servidor. Recarregue a página.');
  if (entrou) return abrirConta(false);
  fimBoot();
  if (h === '#cadastro') openReg(); else if (h === '#entrar') abrirLogin();
})();
