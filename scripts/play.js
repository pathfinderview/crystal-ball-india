// -------- Utilities (unchanged) --------
function pct(x){return (x).toFixed(2)+'%';}
function humanReason(r){
  if(r.expect==='up'&&r.pct<0) return 'Felt bullish, still fell — profit‑taking/positioning can overpower good news.';
  if(r.expect==='down'&&r.pct>0) return 'Looked scary, finished green — fear was already priced in.';
  if(Math.abs(r.pct)<0.2) return 'Headline noise, muted index — rotation under the hood.';
  return 'Headlines ≠ outcomes; flows/liquidity matter.';
}
function shuffle(a){for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]];}return a;}

// -------- State (unchanged) --------
let PACK=[]; let i=-1; let right=0, wrong=0, skip=0;
const RESULTS=[];

// ...DOM refs and helpers are identical to the previous file...

function decide(dir){ // +1 up, -1 down, 0 skip
  const r=PACK[i]; const m=Number(r.pct);
  setChoicesEnabled(false);

  let verdictText='', isRight=false, reasonText='';
  if(dir===0){
    skip++; verdictText='Skipped — sometimes the best call is to sit out.'; reasonText='Chose to preserve capital.';
  }else{
    isRight = (m>0 && dir>0) || (m<0 && dir<0) || (m===0);
    isRight ? right++ : wrong++;
    reasonText = humanReason(r);
    verdictText = `${isRight?'Right':'Wrong'} • ${dir*m>=0?'+':'−'}${Math.abs(dir*m).toFixed(2)}% — ${reasonText}`;
    if(!isRight) eVerdict.classList.add('wrong');
  }
  eVerdict.textContent = verdictText;
  eVerdict.classList.remove('hidden');
  eNX.style.display='inline-flex';
  updateCounts();

  // store a richer record for the summary table
  RESULTS.push({
    date:r.date,
    month:r.month,
    headline:r.headline,
    url:r.url||'',
    source:r.source||'',
    expect:r.expect||'',
    user: dir===0?'Skip':(dir>0?'UP':'DOWN'),
    actualPct: m,
    correct: dir===0?null:isRight,
    reason: reasonText
  });
}

function finish(){
  // save session for the summary page
  sessionStorage.setItem('cb_results', JSON.stringify({
    right, wrong, skip, total: RESULTS.length, results: RESULTS,
    endedAt: new Date().toISOString()
  }));
  // go to the summary page
  window.location.href = 'summary.html';
}
