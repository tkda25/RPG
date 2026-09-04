// v32: expanded scrolling world map
(function(){
  const W=32,H=22;
  const M=Array.from({length:H},()=>Array(W).fill('G'));
  for(let x=0;x<W;x++){M[0][x]='W';M[H-1][x]='W'}
  for(let y=0;y<H;y++){M[y][0]='W';M[y][W-1]='W'}
  for(let y=3;y<19;y++)M[y][16]='W';
  M[10][16]='R'; M[15][16]='R';
  for(let x=3;x<13;x++)M[4][x]='M';
  M[4][7]='R';M[4][8]='R';
  for(let y=11;y<17;y++)for(let x=4;x<9;x++)if((x+y)%3)M[y][x]='F';
  for(let y=3;y<8;y++)for(let x=21;x<27;x++)if((x+y)%3)M[y][x]='F';
  for(let x=8;x<=16;x++)M[17][x]='R';
  for(let y=10;y<=17;y++)M[y][16]='R';
  for(let x=16;x<=25;x++)M[10][x]='R';
  M[17][8]='A'; M[13][12]='C'; M[10][25]='K'; M[6][23]='V';
  const names={G:'草原',W:'海',R:'街道',F:'森',M:'山',A:'アルネ村',C:'北の洞窟',K:'王都レグナス',V:'古代神殿'};
  if(state.worldX==null){state.worldX=8;state.worldY=18}

  function tile(ch,sx,sy){
    const px=sx*TILE,py=sy*TILE;
    ctx.fillStyle=ch==='W'?'#2f6fb0':ch==='R'?'#b99d68':ch==='F'?'#286638':ch==='M'?'#6b7280':'#4f913f';
    ctx.fillRect(px,py,TILE,TILE);
    if(ch==='F'){ctx.fillStyle='#174526';ctx.fillRect(px+8,py+8,24,25)}
    if(ch==='M'){ctx.fillStyle='#4b5563';ctx.beginPath();ctx.moveTo(px+4,py+34);ctx.lineTo(px+20,py+6);ctx.lineTo(px+36,py+34);ctx.fill()}
    if(ch==='A'||ch==='K'){ctx.fillStyle=ch==='K'?'#cbd5e1':'#e4c08a';ctx.fillRect(px+7,py+13,26,20);ctx.fillStyle=ch==='K'?'#7c3aed':'#9a4b31';ctx.fillRect(px+5,py+8,30,9)}
    if(ch==='C'){ctx.fillStyle='#171717';ctx.beginPath();ctx.arc(px+20,py+25,14,0,Math.PI*2);ctx.fill()}
    if(ch==='V'){ctx.fillStyle='#d6c39a';ctx.fillRect(px+8,py+10,24,25);ctx.fillStyle='#475569';ctx.fillRect(px+17,py+18,7,17)}
  }

  window.drawExpandedWorld=function(){
    const ox=Math.max(0,Math.min(W-COLS,state.worldX-8));
    const oy=Math.max(0,Math.min(H-ROWS,state.worldY-6));
    for(let sy=0;sy<ROWS;sy++)for(let sx=0;sx<COLS;sx++)tile(M[oy+sy][ox+sx],sx,sy);
    drawHero(state.worldX-ox,state.worldY-oy);
  };

  function moveWorld(dx,dy){
    const nx=state.worldX+dx,ny=state.worldY+dy;
    if(nx<0||ny<0||nx>=W||ny>=H)return;
    const ch=M[ny][nx];
    if(ch==='W'||ch==='M'){say(names[ch]+'が行く手をはばんでいる。');return}
    state.worldX=nx;state.worldY=ny;drawExpandedWorld();
    if(ch==='A'||ch==='K'||ch==='C'||ch==='V'){say(names[ch]+'。Aボタンで入る。');return}
    say(names[ch]+'を進んでいる。');
    if((ch==='F'&&Math.random()<0.22)||(ch==='G'&&Math.random()<0.10))startBattle({...enemies[Math.floor(Math.random()*enemies.length)]});
  }

  const oldMove=window.move;
  window.move=function(dx,dy){
    if(state.inBattle||state.inMenu)return;
    if(state.area==='world'){moveWorld(dx,dy);return}
    oldMove(dx,dy);
  };

  const oldAction=window.action;
  window.action=function(){
    if(!state.inBattle&&!state.inMenu&&state.area==='world'){
      const ch=M[state.worldY][state.worldX];
      if(ch==='A'){enterTown();return}
      if(ch==='K'){if(window.enterCapital)enterCapital();return}
      if(ch==='C'){enterCave();return}
      if(ch==='V'){say('古代神殿は強い風に閉ざされている。王都で情報を集めよう。');return}
      say('あたりを調べたが、特に何もない。');return;
    }
    oldAction();
  };

  const oldDraw=window.drawCurrent;
  window.drawCurrent=function(){if(state.area==='world')drawExpandedWorld();else oldDraw()};

  window.leaveTown=function(){
    state.area='world';state.worldX=8;state.worldY=18;state.inMenu=false;closeOverlay();drawExpandedWorld();say('アルネ村を出た。');
  };
  window.leaveCave=function(){
    state.area='world';state.worldX=12;state.worldY=14;state.dungeonFloor=1;state.inMenu=false;closeOverlay();drawExpandedWorld();say('北の洞窟を出た。');
  };

  if(state.area==='world')drawExpandedWorld();
})();