// v22: fix ABXY menu selection, make skill panel reachable, add Report/manual save.
(function(){
  const A=document.getElementById('btnA');
  const B=document.getElementById('btnB');
  const X=document.getElementById('btnX');
  if(!A||!B||!X)return;

  const oldA=A.onclick;
  const oldB=B.onclick;
  const oldX=X.onclick;
  let reportOpen=false;

  const style=document.createElement('style');
  style.textContent=`
    .field-menu-list button{padding:9px 11px!important;min-height:38px!important}
    .report-card{display:grid;gap:10px;border:1px solid #475569;border-radius:8px;background:#0b1323;padding:12px}
    .report-card strong{color:#fde68a}.report-card small{color:#cbd5e1;line-height:1.5}
    .report-save{width:100%;border:2px solid #cbd5e1;border-radius:8px;background:#0f172a;color:#f8fafc;padding:13px 12px;font:inherit;font-weight:800;text-align:center}
    .report-result{min-height:24px;color:#86efac;font-weight:800;text-align:center}
    @media(max-width:760px){
      .field-menu-title{font-size:18px!important;padding-bottom:7px!important;margin-bottom:7px!important}
      .field-menu-list{gap:5px!important}.field-menu-list button{padding:7px 9px!important;min-height:32px!important;font-size:13px!important}
      .skill-panel{grid-template-columns:1fr 1fr!important;gap:5px!important}
      .skill-node{min-height:70px!important;padding:7px!important;font-size:11px!important}
      .skill-node small{font-size:9px!important;line-height:1.25!important}
      .field-menu-hint{margin-top:5px!important;font-size:9px!important}
    }
  `;
  document.head.appendChild(style);

  function saveSnapshot(){
    try{
      const snapshot={...state,inMenu:false,inBattle:false};
      localStorage.setItem('astria-save',JSON.stringify(snapshot));
      localStorage.setItem('astria-save-backup',JSON.stringify(snapshot));
      return true;
    }catch(e){return false}
  }

  function selectFirst(){
    requestAnimationFrame(()=>{
      const buttons=[...overlay.querySelectorAll('button:not([disabled])')].filter(b=>b.offsetParent!==null);
      buttons.forEach((b,i)=>b.classList.toggle('menu-selected',i===0));
    });
  }

  function reopenMain(){
    reportOpen=false;
    // Use the existing X-menu code so all original menu event handlers are rebuilt correctly.
    if(state.inMenu) oldX.call(X);
    if(!state.inMenu) oldX.call(X);
    setTimeout(ensureReportButton,0);
  }

  function openReport(){
    reportOpen=true;
    state.inMenu=true;
    overlay.classList.remove('hidden');
    overlay.innerHTML=`<div class="field-menu"><div class="field-menu-title">レポート</div><div class="field-menu-body"><div class="report-card"><strong>冒険の記録</strong><small>現在のレベル、所持金、装備、取得アイテム、スキル、現在地を保存します。</small><button id="reportSave" class="report-save">冒険の記録をセーブする</button><div id="reportResult" class="report-result"></div><button id="reportBack" class="menu-back">戻る</button></div></div><div class="field-menu-hint">スティック 選択　A 決定　B 戻る</div></div>`;
    document.getElementById('reportSave').onclick=()=>{
      const ok=saveSnapshot();
      document.getElementById('reportResult').textContent=ok?'冒険の記録をセーブした！':'セーブに失敗した。';
    };
    document.getElementById('reportBack').onclick=reopenMain;
    selectFirst();
  }

  function ensureReportButton(){
    const list=overlay.querySelector('.field-menu-list');
    const skills=list&&list.querySelector('[data-menu="skills"]');
    if(!list||!skills||list.querySelector('[data-menu="report"]'))return;
    const btn=document.createElement('button');
    btn.dataset.menu='report';
    btn.textContent='レポート';
    btn.onclick=openReport;
    list.appendChild(btn);
  }

  // The v20 stick replacement keeps its own selection index. Always activate the visibly selected button.
  A.onclick=function(){
    if(state.inBattle){if(oldA)oldA.call(A);return}
    if(state.inMenu){
      const selected=overlay.querySelector('button.menu-selected:not([disabled])');
      if(selected){selected.click();return}
      const first=[...overlay.querySelectorAll('button:not([disabled])')].find(b=>b.offsetParent!==null);
      if(first){first.click();return}
    }
    if(oldA)oldA.call(A);
  };

  B.onclick=function(){
    if(reportOpen){reopenMain();return}
    if(oldB)oldB.call(B);
  };

  const observer=new MutationObserver(()=>ensureReportButton());
  observer.observe(overlay,{childList:true,subtree:true});
  ensureReportButton();
})();