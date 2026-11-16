const crypto = require('crypto');

const resposta = (status, corpo) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(corpo)
});

const assinar = (payload, codigo) =>
  crypto.createHmac('sha256', process.env.RECUPERACAO_SEGREDO).update(payload + '|' + codigo).digest('base64url');

async function enviarEmail(para, codigo) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_REMETENTE,
      to: [para],
      subject: 'O seu código de recuperação — Gerentodo',
      text: 'O seu código de recuperação é ' + codigo + '. Vale 10 minutos. Se não pediu este código, ignore esta mensagem.'
    })
  });
  if (!r.ok) throw new Error('email ' + r.status);
}

async function enviarWhatsapp(para, codigo) {
  const r = await fetch('https://graph.facebook.com/v20.0/' + process.env.WHATSAPP_PHONE_ID + '/messages', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + process.env.WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: para,
      type: 'template',
      template: {
        name: process.env.WHATSAPP_TEMPLATE || 'codigo_recuperacao',
        language: { code: process.env.WHATSAPP_IDIOMA || 'pt_PT' },
        components: [
          { type: 'body', parameters: [{ type: 'text', text: codigo }] },
          { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: codigo }] }
        ]
      }
    })
  });
  if (!r.ok) throw new Error('whatsapp ' + r.status);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return resposta(405, { ok: false, erro: 'Método não permitido.' });
  if (!process.env.RECUPERACAO_SEGREDO) return resposta(500, { ok: false, erro: 'O serviço de envio ainda não está configurado.' });

  let corpo;
  try { corpo = JSON.parse(event.body || '{}'); } catch (e) { return resposta(400, { ok: false, erro: 'Pedido inválido.' }); }
  const canal = corpo.canal;
  const destino = String(corpo.destino || '').trim();

  if (canal === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destino)) return resposta(400, { ok: false, erro: 'E-mail inválido.' });
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_REMETENTE) return resposta(500, { ok: false, erro: 'O envio por e-mail ainda não está configurado.' });
  } else if (canal === 'whatsapp') {
    const d = destino.replace(/\D/g, '');
    if (d.length < 9 || d.length > 15) return resposta(400, { ok: false, erro: 'Número inválido.' });
    if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_ID) return resposta(500, { ok: false, erro: 'O envio por WhatsApp ainda não está configurado.' });
  } else {
    return resposta(400, { ok: false, erro: 'Canal inválido.' });
  }

  const codigo = String(crypto.randomInt(100000, 1000000));
  const payload = Buffer.from(JSON.stringify({ c: canal, d: destino, e: Date.now() + 10 * 60 * 1000 })).toString('base64url');

  try {
    if (canal === 'email') await enviarEmail(destino, codigo);
    else await enviarWhatsapp(destino.replace(/\D/g, ''), codigo);
  } catch (e) {
    return resposta(502, { ok: false, erro: 'Não foi possível enviar a mensagem. Tente mais tarde.' });
  }

  return resposta(200, { ok: true, token: payload + '.' + assinar(payload, codigo) });
};
