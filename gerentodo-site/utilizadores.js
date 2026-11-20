/* =====================================================================
   netlify/functions/utilizadores.js — gestão de utilizadores (só administradores).
   Criar, editar, ativar/desativar e eliminar funcionários e administradores
   secundários. Precisa de uma chave SECRETA do Supabase, que fica só aqui
   (variável SUPABASE_SECRET_KEY no Netlify). Nunca vai para o navegador.
   Regras: o administrador principal gere todos (menos ele próprio); o
   administrador secundário gere só funcionários; só o principal cria
   administradores secundários.
   ===================================================================== */
const URL_BASE = (process.env.SUPABASE_URL || 'https://niocmasompmdqjcylhsx.supabase.co').replace(/\/+$/, '');
const KEY = process.env.SUPABASE_SECRET_KEY || '';

const resp = (status, corpo) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(corpo)
});
const falha = (status, erro) => resp(status, { ok: false, erro });

const dig = t => String(t || '').replace(/\D/g, '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const forte = p => typeof p === 'string' && p.length >= 10 && /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* chamada ao Supabase com a chave secreta (as chaves sb_secret_ vão só em "apikey") */
async function sb(caminho, opcoes) {
  const o = opcoes || {};
  const h = Object.assign({ apikey: KEY, 'Content-Type': 'application/json' }, o.headers || {});
  if (/^eyJ/.test(KEY) && !h.Authorization) h.Authorization = 'Bearer ' + KEY;   /* chave antiga (JWT) */
  const r = await fetch(URL_BASE + caminho, { method: o.method || 'GET', headers: h, body: o.body ? JSON.stringify(o.body) : undefined });
  let dados = null; const txt = await r.text();
  try { dados = txt ? JSON.parse(txt) : null; } catch (e) { dados = txt; }
  return { status: r.status, ok: r.ok, dados };
}
const msgDe = d => (d && (d.msg || d.message || d.error_description || d.error)) || '';

async function perfilPorId(id) {
  const r = await sb('/rest/v1/perfis?id=eq.' + encodeURIComponent(id) + '&select=*');
  return r.ok && Array.isArray(r.dados) ? r.dados[0] || null : null;
}
function erroDeInsercao(r) {
  const d = r.dados || {};
  if (d.code === '23505' || /duplicate key|already exists/i.test(msgDe(d))) {
    return /email_login/.test(msgDe(d)) ? 'Já existe uma conta com este e-mail.' : 'Já existe uma conta com este contacto.';
  }
  return 'Não foi possível guardar o utilizador.';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return falha(405, 'Método não permitido.');
  if (!KEY) return falha(500, 'O servidor ainda não está configurado (falta a chave secreta no Netlify).');

  let b;
  try { b = JSON.parse(event.body || '{}'); } catch (e) { return falha(400, 'Pedido inválido.'); }
  const cab = event.headers || {};
  const token = String(cab.authorization || cab.Authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return falha(401, 'Sessão inválida. Entre novamente.');

  /* quem está a pedir? */
  const u = await sb('/auth/v1/user', { headers: { Authorization: 'Bearer ' + token } });
  if (!u.ok || !u.dados || !u.dados.id) return falha(401, 'Sessão inválida. Entre novamente.');
  const eu = await perfilPorId(u.dados.id);
  if (!eu || eu.estado !== 'Ativo' || eu.role !== 'Administrador') return falha(403, 'Só os administradores podem gerir utilizadores.');

  const podeGerir = t => !!t && t.id !== eu.id && !t.principal && t.empresa_id === eu.empresa_id && (eu.principal || t.role !== 'Administrador');
  const acao = b.acao;

  /* ---------- criar ---------- */
  if (acao === 'criar') {
    const nome = String(b.nome || '').trim(), tel = String(b.telefone || '').trim(), mail = String(b.email || '').trim();
    const role = b.tipo === 'a' ? 'Administrador' : 'Funcionário';
    if (role === 'Administrador' && !eu.principal) return falha(403, 'Só o administrador principal pode criar administradores.');
    if (nome.length < 2) return falha(400, 'Introduza o nome completo.');
    if (dig(tel).length < 9) return falha(400, 'Introduza o contacto (mínimo 9 dígitos).');
    if (mail && !EMAIL_RE.test(mail)) return falha(400, 'O e-mail é inválido.');
    if (!forte(b.senha)) return falha(400, 'Senha fraca: use 10+ caracteres com maiúscula, minúscula, número e símbolo.');
    const loginEmail = mail || ('u' + dig(tel).slice(-9) + '@gerentodo.app');
    const c = await sb('/auth/v1/admin/users', { method: 'POST', body: { email: loginEmail, password: b.senha, email_confirm: true } });
    if (!c.ok || !c.dados || !c.dados.id) {
      return falha(/already|registered|exists/i.test(msgDe(c.dados)) ? 409 : 502,
        /already|registered|exists/i.test(msgDe(c.dados)) ? 'Já existe uma conta com este e-mail ou contacto.' : 'Não foi possível criar a conta de acesso.');
    }
    const ins = await sb('/rest/v1/perfis', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: {
      id: c.dados.id, empresa_id: eu.empresa_id, nome, telefone: tel, email: mail, email_login: loginEmail,
      role, principal: false, estado: 'Ativo' } });
    if (!ins.ok) {
      await sb('/auth/v1/admin/users/' + c.dados.id, { method: 'DELETE' });     /* desfaz a conta de acesso */
      return falha(409, erroDeInsercao(ins));
    }
    return resp(200, { ok: true, id: c.dados.id });
  }

  /* as restantes ações precisam de um utilizador alvo */
  if (!UUID_RE.test(String(b.id || ''))) return falha(400, 'Utilizador inválido.');
  const alvo = await perfilPorId(b.id);
  if (!podeGerir(alvo)) return falha(403, 'Sem permissão para gerir este utilizador.');

  /* ---------- editar ---------- */
  if (acao === 'editar') {
    const nome = String(b.nome || '').trim(), tel = String(b.telefone || '').trim(), mail = String(b.email || '').trim();
    const role = b.tipo === 'a' ? 'Administrador' : 'Funcionário';
    if (role !== alvo.role && !eu.principal) return falha(403, 'Só o administrador principal pode alterar o tipo de utilizador.');
    if (nome.length < 2) return falha(400, 'Introduza o nome completo.');
    if (dig(tel).length < 9) return falha(400, 'Introduza o contacto (mínimo 9 dígitos).');
    if (mail && !EMAIL_RE.test(mail)) return falha(400, 'O e-mail é inválido.');
    if (b.senha && !forte(b.senha)) return falha(400, 'Senha fraca: use 10+ caracteres com maiúscula, minúscula, número e símbolo.');
    const estado = role === 'Administrador' ? 'Ativo' : (b.estado === 'Inativo' ? 'Inativo' : 'Ativo');
    const up = await sb('/rest/v1/perfis?id=eq.' + alvo.id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: { nome, telefone: tel, email: mail, role, estado } });
    if (!up.ok) return falha(409, erroDeInsercao(up));
    const auth = {};
    if (b.senha) auth.password = b.senha;
    if (estado !== alvo.estado || role !== alvo.role) auth.ban_duration = estado === 'Inativo' ? '876000h' : 'none';
    if (Object.keys(auth).length) {
      const a = await sb('/auth/v1/admin/users/' + alvo.id, { method: 'PUT', body: auth });
      if (!a.ok && auth.password) return falha(502, 'Os dados foram guardados, mas não foi possível alterar a senha.');
    }
    return resp(200, { ok: true });
  }

  /* ---------- ativar / desativar (só funcionários) ---------- */
  if (acao === 'estado') {
    if (alvo.role === 'Administrador') return falha(400, 'A conta de administrador não pode ser desativada.');
    const estado = b.estado === 'Inativo' ? 'Inativo' : 'Ativo';
    const up = await sb('/rest/v1/perfis?id=eq.' + alvo.id, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: { estado } });
    if (!up.ok) return falha(502, 'Não foi possível alterar o estado.');
    await sb('/auth/v1/admin/users/' + alvo.id, { method: 'PUT', body: { ban_duration: estado === 'Inativo' ? '876000h' : 'none' } });
    return resp(200, { ok: true });
  }

  /* ---------- eliminar ---------- */
  if (acao === 'eliminar') {
    const d = await sb('/auth/v1/admin/users/' + alvo.id, { method: 'DELETE' });
    if (!d.ok) return falha(502, 'Não foi possível eliminar o utilizador.');
    return resp(200, { ok: true });
  }

  return falha(400, 'Ação desconhecida.');
};
