// v29: small area-name label in top-left of the game screen.
(function(){
  const wrap=document.getElementById('game-wrap');
  if(!wrap)return;

  const label=document.createElement('div');
  label.id='areaNameLabel';
  wrap.appendChild(label);

  function areaName(){
    if(state.area==='town') return 'アルネ村';
    if(state.area==='dungeon') return state.dungeonFloor===2 ? '北の洞窟 B1F' : '北の洞窟 1F';
    if(state.area==='interior'){
      const map={home:'民家',weapon:'武器屋',armor:'防具屋',item:'道具屋',inn:'宿屋'};
      return map[state.interiorType]||'建物の中';
    }
    if(state.area==='world') return '';
    return '';
  }

  function updateAreaLabel(){
    const name=areaName();
    label.textContent=name;
    label.style.display=name?'block':'none';
  }

  const oldDrawCurrent=window.drawCurrent;
  window.drawCurrent=function(){
    const r=oldDrawCurrent.apply(this,arguments);
    updateAreaLabel();
    return r;
  };

  const oldMove=window.move;
  window.move=function(){
    const r=oldMove.apply(this,arguments);
    updateAreaLabel();
    return r;
  };

  const oldAction=window.action;
  window.action=function(){
    const r=oldAction.apply(this,arguments);
    setTimeout(updateAreaLabel,0);
    return r;
  };

  const oldEnterTown=window.enterTown;
  if(oldEnterTown) window.enterTown=function(){const r=oldEnterTown.apply(this,arguments);updateAreaLabel();return r};
  const oldEnterCave=window.enterCave;
  if(oldEnterCave) window.enterCave=function(){const r=oldEnterCave.apply(this,arguments);updateAreaLabel();return r};
  const oldLeaveCave=window.leaveCave;
  if(oldLeaveCave) window.leaveCave=function(){const r=oldLeaveCave.apply(this,arguments);updateAreaLabel();return r};

  const style=document.createElement('style');
  style.textContent=`
    #areaNameLabel{
      position:absolute;left:8px;top:8px;z-index:15;
      padding:4px 7px;border-radius:6px;
      background:rgba(2,6,23,.76);border:1px solid rgba(255,255,255,.28);
      color:#f8fafc;font-size:11px;font-weight:800;letter-spacing:.04em;
      line-height:1;pointer-events:none;text-shadow:0 1px 2px #000;
      max-width:55%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis
    }
    @media(max-width:760px){#areaNameLabel{font-size:9px;padding:3px 5px;left:6px;top:6px}}
  `;
  document.head.appendChild(style);

  updateAreaLabel();
  setInterval(updateAreaLabel,500);
})();