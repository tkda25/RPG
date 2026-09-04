// v33: remove duplicate Regnas entry + unify world/cities/dungeons into 16-bit visual language.
(function(){
  // --- World map: one Regnas only ---
  // v32 map is private, so override world drawing/movement with a corrected map.
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
  // single instances only
  M[18][9]='A';    // Arne
  M[14][13]='C';   // North Cave
  M[11][27]='K';   // Regnas
  M[7][25]='V';    // Ancient Temple

  const names={G:'草原',W:'海',R:'街道',F:'森',M:'山',A:'アルネ村',C:'北の洞窟',K:'王都レグナス',V:'古代神殿'};
  if(state.worldX==null||state.worldY==null){state.worldX=9;state.worldY=19}

  function pxRect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
  function drawWater(px,py){
    pxRect(px,py,TILE,TILE,'#2d69a8');
    pxRect(px+4,py+8,12,3,'#4d8fd0');pxRect(px+23,py+24,11,3,'#4d8fd0');
    pxRect(px+13,py+15,8,2,'#7ab6ea');
  }
  function drawGrass(px,py){
    pxRect(px,py,TILE,TILE,'#4d8d3f');
    pxRect(px+7,py+9,3,5,'#2e6c31');pxRect(px+27,py+26,3,5,'#2e6c31');
  }
  function drawRoad(px,py){
    pxRect(px,py,TILE,TILE,'#b69b68');
    pxRect(px+4,py+5,8,3,'#ccb783');pxRect(px+24,py+25,10,3,'#8e764d');
  }
  function drawForest(px,py){
    drawGrass(px,py);
    pxRect(px+17,py+22,6,12,'#66401f');
    pxRect(px+7,py+10,26,18,'#19522a');
    pxRect(px+11,py+6,18,16,'#2c7c39');
    pxRect(px+15,py+8,7,5,'#55a44e');
  }
  function drawMountain(px,py){
    pxRect(px,py,TILE,TILE,'#748087');
    ctx.fillStyle='#4c555a';ctx.beginPath();ctx.moveTo(px+4,py+34);ctx.lineTo(px+20,py+7);ctx.lineTo(px+36,py+34);ctx.fill();
    ctx.fillStyle='#cfd8dc';ctx.beginPath();ctx.moveTo(px+15,py+16);ctx.lineTo(px+20,py+7);ctx.lineTo(px+25,py+16);ctx.fill();
  }
  function drawTownIcon(px,py,capital=false){
    drawGrass(px,py);
    pxRect(px+7,py+18,26,15,capital?'#d7d7d7':'#d7b984');
    pxRect(px+4,py+11,32,10,capital?'#6a5acd':'#9b4d34');
    pxRect(px+16,py+23,8,10,'#4c2e1f');
    if(capital){pxRect(px+10,py+6,5,8,'#c5c8cf');pxRect(px+25,py+6,5,8,'#c5c8cf')}
  }
  function drawCaveIcon(px,py){
    drawMountain(px,py);ctx.fillStyle='#111827';ctx.beginPath();ctx.arc(px+20,py+27,12,Math.PI,0);ctx.fill();pxRect(px+8,py+27,24,8,'#111827');
  }
  function drawTempleIcon(px,py){
    drawGrass(px,py);pxRect(px+9,py+13,22,21,'#cbbd95');pxRect(px+6,py+10,28,5,'#8f876e');pxRect(px+16,py+20,8,14,'#374151');
  }
  function drawTile(ch,sx,sy){
    const px=sx*TILE,py=sy*TILE;
    if(ch==='W')return drawWater(px,py);
    if(ch==='R')return drawRoad(px,py);
    if(ch==='F')return drawForest(px,py);
    if(ch==='M')return drawMountain(px,py);
    if(ch==='A')return drawTownIcon(px,py,false);
    if(ch==='K')return drawTownIcon(px,py,true);
    if(ch==='C')return drawCaveIcon(px,py);
    if(ch==='V')return drawTempleIcon(px,py);
    drawGrass(px,py);
  }
  window.drawExpandedWorld=function(){
    const ox=Math.max(0,Math.min(W-COLS,state.worldX-8));
    const oy=Math.max(0,Math.min(H-ROWS,state.worldY-6));
    for(let sy=0;sy<ROWS;sy++)for(let sx=0;sx<COLS;sx++)drawTile(M[oy+sy][ox+sx],sx,sy);
    drawHero(state.worldX-ox,state.worldY-oy);
  };

  const oldMove=window.move;
  window.move=function(dx,dy){
    if(state.inBattle||state.inMenu)return;
    if(state.area!=='world')return oldMove(dx,dy);
    const nx=state.worldX+dx,ny=state.worldY+dy;if(nx<0||ny<0||nx>=W||ny>=H)return;
    const ch=M[ny][nx];
    if(ch==='W'||ch==='M'){say(names[ch]+'が行く手をはばんでいる。');return}
    state.worldX=nx;state.worldY=ny;drawExpandedWorld();
    if(['A','K','C','V'].includes(ch)){say(names[ch]+'。Aボタンで入る。');return}
    say(names[ch]+'を進んでいる。');
    if((ch==='F'&&Math.random()<.22)||(ch==='G'&&Math.random()<.10))startBattle({...enemies[Math.floor(Math.random()*enemies.length)]});
  };
  const oldAction=window.action;
  window.action=function(){
    if(!state.inBattle&&!state.inMenu&&state.area==='world'){
      const ch=M[state.worldY][state.worldX];
      if(ch==='A'){enterTown();return}
      if(ch==='K'){window.enterCapital&&enterCapital();return}
      if(ch==='C'){enterCave();return}
      if(ch==='V'){say('古代神殿は強い風に閉ざされている。王都で情報を集めよう。');return}
      say('あたりを調べたが、特に何もない。');return
    }
    oldAction();
  };
  const oldDraw=window.drawCurrent;
  window.drawCurrent=function(){if(state.area==='world')drawExpandedWorld();else oldDraw()};

  // --- 16-bit UI polish ---
  const style=document.createElement('style');
  style.textContent=`
    body{background:#111!important}
    #game-wrap{border:4px solid #d8d8d8!important;box-shadow:0 0 0 4px #202020,0 8px 0 #000!important}
    #overlay{background:rgba(0,0,0,.93)!important}
    .field-menu,.npc-box,.menu-card,.shop-choice,.shop-item,.report-card{
      border-radius:0!important;box-shadow:none!important
    }
    .field-menu{border:4px double #f8fafc!important;background:#06101c!important}
    .field-menu-title{letter-spacing:1px!important;border-bottom:2px solid #aeb8c4!important}
    .story-choice,.menu-back,.shop-choice,.field-menu-list button,.equip-choice,.skill-node{
      border-radius:0!important;border:2px solid #e5e7eb!important;background:#091421!important
    }
    .menu-selected{outline:3px solid #facc15!important;background:#17263a!important}
    #areaNameLabel{border-radius:0!important;background:#06101c!important;border:2px solid #e5e7eb!important}
  `;document.head.appendChild(style);

  // refresh if currently outside
  if(state.area==='world')drawExpandedWorld();
})();