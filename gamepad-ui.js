// v18: virtual stick + ABXY controls, field menu, map toggle and skill panel.
(function(){
  if(state.skillSpent==null) state.skillSpent=0;
  if(!Array.isArray(state.learnedAbilities)) state.learnedAbilities=[];
  const skillDefs=[
    {id:'flame',name:'フレイム',type:'呪文',cost:1,level:2,desc:'炎で敵1体を攻撃する。消費MP4'},
    {id:'heal',name:'ヒール',type:'呪文',cost:1,level:3,desc:'HPを回復する。消費MP3'},
    {id:'powerSlash',name:'火炎斬り',type:'特技',cost:1,level:4,desc:'炎をまとった強力な斬撃。'},
    {id:'doubleSlash',name:'連続斬り',type:'特技',cost:2,level:6,desc:'敵を2回連続で斬りつける。'}
  ];
  const skillPoints=()=>Math.max(0,(state.level-1)-(state.skillSpent||0));
  const has=id=>state.learnedAbilities.includes(id);
  function persist(){try{localStorage.setItem('astria-save',JSON.stringify(state));localStorage.setItem('astria-save-backup',JSON.stringify(state))}catch(e){}}

  // Capture the active enemy so learned skills can be used from the battle menu.
  let currentEnemy=null;
  const baseStartBattle=window.startBattle;
  window.startBattle=function(enemy){currentEnemy=enemy;return baseStartBattle(enemy)};

  // ---------- menu navigation state ----------
  let menuDepth='closed',menuIndex=0,lastMenuMove=0;
  function selectable(){return [...overlay.querySelectorAll('button:not([disabled])')].filter(b=>b.offsetParent!==null)}
  function selectIndex(next){const list=selectable();if(!list.length)return;menuIndex=(next+list.length)%list.length;list.forEach((b,i)=>b.classList.toggle('menu-selected',i===menuIndex));list[menuIndex].scrollIntoView({block:'nearest'})}
  function selectFirst(){menuIndex=0;requestAnimationFrame(()=>selectIndex(0))}
  function navMenu(dx,dy){const now=Date.now();if(now-lastMenuMove<150)return;lastMenuMove=now;const list=selectable();if(!list.length)return;let step=dy||dx;if(!step)return;selectIndex(menuIndex+(step>0?1:-1))}

  // ---------- virtual stick ----------
  const base=document.getElementById('stickBase'),knob=document.getElementById('stickKnob');
  let stickPointer=null,dirX=0,dirY=0,repeat=null;
  function setDirFromPointer(ev){
    const b=base.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;
    const dx=ev.clientX-cx,dy=ev.clientY-cy,max=b.width*.32,len=Math.hypot(dx,dy)||1,k=Math.min(1,max/len);
    knob.style.transform=`translate(${dx*k}px,${dy*k}px)`;
    if(Math.hypot(dx,dy)<b.width*.11){dirX=0;dirY=0;return}
    const ang=Math.atan2(dy,dx),oct=Math.round(ang/(Math.PI/4)),dirs=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
    [dirX,dirY]=dirs[(oct+8)%8];
  }
  function step(){
    if(!(dirX||dirY)||state.inBattle)return;
    if(state.inMenu){navMenu(dirX,dirY);return}
    move(dirX,dirY)
  }
  function stopStick(){stickPointer=null;dirX=dirY=0;knob.style.transform='translate(0,0)';if(repeat){clearInterval(repeat);repeat=null}}
  if(base){
    base.addEventListener('pointerdown',ev=>{ev.preventDefault();stickPointer=ev.pointerId;base.setPointerCapture(ev.pointerId);setDirFromPointer(ev);step();repeat=setInterval(step,145)});
    base.addEventListener('pointermove',ev=>{if(ev.pointerId===stickPointer)setDirFromPointer(ev)});
    base.addEventListener('pointerup',stopStick);base.addEventListener('pointercancel',stopStick);base.addEventListener('lostpointercapture',stopStick);
  }

  // ---------- field menu ----------
  function openShell(title,html,depth='section'){
    menuDepth=depth;state.inMenu=true;overlay.classList.remove('hidden');overlay.innerHTML=`<div class="field-menu"><div class="field-menu-title">${title}</div><div class="field-menu-body">${html}</div><div class="field-menu-hint">スティック 選択　A 決定　B 戻る</div></div>`;selectFirst()
  }
  function closeMenu(){if(state.inBattle)return;menuDepth='closed';state.inMenu=false;closeOverlay();persist();drawCurrent()}
  function mainMenu(){
    openShell('メニュー',`<div class="field-menu-list"><button data-menu="items">道具</button><button data-menu="spells">呪文</button><button data-menu="status">強さ</button><button data-menu="equip">装備</button><button data-menu="skills">スキルパネル <span>SP ${skillPoints()}</span></button></div>`,'main');
    overlay.querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>showSection(b.dataset.menu));selectFirst()
  }
  function showSection(key){
    if(key==='items'){
      openShell('道具',`<div class="menu-card"><strong>薬草 × ${state.herbs||0}</strong><small>HPを30回復する。</small></div><button class="menu-back">戻る</button>`);
    }else if(key==='spells'){
      const learned=skillDefs.filter(s=>s.type==='呪文'&&has(s.id));
      openShell('呪文',`${learned.length?learned.map(s=>`<div class="menu-card"><strong>${s.name}</strong><small>${s.desc}</small></div>`).join(''):'<div class="menu-empty">まだ呪文を覚えていない。</div>'}<button class="menu-back">戻る</button>`);
    }else if(key==='status'){
      openShell('強さ',`<div class="status-grid"><span>レベル</span><b>${state.level}</b><span>EXP</span><b>${state.xp}/${state.level*20}</b><span>HP</span><b>${state.hp}/${state.maxHp}</b><span>MP</span><b>${state.mp}/${state.maxMp}</b><span>攻撃力</span><b>${state.atk}</b><span>防御力</span><b>${state.def}</b><span>スキルP</span><b>${skillPoints()}</b></div><button class="menu-back">戻る</button>`);
    }else if(key==='equip'){
      const ws=(state.ownedWeapons||[]).map(n=>`<button class="equip-choice" data-kind="weapon" data-name="${n}">${n}${state.weapon===n?'　装備中':''}</button>`).join('');
      const as=(state.ownedArmor||[]).map(n=>`<button class="equip-choice" data-kind="armor" data-name="${n}">${n}${state.armor===n?'　装備中':''}</button>`).join('');
      openShell('装備',`<div class="equip-section"><h3>武器</h3>${ws||'<div class="menu-empty">所持なし</div>'}<h3>防具</h3>${as||'<div class="menu-empty">所持なし</div>'}</div><button class="menu-back">戻る</button>`);
      overlay.querySelectorAll('.equip-choice').forEach(btn=>btn.onclick=()=>equipOwned(btn.dataset.kind,btn.dataset.name));
    }else if(key==='skills'){
      openShell(`スキルパネル　SP ${skillPoints()}`,`<div class="skill-panel">${skillDefs.map(s=>`<button class="skill-node ${has(s.id)?'learned':''}" data-skill="${s.id}" ${has(s.id)?'disabled':''}><strong>${has(s.id)?'★':'○'} ${s.name}</strong><small>${s.type} / 必要Lv${s.level} / ${s.cost}P</small><small>${s.desc}</small></button>`).join('')}</div><button class="menu-back">戻る</button>`);
      overlay.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>learnSkill(b.dataset.skill));
    }
    const back=overlay.querySelector('.menu-back');if(back)back.onclick=mainMenu;selectFirst()
  }
  function equipOwned(kind,name){
    if(kind==='weapon'){
      const item=weapons.find(w=>w.name===name);if(!item)return;state.atk-=state.weaponBonus||0;state.weapon=name;state.weaponBonus=item.atk;state.atk+=item.atk;
    }else{
      const item=armors.find(a=>a.name===name);if(!item)return;state.def-=state.armorBonus||0;state.armor=name;state.armorBonus=item.def;state.def+=item.def;
    }
    updateUI();persist();showSection('equip')
  }
  function learnSkill(id){
    const s=skillDefs.find(v=>v.id===id);if(!s||has(id))return;
    if(state.level<s.level){alert(`Lv${s.level}で解放されます。`);return}
    if(skillPoints()<s.cost){alert('スキルポイントが足りません。');return}
    state.learnedAbilities.push(id);state.skillSpent=(state.skillSpent||0)+s.cost;persist();showSection('skills')
  }

  // ---------- learned skills in battle ----------
  function battleLog(t){const l=document.getElementById('battle15Log');if(l)l.textContent=t}
  function refreshBattleStatus(){const s=document.querySelector('.battle15-status');if(s)s.innerHTML=`HP ${state.hp}/${state.maxHp}<br>MP ${state.mp}/${state.maxMp}`}
  function counter(enemy,prefix){
    const dmg=Math.max(1,enemy.atk+Math.floor(Math.random()*4)-state.def);state.hp-=dmg;updateUI();refreshBattleStatus();
    if(state.hp<=0){document.body.classList.remove('in-battle');lose();return}
    battleLog(`${prefix}\n${enemy.name}の攻撃！ ${dmg}ダメージ！`)
  }
  function abilityDamage(enemy,id){
    if(!enemy)return;
    if(id==='flame'){
      if(state.mp<4){battleLog('MPが足りない！');return}state.mp-=4;const dmg=Math.max(5,8+state.level*3+Math.floor(Math.random()*7)-Math.floor(enemy.def/2));enemy.hp-=dmg;updateUI();refreshBattleStatus();battleLog(`フレイム！ ${dmg}ダメージ！`);if(enemy.hp<=0){win(enemy);return}setTimeout(()=>counter(enemy,`フレイム！ ${dmg}ダメージ！`),260)
    }else if(id==='heal'){
      if(state.mp<3){battleLog('MPが足りない！');return}state.mp-=3;const n=14+state.level*2;state.hp=Math.min(state.maxHp,state.hp+n);updateUI();refreshBattleStatus();setTimeout(()=>counter(enemy,`ヒール！ HPが${n}回復した！`),260)
    }else if(id==='powerSlash'){
      const dmg=Math.max(2,Math.floor((state.atk+Math.floor(Math.random()*5)-enemy.def)*1.45));enemy.hp-=dmg;battleLog(`火炎斬り！ ${dmg}ダメージ！`);if(enemy.hp<=0){win(enemy);return}setTimeout(()=>counter(enemy,`火炎斬り！ ${dmg}ダメージ！`),260)
    }else if(id==='doubleSlash'){
      const d1=Math.max(1,Math.floor((state.atk+Math.floor(Math.random()*4)-enemy.def)*.78)),d2=Math.max(1,Math.floor((state.atk+Math.floor(Math.random()*4)-enemy.def)*.78));enemy.hp-=d1+d2;battleLog(`連続斬り！ ${d1} + ${d2}ダメージ！`);if(enemy.hp<=0){win(enemy);return}setTimeout(()=>counter(enemy,`連続斬り！ 合計${d1+d2}ダメージ！`),260)
    }
  }
  function learnedBattleMenu(){
    const box=document.getElementById('battle15Commands');if(!box||!currentEnemy)return;
    const learned=skillDefs.filter(s=>has(s.id));
    box.innerHTML=`<div class="battle15-sub">${learned.length?learned.map(s=>`<button data-ability="${s.id}">${s.name}${s.id==='flame'?' MP4':s.id==='heal'?' MP3':''}</button>`).join(''):'<button disabled>まだ特技・呪文を覚えていない</button>'}<button class="back" id="learnedBack">戻る</button></div>`;
    box.querySelectorAll('[data-ability]').forEach(b=>b.onclick=()=>abilityDamage(currentEnemy,b.dataset.ability));
    box.querySelector('#learnedBack').onclick=()=>window.startBattle(currentEnemy)
  }
  const battleObserver=new MutationObserver(()=>{
    if(!state.inBattle)return;
    const skill=document.getElementById('b15Skill');if(skill&&!skill.dataset.skillHook){skill.dataset.skillHook='1';skill.onclick=learnedBattleMenu}
  });
  battleObserver.observe(overlay,{childList:true,subtree:true});

  // ---------- map ----------
  const mapLayer=document.getElementById('mapLayer'),mapCanvas=document.getElementById('mapCanvas');
  function toggleMap(){if(state.inBattle||state.inMenu)return;const nowHidden=mapLayer.classList.toggle('hidden');if(!nowHidden)drawMap()}
  function drawMap(){
    const c=mapCanvas.getContext('2d'),w=mapCanvas.width/COLS,h=mapCanvas.height/ROWS,pal={W:'#2874b7',G:'#4b9345',R:'#c9ae79',T:'#b9503b',C:'#26262b',F:'#1d6931',M:'#858e92'};
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){c.fillStyle=pal[worldMap[y][x]]||'#333';c.fillRect(x*w,y*h,w,h)}
    if(state.area==='world'){c.fillStyle='#fde047';c.fillRect(state.x*w+w*.25,state.y*h+h*.25,w*.5,h*.5)}c.strokeStyle='#f8fafc';c.lineWidth=2;c.strokeRect(1,1,mapCanvas.width-2,mapCanvas.height-2)
  }

  // ---------- ABXY ----------
  const A=document.getElementById('btnA'),B=document.getElementById('btnB'),X=document.getElementById('btnX'),Y=document.getElementById('btnY');
  if(A)A.onclick=()=>{if(state.inBattle)return;if(state.inMenu){const list=selectable();if(list[menuIndex])list[menuIndex].click();return}action()};
  if(B)B.onclick=()=>{if(state.inBattle)return;if(!mapLayer.classList.contains('hidden')){mapLayer.classList.add('hidden');return}if(state.inMenu){if(menuDepth==='main')closeMenu();else mainMenu()}};
  if(X)X.onclick=()=>{if(state.inBattle)return;if(state.inMenu)closeMenu();else mainMenu()};
  if(Y)Y.onclick=toggleMap;

  // keyboard mirrors ABXY for desktop testing
  document.addEventListener('keydown',ev=>{if(ev.repeat)return;const k=ev.key.toLowerCase();if(k==='j')A&&A.click();if(k==='k')B&&B.click();if(k==='i')X&&X.click();if(k==='u')Y&&Y.click()});

  // Autosave replaces the removed manual save UI.
  setInterval(()=>{if(!state.inBattle)persist()},8000);document.addEventListener('visibilitychange',()=>{if(document.hidden)persist()});window.addEventListener('beforeunload',persist);
})();