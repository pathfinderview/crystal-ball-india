// Utilities
function humanReason(r){
  if(r.expect==='up'&&r.pct<0) return 'Felt bullish, still fell — profit‑taking/positioning can overpower good news.';
  if(r.expect==='down'&&r.pct>0) return 'Looked scary, finished green — fear was already priced in.';
  if(Math.abs(r.pct)<0.2) return 'Headline noise, muted index — rotation under the hood.';
  return 'Headlines ≠ outcomes; flows/liquidity matter.';
}
function shuffle(a){for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]];}return a;}

// State
let PACK=[]; let i=-1; let right=0, wrong=0, skip=0;
const RESULTS=[];

// DOM
const eI=document.getElementById('i'), eN=document.getElementById('n');
const eDATE=document.getElementById('date'), eH=document.getElementById('headline'), eD=document.getElementById('deck'), eBY=document.getElementById('by');
const eUP=document.getElementById('up'), eDN=document.getElementById('down'), eSK=document.getElementById('skip'), eST=document.getElementById('start'), eNX=document.getElementById('next');
const eVerdict=document.getElementById('verdict');
const eRC=document.getElementById('rCnt'), eWC=document.getElementById('wCnt'), eSC=document.getElementById('sCnt');

function setChoicesEnabled(b){[eUP,eDN,eSK].forEach(btn=>{btn.disabled=!b;btn.style.opacity=b?1:0.6;});}
function updateCounts(){eRC.textContent=right; eWC.textContent=wrong; eSC.textContent=skip;}

function showRound(r){
  eI.textContent=String(i+1);
  eDATE.textContent=`${r.month||''} • ${r.date}`;
  eH.textContent=r.headline; eD.textContent=r.deck||'';
  eBY.innerHTML=`${r.source||'Source'}${r.url?` • <a href="${r.url}" target="_blank" rel="noopener">link</a>`:''}`;
  eVerdict.className='verdict hidden'; eVerdict.textContent='';
  setChoicesEnabled(true);
  eNX.style.display='none';
}

function next(){
  i+=1;
  if(i>=PACK.length){ finish(); return; }
  showRound(PACK[i]);
}

function start(){
  if(!PACK.length){ eH.textContent='Still loading data…'; return; }
  shuffle(PACK);
  i=-1; right=0; wrong=0; skip=0; RESULTS.length=0; updateCounts();
  eST.style.display='none'; // Start vanishes after beginning
  next();
}

function decide(dir){ // +1 up, -1 down, 0 skip
  const r=PACK[i]; const m=Number(r.pct);
  setChoicesEnabled(false);

  let verdictText='', isRight=false, reasonText='';
  if(dir===0){
    skip++; verdictText='Skipped — sometimes the best call is to sit out.'; reasonText='Chose to preserve capital.';
  }else{
    isRight=(m>0&&dir>0)||(m<0&&dir<0)||(m===0);
    isRight? right++ : wrong++;
    reasonText=humanReason(r);
    const signed = dir*m;
    verdictText = `${isRight?'Right':'Wrong'} • ${signed>=0?'+':'−'}${Math.abs(signed).toFixed(2)}% — ${reasonText}`;
    if(!isRight) eVerdict.classList.add('wrong');
  }
  eVerdict.textContent=verdictText;
  eVerdict.classList.remove('hidden');
  eNX.style.display='inline-flex';
  updateCounts();

  RESULTS.push({
    date:r.date, month:r.month, headline:r.headline, url:r.url||'', source:r.source||'', expect:r.expect||'',
    user: dir===0?'Skip':(dir>0?'UP':'DOWN'),
    actualPct:m, correct: dir===0?null:isRight, reason: reasonText
  });
}

function finish(){
  sessionStorage.setItem('cb_results', JSON.stringify({
    right, wrong, skip, total: RESULTS.length, results: RESULTS, endedAt:new Date().toISOString()
  }));
  window.location.href='summary.html';
}

// Bindings
eUP.onclick=()=>decide(+1);
eDN.onclick=()=>decide(-1);
eSK.onclick=()=>decide(0);
eST.onclick=start;
eNX.onclick=next;
window.addEventListener('keydown',e=>{if(eUP.disabled)return;const k=e.key.toLowerCase();if(k==='u')decide(+1);if(k==='d')decide(-1);if(k==='s')decide(0);});

// Load data, then enable Start
fetch('data/questions.json')
 .then(r=>r.json())
 .then(rows=>{ PACK=rows; eN.textContent=String(PACK.length); eH.textContent='Press “Start” to begin.'; eST.disabled=false; })
 .catch(()=>{ eH.textContent='Failed to load data/questions.json'; });
