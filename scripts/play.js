// -------- Utilities --------
function pct(x){return (x).toFixed(2)+'%';}
function humanReason(r){
  if(r.expect==='up'&&r.pct<0) return 'Felt bullish, still fell — profit‑taking/positioning can overpower good news.';
  if(r.expect==='down'&&r.pct>0) return 'Looked scary, finished green — fear was already priced in.';
  if(Math.abs(r.pct)<0.2) return 'Headline noise, muted index — rotation under the hood.';
  return 'Headlines ≠ outcomes; flows/liquidity matter.';
}
function shuffle(a){for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]];}return a;}

// -------- State --------
let PACK=[];                   // [{date, month, headline, url, source, deck, expect, pct, ...}]
let i=-1;
let right=0, wrong=0, skip=0;
const RESULTS=[];              // for summary page

// -------- DOM --------
const eI=document.getElementById('i');
const eN=document.getElementById('n');
const eDATE=document.getElementById('date');
const eH=document.getElementById('headline');
const eD=document.getElementById('deck');
const eBY=document.getElementById('by');
const eVerdict=document.getElementById('verdict');

const eUP=document.getElementById('up');
const eDN=document.getElementById('down');
const eSK=document.getElementById('skip');
const eST=document.getElementById('start');
const eNX=document.getElementById('next');

const eRC=document.getElementById('rCnt');
const eWC=document.getElementById('wCnt');
const eSC=document.getElementById('sCnt');

function setChoicesEnabled(b){
  [eUP,eDN,eSK].forEach(btn => { btn.disabled = !b; btn.style.opacity = b?1:0.6; });
}
function showRound(r){
  eI.textContent=String(i+1);
  eDATE.textContent=`${r.month||''} • ${r.date}`;
  eH.textContent=r.headline;
  eD.textContent=r.deck||'';
  const link=r.url?` • <a href="${r.url}" target="_blank" rel="noopener">link</a>`:'';
  eBY.innerHTML=`${r.source||'Source'}${link}`;
  eVerdict.classList.add('hidden'); eVerdict.textContent='';
  eVerdict.classList.remove('wrong');
  setChoicesEnabled(true);
  eNX.style.display='none';
}
function updateCounts(){ eRC.textContent=right; eWC.textContent=wrong; eSC.textContent=skip; }
function next(){
  i+=1;
  if(i>=PACK.length){ finish(); return; }
  showRound(PACK[i]);
}
function start(){
  if(!PACK.length){ eH.textContent='Still loading data…'; return; }
  shuffle(PACK);
  i=-1; right=0; wrong=0; skip=0; RESULTS.length=0;
  updateCounts();
  eST.style.display='none';      // Start vanishes after beginning
  next();
}

function decide(dir){ // +1 up, -1 down, 0 skip
  const r=PACK[i]; const m=Number(r.pct);
  setChoicesEnabled(false);

  let verdictText='', isRight=false;
  if(dir===0){
    skip++; verdictText='Skipped — sometimes the best call is to sit out.';
  }else{
    isRight = (m>0 && dir>0) || (m<0 && dir<0) || (m===0);
    isRight ? right++ : wrong++;
    verdictText = `${isRight?'Right':'Wrong'} • ${dir*m>=0?'+':'−'}${Math.abs(dir*m).toFixed(2)}% — ${humanReason(r)}`;
    if(!isRight) eVerdict.classList.add('wrong');
  }
  eVerdict.textContent = verdictText;
  eVerdict.classList.remove('hidden');
  eNX.style.display='inline-flex';
  updateCounts();

  // store for summary page
  RESULTS.push({
    date:r.date, month:r.month, headline:r.headline, url:r.url||'',
    user: dir===0?'Skip':(dir>0?'UP':'DOWN'),
    actualPct: m, correct: dir===0?null:isRight
  });
}

function finish(){
  // keep results for the summary page we’ll build next
  sessionStorage.setItem('cb_results', JSON.stringify({
    right, wrong, skip, total: PACK.length, results: RESULTS
  }));
  alert(`Finished! Right: ${right}, Wrong: ${wrong}, Skips: ${skip}.
We’ve saved your session; on the summary page we’ll show a clean table (Date • Headline • Your call • Result).`);
  // Optionally redirect later: window.location.href = 'summary.html';
}

// bindings
eUP.onclick = ()=>decide(+1);
eDN.onclick = ()=>decide(-1);
eSK.onclick = ()=>decide(0);
eST.onclick = start;
eNX.onclick = next;

window.addEventListener('keydown',(e)=>{
  const k=e.key.toLowerCase();
  if(eUP.disabled) return;
  if(k==='u') decide(+1);
  if(k==='d') decide(-1);
  if(k==='s') decide(0);
});

// Load data then enable Start
fetch('data/questions.json')
  .then(r=>r.json())
  .then(rows=>{
    PACK = rows;
    eN.textContent = String(PACK.length);
    eH.textContent = 'Press “Start” to begin.';
    eST.disabled = false; // only after data is ready
  })
  .catch(()=>{
    eH.textContent='Failed to load data/questions.json';
  });
