/* Núcleo partilhado de Faturacao.html e Documentos.html. Manter na mesma pasta. */
const CSS=`:root{--bg:#f3f5f2;--sf:#fff;--tx:#1b2a26;--mu:#66756f;--bd:#dbe2dd;--ac:#0f6b57;--ac2:#e6f2ee;--rd:#c0392b;--sh:0 8px 30px rgba(0,0,0,.18)}
:root[data-t=dark]{--bg:#121816;--sf:#1a2320;--tx:#e8efec;--mu:#93a49d;--bd:#2c3935;--ac:#3bb592;--ac2:#1f332d;--rd:#e5675a;--sh:0 8px 30px rgba(0,0,0,.6)}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.45 "Segoe UI",system-ui,sans-serif}
header{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;padding:14px 20px;background:var(--sf);border-bottom:1px solid var(--bd)}
h1{font-size:20px;margin:0}main{padding:20px;max-width:1300px;margin:auto}button,input,select,textarea{font:inherit;color:inherit}
.btn{background:var(--sf);border:1px solid var(--bd);border-radius:8px;padding:8px 14px;cursor:pointer;text-decoration:none;display:inline-block}
.btn:hover{border-color:var(--ac)}.btn.p{background:var(--ac);border-color:var(--ac);color:#fff}.btn.d{color:var(--rd)}.btn.s{padding:3px 9px;font-size:13px}
:focus-visible{outline:2px solid var(--ac);outline-offset:1px}.row{display:flex;flex-wrap:wrap;gap:8px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:16px}
.card{background:var(--sf);border:1px solid var(--bd);border-radius:10px;padding:12px 14px}.card b{display:block;font-size:19px}.card span{color:var(--mu);font-size:13px}
.filters{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:14px 0}
input,select,textarea{width:100%;padding:8px 10px;border:1px solid var(--bd);border-radius:8px;background:var(--sf)}
.tw{overflow-x:auto;background:var(--sf);border:1px solid var(--bd);border-radius:10px}table{width:100%;border-collapse:collapse;min-width:820px}
th,td{padding:9px 10px;text-align:left;border-bottom:1px solid var(--bd);white-space:nowrap}th{color:var(--mu);font-weight:600}
.tg{padding:2px 8px;border-radius:99px;font-size:12px;background:var(--ac2);color:var(--ac)}.tg.r{background:#fbe4e1;color:var(--rd)}.rd{color:var(--rd);font-weight:600}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;padding:14px;z-index:10}.ov.on{display:flex}
.ov.hi{z-index:15}.md{background:var(--sf);border-radius:12px;padding:20px;max-width:560px;width:100%;max-height:92vh;overflow:auto;box-shadow:var(--sh)}.md.w{max-width:900px}.md h2{margin:0 0 12px;font-size:18px}
label{display:block;font-size:13px;color:var(--mu);margin:10px 0 3px}.g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.err{border-color:var(--rd)!important}.hint{font-size:13px;color:var(--mu);margin-top:4px}.chk{display:flex;align-items:center;gap:8px;color:var(--tx)}.chk input{width:auto}
.acts{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap}.li{display:block;width:100%;text-align:left;margin-bottom:6px}.hl{border-bottom:1px solid var(--bd);padding:6px 0;font-size:14px}
#toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:var(--tx);color:var(--bg);padding:10px 18px;border-radius:8px;display:none;z-index:30}`;
document.head.appendChild(Object.assign(document.createElement('style'),{textContent:CSS}));
document.documentElement.dataset.t=localStorage.getItem('tema')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
function tema(){const d=document.documentElement,t=d.dataset.t==='dark'?'light':'dark';d.dataset.t=t;localStorage.setItem('tema',t)}

const $=id=>document.getElementById(id);
const kz=v=>(Number(v)||0).toLocaleString('pt-PT',{minimumFractionDigits:2,maximumFractionDigits:2}).replace(/\u00a0/g,'.')+' Kz';
const norm=s=>(s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=s=>(s||'').toString().replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const fmtD=d=>d?d.slice(0,10).split('-').reverse().join('/'):'';
const addDays=(n,from)=>{const d=from?new Date(from):new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const addMonths=n=>{const d=new Date();d.setMonth(d.getMonth()+n);return d.toISOString().slice(0,10)};
const LS={g:(k,d)=>JSON.parse(localStorage.getItem(k)||'null')||d,s:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
function toast(t){const e=$('toast');e.textContent=t;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display='none',3000)}
function modal(h){$('mb').innerHTML=h;$('m').classList.add('on')}
function closeM(){$('m').classList.remove('on')}
function confirmBox(msg,fn,yes='Confirmar',no='Cancelar'){window._cf=fn;modal(`<h2>${msg}</h2><div class="acts"><button class="btn" onclick="closeM()">${no}</button><button class="btn p" onclick="closeM();_cf()">${yes}</button></div>`)}

const TIPOS={FT:'Fatura',FR:'Fatura-recibo',FP:'Fatura proforma',RC:'Recibo',GR:'Guia de remessa',NC:'Nota de crédito',ND:'Nota de débito'};
const ABATE=['FT','FR','GR'],CRED=['FT','ND'],FORMAS=['Numerário','Transferência','TPA','Multicaixa Express'];
const FD={docs:[],pg:[],seq:{},cfg:{emp:'',nif:'',end:'',tel:'',em:'',logo:'',bancos:[],modelo:1,iva:14,isencoes:['Isento nos termos da lei'],rodape:'',cond:'Pronto pagamento'}};
function loadF(){const f=LS.g('faturacao_v1',{});return{...FD,...f,cfg:{...FD.cfg,...(f.cfg||{})},seq:f.seq||{}}}
let F=loadF();const saveF=()=>LS.s('faturacao_v1',F);
const P=()=>LS.g('produtos_v2',{p:[],h:[]}),saveP=x=>LS.s('produtos_v2',x);
function getC(){const c=LS.g('clientes_v1',{c:[],pg:[],doc:[]});if(!c.c.some(x=>x.final))c.c.unshift({id:c.c.reduce((m,x)=>Math.max(m,x.id),0)+1,ref:'CLI-0000',final:true,tp:'Particular',n:'Cliente final',tel:'—',cat:'Normal',cp:'Pronto pagamento',ativo:true,ts:Date.now(),pv:'',nif:''});return c}
const saveC=x=>LS.s('clientes_v1',x);
const DEPS=()=>LS.g('departamentos_v1',{d:[]}).d.filter(d=>d.ativo).map(d=>d.n);
function final(p){const pv=+p.pv||0,d=+p.ds||0;return Math.max(0,p.dt==='Kz'?pv-d:pv-pv*d/100)}
const divida=d=>CRED.includes(d.tipo)&&d.estado!=='Anulado'?Math.max(0,d.total-(d.pago||0)):0;
const vencido=d=>divida(d)>0&&d.venc<today();
const clientDivida=cid=>F.docs.filter(d=>d.cid===cid).reduce((s,d)=>s+divida(d),0);
const clientVenc=cid=>F.docs.some(d=>d.cid===cid&&vencido(d));
const histP=(X,p,tipo,q,motivo,dest,sol)=>X.h.push({pid:p.id,tipo,qtd:q,data:new Date().toLocaleString('pt-PT'),ts:Date.now(),motivo,dest,sol});

function calc(itens,isento){
  let bruto=0,desc=0,iva=0;
  const L=itens.map(i=>{const b=i.q*i.pu,d=Math.min(b,i.dt==='Kz'?+i.desc||0:b*(+i.desc||0)/100),s=b-d,v=isento?0:s*F.cfg.iva/100;bruto+=b;desc+=d;iva+=v;return{...i,sub:s,iva:v}});
  return{L,bruto,desc,liq:bruto-desc,iva,total:bruto-desc+iva};
}
function nextNum(t){const y=new Date().getFullYear(),k=t+y;F.seq[k]=(F.seq[k]||0)+1;return`${t} ${y}/${String(F.seq[k]).padStart(4,'0')}`}

function pagar(id,valor,forma,data,rec){
  const d=F.docs.find(x=>x.id===id),ant=divida(d);
  d.pago=(d.pago||0)+valor;d.estado=d.pago>=d.total-.005?'Pago':'Parcialmente pago';
  F.pg.push({id:Date.now()+Math.random(),did:id,cid:d.cid,valor,forma,data,rec});
  const cc=getC();cc.pg.push({id:Date.now()+Math.random(),cid:d.cid,valor,forma,data,rec});saveC(cc);saveF();
  return{ant,atual:divida(d)};
}
function emitir(doc){
  doc.id=Date.now();doc.num=nextNum(doc.tipo);doc.ts=Date.now();doc.dia=today();doc.pago=0;doc.estado='Emitido';doc.envio='Não enviado';
  const cc=getC();
  if(ABATE.includes(doc.tipo)&&!doc.skipStock){
    const X=P();doc.itens.forEach(i=>{const p=X.p.find(x=>x.id===i.pid);if(p){p.qa=p.q;p.q-=i.q;histP(X,p,'Saída',i.q,'Venda '+doc.num,doc.dep||'Venda',doc.cli.n)}});saveP(X);doc.stock=true;
  }
  F.docs.push(doc);
  if(CRED.includes(doc.tipo))cc.doc.push({id:doc.id,cid:doc.cid,num:doc.num,data:doc.dia,venc:doc.venc,valor:doc.total,estado:'Emitido'});
  if(doc.tipo==='FR'){cc.doc.push({id:doc.id,cid:doc.cid,num:doc.num,data:doc.dia,venc:doc.dia,valor:doc.total,estado:'Emitido'});cc.pg.push({id:doc.id+1,cid:doc.cid,valor:doc.total,forma:doc.forma,data:doc.dia,rec:doc.num});F.pg.push({id:doc.id+1,did:doc.id,cid:doc.cid,valor:doc.total,forma:doc.forma,data:doc.dia,rec:doc.num});doc.pago=doc.total;doc.estado='Pago'}
  if(doc.tipo==='NC')cc.pg.push({id:doc.id+2,cid:doc.cid,valor:doc.total,forma:'Nota de crédito',data:doc.dia,rec:doc.num});
  saveC(cc);saveF();
  if(doc.tipo==='RC'){
    let left=doc.total;
    F.docs.filter(d=>d.cid===doc.cid&&divida(d)>0).sort((a,b)=>a.ts-b.ts).forEach(d=>{if(left<=0)return;const v=Math.min(left,divida(d));pagar(d.id,v,doc.forma,doc.dia,doc.num);left-=v});
    if(left>0){const c2=getC();c2.pg.push({id:doc.id+3,cid:doc.cid,valor:left,forma:doc.forma,data:doc.dia,rec:doc.num});saveC(c2)}
    doc.estado='Pago';saveF();
  }
  return doc;
}
function anular(id,motivo){
  const d=F.docs.find(x=>x.id===id);
  if(d.stock){const X=P();d.itens.forEach(i=>{const p=X.p.find(x=>x.id===i.pid);if(p){p.qa=p.q;p.q+=i.q;histP(X,p,'Entrada',i.q,'Anulação '+d.num)}});saveP(X);d.stock=false}
  d.estado='Anulado';d.motivo=motivo;
  const cc=getC();cc.doc.forEach(x=>{if(x.id===d.id)x.estado='Anulado'});saveC(cc);
  const nc={...JSON.parse(JSON.stringify(d)),tipo:'NC',ref:d.num,anulacao:true,estado:'Emitido',obs:`Anulação de ${d.num}: ${motivo}`,stock:false,pago:0,id:Date.now()+5,num:nextNum('NC'),ts:Date.now(),dia:today(),envio:'Não enviado'};
  F.docs.push(nc);saveF();return nc;
}

/* documento impresso */
function docHTML(d){
  const c=F.cfg,m=c.modelo===2,cor=m?'#0f6b57':'#222';
  const rows=d.itens.map(i=>`<tr><td>${esc(i.n)}</td><td class="r">${i.q}</td><td class="r">${kz(i.pu)}</td><td class="r">${i.desc?(i.dt==='Kz'?kz(i.desc):i.desc+'%'):'—'}</td><td class="r">${d.isento?'Isento':F.cfg.iva+'%'}</td><td class="r">${kz(i.sub)}</td></tr>`).join('');
  return`<div class="doc"><div class="top"><div>${c.logo?`<img src="${c.logo}" style="max-height:60px"><br>`:''}<b style="font-size:16px">${esc(c.emp)||'Empresa'}</b><br>NIF ${esc(c.nif)||'—'}<br>${esc(c.end)}<br>${esc(c.tel)} ${esc(c.em)}</div><div style="text-align:right"><h1 style="color:${cor};margin:0">${TIPOS[d.tipo]}</h1><b>${d.num}</b><br>Emissão: ${fmtD(d.dia)}<br>Vencimento: ${fmtD(d.venc)}${d.ref?`<br>Ref.: ${d.ref}`:''}</div></div>
  <div class="cli"><b>Cliente:</b> ${esc(d.cli.n)}<br>NIF/BI: ${esc(d.cli.nif)||'—'} · ${esc(d.cli.end)||''} ${esc(d.cli.tel)||''}</div>
  <table><thead><tr><th>Descrição</th><th class="r">Qtd</th><th class="r">Preço</th><th class="r">Desc.</th><th class="r">IVA</th><th class="r">Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
  <div class="tot">Subtotal: ${kz(d.bruto)}<br>Descontos: ${kz(d.desc)}<br>IVA: ${kz(d.iva)}<br><b style="font-size:16px">Total: ${kz(d.total)}</b>${d.pago?`<br>Pago: ${kz(d.pago)}`:''}</div>
  ${d.isento?`<p><b>Isenção de IVA:</b> ${esc(d.motivoIsento)}</p>`:''}<p>Forma de pagamento: ${esc(d.forma)}${d.dep?' · Vendedor/Departamento: '+esc(d.dep):''}</p>${d.obs?`<p>Obs.: ${esc(d.obs)}</p>`:''}
  ${c.bancos.length?`<p><b>Contas bancárias:</b><br>${c.bancos.map(b=>esc(b.b+' · Conta '+b.c+' · IBAN '+b.i)).join('<br>')}</p>`:''}<p class="hint">${esc(c.rodape)}</p></div>`;
}
const DOCCSS='body{font:12px "Segoe UI",Arial,sans-serif;color:#111;margin:24px}.top{display:flex;justify-content:space-between;gap:20px;margin-bottom:14px}.cli{border:1px solid #ccc;padding:8px;margin-bottom:10px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ccc;padding:5px 6px;text-align:left}th{background:#eef3f0}.r{text-align:right}.tot{text-align:right;margin:12px 0}.hint{color:#666}@media print{@page{margin:12mm}}';
function openWin(title,body,css=DOCCSS){const w=window.open('','_blank');if(!w){toast('O navegador bloqueou a janela. Permita pop-ups e tente de novo.');return}w.document.write(`<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}</style></head><body>${body}<script>onload=()=>setTimeout(()=>print(),300)<\/script></body></html>`);w.document.close()}
const viewDoc=d=>openWin(d.num,docHTML(d));
function cliOf(d){return getC().c.find(c=>c.id===d.cid)||{}}
function marcaEnvio(d,t){d.envio=t+' em '+new Date().toLocaleString('pt-PT');saveF()}
function enviar(id,via){
  const d=F.docs.find(x=>x.id===id),c=cliOf(d),msg=`${TIPOS[d.tipo]} ${d.num} — ${F.cfg.emp}\nTotal: ${kz(d.total)}\nVencimento: ${fmtD(d.venc)}`;
  if(via==='wa'){const t=((c.wa||c.tel||'')+'').split(',')[0].replace(/\D/g,'');if(!t)return toast('O cliente não tem telefone/WhatsApp.');window.open('https://wa.me/'+(t.length===9?'244'+t:t)+'?text='+encodeURIComponent(msg),'_blank');marcaEnvio(d,'Enviado por WhatsApp')}
  else{if(!c.em)return toast('O cliente não tem email.');location.href='mailto:'+c.em+'?subject='+encodeURIComponent(TIPOS[d.tipo]+' '+d.num)+'&body='+encodeURIComponent(msg);marcaEnvio(d,'Enviado por e-mail')}
  toast('Envio registado.');window.onData&&onData();
}

/* registar pagamento (4235) */
function openPag(did){
  modal(`<h2>Registar pagamento</h2><label>Cliente ou documento</label><input id="pg_q" oninput="pagSearch()" placeholder="Nº do documento, cliente ou NIF"><select id="pg_l" size="5" onchange="pagPick()" style="margin-top:6px"></select><div class="hint" id="pg_i"></div>
  <div class="g2"><div><label>Valor recebido (Kz) *</label><input id="pg_v" type="number" min="0" step="0.01"></div><div><label>Forma de pagamento</label><select id="pg_f">${FORMAS.map(f=>`<option>${f}</option>`).join('')}</select></div></div>
  <div class="g2"><div><label>Data</label><input id="pg_d" type="date" value="${today()}"></div><div><label>Nº do recibo</label><input id="pg_r"></div></div>
  <div class="acts"><button class="btn" onclick="closeM()">Cancelar</button><button class="btn p" onclick="regPag()">Registar</button></div>`);
  window._pd=null;pagSearch();if(did){$('pg_l').value=did;pagPick()}
}
function pagSearch(){const q=norm($('pg_q').value);$('pg_l').innerHTML=F.docs.filter(d=>divida(d)>0&&(!q||norm(d.num+' '+d.cli.n+' '+d.cli.nif).includes(q))).slice(0,40).map(d=>`<option value="${d.id}">${d.num} · ${esc(d.cli.n)} · dívida ${kz(divida(d))}</option>`).join('')}
function pagPick(){const d=F.docs.find(x=>x.id==$('pg_l').value);window._pd=d?d.id:null;$('pg_i').textContent=d?`Dívida do documento: ${kz(divida(d))} · cliente: ${kz(clientDivida(d.cid))}`:''}
function regPag(){
  const d=F.docs.find(x=>x.id===window._pd),v=+$('pg_v').value;
  if(!d)return toast('Escolha um documento em dívida.');if(!(v>0))return toast('Indique o valor recebido.');
  if(v>divida(d)+.005)return toast('O valor não pode ser maior que a dívida do documento ('+kz(divida(d))+').');
  const r=pagar(d.id,v,$('pg_f').value,$('pg_d').value||today(),$('pg_r').value.trim());
  modal(`<h2>Pagamento registado</h2><p>${d.num} · ${esc(d.cli.n)}</p><p>Dívida anterior: <b>${kz(r.ant)}</b><br>Valor pago: <b>${kz(v)}</b><br>Dívida atual: <b>${kz(r.atual)}</b><br>Estado: ${d.estado}</p><div class="acts"><button class="btn p" onclick="closeM()">Fechar</button></div>`);
  window.onData&&onData();
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.ov.on').forEach(o=>o.classList.remove('on'))}});
