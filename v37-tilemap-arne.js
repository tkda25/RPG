// v37: tilemap-based Arne Village + inn, pixel portraits, strict collision.
(function(){
  const A=document.getElementById('btnA'),B=document.getElementById('btnB');
  const prevAction=window.action, prevMove=window.move, prevDraw=window.drawCurrent;
  const P=32, VW=20, VH=15;
  const V=[
    "TTTTTTTTTTTTTTTTTTTT",
    "TGGGGGGPPGGGGGGGGGGT",
    "TGGGHHHPPGGGHHHGGGGT",
    "TGGGHHHPPGGGHHHGGGGT",
    "TGGGDGGPPGGGDHGGGGGT",
    "TGGGGGGPPGGGGGGGGGGT",
    "TWWWWWWBBWWWWWWWWGGT",
    "TGGGGGGPPGGGGGGGGGGT",
    "TGGHHGGPPGGGGHHHGGGT",
    "TGGHDGGPPGGGGHDHGGGT",
    "TGGGGGGPPGGGGGGGGGGT",
    "TGGGGGGPPPPPPPPGGGGT",
    "TGGGGGGGGGGGGPPGGGGT",
    "TGGGGGGGGGGGGPPGGGGT",
    "TTTTTTTTTTTTTXXTTTTT"
  ];
  // H house body, D door, T trees/walls, W water, B bridge, P path, G grass, X exit
  const houseDoors={
    "4,4":"home",
    "14,4":"weapon",
    "3,9":"item",
    "14,9":"inn"
  };
  const houseNames={home:"民家",weapon:"武器屋",item:"道具屋",inn:"宿屋"};
  const npcs=[
    {id:"boy",name:"少年",x:9,y:3,pal:["#5a341f","#e6ae7f","#315fa8","#15365e"],lines:["北の洞窟、夜になると変な音がするんだ。","王都レグナスって、村の何倍も大きいんだって！"]},
    {id:"woman",name:"ミラ",x:6,y:10,pal:["#6b3a2a","#e7b17f","#a34d65","#54263a"],lines:["旅に出るなら薬草を忘れないでね。","あなたのお父さん、昔は村で一番剣が強かったのよ。"]},
    {id:"guard",name:"衛兵ローデン",x:15,y:11,pal:["#4b3426","#d8a572","#617286","#303a48"],lines:["北の洞窟の魔物が増えている。油断するな。","王都から星晶石についての知らせが来ている。"]}
  ];
  const I=[
    "####################",
    "#....bbbb....bbbb..#",
    "#....bbbb....bbbb..#",
    "#..................#",
    "#....rrrrrrrr......#",
    "#....rrrrrrrr......#",
    "#.......CCCC.......#",
    "#.......CNC........#",
    "#.......CCCC.......#",
    "#..................#",
    "#..SS..........SS..#",
    "#..SS..........SS..#",
    "#..................#",
    "#.........E........#",
    "#########XX#########"
  ];
  // b bed, r rug, C counter, N innkeeper, S shelf, E entrance mat, X exit, # wall

  if(state.townX==null||state.townY==null){state.townX=9;state.townY=13}
  if(state.interiorX==null||state.interiorY==null){state.interiorX=10;state.interiorY=13}
  if(!state.faceTalkIndex)state.faceTalkIndex={};

  function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
  function px(x,y,c){ctx.fillStyle=c;ctx.fillRect(x,y,2,2)}
  function tileGrass(x,y){
    R(x,y,P,P,'#4f913e'); R(x+5,y+7,2,5,'#2e6c31'); R(x+22,y+19,2,5,'#2e6c31');
    R(x+11,y+24,3,2,'#6eaa51'); R(x+27,y+7,2,2,'#7cb45c');
  }
  function tilePath(x,y){
    R(x,y,P,P,'#a99b7c');R(x+2,y+3,11,3,'#c6b895');R(x+18,y+19,10,3,'#8d8065');
    R(x+8,y+12,3,2,'#756a55');
  }
  function tileWater(x,y){
    R(x,y,P,P,'#2769a8');R(x+4,y+8,12,2,'#5ca1d9');R(x+17,y+21,10,2,'#4a8fc8');R(x+9,y+27,7,2,'#74b6e4');
  }
  function tileBridge(x,y){
    R(x,y,P,P,'#6a4328');for(let yy=y+2;yy<y+P;yy+=6){R(x,yy,P,4,'#a06a3a');R(x,yy+4,P,2,'#4d301f')}R(x+3,y,3,P,'#d6a056');R(x+26,y,3,P,'#d6a056');
  }
  function tileTree(x,y){
    R(x,y,P,P,'#355a31');R(x+13,y+21,6,10,'#5f3a20');R(x+4,y+7,24,18,'#1e5a2e');R(x+8,y+3,18,17,'#2f7f3d');R(x+12,y+5,7,5,'#59a651');
  }
  function houseTile(x,y,door=false,roof="#8e3f35"){
    R(x,y,P,P,'#b69b72');R(x,y,P,10,roof);R(x,y+10,P,4,'#5b3627');R(x+3,y+14,P-6,18,'#d7c497');
    if(door){R(x+10,y+13,12,19,'#4b2c20');R(x+19,y+21,2,2,'#e0b84e')}else{R(x+8,y+18,16,9,'#76a9b8');R(x+10,y+20,12,5,'#244957')}
  }
  function sprite(x,y,pal,dir="down"){
    const X=x*P+5,Y=y*P+2;
    R(X+7,Y,10,4,pal[0]);R(X+5,Y+4,14,4,pal[0]);
    R(X+7,Y+8,10,8,pal[1]);
    R(X+5,Y+16,14,11,pal[2]);
    R(X+2,Y+18,4,8,pal[1]);R(X+19,Y+18,4,8,pal[1]);
    R(X+7,Y+27,5,4,pal[3]);R(X+14,Y+27,5,4,pal[3]);
    if(dir!=="up"){px(X+9,Y+11,"#1b1b1b");px(X+15,Y+11,"#1b1b1b")}
  }
  function heroSprite(x,y){sprite(x,y,["#1d4b9a","#efbd87","#315ec0","#f1ead8"],state.facing||"down")}
  function drawVillage(){
    for(let y=0;y<VH;y++)for(let x=0;x<VW;x++){
      const ch=V[y][x],X=x*P,Y=y*P;
      if(ch==="G")tileGrass(X,Y);else if(ch==="P")tilePath(X,Y);else if(ch==="W")tileWater(X,Y);else if(ch==="B")tileBridge(X,Y);else if(ch==="T")tileTree(X,Y);
      else if(ch==="H")houseTile(X,Y,false);else if(ch==="D")houseTile(X,Y,true);
      else if(ch==="X"){tilePath(X,Y);R(X+4,Y+24,24,5,'#5a3824')}
      else tileGrass(X,Y);
    }
    npcs.forEach(n=>sprite(n.x,n.y,n.pal));
    heroSprite(state.townX,state.townY);
  }
  function stoneFloor(x,y){R(x,y,P,P,'#5a5d60');R(x+2,y+2,P-4,P-4,'#686c6e');R(x+3,y+3,12,3,'#7b7f81');R(x+18,y+22,10,3,'#46494b')}
  function wallTile(x,y){R(x,y,P,P,'#35383a');for(let yy=0;yy<P;yy+=8){for(let xx=0;xx<P;xx+=16){const o=(yy/8)%2?8:0;R(x+xx-o,y+yy,14,6,'#4a4e50');R(x+xx-o+2,y+yy+1,10,2,'#5d6264')}}}
  function bedTile(x,y){stoneFloor(x,y);R(x+4,y+4,24,26,'#4b2f22');R(x+7,y+6,18,21,'#e5dcc6');R(x+7,y+16,18,11,'#8c2d42');R(x+9,y+18,14,2,'#d4a94c')}
  function rugTile(x,y){stoneFloor(x,y);R(x+2,y+2,28,28,'#7f2336');R(x+5,y+5,22,22,'#b63b48');R(x+8,y+8,16,2,'#d5aa4c');R(x+8,y+22,16,2,'#d5aa4c')}
  function counterTile(x,y){stoneFloor(x,y);R(x+2,y+8,28,20,'#4c2f20');R(x,y+6,32,7,'#9c6537')}
  function shelfTile(x,y){stoneFloor(x,y);R(x+3,y+3,26,26,'#3e281d');for(let yy=7;yy<27;yy+=8)R(x+5,y+yy,22,3,'#6e482b');R(x+7,y+5,4,6,'#71905d');R(x+14,y+13,4,6,'#9c574c');R(x+21,y+21,4,5,'#5879a8')}
  function torchAt(x,y){R(x-2,y+5,4,10,'#5c3a22');R(x-5,y+2,10,4,'#9d5523');const f=(Date.now()/160|0)%3;R(x-4,y-5-f,8,9+f,'#eb5c20');R(x-2,y-3-f,4,6+f,'#ffb62c')}
  function drawInn(){
    for(let y=0;y<VH;y++)for(let x=0;x<VW;x++){
      const ch=I[y][x],X=x*P,Y=y*P;
      if(ch==="#")wallTile(X,Y);else if(ch==="b")bedTile(X,Y);else if(ch==="r")rugTile(X,Y);else if(ch==="C")counterTile(X,Y);else if(ch==="S")shelfTile(X,Y);else stoneFloor(X,Y);
    }
    torchAt(3*P+16,3*P+16);torchAt(16*P+16,3*P+16);torchAt(3*P+16,12*P+16);torchAt(16*P+16,12*P+16);
    sprite(8,7,["#6b3a29","#e6af7f","#a24961","#4f2e27"]);
    heroSprite(state.interiorX,state.interiorY);
  }
  function blockedVillage(x,y){
    if(x<0||y<0||x>=VW||y>=VH)return true;
    const ch=V[y][x];
    if(["T","H","W"].includes(ch))return true;
    if(npcs.some(n=>n.x===x&&n.y===y))return true;
    return false;
  }
  function blockedInn(x,y){
    if(x<0||y<0||x>=VW||y>=VH)return true;
    const ch=I[y][x];
    if(["#","b","C","S","N"].includes(ch))return true;
    return false;
  }
  function faceCanvas(pal){
    const c=document.createElement('canvas');c.width=48;c.height=48;const q=c.getContext('2d');q.imageSmoothingEnabled=false;
    q.fillStyle='#101820';q.fillRect(0,0,48,48);q.fillStyle=pal[0];q.fillRect(10,5,28,10);q.fillRect(7,11,34,9);
    q.fillStyle=pal[1];q.fillRect(11,18,26,19);q.fillStyle='#1b1b1b';q.fillRect(16,25,4,4);q.fillRect(29,25,4,4);q.fillRect(22,32,6,3);
    q.fillStyle=pal[2];q.fillRect(6,38,36,10);return c.toDataURL();
  }
  function talk(n){
    const idx=(state.faceTalkIndex[n.id]||0)%n.lines.length;state.faceTalkIndex[n.id]=idx+1;
    state.inMenu=true;overlay.classList.remove('hidden');
    overlay.innerHTML=`<div class="field-menu"><div class="field-menu-title">${n.name}</div><div class="field-menu-body"><div class="npc-box portrait-dialog"><img src="${faceCanvas(n.pal)}" alt=""><div>${n.lines[idx]}</div></div><button id="talkClose" class="menu-back">閉じる</button></div><div class="field-menu-hint">A 決定 / B 戻る</div></div>`;
    document.getElementById('talkClose').onclick=()=>{state.inMenu=false;closeOverlay();drawVillage()};
    if(window.astriaSelectFirst)window.astriaSelectFirst();
  }
  function innTalk(){
    state.inMenu=true;overlay.classList.remove('hidden');
    const pal=["#6b3a29","#e6af7f","#a24961","#4f2e27"];
    overlay.innerHTML=`<div class="field-menu"><div class="field-menu-title">女将エルナ</div><div class="field-menu-body"><div class="npc-box portrait-dialog"><img src="${faceCanvas(pal)}" alt=""><div>旅の疲れを癒していくかい？</div></div><div class="field-menu-list"><button id="rest">泊まる（無料）</button><button id="leaveTalk">やめる</button></div></div></div>`;
    document.getElementById('rest').onclick=()=>{state.hp=state.maxHp;state.mp=state.maxMp;updateUI();state.inMenu=false;closeOverlay();drawInn();say('HPとMPが全回復した。')};
    document.getElementById('leaveTalk').onclick=()=>{state.inMenu=false;closeOverlay();drawInn()};
    if(window.astriaSelectFirst)window.astriaSelectFirst();
  }
  function enter(type){
    state.area='interior';state.interiorType=type;state.interiorX=10;state.interiorY=13;state.facing='up';state.inMenu=false;closeOverlay();
    if(type==='inn'){drawInn();say('アルネ村 宿屋。女将に近づいてAボタンで話しかけよう。');return}
    // other interiors keep the existing game systems for now
    prevAction();
  }

  window.drawTown=drawVillage;
  window.drawCurrent=function(){
    if(state.area==='town'){drawVillage();return}
    if(state.area==='interior'&&state.interiorType==='inn'){drawInn();return}
    prevDraw.apply(this,arguments);
  };
  window.enterArneVillage=function(){state.area='town';state.townX=9;state.townY=13;state.inMenu=false;closeOverlay();drawVillage();say('アルネ村。')};

  window.move=function(dx,dy){
    if(state.inBattle||state.inMenu)return;
    if(state.area==='town'){
      state.facing=dx>0?'right':dx<0?'left':dy<0?'up':'down';
      const nx=state.townX+dx,ny=state.townY+dy;
      if(blockedVillage(nx,ny)){say('そこには進めない。');return}
      state.townX=nx;state.townY=ny;drawVillage();
      if(V[ny][nx]==='D')say((houseNames[houseDoors[`${nx},${ny}`]]||'建物')+'の入口だ。Aボタンで入れる。');
      if(V[ny][nx]==='X'){state.area='world';state.worldX=9;state.worldY=19;drawCurrent();say('アルネ村を出た。')}
      return;
    }
    if(state.area==='interior'&&state.interiorType==='inn'){
      state.facing=dx>0?'right':dx<0?'left':dy<0?'up':'down';
      const nx=state.interiorX+dx,ny=state.interiorY+dy;
      if(blockedInn(nx,ny)){say('そこには進めない。');return}
      state.interiorX=nx;state.interiorY=ny;drawInn();
      if(I[ny][nx]==='X'){state.area='town';state.townX=14;state.townY=10;drawVillage();say('宿屋を出た。')}
      return;
    }
    prevMove(dx,dy);
  };
  window.action=function(){
    if(!state.inBattle&&!state.inMenu&&state.area==='town'){
      const key=`${state.townX},${state.townY}`;
      if(V[state.townY][state.townX]==='D'){
        const type=houseDoors[key];
        if(type==='inn'){enter('inn');return}
      }
      const n=npcs.find(n=>Math.abs(n.x-state.townX)+Math.abs(n.y-state.townY)<=1);
      if(n){talk(n);return}
    }
    if(!state.inBattle&&!state.inMenu&&state.area==='interior'&&state.interiorType==='inn'){
      if(Math.abs(state.interiorX-8)+Math.abs(state.interiorY-7)<=2){innTalk();return}
    }
    prevAction();
  };

  const style=document.createElement('style');
  style.textContent=`
    .portrait-dialog{display:grid!important;grid-template-columns:56px 1fr!important;gap:10px!important;align-items:center!important}
    .portrait-dialog img{width:48px;height:48px;image-rendering:pixelated;border:2px solid #e5e7eb;background:#101820}
  `;document.head.appendChild(style);

  if(state.area==='town')drawVillage();
  if(state.area==='interior'&&state.interiorType==='inn')drawInn();
})();