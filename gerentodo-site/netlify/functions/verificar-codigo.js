const crypto = require('crypto');

const resposta = (status, corpo) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(corpo)
});

const espera = ms => new Promise(r => setTimeout(r, ms));

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resposta(405, { ok: false });
  if (!process.env.RECUPERACAO_SEGREDO) return resposta(500, { ok: false, erro: 'O serviço ainda não está configurado.' });

  let corpo;
  try { corpo = JSON.parse(event.body || '{}'); } catch (e) { return resposta(400, { ok: false }); }
  const token = String(corpo.token || '');
  const codigo = String(corpo.codigo || '');
  const partes = token.split('.');
  if (partes.length !== 2 || !/^\d{6}$/.test(codigo)) return resposta(400, { ok: false });

  let dados;
  try { dados = JSON.parse(Buffer.from(partes[0], 'base64url').toString('utf8')); } catch (e) { return resposta(400, { ok: false }); }
  if (!dados || typeof dados.e !== 'number' || Date.now() > dados.e) return resposta(410, { ok: false, erro: 'O código expirou.' });

  const esperado = crypto.createHmac('sha256', process.env.RECUPERACAO_SEGREDO).update(partes[0] + '|' + codigo).digest();
  let recebido;
  try { recebido = Buffer.from(partes[1], 'base64url'); } catch (e) { return resposta(400, { ok: false }); }
  const certo = recebido.length === esperado.length && crypto.timingSafeEqual(recebido, esperado);

  if (!certo) { await espera(600); return resposta(401, { ok: false }); }
  return resposta(200, { ok: true });
};
