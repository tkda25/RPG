// v23: menu selection fix + Report/manual save + compact no-scroll menu viewport.
(function(){
  const A=document.getElementById('btnA'),B=document.getElementById('btnB'),X=document.getElementById('btnX');
  if(!A||!B||!X)return;
  const oldA=A.onclick,oldB=B.onclick,oldX=X.onclick;let reportOpen=false;
  const style=document.createElement('style');
  style.textContent=`
    .field-menu{box-sizing:border-box!important;height:100%!important;max-height:100%!important;padding:12px!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
    .field-menu-title{flex:0 0 auto!important;font-size:20px!important;padding-bottom:6px!important;margin-bottom:6px!important}
    .field-menu-body{flex:1 1 auto!important;min-height:0!important;overflow:hidden!important}
    .field-menu-list{height:100%!important;display:grid!important;grid-template-rows:repeat(6,minmax(0,1fr))!important;gap:5px!important;overflow:hidden!important}
    .field-menu-list button{box-sizing:border-box!important;min-height:0!important;height:100%!important;padding:5px 10px!important;font-size:14px!important;line-height:1.05!important}
    .field-menu-hint{flex:0 0 auto!important;margin-top:4px!important;font-size:9px!important}
    .report-card{display:grid;gap:8px;border:1px solid #475569;border-radius:8px;background:#0b1323;padding:10px}
    .report-card strong{color:#fde68a}.report-card small{color:#cbd5e1;line-height:1.4}.report-save{width:100%;border:2px solid #cbd5e1;border-radius:8px;background:#0f172a;color:#f8fafc;padding:11px;font:inherit;font-weight:800}.report-result{min-height:20px;color:#86efac;font-weight:800;text-align:center}
    @media(max-width:760px){.field-menu{padding:9px!important}.field-menu-title{font-size:17px!important}.field-menu-list{gap:4px!important}.field-menu-list button{font-size:12px!important;padding:3px 8px!important}.field-menu-hint{font-size:8px!important}.skill-panel{grid-template-columns:1fr 1fr!important;gap:4px!important}.skill-node{min-height:0!important;padding:5px!important;font-size:10px!important}.skill-node small{font-size:8px!important;line-height:1.15!important}}
  `;document.head.appendChild(style);
  function saveSnapshot(){try{const snapshot={...state,inMenu:false,inBattle:false};localStorage.setItem('astria-save',JSON.stringify(snapshot));localStorage.setItem('astria-save-backup',JSON.stringify(snapshot));return true}catch(e){return false}}
  function selectFirst(){requestAnimationFrame(()=>{const bs=[...overlay.querySelectorAll('button:not([disabled])')].filter(b=>b.offsetParent!==null);bs.forEach((b,i)=>b.classList.toggle('menu-selected',i===0))})}
  function reopenMain(){reportOpen=false;if(state.inMenu)oldX.call(X);if(!state.inMenu)oldX.call(X);setTimeout(ensureReportButton,0)}
  function openReport(){reportOpen=true;state.inMenu=true;overlay.classList.remove('hidden');overlay.innerHTML=`<div class="field-menu"><div class="field-menu-title">レポート</div><div class="field-menu-body"><div class="report-card"><strong>冒険の記録</strong><small>現在のレベル、所持金、装備、取得アイテム、スキル、現在地を保存します。</small><button id="reportSave" class="report-save">冒険の記録をセーブする</button><div id="reportResult" class="report-result"></div><button id="reportBack" class="menu-back">戻る</button></div></div><div class="field-menu-hint">スティック 選択　A 決定　B 戻る</div></div>`;document.getElementById('reportSave').onclick=()=>{document.getElementById('reportResult').textContent=saveSnapshot()?'冒険の記録をセーブした！':'セーブに失敗した。'};document.getElementById('reportBack').onclick=reopenMain;selectFirst()}
  function ensureReportButton(){const list=overlay.querySelector('.field-menu-list'),skills=list&&list.querySelector('[data-menu="skills"]');if(!list||!skills||list.querySelector('[data-menu="report"]'))return;const btn=document.createElement('button');btn.dataset.menu='report';btn.textContent='レポート';btn.onclick=openReport;list.appendChild(btn)}
  A.onclick=function(){if(state.inBattle){if(oldA)oldA.call(A);return}if(state.inMenu){const selected=overlay.querySelector('button.menu-selected:not([disabled])');if(selected){selected.click();return}const first=[...overlay.querySelectorAll('button:not([disabled])')].find(b=>b.offsetParent!==null);if(first){first.click();return}}if(oldA)oldA.call(A)};
  B.onclick=function(){if(reportOpen){reopenMain();return}if(oldB)oldB.call(B)};
  new MutationObserver(ensureReportButton).observe(overlay,{childList:true,subtree:true});ensureReportButton();
})();