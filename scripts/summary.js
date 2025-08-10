(function(){
  const saved = sessionStorage.getItem('cb_results');
  const hero = document.getElementById('summaryHero');
  const tbody = document.getElementById('resultsBody');

  if(!saved){
    hero.querySelector('.bigstat').textContent = 'No recent game data found.';
    document.getElementById('resultsTable').style.display='none';
    return;
  }

  const data = JSON.parse(saved);
  const total = data.total || (data.results? data.results.length : 0);
  const r = data.right||0, w=data.wrong||0, s=data.skip||0;
  const acc = (r+w)>0 ? Math.round(100*r/(r+w)) : 0;

  // Replace the hero line with a more polished, share‑able message
  const stat = document.getElementById('headlineStat');
  stat.textContent = `You got ${r} right, ${w} wrong, ${s} skipped — accuracy ${acc}%.`;
  // Keep the user’s requested dummy line visible as sub copy? we honor their wording in the hero already.
  // If you want to show both, uncomment below:
  // const q = document.createElement('div'); q.className='quote'; q.textContent='Dummy: 95% people including make less when they take so much decisions.'; hero.appendChild(q);

  // Build rows
  const rows = (data.results||[]).map((it, idx)=>{
    const tr = document.createElement('tr');

    // Date
    const tdDate = document.createElement('td');
    tdDate.className='monoSmall';
    tdDate.textContent = `${it.month||''} ${it.date? '• '+it.date : ''}`.trim();
    tr.appendChild(tdDate);

    // Headline
    const tdHead = document.createElement('td');
    if(it.url){
      const a=document.createElement('a'); a.href=it.url; a.target='_blank'; a.rel='noopener'; a.textContent=it.headline;
      tdHead.appendChild(a);
    }else{
      tdHead.textContent = it.headline;
    }
    const src = document.createElement('div'); src.className='note'; src.textContent = [it.source, it.expect?`Expectation: ${it.expect.toUpperCase()}`:''].filter(Boolean).join(' • ');
    tdHead.appendChild(src);
    tr.appendChild(tdHead);

    // Your call
    const tdCall = document.createElement('td'); tdCall.textContent = it.user || '-'; tr.appendChild(tdCall);

    // Outcome (Right/Wrong/Skip)
    const tdOut = document.createElement('td');
    const pill = document.createElement('span'); pill.className='pill';
    if(it.user==='Skip'){ pill.classList.add('skip'); pill.textContent='Skip'; }
    else if(it.correct){ pill.classList.add('right'); pill.textContent='Right'; }
    else{ pill.classList.add('wrong'); pill.textContent='Wrong'; }
    tdOut.appendChild(pill);
    tr.appendChild(tdOut);

    // Actual %
    const tdPct = document.createElement('td'); tdPct.className='monoSmall';
    const val = Number(it.actualPct||0);
    tdPct.textContent = (val>=0?'+':'') + val.toFixed(2) + '%';
    tdPct.classList.add(val>=0?'pos':'neg');
    tr.appendChild(tdPct);

    // Reason / irony
    const tdWhy = document.createElement('td');
    tdWhy.textContent = it.reason || '—';
    tr.appendChild(tdWhy);

    return tr;
  });

  rows.forEach(tr=>tbody.appendChild(tr));

  // Buttons
  document.getElementById('btnReplay').onclick = ()=>{ window.location.href='play.html'; };
  document.getElementById('btnCopy').onclick = async ()=>{
    try{ await navigator.clipboard.writeText(window.location.href); alert('Link copied'); }catch{ alert('Copy failed'); }
  };
  document.getElementById('btnCSV').onclick = ()=>{
    const head = ['date','month','headline','url','source','expect','your_call','outcome','actual_pct','reason'];
    const body = (data.results||[]).map(it=>[
      it.date||'', it.month||'', (it.headline||'').replace(/"/g,'""'),
      it.url||'', it.source||'', it.expect||'',
      it.user||'', it.user==='Skip'?'Skip':(it.correct?'Right':'Wrong'),
      (Number(it.actualPct)||0).toFixed(2),
      (it.reason||'').replace(/"/g,'""')
    ]);
    const rows = [head, ...body].map(r=>r.map(x=>`"${x}"`).join(',')).join('\n');
    const blob = new Blob([rows],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='crystal-ball-results.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  // Add a tasteful context quote block about decision density (kept neutral, not a factual claim)
  const q = document.createElement('div');
  q.className = 'quote';
  q.textContent = 'Dummy headline: “95% people including make less when they take so much decisions.” It captures the intuition that constant decision‑making can backfire. Use fixed income as ballast so mistakes don’t compound.';
  hero.appendChild(q);
})();
