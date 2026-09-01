// Living town v2: moving NPCs, 4-direction hero, shop UI, furniture search, day/night.
(function(){
 const baseMove=window.move,baseAction=window.action,baseCurrent=window.drawCurrent,baseTown=window.drawTown;
 let walkFrame=0;
 if(state.facing==null)state.facing='down';
 if(state.worldMinutes==null)state.worldMinutes=9*60;
 if(!Array.isArray(state.searchedFurniture))state.searchedFurniture=[];
 if(state.herbs==null)state.herbs=0;
 const interiors={
  home:{name:'民家',npc:'老人',line:'洞窟の向こうには、かつて王都へ続く古い街道があったそうじゃ。'},
  weapon:{name:'武器屋',npc:'鍛冶屋',line:'武器は旅人の相棒だ。手に馴染む一本を選びな。'},
  armor:{name:'防具屋',npc:'防具職人',line:'強い敵ほど一撃が重い。防具を惜しむと後悔するよ。'},
  item:{name:'道具屋',npc:'店員',line:'薬草は冒険の基本！ 何個か持っておくと安心だよ。'},
  inn:{name:'宿屋',npc:'女将',line:'夜道は危ないよ。疲れたら無理せず泊まっていきな。'}
 };
 const doors={home:[2,3],weapon:[7,3],armor:[12,3],item:[3,9],inn:[11,9]};
 const townNPCs=[
  {name:'少年',x:5,y:6,dir:1,color:'#3767b1',lines:['洞窟に入ったことある？ ぼくは怖くて無理！','噴水の水、すっごく冷たいんだ。']},
  {name:'おばさん',x:10,y:6,dir:-1,color:'#9b4d66',lines:['武器屋の主人は無愛想だけど腕は確かよ。','日が暮れる前に宿を取るといいわ。']},
  {name:'兵士',x:8,y:1,dir:1,color:'#65758b',lines:['町の外では魔物に警戒しろ。','黒曜の騎士を倒した旅人がいるらしいな。']}
 ];
 function tickTime(){state.worldMinutes=(state.worldMinutes+8)%(24*60)}
 function hour(){return Math.floor(state.worldMinutes/60)}
 function isNight(){const h=hour();return h>=18||h<6}
 function timeLabel(){const h=hour(),m=state.worldMinutes%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`}
 function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
 function drawHeroDirectional(x,y){
  const X=x*TILE,Y=y*TILE,bob=walkFrame%2?1:0;
  rect(X+8,Y+33,25,4,'rgba(0,0,0,.28)');
  if(state.facing==='up'){
   rect(X+11,Y+17+bob,22,13,'#143b7a');rect(X+14,Y+8+bob,16,11,'#e7b685');rect(X+11,Y+5+bob,21,7,'#113b91');rect(X+14,Y+2+bob,5,6,'#1e63d5');rect(X+20,Y+bob,5,8,'#2671e5');rect(X+26,Y+3+bob,5,7,'#174caa');rect(X+14,Y+28,7,6,'#52311f');rect(X+25,Y+28,7,6,'#52311f');rect(X+8,Y+18+bob,6,6,'#d2a23b');rect(X+31,Y+18+bob,6,6,'#d2a23b');rect(X+18,Y+22+bob,10,3,'#794220');
  }else if(state.facing==='left'||state.facing==='right'){
   const flip=state.facing==='right';const sx=flip?X+12:X+14;
   rect(X+11,Y+17+bob,21,13,'#164999');rect(sx,Y+8+bob,15,11,'#efbd8b');rect(X+11,Y+5+bob,20,6,'#10367e');rect(flip?X+27:X+10,Y+10+bob,3,3,'#20222b');rect(X+12,Y+28,7,6,'#52311f');rect(X+25,Y+28,7,6,'#52311f');rect(flip?X+29:X+7,Y+18+bob,7,6,'#d3a43a');rect(flip?X+8:X+32,Y+8+bob,3,18,'#d7e0e8');rect(flip?X+6:X+30,Y+21+bob,7,3,'#e3ad36');
  }else{
   rect(X+11,Y+17+bob,22,13,'#143b7a');rect(X+14,Y+8+bob,16,11,'#efbd8b');rect(X+11,Y+5+bob,21,6,'#10367e');rect(X+14,Y+2+bob,5,6,'#1e63d5');rect(X+20,Y+bob,5,8,'#2671e5');rect(X+26,Y+3+bob,5,7,'#174caa');rect(X+17,Y+12+bob,3,3,'#20222b');rect(X+25,Y+12+bob,3,3,'#20222b');rect(X+9,Y+18+bob,6,6,'#d2a23b');rect(X+31,Y+18+bob,6,6,'#d2a23b');rect(X+13,Y+28,7,6,'#52311f');rect(X+25,Y+28,7,6,'#52311f');rect(X+33,Y+8+bob,3,18,'#d7e0e8');rect(X+31,Y+22+bob,8,3,'#e3ad36');
  }
 }
 window.drawHero=drawHeroDirectional;
 function drawNPC(n){const X=n.x*TILE,Y=n.y*TILE;rect(X+10,Y+32,20,4,'rgba(0,0,0,.22)');rect(X+11,Y+17,18,15,n.color);rect(X+13,Y+8,15,10,'#edbc89');rect(X+11,Y+5,19,5,'#543725');rect(X+16,Y+12,2,2,'#20222b');rect(X+24,Y+12,2,2,'#20222b');rect(X+12,Y+30,6,4,'#4a3023');rect(X+23,Y+30,6,4,'#4a3023')}
 function nightOverlay(){if(!isNight())return;ctx.fillStyle='rgba(8,16,47,.40)';ctx.fillRect(0,0,canvas.width,canvas.height);for(const [x,y] of [[2,3],[7,3],[12,3],[3,9],[11,9]]){ctx.fillStyle='rgba(255,205,92,.70)';ctx.fillRect(x*TILE+14,y*TILE-8,12,12)}}
 window.drawTown=function(){baseTown();townNPCs.forEach(drawNPC);drawHeroDirectional(state.townX,state.townY);nightOverlay();ctx.fillStyle='rgba(2,6,23,.82)';ctx.fillRect(8,8,126,26);ctx.fillStyle='#f8fafc';ctx.font='bold 14px monospace';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(`${isNight()?'🌙':'☀'} ${timeLabel()}`,18,21)};
 function drawInterior(){
  const type=state.interiorType||'home';
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const X=x*TILE,Y=y*TILE;rect(X,Y,40,40,(x===0||y===0||x===15||y===11)?'#3f2a20':'#8e6038');if(x>0&&y>0&&x<15&&y<11){rect(X+2,Y+2,36,36,'#a97645');ctx.strokeStyle='rgba(61,36,20,.24)';ctx.strokeRect(X+2,Y+2,36,36)}}
  rect(2*TILE,2*TILE,12*TILE,2*TILE,'#563522');rect(2*TILE,2*TILE+4,12*TILE,9,'#c18d50');
  // shelves / decoration
  for(let x=3;x<13;x+=2){rect(x*TILE,3*TILE,25,29,'#4e3020');rect(x*TILE+4,3*TILE+5,17,5,'#d2ac66')}
  if(type==='inn'){rect(2*TILE,7*TILE,90,55,'#e9d9b6');rect(11*TILE,7*TILE,90,55,'#e9d9b6');rect(2*TILE,7*TILE,90,10,'#84364d');rect(11*TILE,7*TILE,90,10,'#84364d')}
  if(type==='weapon'||type==='armor'){for(let i=0;i<4;i++){rect((4+i*2)*TILE,5*TILE,5,24,'#ccd4dc');rect((4+i*2)*TILE-5,5*TILE+19,15,4,'#d6a53b')}}
  if(type==='item'){for(let i=0;i<5;i++){ctx.fillStyle=['#5cb85c','#c34d4d','#4b7ac7','#cf9c4c','#895ab4'][i];ctx.beginPath();ctx.arc((4+i*2)*TILE,5*TILE+20,8,0,Math.PI*2);ctx.fill()}}
  // furniture search spots
  if(type==='home'){rect(3*TILE,7*TILE,34,28,'#6c4027');rect(3*TILE+5,7*TILE+5,24,8,'#a06c3e');rect(12*TILE,7*TILE,34,30,'#8b551f');rect(12*TILE+4,7*TILE+4,26,8,'#d59a32')}
  drawNPC({x:8,y:4,color:type==='inn'?'#9b3157':type==='weapon'?'#814126':type==='armor'?'#596173':type==='item'?'#447a52':'#6a5a45'});
  rect(7*TILE,10*TILE+10,80,25,'#51311f');ctx.fillStyle='#e7c779';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText('EXIT',8*TILE,10*TILE+27);drawHeroDirectional(state.interiorX||8,state.interiorY||9);if(isNight()){ctx.fillStyle='rgba(18,18,36,.18)';ctx.fillRect(0,0,640,480)}
 }
 function findDoor(){return Object.entries(doors).find(([,p])=>p[0]===state.townX&&p[1]===state.townY)?.[0]}
 function enter(type){state.area='interior';state.interiorType=type;state.interiorX=8;state.interiorY=9;state.facing='up';state.inMenu=false;closeOverlay();drawInterior();say(`${interiors[type].name}。中には${interiors[type].npc}がいる。`)}
 function leaveInterior(){state.area='town';state.townX=doors[state.interiorType][0];state.townY=doors[state.interiorType][1];state.facing='down';drawTown();say(`${interiors[state.interiorType].name}を出た。`) }
 function shopScreen(type){
  state.inMenu=true;overlay.classList.remove('hidden');
  if(type==='item'){
   overlay.innerHTML=`<div class="menu-title">🧪 道具屋</div><div class="npc-box">所持金 ${state.gold}G　薬草 ${state.herbs||0}個<br>薬草は1個15G。HPを30回復する冒険の必需品だ。</div><div class="shop-list"><div class="shop-item"><div><strong>薬草</strong><small>HPを30回復</small></div><button id="buyHerb">15G</button></div></div><div class="menu-actions"><button id="shopClose">買い物をやめる</button></div>`;
   document.getElementById('buyHerb').onclick=()=>{if(state.gold<15){say('ゴールドが足りない！');return}state.gold-=15;state.herbs=(state.herbs||0)+1;updateUI();shopScreen('item')};document.getElementById('shopClose').onclick=()=>{state.inMenu=false;closeOverlay();drawInterior()};return;
  }
  const list=type==='weapon'?weapons:armors;const owned=type==='weapon'?state.ownedWeapons:state.ownedArmor;
  overlay.innerHTML=`<div class="menu-title">${type==='weapon'?'⚔️ 武器屋':'🛡️ 防具屋'}</div><div class="npc-box">所持金 ${state.gold}G<br>品物を選ぶと、その場で装備する。</div><div class="shop-list">${list.map((it,i)=>{const has=owned.includes(it.name),eq=type==='weapon'?state.weapon===it.name:state.armor===it.name;return `<div class="shop-item"><div><strong>${it.name}</strong><small>${it.desc}</small></div><button data-shop="${i}" ${eq?'disabled':''}>${eq?'装備中':has?'装備する':it.price+'G'}</button></div>`}).join('')}</div><div class="menu-actions"><button id="shopClose">買い物をやめる</button></div>`;
  overlay.querySelectorAll('[data-shop]').forEach(b=>b.onclick=()=>{buyOrEquip(type,Number(b.dataset.shop));shopScreen(type)});document.getElementById('shopClose').onclick=()=>{state.inMenu=false;closeOverlay();drawInterior()}
 }
 function searchFurniture(){
  if(state.interiorType!=='home')return false;
  const spots=[{id:'dresser',x:3,y:7,text:'タンス',reward:()=>{state.herbs=(state.herbs||0)+1;say('タンスを調べた。薬草を1個見つけた！')}},{id:'chest',x:12,y:7,text:'宝箱',reward:()=>{state.gold+=50;updateUI();say('宝箱を開けた！ 50Gを手に入れた！')}}];
  for(const s of spots){if(Math.abs(state.interiorX-s.x)+Math.abs(state.interiorY-s.y)<=1){const key=`home:${s.id}`;if(state.searchedFurniture.includes(key)){say(`${s.text}はもう調べた。`)}else{state.searchedFurniture.push(key);s.reward()}return true}}
  return false;
 }
 function npcNearInterior(){return Math.abs((state.interiorX||8)-8)+Math.abs((state.interiorY||9)-4)<=2}
 function townNpcNear(){return townNPCs.find(n=>Math.abs(n.x-state.townX)+Math.abs(n.y-state.townY)<=1)}
 function moveInterior(dx,dy){state.facing=dx>0?'right':dx<0?'left':dy<0?'up':'down';const nx=state.interiorX+dx,ny=state.interiorY+dy;if(nx<1||nx>14||ny<4||ny>10){say('そこには進めない。');return}if(nx===8&&ny===4){say(`${interiors[state.interiorType].npc}がいる。`);return}state.interiorX=nx;state.interiorY=ny;walkFrame++;tickTime();drawInterior();if(ny===10&&(nx===7||nx===8))leaveInterior()}
 window.move=function(dx,dy){if(state.inBattle||state.inMenu)return;state.facing=dx>0?'right':dx<0?'left':dy<0?'up':'down';walkFrame++;tickTime();if(state.area==='interior'){moveInterior(dx,dy);return}baseMove(dx,dy)};
 window.action=function(){
  if(state.inBattle||state.inMenu)return;
  if(state.area==='town'){const d=findDoor();if(d){enter(d);return}const n=townNpcNear();if(n){say(`${n.name}「${n.lines[Math.floor(Math.random()*n.lines.length)]}」`);return}say('町を見渡した。人々の生活の音が聞こえる。');return}
  if(state.area==='interior'){
   if(searchFurniture())return;
   if(npcNearInterior()){
    const i=interiors[state.interiorType];
    if(state.interiorType==='weapon'){shopScreen('weapon');return}
    if(state.interiorType==='armor'){shopScreen('armor');return}
    if(state.interiorType==='item'){shopScreen('item');return}
    if(state.interiorType==='inn'){state.hp=state.maxHp;state.mp=state.maxMp;updateUI();state.worldMinutes=(8*60);say(`${i.npc}「ぐっすり眠れたかい？」 HPとMPが全回復した。朝になった！`);drawInterior();return}
    say(`${i.npc}「${i.line}」`);return
   }
   say('家具や棚を調べたが、特に変わったものはない。');return
  }
  baseAction()
 };
 window.drawCurrent=function(){if(state.area==='interior')drawInterior();else baseCurrent()};
 // Slowly move NPCs while the town is open.
 setInterval(()=>{if(state.area!=='town'||state.inBattle||state.inMenu)return;for(const n of townNPCs){const dirs=[[1,0],[-1,0],[0,1],[0,-1],[0,0]][Math.floor(Math.random()*5)],nx=n.x+dirs[0],ny=n.y+dirs[1];if(nx>0&&nx<15&&ny>0&&ny<11&&!((nx===7||nx===8)&&(ny===5||ny===6))){n.x=nx;n.y=ny}}drawTown()},1200);
 document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>({up:()=>move(0,-1),down:()=>move(0,1),left:()=>move(-1,0),right:()=>move(1,0)})[b.dataset.action]());document.getElementById('action').onclick=()=>action();window.onkeydown=e=>{const k=e.key.toLowerCase();if(['arrowup','w'].includes(k))move(0,-1);if(['arrowdown','s'].includes(k))move(0,1);if(['arrowleft','a'].includes(k))move(-1,0);if(['arrowright','d'].includes(k))move(1,0)};
 if(state.area==='town')drawTown();if(state.area==='interior')drawInterior();
})();