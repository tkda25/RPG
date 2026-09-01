const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
const msg=document.getElementById('message');
const overlay=document.getElementById('overlay');
const ui={
  level:document.getElementById('level'),hp:document.getElementById('hp'),mp:document.getElementById('mp'),gold:document.getElementById('gold'),
  weapon:document.getElementById('weapon'),armor:document.getElementById('armor')
};

const TILE=40,COLS=16,ROWS=12;
const colors={grass:'#4c8c3a',water:'#2f6fb0',road:'#c7a76a',town:'#b96f40',cave:'#5b4b3f',forest:'#235f33',mountain:'#777'};
const worldMap=[
'WWWWWWWWWWWWWWWW','WGGGGGGGMMMMMGGW','WGGTTTGGMMMGGGGW','WGGTTTGGGGGGGGGW','WGGGRRGGGFFFFGGW','WGGGRRGGGFFFFGGW',
'WGGGRRGGGGGGGCGW','WGGGRRRRRRGGGGGW','WGGGGGGGRRGGGGGW','WGGFFFFGRRGGGGGW','WGGFFFFGGGGGGGGW','WWWWWWWWWWWWWWWW'];
const tileInfo={G:['草原','grass'],W:['海','water'],R:['道','road'],T:['アストリアの町','town'],C:['黒曜の洞窟','cave'],F:['森','forest'],M:['山','mountain']};

const dungeonMaps={
  1:[
    '################','##E...........###','##.####.######.##','##....#......#.##','#####.######.#.##','##....#....#.#.##','##.####.##.#.#.##','##......##...#.##','##.###########.##','##.............##','##............S##','################'
  ],
  2:[
    '################','##S.....#########','######..#.......#','##......#.#####.#','##.######.#...#.#','##....H...#.#.#.#','######.####.#.#.#','##.....#....#...#','##.#####.######.#','##.......#....B.#','##########......#','################'
  ]
};

const defaultState={
  x:4,y:8,level:1,xp:0,hp:30,maxHp:30,mp:10,maxMp:10,atk:7,def:3,gold:20,
  bossDefeated:false,inBattle:false,inMenu:false,area:'world',dungeonFloor:1,dungeonX:2,dungeonY:1,
  weapon:'なし',weaponBonus:0,armor:'なし',armorBonus:0,ownedWeapons:[],ownedArmor:[],openedChests:[]
};
let state={...defaultState};

const enemies=[
{name:'スライム',emoji:'🟢',hp:12,atk:4,def:1,xp:5,gold:4},
{name:'ツノウサギ',emoji:'🐇',hp:18,atk:6,def:2,xp:8,gold:7},
{name:'森オオカミ',emoji:'🐺',hp:24,atk:8,def:3,xp:12,gold:10},
{name:'ゴブリン',emoji:'👺',hp:30,atk:10,def:4,xp:18,gold:14}
];
const dungeonEnemies=[
{name:'洞窟コウモリ',emoji:'🦇',hp:22,atk:8,def:2,xp:12,gold:9},
{name:'どくキノコ',emoji:'🍄',hp:28,atk:9,def:3,xp:15,gold:12},
{name:'骸骨兵',emoji:'💀',hp:36,atk:11,def:4,xp:22,gold:18}
];
const weapons=[
{name:'銅のつるぎ',price:35,atk:3,desc:'攻撃力 +3'},{name:'鋼のつるぎ',price:85,atk:7,desc:'攻撃力 +7'},{name:'騎士のつるぎ',price:160,atk:12,desc:'攻撃力 +12'}
];
const armors=[
{name:'旅人の服',price:30,def:2,desc:'防御力 +2'},{name:'鉄のよろい',price:80,def:5,desc:'防御力 +5'},{name:'騎士のよろい',price:150,def:9,desc:'防御力 +9'}
];

function updateUI(){
  ui.level.textContent=`Lv ${state.level}`;ui.hp.textContent=`HP ${state.hp}/${state.maxHp}`;ui.mp.textContent=`MP ${state.mp}/${state.maxMp}`;ui.gold.textContent=`G ${state.gold}`;
  ui.weapon.textContent=`武器: ${state.weapon}`;ui.armor.textContent=`防具: ${state.armor}`;
}
function say(t){msg.textContent=t}
function closeOverlay(){overlay.classList.add('hidden');overlay.innerHTML=''}
function drawCurrent(){state.area==='dungeon'?drawDungeon():drawWorld()}
function drawHero(x,y){
  ctx.fillStyle='#f8fafc';ctx.fillRect(x*TILE+11,y*TILE+7,18,25);ctx.fillStyle='#2563eb';ctx.fillRect(x*TILE+9,y*TILE+6,22,8);
  ctx.fillStyle='#111827';ctx.fillRect(x*TILE+14,y*TILE+13,4,4);ctx.fillRect(x*TILE+23,y*TILE+13,4,4)
}
function drawWorld(){
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const ch=worldMap[y][x],type=tileInfo[ch][1];ctx.fillStyle=colors[type];ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
    if(ch==='F'){ctx.fillStyle='#163d21';ctx.fillRect(x*TILE+8,y*TILE+7,24,26)}
    if(ch==='T'){ctx.fillStyle='#f2d3a2';ctx.fillRect(x*TILE+7,y*TILE+8,26,24);ctx.fillStyle='#7c2d12';ctx.fillRect(x*TILE+6,y*TILE+4,28,8)}
    if(ch==='C'){ctx.fillStyle='#151515';ctx.beginPath();ctx.arc(x*TILE+20,y*TILE+25,13,0,Math.PI*2);ctx.fill()}
    ctx.strokeStyle='rgba(0,0,0,.08)';ctx.strokeRect(x*TILE,y*TILE,TILE,TILE)
  }
  drawHero(state.x,state.y)
}
function drawDungeon(){
  const map=dungeonMaps[state.dungeonFloor];
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const ch=map[y][x];
    ctx.fillStyle=ch==='#'?'#171717':'#4b5563';ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
    if(ch!=='#'){ctx.fillStyle='#374151';ctx.fillRect(x*TILE+4,y*TILE+4,TILE-8,TILE-8)}
    if(ch==='E'){ctx.fillStyle='#92400e';ctx.fillRect(x*TILE+10,y*TILE+5,20,30);ctx.fillStyle='#fbbf24';ctx.fillRect(x*TILE+24,y*TILE+19,4,4)}
    if(ch==='S'){ctx.fillStyle='#d1d5db';for(let i=0;i<4;i++)ctx.fillRect(x*TILE+8+i*5,y*TILE+8+i*5,24-i*5,4)}
    if(ch==='H'){
      const id=`${state.dungeonFloor}:${x}:${y}`;if(!state.openedChests.includes(id)){ctx.fillStyle='#b45309';ctx.fillRect(x*TILE+8,y*TILE+15,24,16);ctx.fillStyle='#facc15';ctx.fillRect(x*TILE+8,y*TILE+12,24,7);ctx.fillRect(x*TILE+18,y*TILE+17,5,7)}
    }
    if(ch==='B'&&!state.bossDefeated){ctx.fillStyle='#7f1d1d';ctx.fillRect(x*TILE+8,y*TILE+8,24,24);ctx.fillStyle='#fca5a5';ctx.fillRect(x*TILE+14,y*TILE+12,4,4);ctx.fillRect(x*TILE+22,y*TILE+12,4,4)}
    ctx.strokeStyle='rgba(255,255,255,.06)';ctx.strokeRect(x*TILE,y*TILE,TILE,TILE)
  }
  drawHero(state.dungeonX,state.dungeonY)
}

function move(dx,dy){
  if(state.inBattle||state.inMenu)return;
  if(state.area==='dungeon'){moveDungeon(dx,dy);return}
  const nx=state.x+dx,ny=state.y+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)return;
  const ch=worldMap[ny][nx];if(['W','M'].includes(ch)){say(tileInfo[ch][0]+'が行く手をはばんでいる。');return}
  state.x=nx;state.y=ny;drawWorld();
  if(ch==='T')enterTown();else if(ch==='C')enterCave();else{
    say(`${tileInfo[ch][0]}を進んでいる。`);const rate=ch==='F'?0.28:0.16;if(Math.random()<rate)startBattle({...enemies[Math.floor(Math.random()*enemies.length)]});
  }
}
function moveDungeon(dx,dy){
  const map=dungeonMaps[state.dungeonFloor],nx=state.dungeonX+dx,ny=state.dungeonY+dy;
  if(nx<0||ny<0||nx>=COLS||ny>=ROWS||map[ny][nx]==='#'){say('冷たい岩壁が行く手をふさいでいる。');return}
  state.dungeonX=nx;state.dungeonY=ny;drawDungeon();
  const ch=map[ny][nx];
  if(ch==='E'){leaveCave();return}
  if(ch==='S'){useStairs();return}
  if(ch==='H'){openChest(nx,ny);return}
  if(ch==='B'&&!state.bossDefeated){startBattle({name:'黒曜の騎士',emoji:'🛡️',hp:70,atk:13,def:6,xp:60,gold:80,boss:true});return}
  say(`黒曜の洞窟 ${state.dungeonFloor===1?'1F':'B1F'}。足音だけが響いている。`);
  if(Math.random()<0.2)startBattle({...dungeonEnemies[Math.floor(Math.random()*dungeonEnemies.length)]});
}
function enterCave(){
  state.area='dungeon';state.dungeonFloor=1;state.dungeonX=2;state.dungeonY=1;state.inMenu=false;closeOverlay();drawDungeon();
  say('黒曜の洞窟 1F。奥から不気味な気配がする。階段を探そう。')
}
function leaveCave(){state.area='world';state.dungeonFloor=1;drawWorld();say('黒曜の洞窟を出た。外の空気が心地いい。')}
function useStairs(){
  if(state.dungeonFloor===1){state.dungeonFloor=2;state.dungeonX=2;state.dungeonY=1;say('階段を下り、黒曜の洞窟 B1Fへ進んだ。')}
  else{state.dungeonFloor=1;state.dungeonX=14;state.dungeonY=10;say('階段を上り、黒曜の洞窟 1Fへ戻った。')}
  drawDungeon()
}
function openChest(x,y){
  const id=`${state.dungeonFloor}:${x}:${y}`;
  if(state.openedChests.includes(id)){say('宝箱は空っぽだ。');return}
  state.openedChests.push(id);state.gold+=100;state.hp=Math.min(state.maxHp,state.hp+20);updateUI();drawDungeon();
  say('宝箱を開けた！ 100Gを手に入れ、薬草でHPが20回復した！')
}

function enterTown(){state.inMenu=true;say('アストリアの町に入った。人々の声と鍛冶場の音が聞こえる。');renderTown()}
function renderTown(){
  state.inMenu=true;overlay.classList.remove('hidden');overlay.innerHTML=`<div class="menu-title">🏰 アストリアの町</div><div class="town-art">🏠 ⚒️ 🛡️ 🏨</div><div class="npc-box">石畳の小さな町。東には黒曜の洞窟があり、魔王軍の影が近づいている。</div><div class="menu-actions"><button id="npcBtn">村人と話す</button><button id="innBtn">宿屋</button><button id="weaponShopBtn">武器屋</button><button id="armorShopBtn">防具屋</button><button id="leaveTownBtn">町を出る</button></div>`;
  document.getElementById('npcBtn').onclick=showNPC;document.getElementById('innBtn').onclick=stayInn;document.getElementById('weaponShopBtn').onclick=()=>renderShop('weapon');document.getElementById('armorShopBtn').onclick=()=>renderShop('armor');document.getElementById('leaveTownBtn').onclick=leaveTown
}
function showNPC(){
  const lines=state.bossDefeated?['老人「黒曜の騎士を倒したのか……！ 王都にも知らせねば。」','少女「東の空が明るくなったよ！ ありがとう、勇者さま！」','兵士「次は北の山脈の向こうを調べる必要がありそうだ。」']:['老人「黒曜の洞窟には地下へ続く階段があるそうじゃ。」','少女「洞窟には宝箱もあるって！ でも魔物には気をつけてね。」','兵士「装備を整えてから洞窟の奥へ進むんだ。」'];
  overlay.innerHTML=`<div class="menu-title">💬 村人</div><div class="npc-box">${lines[Math.floor(Math.random()*lines.length)]}</div><div class="menu-actions"><button id="backTownBtn">戻る</button></div>`;document.getElementById('backTownBtn').onclick=renderTown
}
function stayInn(){state.hp=state.maxHp;state.mp=state.maxMp;updateUI();say('宿屋で休んだ。HPとMPが全回復した！');overlay.innerHTML=`<div class="menu-title">🏨 宿屋</div><div class="npc-box">店主「ゆっくり休めたかい？ HPとMPは全回復だよ。」</div><div class="menu-actions"><button id="backTownBtn">戻る</button></div>`;document.getElementById('backTownBtn').onclick=renderTown}
function renderShop(type){
  const isWeapon=type==='weapon',items=isWeapon?weapons:armors,owned=isWeapon?state.ownedWeapons:state.ownedArmor,icon=isWeapon?'⚔️':'🛡️',title=isWeapon?'武器屋':'防具屋';
  overlay.innerHTML=`<div class="menu-title">${icon} ${title}</div><div class="npc-box">店主「いい品が揃ってるぜ。今の所持金は ${state.gold}G だ。」</div><div class="shop-list">${items.map((item,i)=>{const has=owned.includes(item.name),equipped=isWeapon?state.weapon===item.name:state.armor===item.name,label=equipped?'装備中':has?'装備する':`${item.price}G`;return `<div class="shop-item"><div><strong>${item.name}</strong><small>${item.desc}</small></div><button data-buy="${i}" ${equipped?'disabled':''}>${label}</button></div>`}).join('')}</div><div class="equip-note">購入済みの装備は無料で付け替え可能。</div><div class="menu-actions"><button id="backTownBtn">町へ戻る</button></div>`;
  overlay.querySelectorAll('[data-buy]').forEach(btn=>btn.onclick=()=>buyOrEquip(type,Number(btn.dataset.buy)));document.getElementById('backTownBtn').onclick=renderTown
}
function buyOrEquip(type,index){
  const isWeapon=type==='weapon',items=isWeapon?weapons:armors,item=items[index],owned=isWeapon?state.ownedWeapons:state.ownedArmor;
  if(!owned.includes(item.name)){if(state.gold<item.price){say(`${item.name}を買うには ${item.price-state.gold}G 足りない。`);renderShop(type);return}state.gold-=item.price;owned.push(item.name);say(`${item.name}を ${item.price}G で購入した！`)}
  if(isWeapon){state.atk+=item.atk-state.weaponBonus;state.weaponBonus=item.atk;state.weapon=item.name}else{state.def+=item.def-state.armorBonus;state.armorBonus=item.def;state.armor=item.name}
  updateUI();renderShop(type)
}
function leaveTown(){state.inMenu=false;closeOverlay();drawWorld();say('アストリアの町を出た。東の黒曜の洞窟へ向かおう。')}

function action(){
  if(state.inBattle||state.inMenu)return;
  if(state.area==='dungeon'){
    const ch=dungeonMaps[state.dungeonFloor][state.dungeonY][state.dungeonX];if(ch==='H')openChest(state.dungeonX,state.dungeonY);else say('周囲を調べたが、冷たい岩と暗闇しかない。');return
  }
  const ch=worldMap[state.y][state.x];if(ch==='T')enterTown();else if(ch==='C')enterCave();else say('あたりを調べたが、特に何も見つからなかった。')
}

function startBattle(enemy){state.inBattle=true;enemy.maxHp=enemy.hp;renderBattle(enemy,`${enemy.name}が あらわれた！`)}
function renderBattle(enemy,text){
  overlay.classList.remove('hidden');overlay.innerHTML=`<div class="battle-title">BATTLE</div><div class="enemy-art">${enemy.emoji}</div><div class="battle-row"><strong>${enemy.name}</strong><span>HP ${Math.max(0,enemy.hp)}/${enemy.maxHp}</span></div><div>${text}</div><div class="battle-actions"><button id="attackBtn">たたかう</button><button id="spellBtn">ヒール MP3</button></div>`;
  document.getElementById('attackBtn').onclick=()=>playerAttack(enemy);document.getElementById('spellBtn').onclick=()=>heal(enemy)
}
function playerAttack(enemy){
  const dmg=Math.max(1,state.atk+Math.floor(Math.random()*5)-enemy.def);enemy.hp-=dmg;if(enemy.hp<=0){win(enemy);return}
  const edmg=Math.max(1,enemy.atk+Math.floor(Math.random()*4)-state.def);state.hp-=edmg;if(state.hp<=0){lose();return}updateUI();renderBattle(enemy,`${state.level>=3?'勇者':'旅人'}の攻撃！ ${dmg}ダメージ！\n${enemy.name}の攻撃！ ${edmg}ダメージ！`)
}
function heal(enemy){
  if(state.mp<3){renderBattle(enemy,'MPが足りない！');return}state.mp-=3;const amount=14+state.level*2;state.hp=Math.min(state.maxHp,state.hp+amount);
  const edmg=Math.max(1,enemy.atk+Math.floor(Math.random()*4)-state.def);state.hp-=edmg;if(state.hp<=0){lose();return}updateUI();renderBattle(enemy,`ヒール！ HPが${amount}回復した！\n${enemy.name}の攻撃！ ${edmg}ダメージ！`)
}
function win(enemy){
  state.gold+=enemy.gold;state.xp+=enemy.xp;if(enemy.boss)state.bossDefeated=true;let leveled='';
  while(state.xp>=state.level*20){state.xp-=state.level*20;state.level++;state.maxHp+=8;state.maxMp+=3;state.atk+=3;state.def+=2;state.hp=state.maxHp;state.mp=state.maxMp;leveled+=`\nレベルが${state.level}になった！`}
  state.inBattle=false;closeOverlay();updateUI();drawCurrent();
  say(`${enemy.name}を倒した！\n${enemy.xp} EXP と ${enemy.gold}G を獲得！${leveled}${enemy.boss?'\n\n黒曜の騎士を撃破！ 洞窟の邪気が消えていく……。':''}`)
}
function lose(){state.inBattle=false;state.inMenu=false;closeOverlay();state.area='world';state.x=4;state.y=8;state.hp=state.maxHp;state.mp=state.maxMp;state.gold=Math.max(0,state.gold-10);updateUI();drawWorld();say('力尽きた……。町の近くまで運ばれ、10Gを失った。')}
function save(){localStorage.setItem('astria-save',JSON.stringify(state));say('冒険の記録をセーブした！')}
function load(){
  const s=localStorage.getItem('astria-save');if(s){try{state={...defaultState,...JSON.parse(s)}}catch(e){state={...defaultState}}}
  state.inBattle=false;state.inMenu=false;if(!Array.isArray(state.openedChests))state.openedChests=[];if(!Array.isArray(state.ownedWeapons))state.ownedWeapons=[];if(!Array.isArray(state.ownedArmor))state.ownedArmor=[];
  updateUI();drawCurrent();say(s?'セーブデータを読み込んだ。':'アストリア王国のはずれ。北に町、東に洞窟がある。')
}

document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>({up:()=>move(0,-1),down:()=>move(0,1),left:()=>move(-1,0),right:()=>move(1,0)})[b.dataset.action]());
document.getElementById('action').onclick=action;document.getElementById('save').onclick=save;
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','w'].includes(k))move(0,-1);if(['arrowdown','s'].includes(k))move(0,1);if(['arrowleft','a'].includes(k))move(-1,0);if(['arrowright','d'].includes(k))move(1,0)});
load();
