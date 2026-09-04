// v30: complete the North Cave chapter route after the boss.
(function(){
  function persist(){try{localStorage.setItem('astria-save',JSON.stringify({...state,inMenu:false,inBattle:false}));localStorage.setItem('astria-save-backup',JSON.stringify({...state,inMenu:false,inBattle:false}))}catch(e){}}

  // Add a post-boss exit tile to B1F at (14,10).
  const oldDrawDungeon=window.drawDungeon;
  window.drawDungeon=function(){
    oldDrawDungeon.apply(this,arguments);
    if(state.dungeonFloor===2 && state.bossDefeated){
      const x=14,y=10,px=x*TILE,py=y*TILE;
      ctx.fillStyle='#111827';ctx.fillRect(px+7,py+5,26,30);
      ctx.fillStyle='#fbbf24';ctx.fillRect(px+10,py+8,20,3);
      ctx.fillStyle='#d1d5db';for(let i=0;i<4;i++)ctx.fillRect(px+9+i*4,py+12+i*4,20-i*4,3);
      ctx.fillStyle='#fde68a';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText('EXIT',px+20,py+36);
    }
  };

  const oldMoveDungeon=window.moveDungeon;
  window.moveDungeon=function(dx,dy){
    if(state.dungeonFloor===2 && state.bossDefeated){
      const nx=state.dungeonX+dx,ny=state.dungeonY+dy;
      if(nx===14&&ny===10){
        state.dungeonX=nx;state.dungeonY=ny;drawDungeon();
        say('ゴブリンロードが守っていた奥の出口だ。Aボタンで洞窟を抜けられる。');
        return;
      }
    }
    oldMoveDungeon(dx,dy);
  };

  const oldAction=window.action;
  window.action=function(){
    if(!state.inBattle&&!state.inMenu&&state.area==='dungeon'&&state.dungeonFloor===2&&state.bossDefeated&&state.dungeonX===14&&state.dungeonY===10){
      state.area='world';state.x=13;state.y=6;state.dungeonFloor=1;state.inMenu=false;closeOverlay();drawCurrent();
      if(state.story&&state.story.stage<2)state.story.stage=2;
      persist();
      say('北の洞窟を抜けた。父の紋章を持ってアルネ村へ戻ろう。');
      return;
    }
    oldAction();
  };

  // Compatibility: if an older save has already beaten the boss, make the new route immediately available.
  if(state.bossDefeated && state.story && state.story.stage<2){
    state.story.stage=2;persist();
  }
  drawCurrent();
})();