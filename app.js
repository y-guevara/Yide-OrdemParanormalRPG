// ===== Dados fixos =====
const ATR=[["vig","Vigor"],["ref","Reflexo"],["men","Mente"],["pre","Presença"],["ins","Instinto"]];
const PER=[["Atletismo","vig"],["Luta","vig"],["Pontaria","ref"],["Furtividade","ref"],["Investigação","men"],["Ocultismo","men"],["Medicina","men"],["Persuasão","pre"],["Vontade","pre"],["Percepção","ins"],["Sobrevivência","ins"]];
// ===== Estado =====
let S={agentes:[],camps:[]},aba="agentes",atual=null,campAtual=null;
try{const x=JSON.parse(localStorage.getItem("yide"));if(x)S=x}catch(e){}
const salvar=()=>{try{localStorage.setItem("yide",JSON.stringify(S))}catch(e){}};
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Math.random().toString(36).slice(2,10);
const enc=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o))));
const dec=s=>JSON.parse(decodeURIComponent(escape(atob(s))));
const link=(k,o)=>location.origin+location.pathname+"#"+k+"="+enc(o);

function maxes(a){const n=a.nivel,v=a.atr.vig,m=a.atr.men,p=a.atr.pre;
 return{pv:10+3*v+(n-1)*(3+v),san:15+2*m+(n-1)*3,pe:4+2*p+(n-1)*(1+p)}}

function aviso(t){const r=$("rolagem");r.textContent=t;r.style.display="block";clearTimeout(aviso.t);aviso.t=setTimeout(()=>r.style.display="none",4500)}

// ===== Navegação =====
const ABAS=[["agentes","Agentes"],["campanhas","Campanhas"],["grimorio","Grimório"],["bestiario","Bestiário"],["guia","Classes e origens"],["regras","Regras"]];
function ir(a){aba=a;atual=null;campAtual=null;render()}
function render(){
 $("nav").innerHTML=ABAS.map(([k,n])=>`<button class="${aba===k?"on":""}" onclick="ir('${k}')">${n}</button>`).join("");
 const v=$("view");
 if(aba==="agentes")v.innerHTML=atual?vFicha(S.agentes.find(a=>a.id===atual)):vAgentes();
 if(aba==="campanhas")v.innerHTML=campAtual?vCamp(S.camps.find(c=>c.id===campAtual)):vCamps();
 if(aba==="bestiario")vBest();if(aba==="grimorio")vGrim();if(aba==="guia")vGuia();
 if(aba==="regras")v.innerHTML="<h2>Regras</h2>"+REGRAS.map(r=>`<details><summary>${r[0]}</summary>${r[1]}</details>`).join("");
}

// ===== Agentes =====
function vAgentes(){
 return`<div class="barra"><h2>Seus agentes</h2><button class="btn pri" onclick="novoAgente()">Novo agente</button></div>
 <div class="grade">${S.agentes.map(a=>`<div class="ficha clic" onclick="atual='${a.id}';render()"><span class="selo">NÍVEL ${a.nivel}</span><h3>${esc(a.nome)}</h3><div class="sub">${esc(a.classe)} · ${esc(a.origem||"sem origem")}</div></div>`).join("")||'<p class="mudo">Nenhum agente ainda. Crie o primeiro.</p>'}</div>`}

function novoAgente(){
 $("dlg").innerHTML=`<h3>Criar agente</h3><label>Nome</label><input id="an"><label>Origem</label><select id="ao" onchange="prevOC()">${ORIGENS.map(o=>`<option>${o.n}</option>`).join("")}</select><label>Classe</label><select id="ac" onchange="prevOC()">${CLASSES.map(c=>`<option>${c.n}</option>`).join("")}</select><div id="prev"></div><br><button class="btn pri" onclick="criaAgente()">Criar ficha</button> <button class="btn" onclick="$('dlg').close()">Cancelar</button>`;prevOC();$("dlg").showModal()}
function prevOC(){const o=ORIGENS.find(x=>x.n===$("ao").value),c=CLASSES.find(x=>x.n===$("ac").value);$("prev").innerHTML=`<p><b>${o.n}:</b> ${o.d}<br><small>Perícias: ${o.per.join(", ")}</small></p><p><b>${c.n}:</b> ${c.d}</p>`}
function criaAgente(){const o=ORIGENS.find(x=>x.n===$("ao").value);
 const a={id:uid(),nome:$("an").value.trim()||"Agente sem nome",origem:o.n,classe:$("ac").value,nivel:1,atr:{vig:1,ref:1,men:1,pre:1,ins:1},pv:0,san:0,pe:0,per:[...o.per],rit:[],hist:"",inv:"",notas:""};
 const m=maxes(a);a.pv=m.pv;a.san=m.san;a.pe=m.pe;S.agentes.push(a);salvar();$("dlg").close();atual=a.id;render()}
const cls=n=>CLASSES.find(c=>c.n===n),ori=n=>ORIGENS.find(o=>o.n===n);
function infoOC(a){const c=cls(a.classe),o=ori(a.origem);
 return(c?`<details><summary>Sobre a classe ${esc(c.n)}</summary><p>${c.d}</p><p><b>Habilidade:</b> ${c.h}</p><p><b>Progressão:</b> ${c.p}</p></details>`:"")+(o?`<details><summary>Sobre a origem ${esc(o.n)}</summary><p>${o.d}</p><p><b>Perícias:</b> ${o.per.join(", ")}</p><p><b>Habilidade:</b> ${o.h}</p></details>`:"")}
function secRituais(a){const k=a.rit||[];
 return`<label>Rituais conhecidos</label>${k.map(id=>{const r=RITUAIS.find(x=>x.id===id);return r?`<details><summary>${r.n} · ${r.el} · ${r.c}º círculo · ${r.pe} PE</summary><p>${r.d}</p><p class="sub"><b>Execução:</b> ${r.ex} · <b>Alcance:</b> ${r.al} · <b>Duração:</b> ${r.du} · <b>Resistência:</b> ${r.rs}</p><button class="btn sm" onclick="ritRm('${id}')">Esquecer</button></details>`:""}).join("")||'<p class="sub">Nenhum ritual aprendido.</p>'}<select onchange="ritAdd(this.value)"><option value="">+ Aprender ritual…</option>${RITUAIS.filter(r=>!k.includes(r.id)).map(r=>`<option value="${r.id}">${r.n} (${r.el}, ${r.c}º círculo)</option>`).join("")}</select>`}
function ritAdd(id){if(!id)return;const a=ag();a.rit=[...(a.rit||[]),id];salvar();render()}
function ritRm(id){const a=ag();a.rit=a.rit.filter(x=>x!==id);salvar();render()}


