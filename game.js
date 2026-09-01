const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
const msg=document.getElementById('message');
const overlay=document.getElementById('overlay');
const ui={
  level:document.getElementById('level'),
  hp:document.getElementById('hp'),
  mp:document.getElementById('mp'),
  gold:document.getElementById('gold'),
  weapon:document.getElementById('weapon'),
  armor:document.getElementById('armor')
};

const TILE=40, COLS=16, ROWS=12;
const colors={grass:'#4c8c3a',water:'#2f6fb0',road:'#c7a76a',town:'#b96f40',cave:'#5b4b3f',forest:'#235f33',mountain:'#777'};

const map=[
'WWWWWWWWWWWWWWWW',
'WGGGGGGGMMMMMGGW',
'WGGTTTGGMMMGGGGW',
'WGGTTTGGGGGGGGGW',
'WGGGRRGGGFFFFGGW',
'WGGGRRGGGFFFFGGW',
'WGGGRRGGGGGGGCGW',
'WGGGRRRRRRGGGGGW',
'WGGGGGGGRRGGGGGW',
'WGGFFFFGRRGGGGGW',
'WGGFFFFGGGGGGGGW',
'WWWWWWWWWWWWWWWW'];

const tileInfo={G:['草原','grass'],W:['海','water'],R:['道','road'],T:['アストリアの町','town'],C:['黒曜の洞窟','cave'],F:['森','forest'],M:['山','mountain']};

const defaultState={
  x:4,y:8,level:1,xp:0,hp:30,maxHp:30,mp:10,maxMp:10,atk:7,def:3,gold:20,
  bossDefeated:false,inBattle:false,inMenu:false,
  weapon:'なし',weaponBonus:0,armor:'なし',armorBonus:0,
  ownedWeapons:[],ownedArmor:[]
};
let state={...defaultState};

const enemies=[
{name:'スライム',emoji:'🟢',hp:12,atk:4,def:1,xp:5,gold:4},
{name:'ツノウサギ',emoji:'🐇',hp:18,atk:6,def:2,xp:8,gold:7},
{name:'森オオカミ',emoji:'🐺',hp:24,atk:8,def:3,xp:12,gold:10},
{name:'ゴブリン',emoji:'👺',hp:30,atk:10,def:4,xp:18,gold:14}
];

const weapons=[
{name:'銅のつるぎ',price:35,atk:3,desc:'攻撃力 +3'},
{name:'鋼のつるぎ',price:85,atk:7,desc:'攻撃力 +7'},
{name:'騎士のつるぎ',price:160,atk:12,desc:'攻撃力 +12'}
];
const armors=[
{name:'旅人の服',price:30,def:2,desc:'防御力 +2'},
{name:'鉄のよろい',price:80,def:5,desc:'防御力 +5'},
{name:'騎士のよろい',price:150,def:9,desc:'防御力 +9'}
];

function updateUI(){
  ui.level.textContent=`Lv ${state.level}`;
  ui.hp.textContent=`HP ${state.hp}/${state.maxHp}`;
  ui.mp.textContent=`MP ${state.mp}/${state.maxMp}`;
  ui.gold.textContent=`G ${state.gold}`;
  ui.weapon.textContent=`武器: ${state.weapon}`;
  ui.armor.textContent=`防具: ${state.armor}`;
}
function passable(ch){return !['W','M'].includes(ch)}
function say(t){msg.textContent=t}
function closeOverlay(){overlay.classList.add('hidden');overlay.innerHTML=''}

function draw(){
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const ch=map[y][x], type=tileInfo[ch][1];
    ctx.fillStyle=colors[type];ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
    if(ch==='F'){ctx.fillStyle='#163d21';ctx.fillRect(x*TILE+8,y*TILE+7,24,26)}
    if(ch==='T'){ctx.fillStyle='#f2d3a2';ctx.fillRect(x*TILE+7,y*TILE+8,26,24);ctx.fillStyle='#7c2d12';ctx.fillRect(x*TILE+6,y*TILE+4,28,8)}
    if(ch==='C'){ctx.fillStyle='#151515';ctx.beginPath();ctx.arc(x*TILE+20,y*TILE+25,13,0,Math.PI*2);ctx.fill()}
    ctx.strokeStyle='rgba(0,0,0,.08)';ctx.strokeRect(x*TILE,y*TILE,TILE,TILE)
  }
  ctx.fillStyle='#f8fafc';ctx.fillRect(state.x*TILE+11,state.y*TILE+7,18,25);
  ctx.fillStyle='#2563eb';ctx.fillRect(state.x*TILE+9,state.y*TILE+6,22,8);
  ctx.fillStyle='#111827';ctx.fillRect(state.x*TILE+14,state.y*TILE+13,4,4);ctx.fillRect(state.x*TILE+23,state.y*TILE+13,4,4)
}

function move(dx,dy){
  if(state.inBattle||state.inMenu)return;
  const nx=state.x+dx,ny=state.y+dy;
  if(nx<0||ny<0||nx>=COLS||ny>=ROWS)return;
  const ch=map[ny][nx];
  if(!passable(ch)){say(tileInfo[ch][0]+'が行く手をはばんでいる。');return}
  state.x=nx;state.y=ny;draw();
  if(ch==='T') enterTown();
  else if(ch==='C') cave();
  else{
    say(`${tileInfo[ch][0]}を進んでいる。`);
    const encounterRate=ch==='F'?0.28:0.16;
    if(Math.random()<encounterRate)startBattle({...enemies[Math.floor(Math.random()*enemies.length)]});
  }
}

function enterTown(){
  state.inMenu=true;
  say('アストリアの町に入った。人々の声と鍛冶場の音が聞こえる。');
  renderTown();
}

function renderTown(){
  state.inMenu=true;
  overlay.classList.remove('hidden');
  overlay.innerHTML=`
    <div class="menu-title">🏰 アストリアの町</div>
    <div class="town-art">🏠 ⚒️ 🛡️ 🏨</div>
    <div class="npc-box">石畳の小さな町。東には黒曜の洞窟があり、魔王軍の影が近づいている。</div>
    <div class="menu-actions">
      <button id="npcBtn">村人と話す</button>
      <button id="innBtn">宿屋</button>
      <button id="weaponShopBtn">武器屋</button>
      <button id="armorShopBtn">防具屋</button>
      <button id="leaveTownBtn">町を出る</button>
    </div>`;
  document.getElementById('npcBtn').onclick=showNPC;
  document.getElementById('innBtn').onclick=stayInn;
  document.getElementById('weaponShopBtn').onclick=()=>renderShop('weapon');
  document.getElementById('armorShopBtn').onclick=()=>renderShop('armor');
  document.getElementById('leaveTownBtn').onclick=leaveTown;
}

function showNPC(){
  const lines=state.bossDefeated
    ? ['老人「黒曜の騎士を倒したのか……！ 王都にも知らせねば。」','少女「東の空が明るくなったよ！ ありがとう、勇者さま！」','兵士「次は北の山脈の向こうを調べる必要がありそうだ。」']
    : ['老人「黒曜の洞窟には魔王軍の騎士が住み着いたそうじゃ。」','少女「森の魔物は強いから、装備を買ってから行ったほうがいいよ！」','兵士「武器と防具を整えれば、生き残れる確率はずっと上がる。」'];
  const line=lines[Math.floor(Math.random()*lines.length)];
  overlay.innerHTML=`<div class="menu-title">💬 村人</div><div class="npc-box">${line}</div><div class="menu-actions"><button id="backTownBtn">戻る</button></div>`;
  document.getElementById('backTownBtn').onclick=renderTown;
}

function stayInn(){
  state.hp=state.maxHp;state.mp=state.maxMp;updateUI();
  say('宿屋で休んだ。HPとMPが全回復した！');
  overlay.innerHTML=`<div class="menu-title">🏨 宿屋</div><div class="npc-box">店主「ゆっくり休めたかい？ HPとMPは全回復だよ。」</div><div class="menu-actions"><button id="backTownBtn">戻る</button></div>`;
  document.getElementById('backTownBtn').onclick=renderTown;
}

function renderShop(type){
  const isWeapon=type==='weapon';
  const items=isWeapon?weapons:armors;
  const owned=isWeapon?state.ownedWeapons:state.ownedArmor;
  const icon=isWeapon?'⚔️':'🛡️';
  const title=isWeapon?'武器屋':'防具屋';
  overlay.innerHTML=`
    <div class="menu-title">${icon} ${title}</div>
    <div class="npc-box">店主「いい品が揃ってるぜ。今の所持金は ${state.gold}G だ。」</div>
    <div class="shop-list">
      ${items.map((item,i)=>{
        const has=owned.includes(item.name);
        const equipped=isWeapon?state.weapon===item.name:state.armor===item.name;
        const label=equipped?'装備中':has?'装備する':`${item.price}G`;
        return `<div class="shop-item"><div><strong>${item.name}</strong><small>${item.desc}</small></div><button data-buy="${i}" ${equipped?'disabled':''}>${label}</button></div>`;
      }).join('')}
    </div>
    <div class="equip-note">装備を買うと、その場で装備できます。購入済みの装備は無料で付け替え可能。</div>
    <div class="menu-actions"><button id="backTownBtn">町へ戻る</button></div>`;
  overlay.querySelectorAll('[data-buy]').forEach(btn=>btn.onclick=()=>buyOrEquip(type,Number(btn.dataset.buy)));
  document.getElementById('backTownBtn').onclick=renderTown;
}

function buyOrEquip(type,index){
  const isWeapon=type==='weapon';
  const items=isWeapon?weapons:armors;
  const item=items[index];
  const owned=isWeapon?state.ownedWeapons:state.ownedArmor;
  if(!owned.includes(item.name)){
    if(state.gold<item.price){say(`${item.name}を買うには ${item.price-state.gold}G 足りない。`);renderShop(type);return}
    state.gold-=item.price;owned.push(item.name);
    say(`${item.name}を ${item.price}G で購入した！`);
  }
  if(isWeapon){
    state.atk+=item.atk-state.weaponBonus;
    state.weaponBonus=item.atk;
    state.weapon=item.name;
  }else{
    state.def+=item.def-state.armorBonus;
    state.armorBonus=item.def;
    state.armor=item.name;
  }
  updateUI();renderShop(type);
}

function leaveTown(){
  state.inMenu=false;closeOverlay();draw();
  say('アストリアの町を出た。東の黒曜の洞窟へ向かおう。');
}

function cave(){
  if(state.bossDefeated){say('黒曜の洞窟は静まり返っている。もう邪悪な気配はない。');return}
  startBattle({name:'黒曜の騎士',emoji:'🛡️',hp:70,atk:13,def:6,xp:60,gold:80,boss:true})
}

function action(){
  if(state.inBattle||state.inMenu)return;
  const ch=map[state.y][state.x];
  if(ch==='T')enterTown();
  else if(ch==='C')cave();
  else say('あたりを調べたが、特に何も見つからなかった。')
}

function startBattle(enemy){state.inBattle=true;enemy.maxHp=enemy.hp;renderBattle(enemy,`${enemy.name}が あらわれた！`)}
function renderBattle(enemy,text){
  overlay.classList.remove('hidden');
  overlay.innerHTML=`<div class="battle-title">BATTLE</div><div class="enemy-art">${enemy.emoji}</div><div class="battle-row"><strong>${enemy.name}</strong><span>HP ${Math.max(0,enemy.hp)}/${enemy.maxHp}</span></div><div>${text}</div><div class="battle-actions"><button id="attackBtn">たたかう</button><button id="spellBtn">ヒール MP3</button></div>`;
  document.getElementById('attackBtn').onclick=()=>playerAttack(enemy);
  document.getElementById('spellBtn').onclick=()=>heal(enemy)
}
function playerAttack(enemy){
  const dmg=Math.max(1,state.atk+Math.floor(Math.random()*5)-enemy.def);enemy.hp-=dmg;
  if(enemy.hp<=0){win(enemy);return}
  const edmg=Math.max(1,enemy.atk+Math.floor(Math.random()*4)-state.def);state.hp-=edmg;
  if(state.hp<=0){lose();return}
  updateUI();renderBattle(enemy,`${state.level>=3?'勇者':'旅人'}の攻撃！ ${dmg}ダメージ！\n${enemy.name}の攻撃！ ${edmg}ダメージ！`)
}
function heal(enemy){
  if(state.mp<3){renderBattle(enemy,'MPが足りない！');return}
  state.mp-=3;const amount=14+state.level*2;state.hp=Math.min(state.maxHp,state.hp+amount);
  const edmg=Math.max(1,enemy.atk+Math.floor(Math.random()*4)-state.def);state.hp-=edmg;
  if(state.hp<=0){lose();return}
  updateUI();renderBattle(enemy,`ヒール！ HPが${amount}回復した！\n${enemy.name}の攻撃！ ${edmg}ダメージ！`)
}
function win(enemy){
  state.gold+=enemy.gold;state.xp+=enemy.xp;if(enemy.boss)state.bossDefeated=true;
  let leveled='';
  while(state.xp>=state.level*20){
    state.xp-=state.level*20;state.level++;state.maxHp+=8;state.maxMp+=3;state.atk+=3;state.def+=2;state.hp=state.maxHp;state.mp=state.maxMp;leveled+=`\nレベルが${state.level}になった！`
  }
  state.inBattle=false;closeOverlay();updateUI();
  say(`${enemy.name}を倒した！\n${enemy.xp} EXP と ${enemy.gold}G を獲得！${leveled}${enemy.boss?'\n\n黒曜の騎士を倒した！ 町の人たちに知らせよう！':''}`);draw()
}
function lose(){
  state.inBattle=false;state.inMenu=false;closeOverlay();state.x=4;state.y=8;state.hp=state.maxHp;state.mp=state.maxMp;state.gold=Math.max(0,state.gold-10);updateUI();draw();say('力尽きた……。\n町の近くまで運ばれた。所持金を10G失った。')
}
function save(){
  const saveState={...state,inBattle:false,inMenu:false};
  localStorage.setItem('astria-save',JSON.stringify(saveState));say('冒険の記録をセーブした！')
}
function load(){
  const s=localStorage.getItem('astria-save');
  if(s){
    try{state={...defaultState,...JSON.parse(s)};state.inBattle=false;state.inMenu=false;say('セーブデータを読み込んだ。')}
    catch(e){state={...defaultState};say('セーブデータを読み込めなかったため、新しい冒険を始めます。')}
  }
  updateUI();draw()
}

document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>({up:()=>move(0,-1),down:()=>move(0,1),left:()=>move(-1,0),right:()=>move(1,0)})[b.dataset.action]());
document.getElementById('action').onclick=action;
document.getElementById('save').onclick=save;
window.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(['arrowup','w'].includes(k))move(0,-1);
  if(['arrowdown','s'].includes(k))move(0,1);
  if(['arrowleft','a'].includes(k))move(-1,0);
  if(['arrowright','d'].includes(k))move(1,0)
});
load();
