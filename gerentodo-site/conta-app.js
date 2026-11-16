/* =====================================================================
   conta-app.js — código da conta (módulos, menus, perfil, empresa, chat).
   NÃO é carregado na página pública nem no ecrã de entrada: o acesso.js só o
   pede depois de a sessão estar válida.
   ===================================================================== */
document.body.insertAdjacentHTML('beforeend', "<div id=\"app\" class=\"hide\">\n  <button id=\"mb\" class=\"card\" aria-label=\"Abrir menu\"><svg class=\"i\"><use href=\"#i-menu\"/></svg></button>\n  <div id=\"bd\"></div>\n\n  <aside id=\"sb\">\n    <div class=\"sb-top\">\n      <span class=\"logo2\"><svg class=\"i\"><use href=\"#i-shield\"/></svg></span>\n      <img class=\"logo-img\" src=\"lodo_gerentodo.png\" alt=\"\" onload=\"this.previousElementSibling.style.display='none'\" onerror=\"this.style.display='none'\">\n      <span class=\"sb-name\">Gerentodo</span>\n      <button id=\"sbTog\" class=\"sb-tog\" aria-label=\"Recolher menu\"><svg class=\"i\"><use href=\"#i-left\"/></svg></button>\n    </div>\n\n    <nav id=\"nav\"></nav>\n\n    <div id=\"sbF\">\n      <div id=\"am\" class=\"card hide\">\n        <div class=\"sub\" id=\"amMail\"></div>\n        <button class=\"nv\" data-m=\"prof\"><span class=\"ic\"><svg class=\"i\"><use href=\"#i-gear\"/></svg></span><span class=\"lb\">Definições do perfil</span></button>\n        <button class=\"nv hide\" id=\"amEmp\" data-m=\"emp\"><span class=\"ic\"><svg class=\"i\"><use href=\"#i-info\"/></svg></span><span class=\"lb\">Dados da empresa</span></button>\n        <button class=\"nv\" data-m=\"theme\"><span class=\"ic\"><svg class=\"i\"><use href=\"#i-moon\"/></svg></span><span class=\"lb\">Alternar tema</span></button>\n        <button class=\"nv\" data-m=\"help\"><span class=\"ic\"><svg class=\"i\"><use href=\"#i-help\"/></svg></span><span class=\"lb\">Obter ajuda</span></button>\n        <button class=\"nv\" data-m=\"info\"><span class=\"ic\"><svg class=\"i\"><use href=\"#i-info\"/></svg></span><span class=\"lb\">Sobre</span></button>\n        <hr>\n        <button class=\"nv\" data-m=\"out\"><span class=\"ic\"><svg class=\"i\"><use href=\"#i-out\"/></svg></span><span class=\"lb\">Terminar sessão</span></button>\n      </div>\n      <button class=\"nv\" id=\"acc\">\n        <span id=\"sbAv\"></span>\n        <span class=\"who\"><b id=\"sbN\"></b><span id=\"sbR\"></span></span>\n      </button>\n    </div>\n  </aside>\n\n  <div id=\"content\">\n  <header id=\"top\">\n    <div class=\"h-title\"><b>Gerentodo</b><span class=\"h-sep\">›</span><b id=\"hMod\" class=\"h-mod\">Painel</b></div>\n    <div class=\"row\" style=\"flex-wrap:nowrap;align-items:center;gap:0\">\n    <button id=\"chatBtn\" class=\"hide\" type=\"button\" aria-label=\"Mensagens\" title=\"Mensagens\" style=\"margin-right:10px;padding:8px 12px;border-radius:999px\">💬 <b id=\"chatN\" class=\"hide\" style=\"background:#e11d48;color:#fff;border-radius:99px;padding:0 7px;font-size:12px\"></b></button>\n    <div class=\"menuw\">\n      <button id=\"hAcc\" type=\"button\" aria-haspopup=\"true\">\n        <span id=\"hAv\"></span>\n        <span class=\"who\" style=\"display:none\"><b id=\"hN\"></b><span id=\"hR\"></span></span>\n      </button>\n      <div id=\"hMenu\" class=\"menu\">\n        <div class=\"sub\" id=\"hMail\"></div>\n        <button data-m=\"prof\"><svg class=\"i\"><use href=\"#i-gear\"/></svg>Definições do perfil</button>\n         <button class=\"hide\" id=\"hEmp\" data-m=\"emp\"><svg class=\"i\"><use href=\"#i-info\"/></svg>Dados da empresa</button>\n         <button data-m=\"help\"><svg class=\"i\"><use href=\"#i-help\"/></svg>Obter ajuda</button>\n        <button data-m=\"info\"><svg class=\"i\"><use href=\"#i-info\"/></svg>Sobre</button>\n        <hr>\n        <button data-m=\"out\"><svg class=\"i\"><use href=\"#i-out\"/></svg>Terminar sessão</button>\n      </div>\n    </div>\n    </div>\n  </header>\n\n  <main id=\"main\">\n    <div id=\"home\">\n      <section class=\"welcome\">\n        <h1>Bem-vindo ao Sistema Gerentodo</h1>\n        <p>Pode começar por onde quiser: escolha um módulo abaixo e gira tudo o que tem para fazer.</p>\n      </section>\n      <div class=\"note hide\" id=\"pacNote\" style=\"margin:12px 0\">Escolha o pacote que vai usar. Os primeiros dias são grátis. <a href=\"#pacotes\" style=\"font-weight:700\">Ver pacotes</a></div>\n      <div class=\"note hide\" id=\"empNote\" style=\"margin:12px 0\">Falta configurar os dados da empresa (nome, NIF, contactos e logótipo). <button type=\"button\" class=\"sm\" id=\"empGo\">Configurar agora</button></div>\n      <div id=\"mods\"></div>\n    </div>\n\n    <section id=\"panel\" class=\"hide\">\n      <iframe id=\"frame\" title=\"Módulo\" src=\"about:blank\"></iframe>\n    </section>\n  </main>\n  </div>\n</div>\n\n<div class=\"ov\" id=\"mProf\">\n  <form class=\"card md\" id=\"fProf\" autocomplete=\"off\">\n    <h2>Meu perfil</h2>\n    <div class=\"sub\" id=\"pRole\"></div>\n    <div class=\"row\" style=\"margin-top:10px;align-items:center\">\n      <span class=\"av\" id=\"pAv\" style=\"width:64px;height:64px;font-size:26px\"></span>\n      <div>\n        <input id=\"pImg\" type=\"file\" accept=\"image/*\" style=\"padding:6px\">\n        <button type=\"button\" id=\"pImgX\" class=\"sm\" style=\"margin-top:6px\">Remover imagem</button>\n      </div>\n    </div>\n    <label for=\"pName\">Nome completo</label><input id=\"pName\" required>\n    <div class=\"g2\">\n      <div><label for=\"pMail\">E-mail</label><input id=\"pMail\" type=\"email\" required></div>\n      <div><label for=\"pTel\">Telefone</label><input id=\"pTel\" required></div>\n    </div>\n    <label for=\"pNew\">Nova senha (opcional)</label><input id=\"pNew\" type=\"password\">\n    <label for=\"pNew2\">Confirmar nova senha</label><input id=\"pNew2\" type=\"password\">\n    <label for=\"pOld\">Senha atual (obrigatória para confirmar qualquer alteração)</label>\n\t<input id=\"pOld\" type=\"password\" required>\n    <div class=\"alert\" id=\"pErr\"></div>\n    <div class=\"acts\"><button type=\"button\" data-close>Cancelar</button><button class=\"pri\">Guardar perfil</button></div>\n  </form>\n</div>\n\n<div class=\"ov\" id=\"mInfo\">\n  <div class=\"card md\">\n    <h2 id=\"iT\"></h2><p id=\"iX\"></p>\n    <div class=\"acts\"><button data-close>Fechar</button></div>\n  </div>\n</div>\n\n<div class=\"ov\" id=\"mEmp\">\n  <form class=\"card md\" id=\"fEmp\" autocomplete=\"off\" style=\"max-width:640px\">\n    <h2>Dados da empresa</h2>\n    <div class=\"sub\">Complete os dados da empresa que vai usar o sistema. Os campos com * são obrigatórios.</div>\n    <label for=\"eNome\">Nome da empresa *</label><input id=\"eNome\" required>\n    <div class=\"g2\">\n      <div><label for=\"eNif\">NIF da empresa *</label><input id=\"eNif\" required></div>\n      <div><label for=\"eNac\">Nacionalidade *</label><input id=\"eNac\" list=\"dlNac\" placeholder=\"Ex.: Angolana\" required></div>\n    </div>\n    <div class=\"g2\">\n      <div><label for=\"eT1\">Contacto da empresa 1 *</label><input id=\"eT1\" type=\"tel\" placeholder=\"+244 9xx xxx xxx\" required></div>\n      <div><label for=\"eT2\">Contacto da empresa 2</label><input id=\"eT2\" type=\"tel\" placeholder=\"+244 9xx xxx xxx\"></div>\n    </div>\n    <div class=\"g2\">\n      <div><label for=\"eMail\">E-mail da empresa</label><input id=\"eMail\" type=\"email\"></div>\n      <div><label for=\"eProv\">Província</label><input id=\"eProv\" list=\"dlProv\"></div>\n    </div>\n    <label for=\"eEnd\">Endereço</label><input id=\"eEnd\" placeholder=\"Bairro, rua, nº\">\n    <label for=\"eLogo\">Foto / logótipo da empresa</label>\n    <div class=\"row\" style=\"align-items:center;flex-wrap:nowrap\">\n      <span class=\"av\" id=\"eLogoP\" style=\"width:56px;height:56px;border-radius:12px;font-size:22px\">?</span>\n      <input id=\"eLogo\" type=\"file\" accept=\"image/*\" style=\"padding:6px\">\n      <button type=\"button\" id=\"eLogoX\" class=\"sm\">Remover</button>\n    </div>\n    <div class=\"alert\" id=\"eErr\"></div>\n    <div class=\"acts\"><button type=\"button\" data-close>Cancelar</button><button class=\"pri\">Guardar dados</button></div>\n  </form>\n  <datalist id=\"dlNac\">\n\t<option>Angolana</option>\n\t<option>Portuguesa</option>\n\t<option>Brasileira</option>\n\t<option>Moçambicana</option>\n\t<option>Cabo-verdiana</option>\n\t<option>Congolesa (RDC)</option>\n\t<option>Chinesa</option>\n\t<option>Libanesa</option>\n </datalist>\n  <datalist id=\"dlProv\">\n  <option>Bengo</option>\n  <option>Benguela</option>\n  <option>Bié</option>\n  <option>Cabinda</option>\n  <option>Cuando</option>\n  <option>Cubango</option>\n  <option>Cuanza Norte</option>\n  <option>Cuanza Sul</option>\n  <option>Cunene</option>\n  <option>Huambo</option>\n  <option>Huíla</option>\n  <option>Icolo e Bengo</option>\n  <option>Luanda</option>\n  <option>Lunda Norte</option>\n  <option>Lunda Sul</option>\n  <option>Malanje</option>\n  <option>Moxico</option>\n  <option>Moxico Leste</option>\n  <option>Namibe</option>\n  <option>Uíge</option>\n  <option>Zaire</option>\n </datalist>\n</div>\n<div id=\"chatAlert\" class=\"card hide\" style=\"position:fixed;right:16px;bottom:16px;z-index:70;max-width:340px;box-shadow:var(--sh)\">\n  <b>🔔 Reunião a começar</b>\n  <div id=\"chatAlertTx\" class=\"hint\" style=\"margin:6px 0\"></div>\n  <div class=\"row\" style=\"gap:8px\"><button type=\"button\" class=\"btn p\" id=\"chatAlertGo\">Entrar</button><button type=\"button\" class=\"btn\" id=\"chatAlertX\">Dispensar</button></div>\n</div>\n");
// Lista de módulos disponíveis no menu lateral e painel principal
const MODULES = [
  { group: 'Geral', items: [
    { name: 'Painel', icon: 'home', desc: 'Página inicial', current: true }
  ]},
  { group: 'Catálogo', items: [
    { name: 'Produtos', file: '1_Produtos.html', icon: 'box', desc: 'Stock, preços e categorias' },
    { name: 'Departamentos', file: '7_Departamentos.html', icon: 'building', desc: 'Áreas da empresa' }
  ]},
  { group: 'Pessoas', items: [
    { name: 'Clientes', file: '2_Clientes.html', icon: 'users', desc: 'Registo de clientes' },
    { name: 'Fornecedores', file: '3_Fornecedores.html', icon: 'truck', desc: 'Registo de fornecedores' }
  ]},
  { group: 'Vendas', items: [
    { name: 'Faturação', file: '4_Faturacao.html', icon: 'receipt', desc: 'Emitir documentos' },
    { name: 'Documentos', file: '5_Documentos.html', icon: 'file', desc: 'Faturas e pagamentos' },
    { name: 'Gerir Gastos', file: '17_Gastos.html', icon: 'receipt', desc: 'Controlo de despesas' }, // <--- MÓDULO DE GASTOS ADICIONADO AQUI
    { name: 'Gerir vitrine', file: '8_vitrineGerir.html', icon: 'store', desc: 'Montra de produtos' },
    { name: 'Comprar na vitrine', file: '9_VitrineCompra.html', icon: 'cart', desc: 'Área de compra' }
  ]},
  { group: 'Sistema', items: [
    { name: 'Base de dados', file: '10_baseDeDados.html', icon: 'db', desc: 'Utilizadores e registos', owner: true },
    { name: 'Empresas', file: '11_Empresas.html', icon: 'building', desc: 'Empresas cadastradas', owner: true },
    { name: 'Utilizadores', file: '12_Utilizadores.html', icon: 'users', desc: 'Equipa da empresa', team: true, sys: true },
    { name: 'Pacotes', file: '18_Pacotes.html', icon: 'tag', desc: 'Escolher o pacote da empresa', team: true, sys: true },
    { name: 'Pagamento', file: '14_Pagamento.html', icon: 'receipt', desc: 'Renovar a garantia', team: true, sys: true },
    { name: 'Configuração', file: '13_Configuracao.html', icon: 'gear', desc: 'Personalizar a minha página', sys: true },
    { name: 'Mensagens', file: '15_NetChat.html', icon: 'chat', desc: 'Chat, reuniões e acordos', sys: true }
  ]}
];

const ALL_MODULES = MODULES.flatMap(g => g.items);
ALL_MODULES.forEach(m => { m.id = m.current ? 'painel' : m.file.replace(/^\d+_/, '').replace('.html', '').toLowerCase(); });


let newAvatar;
let frameSrc = '';

const isAdmin = () => !!me && me.role === 'Administrador';
const isOwner = () => !!me && me.isDefault === true;
/* O pacote escolhido limita os módulos de trabalho (os de sistema e do dono ficam sempre). Sem pacote escolhido, nada é limitado. */
const modId = m => m.file.replace(/^\d+_/, '').replace('.html', '').toLowerCase();
const noPacote = m => {
  if (m.sys || m.owner || m.current || !me || !me.companyId || !window.PACOTES) return true;
  const co = compAtual(), lim = co && co.pacote ? PACOTES.limite(co.pacote.cat) : null;
  return !lim || lim.includes(modId(m));
};
const canSee = m => (!m.admin || isAdmin()) && (!m.owner || isOwner()) && (!m.team || (isAdmin() && !!me.companyId)) && noPacote(m);
const roleLabel = u => u.role === 'Administrador' ? ((u.principal || u.isDefault) ? 'Administrador principal' : 'Administrador secundário') : u.role;
const icon = name => `<svg class="i"><use href="#i-${name}"/></svg>`;
function showInfo(title, text) {
  $('iT').textContent = title;
  $('iX').textContent = text;
  openModal('mInfo');
}

// Verifica se já existe email ou telefone duplicado
function duplicateMessage(email, phone, exceptId) {
  if (users.some(u => u.id !== exceptId && u.email.toLowerCase() === email.toLowerCase())) return 'Já existe um utilizador com este e-mail.';
  if (users.some(u => u.id !== exceptId && norm(u.phone) === norm(phone))) return 'Já existe um utilizador com este telefone.';
  return '';
}


// Gera o HTML do avatar do utilizador
function avatarHtml(u) {
  return u.avatar
    ? `<span class="av"><img src="${esc(u.avatar)}" alt=""></span>`
    : `<span class="av">${esc((u.name || '?').trim()[0] || '?')}</span>`;
}

// Filtra os módulos visíveis para o utilizador atual
function visibleModules() {
  return MODULES
    .map(g => ({ group: g.group, items: g.items.filter(canSee) }))
    .filter(g => g.items.length);
}

// Retorna o módulo atual com base no hash do URL
function currentModule() {
  const id = location.hash.slice(1);
  return ALL_MODULES.find(m => m.id === id && !m.current && canSee(m));
}

// Renderiza o menu lateral de navegação
function renderNav() {
  const activeId = currentModule()?.id || 'painel';
  $('nav').innerHTML = visibleModules().map(g => `
    <div class="sbt">${esc(g.group)}</div>
    ${g.items.map(m => `
      <a class="nv${m.id === activeId ? ' on' : ''}" href="#${m.id}" title="${esc(m.name)}"${m.id === activeId ? ' aria-current="page"' : ''}>
        <span class="ic">${icon(m.icon)}</span><span class="lb">${esc(m.name)}</span>
      </a>`).join('')}`).join('');
}

// Limpa elementos desnecessários dentro do iframe carregado
function cleanFrame() {
  if (!frameSrc) return;
  try {
    const d = $('frame').contentDocument;
    if (!d || !d.body) return;
    d.querySelectorAll('header').forEach(h => {
      h.querySelectorAll('h1,h2,.sub,b,img').forEach(x => { if (!x.closest('button,a,label')) x.style.display = 'none'; });
      const hasControls = [...h.querySelectorAll('button,input,select,textarea,a')].some(x => x.getClientRects().length);
      if (!hasControls) h.style.display = 'none';
    });
  } catch (e) {}
}
$('frame').addEventListener('load', cleanFrame);

// Define a fonte do iframe para carregar o módulo respetivo
function setFrame(src) {
  if (src === frameSrc) return;
  frameSrc = src;
  $('frame').src = src || 'about:blank';
}

// Alterna entre a vista de Painel Inicial e o Módulo ativo no Iframe
function renderView() {
  const mod = me ? currentModule() : null;
  $('home').classList.toggle('hide', !!mod);
  $('panel').classList.toggle('hide', !mod);
  $('main').classList.toggle('framed', !!mod);
  $('hMod').textContent = mod ? mod.name : 'Painel';
  if (mod) $('frame').title = mod.name;
  setFrame(mod ? mod.file : '');
}

// Renderiza os cards de atalho dos módulos na página inicial
function renderModules() {
  $('mods').innerHTML = visibleModules()
    .map(g => ({ group: g.group, items: g.items.filter(m => !m.current) }))
    .filter(g => g.items.length)
    .map(g => `
      <h3 class="grp">${esc(g.group)}</h3>
      <div class="mods">${g.items.map(m => `
        <a class="card mod" href="#${m.id}">
          <span class="ic">${icon(m.icon)}</span>
          <span><b>${esc(m.name)}</b><span>${esc(m.desc)}</span></span>
        </a>`).join('')}
      </div>`).join('');
}

// Sincroniza a empresa ativa na sessão
function syncScope() {
  try {
    if (me && me.companyId) sessionStorage.setItem('authvault.empresa.v1', String(me.companyId));
    else sessionStorage.removeItem('authvault.empresa.v1');
  } catch (e) {}
}

// Renderiza toda a interface do sistema consoante o estado de autenticação
function render() {
  syncScope();
  if (window.__prefs) window.__prefs.apply();
  ncLigar();
  if ($('gate')) $('gate').classList.toggle('hide', !!me);
  $('app').classList.toggle('hide', !me);
  if (me) {
    $('sbAv').innerHTML = avatarHtml(me);
    $('sbN').textContent = me.name;
    $('sbR').textContent = roleLabel(me);
    $('amMail').textContent = me.email;
    $('hAv').innerHTML = avatarHtml(me);
    $('hN').textContent = me.name;
    $('hR').textContent = roleLabel(me);
    $('hMail').textContent = me.email;
    renderNav();
    renderModules();
    const pr = !!me.principal, co = compAtual();
    $('amEmp').classList.toggle('hide', !pr); $('hEmp').classList.toggle('hide', !pr);
    $('empNote').classList.toggle('hide', !(pr && co && co.semDados));
    $('pacNote').classList.toggle('hide', !(isAdmin() && co && !co.pacote));
  }
  renderView();
}

// Regista histórico de alterações/sessão
function histEdit(fn) {
  try {
    let h = JSON.parse(localStorage.getItem(KEY_HIST) || '[]');
    if (!Array.isArray(h)) h = [];
    fn(h);
    localStorage.setItem(KEY_HIST, JSON.stringify(h.slice(-500)));
  } catch (e) {}
}

// Abre registo de histórico de login
function histOpen(uid) {
  const t = new Date().toISOString();
  try { sessionStorage.setItem(KEY_SSTART, t); } catch (e) {}
  histEdit(h => h.push({ uid, in: t, out: null }));
}

// Fecha registo de histórico de login
function histClose() {
  const t = sessionStorage.getItem(KEY_SSTART);
  if (me && t) histEdit(h => { const e = h.find(x => x.uid === me.id && x.in === t && !x.out); if (e) e.out = new Date().toISOString(); });
  sessionStorage.removeItem(KEY_SSTART);
}

// ==========================================
// MÓDULO DE MENSAGENS E CHAT (NETCHAT)
// ==========================================
let ncUid = 0;
function irNetChat(id) {
  if (id) sessionStorage.setItem('nc.entrar', id);
  if (location.hash === '#netchat' && frameSrc) $('frame').src = frameSrc; else location.hash = '#netchat';
}

function ncLigar() {
  if (!window.NC) return;
  const uidAtual = me ? me.id : 0;
  $('chatBtn').classList.toggle('hide', !me);
  if (uidAtual === ncUid) return;
  ncUid = uidAtual;
  if (!me) { NC.parar(); $('chatAlert').classList.add('hide'); return; }
  NC.init();
  NC.vigiar({
    onNaoLidas: n => { const b = $('chatN'); b.textContent = n; b.classList.toggle('hide', !n); },
    onAlert: m => {
      $('chatAlertTx').textContent = `“${m.titulo}” — ${NC.nomeDe(m.host)} · ${({ audio: 'Áudio', video: 'Vídeo', mensagens: 'Mensagens' })[m.modo]}`;
      $('chatAlert').classList.remove('hide');
      $('chatAlertGo').onclick = () => { $('chatAlert').classList.add('hide'); irNetChat(m.id); };
    }
  });
}
$('chatBtn').onclick = () => irNetChat();
$('chatAlertX').onclick = () => $('chatAlert').classList.add('hide');

// ==========================================
// INICIALIZAÇÃO E CONTROLO DE SESSÃO
// ==========================================
function init() {
  load();
  const id = Number(sessionStorage.getItem(KEY_SESSION));
  let fixed = false;
  loadComps().forEach(c => { const u = users.find(x => x.id === c.adminId); if (u && !u.principal) { u.principal = true; u.companyId = u.companyId || c.id; fixed = true; } });
  users.forEach(u => { if (u.role === 'Administrador' && u.status !== 'Ativo') { u.status = 'Ativo'; fixed = true; } });
  if (fixed) saveUsers();
  me = users.find(u => u.id === id && u.status === 'Ativo') || null;
  applyMenuState();
  if (window.__novoLogin && me) histOpen(me.id);
  aplicarPacotePendente();
  render();
}

function forceLogout(msg) {
  histClose();
  me = null;
  sessionStorage.removeItem(KEY_SESSION);
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  syncScope();
  if (msg) { try { sessionStorage.setItem('authvault.aviso', msg); } catch (e) {} }
  const fim = () => location.replace('conta.html');
  if (window.GS) GS.sair().then(fim, fim); else fim();
}

function logout() {
  if (me) log(`${me.name} terminou a sessão.`);
  forceLogout('Sessão terminada.');
}

// Sincronização entre abas do navegador
window.addEventListener('storage', e => {
  if (e.key === KEY_COMP) return render();
  if (e.key !== KEY_USERS && e.key !== KEY_LOG) return;
  load();
  if (me) {
    const current = users.find(u => u.id === me.id && u.status === 'Ativo');
    if (!current) return forceLogout('A sua conta foi alterada ou desativada na base de dados.');
    me = current;
  }
  render();
});

// ==========================================
// TEMA E ESTADO DO MENU LATERAL
// ==========================================
function applyTheme() {
  if (window.__prefs && window.__prefs.uid()) { window.__prefs.apply(); return; }
  const saved = localStorage.getItem(KEY_THEME);
  document.documentElement.dataset.t = saved || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
}

function toggleTheme() {
  const root = document.documentElement;
  root.dataset.t = root.dataset.t === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(KEY_THEME, root.dataset.t); } catch (e) {}
  if (frameSrc) $('frame').src = frameSrc;
}

const isWide = () => matchMedia('(min-width:861px)').matches;

function applyMenuState() {
  const collapsed = localStorage.getItem(KEY_MENU) === '1' && isWide();
  $('app').classList.toggle('min', collapsed);
  $('sbTog').innerHTML = icon(collapsed ? 'right' : 'left');
  $('sbTog').setAttribute('aria-label', collapsed ? 'Expandir menu' : 'Recolher menu');
}

$('sbTog').onclick = () => {
  const collapsed = $('app').classList.contains('min');
  try { localStorage.setItem(KEY_MENU, collapsed ? '0' : '1'); } catch (e) {}
  applyMenuState();
};

$('mb').onclick = () => $('app').classList.add('open');
$('bd').onclick = () => $('app').classList.remove('open');
window.addEventListener('resize', applyMenuState);
window.addEventListener('hashchange', () => { if (me) render(); });
$('nav').addEventListener('click', () => $('app').classList.remove('open'));

// Menus de utilizador no topo e barra lateral
const closeMenus = () => { $('am').classList.add('hide'); $('hMenu').classList.remove('on'); };
$('acc').onclick = e => { e.stopPropagation(); const open = $('am').classList.contains('hide'); closeMenus(); $('am').classList.toggle('hide', !open); };
$('hAcc').onclick = e => { e.stopPropagation(); const open = !$('hMenu').classList.contains('on'); closeMenus(); $('hMenu').classList.toggle('on', open); };
document.addEventListener('click', e => { if (!e.target.closest('#acc') && !e.target.closest('#hAcc')) closeMenus(); });   /* fecha ao clicar em qualquer sítio (também dentro do menu) */

function accountAction(e) {
  const btn = e.target.closest('[data-m]');
  if (!btn) return;
  closeMenus();
  const action = btn.dataset.m;
  if (action === 'prof') openProfile();
  if (action === 'theme') toggleTheme();
  if (action === 'emp') openEmp();
  if (action === 'out') logout();
  if (action === 'help') showInfo('Obter ajuda', 'Se esqueceu o e-mail, o telefone ou a senha, use “Esqueci o e-mail, o telefone ou a senha” no ecrã de entrada. Cada módulo tem um Menu no canto superior direito com todas as ações.');
  if (action === 'info') showInfo('Sobre', 'Gerentodo · sistema de faturação e gestão. Os dados ficam guardados neste navegador: faça cópias de segurança regularmente.');
}
$('am').onclick = accountAction;
$('hMenu').onclick = accountAction;

// ==========================================
// GESTÃO DO PERFIL DO UTILIZADOR
// ==========================================
function showProfileAvatar() {
  const a = newAvatar === undefined ? me?.avatar : newAvatar;
  $('pAv').innerHTML = a ? `<img src="${esc(a)}" alt="">` : esc(me?.name?.trim()[0] || '?');
}

function openProfile() {
  if (!me) return;
  $('fProf').reset();
  showError('pErr', '');
  newAvatar = undefined;
  $('pName').value = me.name;
  $('pMail').value = me.email;
  $('pTel').value = me.phone;
  $('pRole').textContent = `Função: ${roleLabel(me)} · ID ${me.id}`;
  showProfileAvatar();
  openModal('mProf');
}

$('pImgX').onclick = () => { newAvatar = ''; showProfileAvatar(); };
$('pImg').onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  if (!/^image\//.test(file.type)) return showError('pErr', 'Escolha um ficheiro de imagem.');
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 160;
      canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 160, 160);
      newAvatar = canvas.toDataURL('image/jpeg', .8);
      showError('pErr', '');
      showProfileAvatar();
    };
    img.onerror = () => showError('pErr', 'Imagem inválida.');
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
};

$('fProf').onsubmit = async e => {
  e.preventDefault();
  load();
  const current = users.find(u => me && u.id === me.id && u.status === 'Ativo');
  if (!current) return forceLogout('A sua conta já não está disponível na base de dados.');
  me = current;
  const name = $('pName').value.trim(), email = $('pMail').value.trim(), phone = $('pTel').value.trim();
  const oldPw = $('pOld').value, newPw = $('pNew').value, newPw2 = $('pNew2').value;
  const avatar = newAvatar === undefined ? (me.avatar || '') : newAvatar;
  if (name.length < 2) return showError('pErr', 'Introduza o nome completo.');
  const dup = duplicateMessage(email, phone, me.id);
  if (dup) return showError('pErr', dup);
  if (name === me.name && email === me.email && phone === me.phone && avatar === (me.avatar || '') && !newPw) {
    return showError('pErr', 'Não há alterações para guardar.');
  }
  if (newPw) {
    if (!strong(newPw)) return showError('pErr', 'Nova senha fraca: ' + WEAK_MSG);
    if (newPw !== newPw2) return showError('pErr', 'A confirmação não coincide com a nova senha.');
    if (newPw === oldPw) return showError('pErr', 'A nova senha deve ser diferente da atual.');
  }
  if (Date.now() < lockUntil) return showError('pErr', `Demasiadas tentativas. Aguarde ${Math.ceil((lockUntil - Date.now()) / 1000)} s.`);
  try {
    if (!await GS.confirmarSenha(me.loginEmail, oldPw)) {
      if (++failedLogins >= 5) { failedLogins = 0; lockUntil = Date.now() + 30000; }
      return showError('pErr', 'Senha atual incorreta. Introduza-a para confirmar as alterações.');
    }
    failedLogins = 0;
    await GS.salvarPerfil({ nome: name, telefone: phone, email, avatar });
    if (newPw) await GS.alterarSenha(newPw);
    Object.assign(me, { name, email, phone, avatar });
    saveUsers();
    closeModal('mProf');
    log(`${me.name} atualizou o próprio perfil${newPw ? ' e a senha' : ''}.`);
    toast('Perfil atualizado.');
    render();
  } catch (x) { showError('pErr', GS.msg(x)); }
};


function fileToData(file, max, square, type) {
  return new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) return reject(new Error('Escolha um ficheiro de imagem.'));
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        if (square) {
          const side = Math.min(img.width, img.height);
          c.width = c.height = max;
          c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, max, max);
        } else {
          const k = Math.min(1, max / Math.max(img.width, img.height));
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        }
        resolve(c.toDataURL(type, .85));
      };
      img.onerror = () => reject(new Error('Imagem inválida.'));
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}



/* Pacote escolhido na página pública antes de ter conta: aplica-se ao entrar (só se a empresa ainda não tiver pacote). */
function aplicarPacotePendente() {
  let pp = null;
  try { pp = JSON.parse(localStorage.getItem('authvault.pacote.pendente') || 'null'); } catch (e) {}
  if (!pp || !me || !isAdmin() || !me.companyId || !window.PACOTES) return;
  try { localStorage.removeItem('authvault.pacote.pendente'); } catch (e) {}
  if (Date.now() - pp.em > 7 * 864e5) return;
  const pk = PACOTES.get(pp.id), comps = loadComps(), c = comps.find(x => x.id === me.companyId);
  if (!pk || !c) return;
  if (c.pacote) return setTimeout(() => toast(`A sua empresa já tem o pacote ${c.pacote.titulo}. Para mudar, abra Pacotes.`), 600);
  GS.escolherPacote(pk).then(() => GS.entrar()).then(() => { render(); toast(`Pacote ${pk.catNome} · ${pk.cicloNome} ativado. Os primeiros ${pk.trial} dias são grátis.`); }).catch(() => {});
}

// ==========================================
// DADOS DA EMPRESA (configurados depois de criar a conta)
// ==========================================
const compAtual = () => (me && me.companyId) ? (loadComps().find(c => c.id === me.companyId) || null) : null;
let empLogo = '';
function empPreview() {
  $('eLogoP').innerHTML = empLogo ? `<img src="${esc(empLogo)}" alt="">` : esc(($('eNome').value.trim()[0] || '?').toUpperCase());
}
function openEmp() {
  if (!me || !me.principal) return toast('Só o administrador principal pode editar os dados da empresa.');
  const c = compAtual();
  if (!c) return toast('Empresa não encontrada.');
  $('fEmp').reset();
  showError('eErr', '');
  $('eNome').value = c.nome || ''; $('eNif').value = c.nif || ''; $('eNac').value = c.nacionalidade || '';
  $('eT1').value = c.tel1 || ''; $('eT2').value = c.tel2 || ''; $('eMail').value = c.email || '';
  $('eProv').value = c.provincia || ''; $('eEnd').value = c.endereco || '';
  empLogo = c.logo || '';
  empPreview();
  openModal('mEmp');
  $('eNome').focus();
}
$('empGo').onclick = openEmp;
$('eNome').addEventListener('input', empPreview);
$('eLogoX').onclick = () => { empLogo = ''; $('eLogo').value = ''; empPreview(); };
$('eLogo').onchange = async e => {
  const f = e.target.files[0]; if (!f) return;
  try { empLogo = await fileToData(f, 240, false, 'image/png'); showError('eErr', ''); empPreview(); } catch (x) { showError('eErr', x.message); }
};
$('fEmp').onsubmit = async e => {
  e.preventDefault();
  load();
  const c0 = compAtual();
  if (!me || !me.principal || !c0) return showError('eErr', 'Sem permissão para editar a empresa.');
  const v = id => $(id).value.trim(), E = m => showError('eErr', m);
  const nome = v('eNome'), nif = v('eNif'), nac = v('eNac'), t1 = v('eT1'), t2 = v('eT2'), mail = v('eMail'), prov = v('eProv'), end = v('eEnd');
  if (nome.length < 2) return E('Introduza o nome da empresa.');
  if (normNif(nif).length < 5) return E('Introduza o NIF da empresa.');
  if (!nac) return E('Indique a nacionalidade.');
  if (digits(t1).length < 9) return E('Introduza o contacto 1 da empresa (mínimo 9 dígitos).');
  if (t2 && digits(t2).length < 9) return E('O contacto 2 da empresa é inválido.');
  if (mail && !EMAIL_RE.test(mail)) return E('O e-mail da empresa é inválido.');
  const comps = loadComps(), outras = comps.filter(c => c.id !== c0.id);
  if (outras.some(c => c.nif && normNif(c.nif) === normNif(nif))) return E('Já existe uma empresa com este NIF.');
  if (outras.some(c => normTxt(c.nome) === normTxt(nome))) return E('Já existe uma empresa com este nome.');
  const c = comps.find(x => x.id === c0.id);
  Object.assign(c, { nome, nif, nacionalidade: nac, tel1: t1, tel2: t2, email: mail, provincia: prov, endereco: end, logo: empLogo, semDados: false });
  try { await GS.salvarEmpresa({ nome, nif, nacionalidade: nac, tel1: t1, tel2: t2, email: mail, provincia: prov, endereco: end, logo: empLogo, sem_dados: false }); } catch (x) { return E(GS.msg(x)); }
  try { localStorage.setItem(KEY_COMP, JSON.stringify(comps)); } catch (x) { return E('Não foi possível guardar (espaço cheio?). Tente um logótipo mais pequeno.'); }
  users.forEach(u => { if (u.companyId === c.id) u.company = nome; });
  me.company = nome;
  saveUsers();
  closeModal('mEmp');
  log(`${me.name} atualizou os dados da empresa ${nome}.`);
  toast('Dados da empresa guardados.');
  render();
};

// Eventos globais de fecho por botão de cancelar ou clique fora da modal
document.querySelectorAll('[data-close]').forEach(b => { b.onclick = () => b.closest('.ov').classList.remove('open'); });
document.querySelectorAll('.ov').forEach(o => o.addEventListener('mousedown', e => { if (e.target === o) o.classList.remove('open'); }));
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeAllModals();
  $('app').classList.remove('open');
});

// Execução inicial
applyTheme();
try { init(); } catch (e) { toast(e.message || 'Erro ao iniciar.'); }
