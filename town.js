// Walkable Astria town + richer 16-bit JRPG hero.
(function(){
  const townBuildings=[
    {id:'home',name:'民家',x:1,y:1,w:3,h:3,doorX:2,doorY:3,roof:'#9f3f2f',sign:'⌂'},
    {id:'weapon',name:'武器屋',x:6,y:1,w:3,h:3,doorX:7,doorY:3,roof:'#3858a8',sign:'⚔'},
    {id:'armor',name:'防具屋',x:11,y:1,w:3,h:3,doorX:12,doorY:3,roof:'#6b46a6',sign:'◆'},
    {id:'item',name:'道具屋',x:2,y:7,w:3,h:3,doorX:3,doorY:9,roof:'#c97619',sign:'●'},
    {id:'inn',name:'宿屋',x:10,y:7,w:3,h:3,doorX:11,doorY:9,roof:'#a83961',sign:'♨'}
  ];

  const originalDrawCurrent=drawCurrent;
  const originalMove=move;
  const originalAction=action;
  const originalLoad=load;

  if(state.townX==null)state.townX=7;
  if(state.townY==null)state.townY=10;

  drawHero=function(x,y){
    const px=x*TILE,py=y*TILE;
    // shadow
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(px+9,py+31,22,5);
    // cape/body silhouette
    ctx.fillStyle='#153e75';ctx.fillRect(px+10,py+15,20,17);
    ctx.fillStyle='#1d4ed8';ctx.fillRect(px+13,py+16,14,14);
    // belt
    ctx.fillStyle='#c78b2b';ctx.fillRect(px+12,py+24,16,3);ctx.fillStyle='#f6c453';ctx.fillRect(px+19,py+24,3,3);
    // boots
    ctx.fillStyle='#5b341d';ctx.fillRect(px+12,py+30,6,5);ctx.fillRect(px+23,py+30,6,5);
    // face
    ctx.fillStyle='#f5c99b';ctx.fillRect(px+13,py+8,15,10);
    // blue spiky hair
    ctx.fillStyle='#0b3c8c';
    ctx.fillRect(px+11,py+6,19,5);ctx.fillRect(px+13,py+3,4,5);ctx.fillRect(px+18,py+1,4,6);ctx.fillRect(px+23,py+3,4,5);ctx.fillRect(px+28,py+6,4,4);
    ctx.fillStyle='#2563eb';ctx.fillRect(px+14,py+5,14,4);
    // eyes
    ctx.fillStyle='#111827';ctx.fillRect(px+16,py+12,2,2);ctx.fillRect(px+24,py+12,2,2);
    // shoulder pads
    ctx.fillStyle='#d4a72c';ctx.fillRect(px+8,py+17,6,5);ctx.fillRect(px+27,py+17,6,5);
    // sword on back
    ctx.fillStyle='#d1d5db';ctx.fillRect(px+31,py+10,3,15);ctx.fillStyle='#fbbf24';ctx.fillRect(px+29,py+22,7,3);ctx.fillStyle='#7c4a20';ctx.fillRect(px+32,py+5,2,6);
  };

  function drawGrassTile(x,y){
    const px=x*TILE,py=y*TILE;
    ctx.fillStyle='#4f9a43';ctx.fillRect(px,py,TILE,TILE);
    ctx.fillStyle='rgba(20,80,35,.16)';
    ctx.fillRect(px+6,py+9,3,3);ctx.fillRect(px+28,py+25,3,3);
  }
  function drawRoadTile(x,y){
    const px=x*TILE,py=y*TILE;
    ctx.fillStyle='#b9a16f';ctx.fillRect(px,py,TILE,TILE);
    ctx.strokeStyle='rgba(80,61,35,.16)';ctx.strokeRect(px+3,py+3,TILE-6,TILE-6);
    ctx.fillStyle='rgba(255,255,255,.07)';ctx.fillRect(px+7,py+6,10,3);
  }
  function drawTree(x,y){
    const px=x*TILE,py=y*TILE;
    ctx.fillStyle='#5f3a1b';ctx.fillRect(px+17,py+24,7,12);
    ctx.fillStyle='#176b35';ctx.fillRect(px+7,py+8,27,22);
    ctx.fillStyle='#238a46';ctx.fillRect(px+11,py+4,19,18);
    ctx.fillStyle='#53ad58';ctx.fillRect(px+14,py+6,8,5);
  }
  function drawHouse(b){
    const px=b.x*TILE,py=b.y*TILE,w=b.w*TILE,h=b.h*TILE;
    ctx.fillStyle='#765335';ctx.fillRect(px+5,py+23,w-10,h-26);
    ctx.fillStyle='#d7bd86';ctx.fillRect(px+9,py+30,w-18,h-35);
    // roof
    ctx.fillStyle=b.roof;ctx.fillRect(px+2,py+8,w-4,25);
    ctx.fillStyle='rgba(255,255,255,.16)';ctx.fillRect(px+7,py+11,w-14,5);
    ctx.fillStyle='#492c1a';ctx.fillRect(px+2,py+30,w-4,5);
    // windows
    ctx.fillStyle='#6dc7e8';ctx.fillRect(px+14,py+47,16,13);ctx.fillRect(px+w-30,py+47,16,13);
    ctx.fillStyle='#42301f';ctx.fillRect(px+18,py+51,8,5);ctx.fillRect(px+w-26,py+51,8,5);
    // door
    const dx=b.doorX*TILE,dy=b.doorY*TILE;
    ctx.fillStyle='#5b331d';ctx.fillRect(dx+11,dy-17,18,30);ctx.fillStyle='#efc45a';ctx.fillRect(dx+24,dy-2,3,3);
    // sign
    ctx.fillStyle='#172033';ctx.fillRect(px+w/2-15,py+37,30,21);
    ctx.fillStyle='#f7d46a';ctx.font='bold 17px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(b.sign,px+w/2,py+48);
  }

  drawTown=function(){
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)drawGrassTile(x,y);
    // main stone roads
    for(let y=0;y<ROWS;y++){drawRoadTile(7,y);drawRoadTile(8,y)}
    for(let x=0;x<COLS;x++){drawRoadTile(x,5);drawRoadTile(x,6)}
    for(let x=1;x<=14;x++)drawRoadTile(x,10);
    // building approach paths
    [[2,4],[7,4],[12,4],[3,8],[11,8]].forEach(([x,y])=>drawRoadTile(x,y));
    // border hedge / trees
    [0,4,9,15].forEach(x=>{drawTree(x,0);drawTree(x,11)});
    [0,15].forEach(x=>{drawTree(x,3);drawTree(x,8)});
    // fountain in center
    const fx=7*TILE,fy=5*TILE;
    ctx.fillStyle='#7b8796';ctx.beginPath();ctx.arc(fx+40,fy+40,27,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#4ca3d9';ctx.beginPath();ctx.arc(fx+40,fy+40,20,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#c5ced8';ctx.fillRect(fx+36,fy+15,8,28);ctx.fillStyle='#8bd3ff';ctx.fillRect(fx+38,fy+9,4,18);
    townBuildings.forEach(drawHouse);
    // town gate at bottom
    ctx.fillStyle='#6d4b2b';ctx.fillRect(6*TILE,11*TILE+8,3*TILE,8);
    ctx.fillStyle='#f5d47b';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('OUT',7.5*TILE,11*TILE+29);
    drawHero(state.townX,state.townY);
  };

  function collidesTown(x,y){
    if(x<0||y<0||x>=COLS||y>=ROWS)return true;
    if((x===7||x===8)&&(y===5||y===6))return true; // fountain
    for(const b of townBuildings){
      const inside=x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h;
      if(inside && !(x===b.doorX&&y===b.doorY))return true;
    }
    return false;
  }

  function buildingAtDoor(x,y){return townBuildings.find(b=>b.doorX===x&&b.doorY===y)}

  function enterBuilding(b){
    state.inMenu=true;overlay.classList.remove('hidden');
    if(b.id==='weapon'){renderShop('weapon');return}
    if(b.id==='armor'){renderShop('armor');return}
    if(b.id==='inn'){
      overlay.innerHTML=`<div class="menu-title">🏨 宿屋</div><div class="npc-box">木の香りがする暖かな宿屋だ。<br><br>店主「旅の疲れを癒していくかい？」</div><div class="menu-actions"><button id="townInnRest">泊まる（無料）</button><button id="townInnBack">外へ出る</button></div>`;
      document.getElementById('townInnRest').onclick=()=>{state.hp=state.maxHp;state.mp=state.maxMp;updateUI();say('宿屋で休んだ。HPとMPが全回復した！');document.getElementById('townInnBack').click()};
      document.getElementById('townInnBack').onclick=leaveBuilding;return;
    }
    if(b.id==='item'){
      overlay.innerHTML=`<div class="menu-title">🧪 道具屋</div><div class="npc-box">棚には薬草や小瓶が並んでいる。<br><br>店主「今は薬草を準備中なんだ。もう少し待ってくれ！」</div><div class="menu-actions"><button id="townBuildingBack">外へ出る</button></div>`;
      document.getElementById('townBuildingBack').onclick=leaveBuilding;return;
    }
    overlay.innerHTML=`<div class="menu-title">🏠 民家</div><div class="npc-box">老人「ようこそ。町の北東には武器屋と防具屋がある。洞窟へ向かうなら装備を整えていきなされ。」</div><div class="menu-actions"><button id="townBuildingBack">外へ出る</button></div>`;
    document.getElementById('townBuildingBack').onclick=leaveBuilding;
  }

  function leaveBuilding(){state.inMenu=false;closeOverlay();drawTown();say('アストリアの町。石畳を人々が行き交っている。')}

  enterTown=function(){
    state.area='town';state.townX=7;state.townY=10;state.inMenu=false;closeOverlay();drawTown();
    say('アストリアの町。石畳の道と5軒の建物が並んでいる。自由に歩いてみよう。')
  };

  leaveTown=function(){state.area='world';state.inMenu=false;closeOverlay();drawWorld();say('アストリアの町を出た。')};

  function moveTown(dx,dy){
    const nx=state.townX+dx,ny=state.townY+dy;
    if(collidesTown(nx,ny)){say('そこには進めない。');return}
    state.townX=nx;state.townY=ny;drawTown();
    const b=buildingAtDoor(nx,ny);
    if(b){say(`${b.name}の入口だ。「しらべる」で中に入れる。`);return}
    if(ny===11&&(nx===7||nx===8)){leaveTown();return}
    say('アストリアの町を歩いている。')
  }

  move=function(dx,dy){
    if(state.inBattle||state.inMenu)return;
    if(state.area==='town'){moveTown(dx,dy);return}
    originalMove(dx,dy);
  };

  action=function(){
    if(state.inBattle||state.inMenu)return;
    if(state.area==='town'){
      const b=buildingAtDoor(state.townX,state.townY);
      if(b){enterBuilding(b);return}
      say('町の様子を眺めた。噴水の音と人々の話し声が聞こえる。');return
    }
    originalAction();
  };

  drawCurrent=function(){
    if(state.area==='town')drawTown();
    else originalDrawCurrent();
  };

  // Rebind buttons because the original handlers captured the previous move/action functions.
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>({up:()=>move(0,-1),down:()=>move(0,1),left:()=>move(-1,0),right:()=>move(1,0)})[b.dataset.action]());
  document.getElementById('action').onclick=()=>action();
  window.onkeydown=function(e){
    const k=e.key.toLowerCase();
    if(['arrowup','w'].includes(k))move(0,-1);
    if(['arrowdown','s'].includes(k))move(0,1);
    if(['arrowleft','a'].includes(k))move(-1,0);
    if(['arrowright','d'].includes(k))move(1,0);
  };

  // If a save is loaded inside town, draw it correctly after this extension loads.
  if(state.area==='town')drawTown();
})();