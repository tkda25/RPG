// Battle visual upgrade: original pixel monsters, effects, XP gauge and level-up presentation.
(function(){
  const spriteMap={
    'スライム':['000000000000','000033000000','000333300000','003333330000','033333333000','333303033300','333333333300','033333333000','003333330000','000333300000','000000000000','000000000000'],
    'ツノウサギ':['000400004000','000440044000','000044440000','000555550000','005555555000','055505055500','055555555500','005555555000','000566650000','000066600000','000000000000','000000000000'],
    '森オオカミ':['000700007000','007770077000','077777777000','777777777700','777707077700','777777777700','077700777000','007777770000','000788700000','000088000000','000000000000','000000000000'],
    'ゴブリン':['000222220000','002222222000','022272722200','222222222220','222707072220','222222222220','022266622200','002666662000','000666600000','000600600000','000000000000','000000000000'],
    '洞窟コウモリ':['900000000009','099000000990','009900009900','000999999000','009999999900','099909099990','999999999999','099999999990','009990099900','000900009000','000000000000','000000000000'],
    'どくキノコ':['000AAAA00000','00AAAAAA0000','0AA0AA0AA000','AAAAAAAAAA00','0AAAAAAAA000','000BBBB00000','000BBBB00000','00BBBBBB0000','00B0BB0B0000','000BBBB00000','000000000000','000000000000'],
    '骸骨兵':['000CCCC00000','00CCCCCC0000','0CC0CC0CC000','0CCCCCCCC000','00C0000C0000','00CCCCCC0000','000DDDD00000','000DDDD00000','000D00D00000','000D00D00000','000000000000','000000000000'],
    '黒曜の騎士':['000111110000','001111111000','011188811100','111111111110','111808081110','111111111110','011166611100','001666661000','001111111000','011111111100','011100111100','000000000000']
  };
  const palette={
    '0':'transparent','1':'#24143f','2':'#4f9f42','3':'#54c84d','4':'#f0d5a0','5':'#d8d0bd','6':'#7b4c2b','7':'#6d7079','8':'#ef435d','9':'#7049a6','A':'#9d5bc1','B':'#d9c38b','C':'#e5e0d7','D':'#77706a'
  };

  const style=document.createElement('style');
  style.textContent=`
  .battle-shell{display:grid;gap:12px;min-height:100%;align-content:center}
  .battle-top{display:flex;justify-content:space-between;align-items:center;gap:10px}
  .battle-zone{position:relative;min-height:220px;border:2px solid #64748b;border-radius:12px;overflow:hidden;background:linear-gradient(#10182d 0 58%,#243249 58% 65%,#1d293a 65%)}
  .battle-zone:before{content:'';position:absolute;inset:auto 0 0;height:35%;background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 2px,transparent 2px 8px)}
  .enemy-sprite{position:absolute;left:50%;top:50%;transform:translate(-50%,-53%);display:grid;grid-template-columns:repeat(12,8px);grid-template-rows:repeat(12,8px);filter:drop-shadow(0 10px 2px rgba(0,0,0,.38));transition:transform .12s,filter .12s}
  .enemy-sprite span{width:8px;height:8px}
  .enemy-sprite.hit{transform:translate(-47%,-53%);filter:brightness(2) drop-shadow(0 10px 2px rgba(0,0,0,.38))}
  .enemy-sprite.enemy-hit{transform:translate(-53%,-53%)}
  .enemy-shadow{position:absolute;left:50%;top:73%;width:120px;height:18px;transform:translateX(-50%);border-radius:50%;background:rgba(0,0,0,.28)}
  .slash-fx{position:absolute;left:50%;top:48%;width:110px;height:8px;background:#fff7c2;transform:translate(-50%,-50%) rotate(-35deg) scaleX(0);box-shadow:0 0 18px #fff,0 0 30px #facc15;animation:slash .28s ease-out}
  .magic-fx{position:absolute;left:50%;top:49%;transform:translate(-50%,-50%);font-size:70px;animation:magicPop .55s ease-out}
  .heal-fx{position:absolute;left:50%;top:72%;transform:translate(-50%,-50%);font-size:42px;animation:magicPop .65s ease-out}
  @keyframes slash{0%{transform:translate(-50%,-50%) rotate(-35deg) scaleX(0)}45%{transform:translate(-50%,-50%) rotate(-35deg) scaleX(1)}100%{opacity:0}}
  @keyframes magicPop{0%{transform:translate(-50%,-50%) scale(.2);opacity:0}50%{transform:translate(-50%,-50%) scale(1.2);opacity:1}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}
  .battle-bars{display:grid;gap:7px}.bar-row{display:grid;grid-template-columns:46px 1fr auto;gap:8px;align-items:center;font-size:12px}.bar{height:9px;background:#111827;border:1px solid #64748b;border-radius:999px;overflow:hidden}.bar>i{display:block;height:100%;transition:width .3s}.hp-fill{background:linear-gradient(90deg,#22c55e,#86efac)}.mp-fill{background:linear-gradient(90deg,#3b82f6,#93c5fd)}.xp-fill{background:linear-gradient(90deg,#f59e0b,#fde68a)}.enemy-fill{background:linear-gradient(90deg,#ef4444,#fb7185)}
  .battle-log{min-height:54px;border:1px solid #475569;border-radius:8px;background:#07101f;padding:10px;line-height:1.5;white-space:pre-line}
  .battle-actions.v2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.battle-actions.v2 button{padding:12px 8px;border:2px solid #cbd5e1;background:#111827;color:white;border-radius:8px;font:inherit;font-weight:700}.battle-actions.v2 button:active{transform:scale(.98)}
  .levelup-card{text-align:center;display:grid;gap:14px;place-items:center}.levelup-burst{font-size:60px;animation:levelBurst 1s ease-in-out infinite alternate}.levelup-title{font-size:32px;font-weight:900;color:#fde68a;text-shadow:0 0 16px rgba(250,204,21,.6)}
  @keyframes levelBurst{from{transform:scale(.92)}to{transform:scale(1.12)}}
  @media(max-width:760px){.battle-zone{min-height:190px}.enemy-sprite{grid-template-columns:repeat(12,7px);grid-template-rows:repeat(12,7px)}.enemy-sprite span{width:7px;height:7px}}
  `;
  document.head.appendChild(style);

  function spriteHTML(enemy){
    const rows=spriteMap[enemy.name]||spriteMap['ゴブリン'];
    return rows.flatMap(row=>[...row].map(c=>`<span style="background:${palette[c]||'#fff'}"></span>`)).join('');
  }
  function threshold(){return Math.max(1,state.level*20)}
  function pct(v,max){return Math.max(0,Math.min(100,Math.round((v/max)*100)))}
  function render(enemy,text){
    overlay.classList.remove('hidden');
    overlay.innerHTML=`<div class="battle-shell">
      <div class="battle-top"><strong>⚔ BATTLE</strong><span>${enemy.boss?'BOSS':'ENCOUNTER'}</span></div>
      <div class="battle-zone" id="battleZone"><div class="enemy-shadow"></div><div class="enemy-sprite" id="enemySprite">${spriteHTML(enemy)}</div></div>
      <div class="battle-row"><strong>${enemy.name}</strong><span>HP ${Math.max(0,enemy.hp)}/${enemy.maxHp}</span></div>
      <div class="bar"><i class="enemy-fill" style="width:${pct(enemy.hp,enemy.maxHp)}%"></i></div>
      <div class="battle-bars">
        <div class="bar-row"><span>HP</span><div class="bar"><i class="hp-fill" style="width:${pct(state.hp,state.maxHp)}%"></i></div><span>${state.hp}/${state.maxHp}</span></div>
        <div class="bar-row"><span>MP</span><div class="bar"><i class="mp-fill" style="width:${pct(state.mp,state.maxMp)}%"></i></div><span>${state.mp}/${state.maxMp}</span></div>
        <div class="bar-row"><span>EXP</span><div class="bar"><i class="xp-fill" style="width:${pct(state.xp,threshold())}%"></i></div><span>${state.xp}/${threshold()}</span></div>
      </div>
      <div class="battle-log">${text}</div>
      <div class="battle-actions v2"><button id="attackBtn">⚔ たたかう</button><button id="flameBtn">🔥 フレイム MP4</button><button id="spellBtn">✨ ヒール MP3</button><button id="herbBtn">🌿 薬草 ${state.herbs||0}</button></div>
    </div>`;
    document.getElementById('attackBtn').onclick=()=>attack(enemy);
    document.getElementById('flameBtn').onclick=()=>flame(enemy);
    document.getElementById('spellBtn').onclick=()=>healV2(enemy);
    document.getElementById('herbBtn').onclick=()=>herb(enemy);
  }
  function fx(kind){const zone=document.getElementById('battleZone');if(!zone)return;const el=document.createElement('div');el.className=kind==='slash'?'slash-fx':kind==='heal'?'heal-fx':'magic-fx';el.textContent=kind==='magic'?'🔥':kind==='heal'?'✨':'';zone.appendChild(el);setTimeout(()=>el.remove(),700)}
  function enemyFlash(cls='hit'){const s=document.getElementById('enemySprite');if(!s)return;s.classList.add(cls);setTimeout(()=>s.classList.remove(cls),180)}
  function counter(enemy,prefix){const edmg=Math.max(1,enemy.atk+Math.floor(Math.random()*4)-state.def);state.hp-=edmg;if(state.hp<=0){lose();return}updateUI();setTimeout(()=>{enemyFlash('enemy-hit');render(enemy,`${prefix}\n${enemy.name}の反撃！ ${edmg}ダメージ！`)},250)}
  function attack(enemy){const dmg=Math.max(1,state.atk+Math.floor(Math.random()*5)-enemy.def);enemy.hp-=dmg;fx('slash');enemyFlash();if(enemy.hp<=0){setTimeout(()=>winV2(enemy),280);return}counter(enemy,`勇者の斬撃！ ${dmg}ダメージ！`)}
  function flame(enemy){if(state.mp<4){render(enemy,'MPが足りない！');return}state.mp-=4;const dmg=Math.max(5,8+state.level*3+Math.floor(Math.random()*7)-Math.floor(enemy.def/2));enemy.hp-=dmg;updateUI();fx('magic');enemyFlash();if(enemy.hp<=0){setTimeout(()=>winV2(enemy),420);return}counter(enemy,`フレイム！ 炎が敵を包む！ ${dmg}ダメージ！`)}
  function healV2(enemy){if(state.mp<3){render(enemy,'MPが足りない！');return}state.mp-=3;const amount=14+state.level*2;state.hp=Math.min(state.maxHp,state.hp+amount);updateUI();fx('heal');counter(enemy,`ヒール！ HPが${amount}回復した！`)}
  function herb(enemy){if((state.herbs||0)<=0){render(enemy,'薬草を持っていない！');return}state.herbs--;const amount=30;state.hp=Math.min(state.maxHp,state.hp+amount);updateUI();fx('heal');counter(enemy,`薬草を使った！ HPが${amount}回復した！`)}
  function finishAfterWin(enemy,levelBefore){
    const leveled=state.level>levelBefore;
    if(leveled){
      overlay.innerHTML=`<div class="levelup-card"><div class="levelup-burst">✨⚔✨</div><div class="levelup-title">LEVEL UP!</div><div>Lv ${levelBefore} → <strong>Lv ${state.level}</strong></div><div class="npc-box">最大HP +${8*(state.level-levelBefore)} / 最大MP +${3*(state.level-levelBefore)}<br>攻撃力・防御力も上昇した！</div><button id="levelContinue" class="menu-btn">冒険を続ける</button></div>`;
      document.getElementById('levelContinue').onclick=()=>{state.inBattle=false;closeOverlay();updateUI();drawCurrent();say(`${enemy.name}を倒した！ ${enemy.xp} EXP / ${enemy.gold}G 獲得！${enemy.boss?'\n黒曜の騎士を撃破した！':''}`)};
    }else{
      state.inBattle=false;closeOverlay();updateUI();drawCurrent();say(`${enemy.name}を倒した！\n${enemy.xp} EXP と ${enemy.gold}G を獲得！${enemy.boss?'\n\n黒曜の騎士を撃破！ 洞窟の邪気が消えていく……。':''}`)
    }
  }
  function winV2(enemy){
    const before=state.level;state.gold+=enemy.gold;state.xp+=enemy.xp;if(enemy.boss)state.bossDefeated=true;
    while(state.xp>=state.level*20){state.xp-=state.level*20;state.level++;state.maxHp+=8;state.maxMp+=3;state.atk+=3;state.def+=2;state.hp=state.maxHp;state.mp=state.maxMp}
    updateUI();
    const zone=document.getElementById('battleZone');if(zone){zone.innerHTML='<div style="display:grid;place-items:center;height:100%;font-size:54px">🏆</div>'}
    const log=overlay.querySelector('.battle-log');if(log)log.textContent=`${enemy.name}を倒した！\n${enemy.xp} EXP / ${enemy.gold}G を獲得！`;
    setTimeout(()=>finishAfterWin(enemy,before),700)
  }
  window.startBattle=function(enemy){state.inBattle=true;enemy.maxHp=enemy.hp;render(enemy,`${enemy.name}が あらわれた！`)};
  window.renderBattle=render;
  window.playerAttack=attack;
  window.heal=healV2;
  window.win=winV2;
})();