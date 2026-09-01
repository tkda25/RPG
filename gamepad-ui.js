// v18: virtual stick + ABXY controls, field menu, map toggle and skill panel.
(function(){
  if(state.skillSpent==null) state.skillSpent=0;
  if(!state.learnedAbilities) state.learnedAbilities=[];
  if(!Array.isArray(state.herbs)){} // preserve numeric herbs from previous saves

  const skillDefs=[
    {id:'flame',name:'フレイム',type:'呪文',cost:1,level:2,desc:'炎で敵1体を攻撃する。消費MP4'},
    {id:'heal',name:'ヒール',type:'呪文',cost:1,level:3,desc:'HPを回復する。消費MP3'},
    {id:'powerSlash',name:'火炎斬り',type:'特技',cost:1,level:4,desc:'炎をまとった斬撃。通常攻撃より高威力。'},
    {id:'doubleSlash',name:'連続斬り',type:'特技',cost:2,level:6,desc:'敵を2回連続で斬りつける。'}
  ];
  const skillPoints=()=>Math.max(0,(state.level-1)-(state.skillSpent||0));
  const has=id=>state.learnedAbilities.includes(id);
  function persist(){try{localStorage.setItem('astria-save',JSON.stringify(state));localStorage.setItem('astria-save-backup',JSON.stringify(state))}catch(e){}}

  // ---------- virtual stick ----------
  const base=document.getElementById('stickBase');
  const knob=document.getElementById('stickKnob');
  let stickPointer=null,dirX=0,dirY=0,repeat=null;
  function setDirFromPointer(ev){
    const b=base.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;
    let dx=ev.clientX-cx,dy=ev.clientY-cy;const max=b.width*.32;const len=Math.hypot(dx,dy)||1;
    const k=Math.min(1,max/len);const px=dx*k,py=dy*k;knob.style.transform=`translate(${px}px,${py}px)`;
    const dead=b.width*.11;if(Math.hypot(dx,dy)<dead){dirX=0;dirY=0;return}
    const ang=Math.atan2(dy,dx),oct=Math.round(ang/(Math.PI/4));
    const dirs=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
    const d=dirs[(oct+8)%8];dirX=d[0];dirY=d[1];
  }
  function step(){if((dirX||dirY)&&!state.inBattle&&!state.inMenu)move(dirX,dirY)}
  function stopStick(){stickPointer=null;dirX=dirY=0;knob.style.transform='translate(0,0)';if(repeat){clearInterval(repeat);repeat=null}}
  if(base){
    base.addEventListener('pointerdown',ev=>{ev.preventDefault();stickPointer=ev.pointerId;base.setPointerCapture(ev.pointerId);setDirFromPointer(ev);step();repeat=setInterval(step,145)});
    base.addEventListener('pointermove',ev=>{if(ev.pointerId===stickPointer)setDirFromPointer(ev)});
    base.addEventListener('pointerup',stopStick);base.addEventListener('pointercancel',stopStick);base.addEventListener('lostpointercapture',stopStick);
  }

  // ---------- menu helpers ----------
  function openShell(title,html){
    state.inMenu=true;overlay.classList.remove('hidden');overlay.innerHTML=`<div class="field-menu"><div class="field-menu-title">${title}</div><div class="field-menu-body">${html}</div><div class="field-menu-hint">A 決定　B 戻る</div></div>`;
  }
  function closeMenu(){if(state.inBattle)return;state.inMenu=false;closeOverlay();persist();drawCurrent()}
  function mainMenu(){
    openShell('メニュー',`<div class="field-menu-list"><button data-menu="items">道具</button><button data-menu="spells">呪文</button><button data-menu="status">強さ</button><button data-menu="equip">装備</button><button data-menu="skills">スキルパネル <span>SP ${skillPoints()}</span></button></div>`);
    overlay.querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>showSection(b.dataset.menu));
  }
  function backToMain(){mainMenu()}
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
    const back=overlay.querySelector('.menu-back');if(back)back.onclick=backToMain;
  }
  function equipOwned(kind,name){
    if(kind==='weapon'){
      const item=weapons.find(w=>w.name===name);if(!item)return;state.atk-=state.weaponBonus||0;state.weapon=name;state.weaponBonus=item.atk;state.atk+=item.atk;
    }else{
      const item=armors.find(a=>a.name===name);if(!item)return;state.def-=state.armorBonus||0;state.armor=name;state.armorBonus=item.def;state.def+=item.def;
    }
    updateUI();persist();showSection('equip');
  }
  function learnSkill(id){
    const s=skillDefs.find(v=>v.id===id);if(!s||has(id))return;
    if(state.level<s.level){alert(`Lv${s.level}で解放されます。`);return}
    if(skillPoints()<s.cost){alert('スキルポイントが足りません。');return}
    state.learnedAbilities.push(id);state.skillSpent=(state.skillSpent||0)+s.cost;persist();showSection('skills');
  }

  // hide unlearned legacy battle spells from the existing battle skill submenu
  const battleObserver=new MutationObserver(()=>{
    if(!state.inBattle)return;
    const flame=document.getElementById('b15Flame'),heal=document.getElementById('b15Heal');
    if(flame&&!has('flame')){flame.disabled=true;flame.textContent='フレイム　未習得'}
    if(heal&&!has('heal')){heal.disabled=true;heal.textContent='ヒール　未習得'}
  });
  battleObserver.observe(overlay,{childList:true,subtree:true});

  // ---------- map ----------
  const mapLayer=document.getElementById('mapLayer'),mapCanvas=document.getElementById('mapCanvas');
  function toggleMap(){if(state.inBattle||state.inMenu)return;const on=mapLayer.classList.toggle('hidden');if(!on)drawMap()}
  function drawMap(){
    const c=mapCanvas.getContext('2d'),w=mapCanvas.width/COLS,h=mapCanvas.height/ROWS;
    const pal={W:'#2874b7',G:'#4b9345',R:'#c9ae79',T:'#b9503b',C:'#26262b',F:'#1d6931',M:'#858e92'};
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){c.fillStyle=pal[worldMap[y][x]]||'#333';c.fillRect(x*w,y*h,w,h)}
    if(state.area==='world'){c.fillStyle='#fde047';c.fillRect(state.x*w+w*.25,state.y*h+h*.25,w*.5,h*.5)}
    c.strokeStyle='#f8fafc';c.lineWidth=2;c.strokeRect(1,1,mapCanvas.width-2,mapCanvas.height-2)
  }

  // ---------- ABXY ----------
  const A=document.getElementById('btnA'),B=document.getElementById('btnB'),X=document.getElementById('btnX'),Y=document.getElementById('btnY');
  if(A)A.onclick=()=>{if(state.inBattle)return;if(state.inMenu){const f=overlay.querySelector('button:not([disabled])');if(f)f.click();return}action()};
  if(B)B.onclick=()=>{if(state.inBattle)return;if(!mapLayer.classList.contains('hidden')){mapLayer.classList.add('hidden');return}if(state.inMenu){closeMenu();return}};
  if(X)X.onclick=()=>{if(state.inBattle)return;if(state.inMenu){closeMenu();return}mainMenu()};
  if(Y)Y.onclick=toggleMap;

  // autosave replaces the removed manual save button
  setInterval(()=>{if(!state.inBattle)persist()},8000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)persist()});
  window.addEventListener('beforeunload',persist);
})();