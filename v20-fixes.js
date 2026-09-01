// v20: stable slower stick + battle controller hiding + richer original JRPG monster art
(function(){
  // ---------- controller visibility ----------
  const style=document.createElement('style');
  style.textContent=`
    html,body,#app{overflow:hidden!important;touch-action:none!important}
    body.in-battle .game-controls{display:none!important}
    .battle15-enemy{display:block!important;width:150px!important;height:150px!important;top:10%!important;transform:translateX(-50%)!important;filter:drop-shadow(0 12px 5px rgba(0,0,0,.42))!important}
    .battle15-enemy svg{display:block;width:100%;height:100%;overflow:visible}
    .battle15-enemy.hit{transform:translateX(-45%)!important;filter:brightness(1.8) drop-shadow(0 12px 5px rgba(0,0,0,.42))!important}
    @media(max-width:760px){.battle15-enemy{width:126px!important;height:126px!important;top:11%!important}}
  `;
  document.head.appendChild(style);

  // ---------- replace the previous stick listeners entirely ----------
  const oldBase=document.getElementById('stickBase');
  if(oldBase){
    const base=oldBase.cloneNode(true);
    oldBase.replaceWith(base);
    const knob=base.querySelector('#stickKnob');
    let pointer=null,dx=0,dy=0,timer=null,lastMenuAt=0,menuIndex=0;
    function updateDirection(ev){
      const b=base.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;
      const rx=ev.clientX-cx,ry=ev.clientY-cy,len=Math.hypot(rx,ry)||1,max=b.width*.31,k=Math.min(1,max/len);
      knob.style.transform=`translate(${rx*k}px,${ry*k}px)`;
      if(len<b.width*.13){dx=dy=0;return}
      const oct=Math.round(Math.atan2(ry,rx)/(Math.PI/4));
      const dirs=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
      [dx,dy]=dirs[(oct+8)%8];
    }
    function selectable(){return [...overlay.querySelectorAll('button:not([disabled])')].filter(b=>b.offsetParent!==null)}
    function menuStep(){
      const now=Date.now();if(now-lastMenuAt<230)return;lastMenuAt=now;
      const list=selectable();if(!list.length)return;
      const d=Math.abs(dy)>=Math.abs(dx)?dy:dx;if(!d)return;
      const current=list.findIndex(b=>b.classList.contains('menu-selected'));menuIndex=current>=0?current:menuIndex;
      menuIndex=(menuIndex+(d>0?1:-1)+list.length)%list.length;
      list.forEach((b,i)=>b.classList.toggle('menu-selected',i===menuIndex));
    }
    function step(){
      if(!(dx||dy)||state.inBattle)return;
      if(state.inMenu){menuStep();return}
      move(dx,dy);
    }
    function stop(){pointer=null;dx=dy=0;knob.style.transform='translate(0,0)';if(timer){clearInterval(timer);timer=null}}
    base.addEventListener('pointerdown',ev=>{ev.preventDefault();pointer=ev.pointerId;base.setPointerCapture(pointer);updateDirection(ev);step();timer=setInterval(step,250)});
    base.addEventListener('pointermove',ev=>{if(ev.pointerId!==pointer)return;ev.preventDefault();updateDirection(ev)});
    base.addEventListener('pointerup',stop);base.addEventListener('pointercancel',stop);base.addEventListener('lostpointercapture',stop);
  }

  // ---------- richer original monster illustrations ----------
  const svgs={
    'スライム':`<svg viewBox="0 0 160 150" xmlns="http://www.w3.org/2000/svg"><path d="M80 10C63 33 23 55 20 91c-3 33 24 49 60 49s63-16 60-49C137 55 97 33 80 10Z" fill="#35b94b" stroke="#153c27" stroke-width="7"/><path d="M45 81c12-18 58-28 81 0-11-37-82-38-92 3" fill="#6de46d" opacity=".75"/><ellipse cx="58" cy="88" rx="8" ry="11" fill="#fff"/><ellipse cx="103" cy="88" rx="8" ry="11" fill="#fff"/><circle cx="61" cy="91" r="4"/><circle cx="100" cy="91" r="4"/><path d="M58 112q22 17 44 0" fill="none" stroke="#17301f" stroke-width="6" stroke-linecap="round"/><path d="M40 65q12-16 28-20" stroke="#b8ff9e" stroke-width="6" stroke-linecap="round"/></svg>`,
    'ツノウサギ':`<svg viewBox="0 0 160 150" xmlns="http://www.w3.org/2000/svg"><path d="M66 34 79 3 91 34" fill="#f0d47c" stroke="#4b3723" stroke-width="6"/><path d="M43 48 31 14q23 9 32 36M117 48l12-34q-23 9-32 36" fill="#c8a36b" stroke="#4b3723" stroke-width="6"/><ellipse cx="80" cy="88" rx="48" ry="46" fill="#e9d7b8" stroke="#4b3723" stroke-width="7"/><path d="M46 78q10-18 25-12M114 78q-10-18-25-12" fill="none" stroke="#5a4633" stroke-width="5"/><ellipse cx="59" cy="83" rx="7" ry="9" fill="#1e293b"/><ellipse cx="101" cy="83" rx="7" ry="9" fill="#1e293b"/><path d="M74 101h12l-6 9Z" fill="#d26a70"/><path d="M58 117q22 12 44 0" fill="none" stroke="#6d5140" stroke-width="5"/><path d="M38 103 21 116l21 4M122 103l17 13-21 4" fill="#e9d7b8" stroke="#4b3723" stroke-width="6"/></svg>`,
    '森オオカミ':`<svg viewBox="0 0 170 150" xmlns="http://www.w3.org/2000/svg"><path d="M43 55 30 15l34 25M125 55l15-40-36 25" fill="#58606a" stroke="#202833" stroke-width="7"/><path d="M33 88q3-48 51-58 50 7 55 58-2 43-53 52-50-7-53-52Z" fill="#626b76" stroke="#202833" stroke-width="7"/><path d="M45 77q16-18 31-6M124 77q-17-18-32-6" stroke="#dbe1e8" stroke-width="6" fill="none"/><ellipse cx="62" cy="80" rx="7" ry="9" fill="#f0c43a"/><ellipse cx="108" cy="80" rx="7" ry="9" fill="#f0c43a"/><circle cx="62" cy="81" r="3"/><circle cx="108" cy="81" r="3"/><path d="M68 102q17-13 34 0l-17 14Z" fill="#262b31"/><path d="M57 119q28 17 57-2" fill="none" stroke="#1e252d" stroke-width="6"/><path d="M47 117 61 139M123 117l-14 22" stroke="#3d4650" stroke-width="12" stroke-linecap="round"/></svg>`,
    'ゴブリン':`<svg viewBox="0 0 180 155" xmlns="http://www.w3.org/2000/svg"><path d="M52 63 17 45l33 34M128 63l35-18-33 34" fill="#67a044" stroke="#25351d" stroke-width="7"/><path d="M44 78q8-48 47-51 40 5 46 51v33q-8 32-46 35-38-3-47-35Z" fill="#6fac4d" stroke="#25351d" stroke-width="7"/><path d="M54 75q13-13 27-4M128 75q-13-13-27-4" stroke="#2b371f" stroke-width="6"/><ellipse cx="68" cy="80" rx="7" ry="8" fill="#ffda4d"/><ellipse cx="113" cy="80" rx="7" ry="8" fill="#ffda4d"/><path d="M82 94h18l-9 10Z" fill="#47722f"/><path d="M66 116q25 13 51-1" fill="none" stroke="#29401f" stroke-width="6"/><path d="M74 119 69 132M108 119l5 13" stroke="#fff2c4" stroke-width="7"/><path d="M19 125 38 82" stroke="#70411e" stroke-width="9"/><path d="M7 124h29l-8-15Z" fill="#9a9aa0" stroke="#33363b" stroke-width="5"/></svg>`,
    '洞窟コウモリ':`<svg viewBox="0 0 190 150" xmlns="http://www.w3.org/2000/svg"><path d="M77 69Q38 22 7 48q24 17 14 52 30-10 58 4M113 69q39-47 70-21-24 17-14 52-30-10-58 4" fill="#6f46a7" stroke="#271d3c" stroke-width="7"/><ellipse cx="95" cy="88" rx="33" ry="43" fill="#8758bf" stroke="#271d3c" stroke-width="7"/><path d="M74 54 61 28l29 17M116 54l13-26-29 17" fill="#8b61bf" stroke="#271d3c" stroke-width="6"/><ellipse cx="82" cy="79" rx="7" ry="9" fill="#ff4e69"/><ellipse cx="108" cy="79" rx="7" ry="9" fill="#ff4e69"/><path d="M77 102q18 15 36 0" fill="none" stroke="#311d40" stroke-width="6"/><path d="M83 103 87 117M107 103l-4 14" stroke="#fff0d2" stroke-width="6"/></svg>`,
    'どくキノコ':`<svg viewBox="0 0 170 155" xmlns="http://www.w3.org/2000/svg"><path d="M17 70Q26 20 84 16q59 2 69 54-31 13-68 10-38 3-68-10Z" fill="#9b52b8" stroke="#38213f" stroke-width="7"/><circle cx="52" cy="48" r="11" fill="#e9bddc"/><circle cx="103" cy="38" r="9" fill="#e9bddc"/><circle cx="129" cy="60" r="7" fill="#e9bddc"/><path d="M57 77q-7 25 2 58h52q9-33 2-58" fill="#d7c18f" stroke="#59452c" stroke-width="7"/><ellipse cx="73" cy="102" rx="7" ry="9" fill="#282121"/><ellipse cx="98" cy="102" rx="7" ry="9" fill="#282121"/><path d="M72 122q13-8 26 0" fill="none" stroke="#684c34" stroke-width="5"/><path d="M53 86 38 104M117 86l16 18" stroke="#c6af7d" stroke-width="9" stroke-linecap="round"/></svg>`,
    '骸骨兵':`<svg viewBox="0 0 190 160" xmlns="http://www.w3.org/2000/svg"><path d="M53 18q43-21 77 8l-7 58q-11 24-35 24-25 0-37-24Z" fill="#e4dfce" stroke="#3c3b37" stroke-width="7"/><path d="M61 62 78 48l7 20M116 62 99 48l-7 20" fill="#22242a"/><path d="M76 82h25l-12 12Z" fill="#393936"/><path d="M68 99h42" stroke="#55534c" stroke-width="5" stroke-dasharray="5 5"/><path d="M64 107 48 145M111 107l16 38M70 111h35M77 111l-5 38M100 111l5 38" stroke="#e4dfce" stroke-width="9" stroke-linecap="round"/><path d="M32 44v105" stroke="#6b4626" stroke-width="8"/><path d="M14 48h37l-9-31Z" fill="#a8adb3" stroke="#353941" stroke-width="6"/><path d="M128 91q36-7 47 21-10 31-43 35-22-21-4-56Z" fill="#596377" stroke="#303642" stroke-width="7"/><path d="M139 104v29M126 118h29" stroke="#c6a64a" stroke-width="5"/></svg>`,
    '黒曜の騎士':`<svg viewBox="0 0 200 170" xmlns="http://www.w3.org/2000/svg"><path d="M64 31 78 8l16 20 17-23 19 28" fill="#302447" stroke="#14101f" stroke-width="7"/><path d="M53 35q45-22 91 2l-3 72q-8 42-43 48-37-6-45-48Z" fill="#27213a" stroke="#100d18" stroke-width="8"/><path d="M65 61h67l-7 31H72Z" fill="#171724" stroke="#0c0c12" stroke-width="6"/><path d="M77 72h12M109 72h12" stroke="#f04464" stroke-width="7"/><path d="M64 104 44 145M135 104l20 41" stroke="#332a4b" stroke-width="18" stroke-linecap="round"/><path d="M78 112 69 160M120 112l9 48" stroke="#211b33" stroke-width="20" stroke-linecap="round"/><path d="M146 28 121 116" stroke="#d7dce2" stroke-width="8"/><path d="M139 27 160 33 150 49Z" fill="#d7dce2" stroke="#272a31" stroke-width="5"/><path d="M113 112h31" stroke="#c59b36" stroke-width="7"/><path d="M46 110q-23 2-31 26 12 26 36 23 20-24-5-49Z" fill="#332844" stroke="#100d18" stroke-width="7"/><path d="M25 136h28M39 122v27" stroke="#c59b36" stroke-width="5"/></svg>`
  };
  function upgradeEnemy(){
    const enemy=document.querySelector('.battle15-enemy'),name=document.querySelector('.battle15-name');
    if(!enemy||!name)return;const key=name.textContent.trim();const art=svgs[key];if(!art)return;
    if(enemy.dataset.art20===key)return;enemy.dataset.art20=key;enemy.innerHTML=art;
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(upgradeEnemy));
  observer.observe(overlay,{childList:true,subtree:true});
  upgradeEnemy();
})();