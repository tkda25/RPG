const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
const msg=document.getElementById('message');
const overlay=document.getElementById('overlay');
const ui={level:document.getElementById('level'),hp:document.getElementById('hp'),mp:document.getElementById('mp'),gold:document.getElementById('gold')};

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
let state={x:4,y:8,level:1,xp:0,hp:30,maxHp:30,mp:10,maxMp:10,atk:7,def:3,gold:20,bossDefeated:false,inBattle:false};

const enemies=[
{name:'スライム',emoji:'🟢',hp:12,atk:4,def:1,xp:5,gold:4},
{name:'ツノウサギ',emoji:'🐇',hp:18,atk:6,def:2,xp:8,gold:7},
{name:'森オオカミ',emoji:'🐺',hp:24,atk:8,def:3,xp:12,gold:10},
{name:'ゴブリン',emoji:'👺',hp:30,atk:10,def:4,xp:18,gold:14}
];

function updateUI(){ui.level.textContent=`Lv ${state.level}`;ui.hp.textContent=`HP ${state.hp}/${state.maxHp}`;ui.mp.textContent=`MP ${state.mp}/${state.maxMp}`;ui.gold.textContent=`G ${state.gold}`}
function passable(ch){return !['W','M'].includes(ch)}
function say(t){msg.textContent=t}

function draw(){
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const ch=map[y][x], type=tileInfo[ch][1];ctx.fillStyle=colors[type];ctx.fillRect(x*TILE,y*TILE,TILE,TILE);
    if(ch==='F'){ctx.fillStyle='#163d21';ctx.fillRect(x*TILE+8,y*TILE+7,24,26)}
    if(ch==='T'){ctx.fillStyle='#f2d3a2';ctx.fillRect(x*TILE+7,y*TILE+8,26,24);ctx.fillStyle='#7c2d12';ctx.fillRect(x*TILE+6,y*TILE+4,28,8)}
    if(ch==='C'){ctx.fillStyle='#151515';ctx.beginPath();ctx.arc(x*TILE+20,y*TILE+25,13,0,Math.PI*2);ctx.fill()}
    ctx.strokeStyle='rgba(0,0,0,.08)';ctx.strokeRect(x*TILE,y*TILE,TILE,TILE)
  }
  ctx.fillStyle='#f8fafc';ctx.fillRect(state.x*TILE+11,state.y*TILE+7,18,25);ctx.fillStyle='#2563eb';ctx.fillRect(state.x*TILE+9,state.y*TILE+6,22,8);ctx.fillStyle='#111827';ctx.fillRect(state.x*TILE+14,state.y*TILE+13,4,4);ctx.fillRect(state.x*TILE+23,state.y*TILE+13,4,4)
}

function move(dx,dy){
 if(state.inBattle)return;
 const nx=state.x+dx,ny=state.y+dy;if(nx<0||ny<0||nx>=COLS||ny>=ROWS)return;
 const ch=map[ny][nx];if(!passable(ch)){say(tileInfo[ch][0]+'が行く手をはばんでいる。');return}
 state.x=nx;state.y=ny;draw();
 if(ch==='T') town(); else if(ch==='C') cave(); else {
   say(`${tileInfo[ch][0]}を進んでいる。`);
   const encounterRate=ch==='F'?0.28:0.16;if(Math.random()<encounterRate) startBattle({...enemies[Math.floor(Math.random()*enemies.length)]});
 }
}

function town(){state.hp=state.maxHp;state.mp=state.maxMp;updateUI();say('アストリアの町。宿屋で休み、HPとMPが全回復した！\n人々は「東の洞窟に魔王軍の将がいる」と噂している。')}
function cave(){if(state.bossDefeated){say('黒曜の洞窟は静まり返っている。もう邪悪な気配はない。');return}startBattle({name:'黒曜の騎士',emoji:'🛡️',hp:70,atk:13,def:6,xp:60,gold:80,boss:true})}

function action(){const ch=map[state.y][state.x];if(ch==='T')town();else if(ch==='C')cave();else say('あたりを調べたが、特に何も見つからなかった。')}

function startBattle(enemy){state.inBattle=true;enemy.maxHp=enemy.hp;renderBattle(enemy,`${enemy.name}が あらわれた！`)}
function renderBattle(enemy,text){
 overlay.classList.remove('hidden');overlay.innerHTML=`<div class="battle-title">BATTLE</div><div class="enemy-art">${enemy.emoji}</div><div class="battle-row"><strong>${enemy.name}</strong><span>HP ${Math.max(0,enemy.hp)}/${enemy.maxHp}</span></div><div>${text}</div><div class="battle-actions"><button id="attackBtn">たたかう</button><button id="spellBtn">ヒール MP3</button></div>`;
 document.getElementById('attackBtn').onclick=()=>playerAttack(enemy);document.getElementById('spellBtn').onclick=()=>heal(enemy)
}
function playerAttack(enemy){
 const dmg=Math.max(1,state.atk+Math.floor(Math.random()*5)-enemy.def);enemy.hp-=dmg;if(enemy.hp<=0){win(enemy);return}const edmg=Math.max(1,enemy.atk+Math.floor(Math.random()*4)-state.def);state.hp-=edmg;if(state.hp<=0){lose();return}updateUI();renderBattle(enemy,`${state.level>=3?'勇者':'旅人'}の攻撃！ ${dmg}ダメージ！\n${enemy.name}の攻撃！ ${edmg}ダメージ！`)
}
function heal(enemy){if(state.mp<3){renderBattle(enemy,'MPが足りない！');return}state.mp-=3;const amount=14+state.level*2;state.hp=Math.min(state.maxHp,state.hp+amount);const edmg=Math.max(1,enemy.atk+Math.floor(Math.random()*4)-state.def);state.hp-=edmg;if(state.hp<=0){lose();return}updateUI();renderBattle(enemy,`ヒール！ HPが${amount}回復した！\n${enemy.name}の攻撃！ ${edmg}ダメージ！`)}
function win(enemy){state.gold+=enemy.gold;state.xp+=enemy.xp;if(enemy.boss)state.bossDefeated=true;let leveled='';while(state.xp>=state.level*20){state.xp-=state.level*20;state.level++;state.maxHp+=8;state.maxMp+=3;state.atk+=3;state.def+=2;state.hp=state.maxHp;state.mp=state.maxMp;leveled+=`\nレベルが${state.level}になった！`}state.inBattle=false;overlay.classList.add('hidden');updateUI();say(`${enemy.name}を倒した！\n${enemy.xp} EXP と ${enemy.gold}G を獲得！${leveled}${enemy.boss?'\n\n黒曜の騎士を倒した！ 試作版クリア！':''}`);draw()}
function lose(){state.inBattle=false;overlay.classList.add('hidden');state.x=4;state.y=8;state.hp=state.maxHp;state.mp=state.maxMp;state.gold=Math.max(0,state.gold-10);updateUI();draw();say('力尽きた……。\n町の近くまで運ばれた。所持金を10G失った。')}
function save(){localStorage.setItem('astria-save',JSON.stringify(state));say('冒険の記録をセーブした！')}
function load(){const s=localStorage.getItem('astria-save');if(s){Object.assign(state,JSON.parse(s));state.inBattle=false;say('セーブデータを読み込んだ。')}updateUI();draw()}

document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>({up:()=>move(0,-1),down:()=>move(0,1),left:()=>move(-1,0),right:()=>move(1,0)})[b.dataset.action]());
document.getElementById('action').onclick=action;document.getElementById('save').onclick=save;
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','w'].includes(k))move(0,-1);if(['arrowdown','s'].includes(k))move(0,1);if(['arrowleft','a'].includes(k))move(-1,0);if(['arrowright','d'].includes(k))move(1,0)});
load();
