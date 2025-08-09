// ------- Utilities -------
function INR(n){try{return n.toLocaleString('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0});}catch(e){return '₹'+Math.round(n).toLocaleString('en-IN');}}
function pct(x){return (x).toFixed(2)+'%';}
function mean(a){return a.length? a.reduce((m,x)=>m+x,0)/a.length : 0;}
function cagr(start,end,months){if(months<=0)return 0;return Math.pow(end/start,12/months)-1;}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1100);}
function humanReason(r){
  if(r.expect==='up'&&r.pct<0) return 'Felt bullish, still fell — positioning and profit‑taking can overpower good news.';
  if(r.expect==='down'&&r.pct>0) return 'Looked scary, finished green — markets had already priced the fear in.';
  if(Math.abs(r.pct)<0.2) return 'Headline noise, muted index — breadth rotated under the hood.';
  return 'It’s difficult — headlines ≠ outcomes, flows matter.';
}
function shuffle(a){for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]];}return a;}

// ------- State + DOM -------
const START=1000000;
let PACK=[], i=-1, bank=START, wins=0, losses=0, skips=0, monthsPlayed=0, monthRets=[];

const eI   = document.getElementById('i');
const eN   = document.getElementById('n');
const eBANK= document.getElementById('bank');
const eDATE= document.getElementById('date');
const eH   = document.getElementById('headline');
const eD   = document.getElementById('deck');
const eBY  = document.getElementById('by');

const eSB  = document.getElementById('sb');
const eCB  = document.getElementById('cb');
const eRW  = document.getElementById('rw');
const eSKS = document.getElementById('sk');
const eAM  = document.getElementById('am');
const eCAGR= document.getElementById('cagr');

const eUP  = document.getElementById('up');
const eDN  = document.getElementById('down');
const eSK  = document.getElementById('skip');
const eST  = document.getElementById('start');

function setBtns(disabled){
  [eUP,eDN,eSK].forEach(b=>{b.disabled=disabled; b.style.opacity = disabled? .6 : 1;});
}

function updateScore(){
  eCB.textContent=INR(bank); eBANK.textContent=INR(bank);
  eRW.textContent=`${wins} / ${losses}`; eSKS.textContent=String(skips);
  const avg=monthRets.length? mean(monthRets):0; eAM.textContent=pct(avg);
  const k=monthsPlayed? cagr(START, bank, monthsPlayed)*100 : 0; eCAGR.textContent=pct(k);
}

function showRound(r){
  eI.textContent=String(i+1);
  eDATE.textContent=`${r.month||''} • ${r.date}`;
  eH.textContent=r.headline;
  eD.textContent=r.deck||'';
  const link = r.url ? ` • <a href="${r.url}" target="_blank" rel="noopener">link</a>` : '';
  eBY.innerHTML = `${r.source||'Source'}${link}`;
}

function next(){
  i += 1;
  if(i >= PACK.length){
    finish(); return;
  }
  showRound(PACK[i]);
  setBtns(false);
}

function start(){
  if(!PACK.length){ toast('Pack still loading…'); return; }
  // reset
  shuffle(PACK);
  i=-1; bank=START; wins=0; losses=0; skips=0; monthsPlayed=0; monthRets=[];
  eI.textContent='0'; eH.textContent='Ready. Press UP or DOWN when the headline appears.'; eD.textContent='Monthly headline, as published.'; eBY.textContent='';
  updateScore(); setBtns(true); next();
}

function decide(dir){
  const r = PACK[i];
  const m = Number(r.pct); // day’s % return
  if(dir===0){
    skips += 1; toast('Skipped'); setTimeout(next, 500); updateScore(); return;
  }
  const correct = (m>0 && dir>0) || (m<0 && dir<0) || (m===0);
  correct ? wins++ : losses++;
  const rr = dir * m;
  bank = Math.max(0, bank + bank*(rr/100));
  monthsPlayed++;               // monthly cadence; one item ~ one month decision
  monthRets.push(m);
  toast(`${correct?'Right':'Wrong'} • ${rr>=0?'+':'−'}${Math.abs(rr).toFixed(2)}% — ${humanReason(r)}`);
  updateScore(); setBtns(true);
  setTimeout(next, 900);        // auto-advance
}

function finish(){
  setBtns(true);
  const accPct = (wins+losses)>0 ? Math.round((wins/(wins+losses))*100) : 0;
  const k = monthsPlayed ? cagr(START, bank, monthsPlayed)*100 : 0;
  const leadTrail = k>=0 ? `you are ${k.toFixed(2)}% ahead` : `you are ${Math.abs(k).toFixed(2)}% behind`;
  let advisory='';
  if(accPct>=65 && k>5) advisory='Nice run. Even so, anchoring with high‑quality fixed income can stabilise outcomes when headlines mislead.';
  else if(accPct>=50 && k>=0) advisory='Decent reads. A core fixed‑income allocation helps smooth the journey—and protects gains when markets zigzag.';
  else advisory='Tough tape. This is why a reliable fixed‑income base matters—so your plan isn’t hostage to monthly surprises.';
  alert(`You got ${wins} out of ${wins+losses} right, which means ${leadTrail}. ${advisory}`);
}

// Bindings
eUP.onclick = ()=>decide(+1);
eDN.onclick = ()=>decide(-1);
eSK.onclick = ()=>decide(0);
eST.onclick = start;
window.addEventListener('keydown', (e)=>{const k=e.key.toLowerCase(); if(k==='u')decide(+1); if(k==='d')decide(-1); if(k==='s')decide(0);});

// Load data, then enable Start
fetch('data/questions.json')
  .then(r=>r.json())
  .then(rows=>{
    PACK = rows;
    document.getElementById('n').textContent = String(PACK.length);
    [eSB,eCB,eBANK].forEach(el=>el.textContent=INR(START));
    updateScore();
    eST.disabled = false; // only now
  })
  .catch(()=>{ eH.textContent='Failed to load data/questions.json'; });
