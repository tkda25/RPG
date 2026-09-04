// v35: restore Arne Village as a separate destination from Regnas.
(function(){
  // Direct entry helpers so later story overrides cannot redirect Arne into Regnas.
  window.enterArneVillage=function(){
    state.area='town';
    state.townX=7;
    state.townY=10;
    state.inMenu=false;
    closeOverlay();
    if(typeof drawTown==='function') drawTown(); else drawCurrent();
    say('アルネ村。故郷の小さな村だ。');
  };

  const oldAction=window.action;
  window.action=function(){
    if(!state.inBattle&&!state.inMenu&&state.area==='world'&&window.astriaWorldV35){
      const ch=window.astriaWorldV35.map[state.worldY]?.[state.worldX];
      if(ch==='A'){enterArneVillage();return}
      if(ch==='K'){if(window.enterCapital)enterCapital();return}
    }
    oldAction();
  };

  // v33 keeps its world map private. Recreate only landmark lookup here for reliable A/K separation.
  const W=34,H=24;
  const M=Array.from({length:H},()=>Array(W).fill('G'));
  for(let x=0;x<W;x++){M[0][x]='W';M[H-1][x]='W'}
  for(let y=0;y<H;y++){M[y][0]='W';M[y][W-1]='W'}
  for(let y=3;y<21;y++)M[y][17]='W';
  M[11][17]='R';M[17][17]='R';
  for(let x=3;x<14;x++)M[5][x]='M';M[5][8]='R';M[5][9]='R';
  for(let y=12;y<19;y++)for(let x=4;x<10;x++)if((x+y)%3)M[y][x]='F';
  for(let y=4;y<9;y++)for(let x=22;x<29;x++)if((x+y)%3)M[y][x]='F';
  for(let x=9;x<=17;x++)M[18][x]='R';
  for(let y=11;y<=18;y++)M[y][17]='R';
  for(let x=17;x<=27;x++)M[11][x]='R';
  M[18][9]='A';M[14][13]='C';M[11][27]='K';M[7][25]='V';
  window.astriaWorldV35={map:M,width:W,height:H};

  // Replace world action one final time so Arne never calls the story-overridden enterTown().
  const prev=window.action;
  window.action=function(){
    if(!state.inBattle&&!state.inMenu&&state.area==='world'){
      const ch=M[state.worldY]?.[state.worldX];
      if(ch==='A'){enterArneVillage();return}
      if(ch==='K'){if(window.enterCapital)enterCapital();return}
      if(ch==='C'){enterCave();return}
      if(ch==='V'){say('古代神殿は強い風に閉ざされている。王都で情報を集めよう。');return}
    }
    prev();
  };

  // Ensure leaving Arne returns to the Arne landmark.
  window.leaveTown=function(){
    state.area='world';
    state.worldX=9;
    state.worldY=19;
    state.inMenu=false;
    closeOverlay();
    if(typeof drawExpandedWorld==='function')drawExpandedWorld();else drawCurrent();
    say('アルネ村を出た。');
  };
})();