(function(){
  const saved = sessionStorage.getItem('cb_results');
  const stat = document.getElementById('headlineStat');
  const tbody = document.getElementById('resultsBody');

  if(!saved){
    stat.textContent='No recent game data found.';
    document.getElementById('resultsTable').style.display='none';
    return;
  }

  const data = JSON.parse(saved);
  const r=data.right||0, w=data.wrong||0, s=data.skip||0;
  const acc=(r+w)>0 ? Math.round(100*r/(r+w)) : 0;
  stat.textContent = `You got ${r} right, ${w} wrong, ${s} skipped — accuracy ${acc}%.`;

  (data.results||[]).forEach(it=>{
    const tr=document.createElement('tr');

    const td0=document.createElement('td'); td0.className='monoSmall'; td0.textContent=`${it.month||''} ${it.date? '• '+it.date:''}`.trim(); tr.appendChild(td0);

    const td1=document.createElement('td');
    if(it.url){ const a=document.createElement('a'); a.href=it.url; a.target='_blank'; a.rel='noopener'; a.textContent=it.headline; td1.appendChild(a);}
    else{ td1.textContent=it.headline; }
    const src=document.createElement('div'); src.className='note'; src.textContent=[it.source, it.expect?`Expectation: ${it.expect.toUpperCase()}`:''].filter(Boolean).join(' • ');
    td1.appendChild(src); tr.appendChild(td1);

    const td2=document.createElement('td'); td2.textContent=it.user||'-'; tr.appendChild(td2);

    const td3=document.createElement('td'); const pill=document.createElement('span'); pill.className='pill';
    if(it.user==='Skip'){pill.classList.add('skip'); pill.textContent='Skip';}
    else if(it.correct){pill.classList.add('right'); pill.textContent='Right';}
    else{pill.classList.add('wrong'); pill.textContent='Wrong';}
    td3.appendChild(pill); tr.appendChild(td3);

    const td4=document.createElement('td'); td4.className='monoSmall'; const v=Number(it.actualPct||0); td4.textContent=(v>=0?'+':'')+v.toFixed(2)+'%'; td4.classList.add(v>=0?'pos':'neg'); tr.appendChild(td4);

    const td5=document.createElement('td'); td5.textContent=it.reason||'—'; tr.appendChild(td5);

    tbody.appendChild(tr);
  });

  document.getElementById('btnReplay').onclick=()=>location.href='play.html';
  document.getElementById('btnCopy').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);alert('Link copied');}catch{alert('Copy failed');}};
  document.getElementById('btnCSV').onclick=()=>{
    const head=['date','month','headline','url','source','expect','your_call','outcome','actual_pct','reason'];
    const body=(data.results||[]).map(it=>[
      it.date||'',it.month||'',(it.headline||'').replace(/"/g,'""'),it.url||'',it.source||'',it.expect||'',it.user||'',
      it.user==='Skip'?'Skip':(it.correct?'Right':'Wrong'),(Number(it.actualPct)||0).toFixed(2),(it.reason||'').replace(/"/g,'""')
    ]);
    const csv=[head,...body].map(r=>r.map(x=>`"${x}"`).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv'}), url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='crystal-ball-results.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
})();
