// v28: shop back-navigation + reliable inn entrance.
(function(){
  const A=document.getElementById('btnA');
  const B=document.getElementById('btnB');
  const oldA=A&&A.onclick;
  const oldB=B&&B.onclick;
  const oldAction=window.action;

  function persist(){try{localStorage.setItem('astria-save',JSON.stringify({...state,inMenu:false,inBattle:false}));localStorage.setItem('astria-save-backup',JSON.stringify({...state,inMenu:false,inBattle:false}))}catch(e){}}

  // Track the custom item-shop screen from its DOM instead of stale closure state.
  function shopScreenKind(){
    const title=overlay.querySelector('.field-menu-title')?.textContent||'';
    if(title.includes('道具屋'))return 'list';
    if(['薬草','上薬草','魔法の水','けむり玉'].some(n=>title.includes(n)))return 'detail';
    if(title.includes('購入しました')||title.includes('お金が足りない'))return 'result';
    return null;
  }
  function clickIf(id){const el=document.getElementById(id);if(el){el.click();return true}return false}

  if(B)B.onclick=function(){
    const kind=shopScreenKind();
    if(kind==='detail'){if(clickIf('detailBack'))return}
    if(kind==='result'){if(clickIf('backList')||clickIf('moneyBack'))return}
    if(kind==='list'){
      // On the item list, B should leave the shop completely.
      if(clickIf('shopExit'))return;
      state.inMenu=false;closeOverlay();persist();drawCurrent();say('道具屋を出た。');return;
    }
    if(oldB)oldB.call(B);
  };

  function nearTownDoor(x,y,maxDist=1){
    return state.area==='town' && Math.abs((state.townX??0)-x)+Math.abs((state.townY??0)-y)<=maxDist;
  }
  function enterInn(){
    state.area='interior';
    state.interiorType='inn';
    state.interiorX=8;
    state.interiorY=9;
    state.facing='up';
    state.inMenu=false;
    closeOverlay();
    drawCurrent();
    say('宿屋。中には女将がいる。近づいてAボタンで話しかけよう。');
    persist();
  }

  // Make the inn usable from the door tile or one tile next to it.
  window.action=function(){
    if(!state.inBattle&&!state.inMenu&&nearTownDoor(11,9,1)){enterInn();return}
    oldAction();
  };

  if(A)A.onclick=function(){
    if(!state.inBattle&&!state.inMenu&&nearTownDoor(11,9,1)){enterInn();return}
    if(oldA)oldA.call(A);
  };
})();