// Eight-direction controls with press-and-hold continuous movement.
(function(){
  const keyMap={
    q:[-1,-1],w:[0,-1],e:[1,-1],
    a:[-1,0],d:[1,0],
    z:[-1,1],x:[0,1],c:[1,1],
    arrowup:[0,-1],arrowdown:[0,1],arrowleft:[-1,0],arrowright:[1,0]
  };

  let holdTimer=null;
  let holdDelay=null;
  let activeButton=null;
  const HOLD_START_MS=220;
  const REPEAT_MS=115;

  function stopHold(){
    if(holdDelay){clearTimeout(holdDelay);holdDelay=null;}
    if(holdTimer){clearInterval(holdTimer);holdTimer=null;}
    if(activeButton){activeButton.classList.remove('holding');activeButton=null;}
  }

  function startHold(btn,dx,dy,ev){
    if(ev){ev.preventDefault();}
    stopHold();
    activeButton=btn;
    btn.classList.add('holding');
    move(dx,dy); // tap still moves one tile immediately
    holdDelay=setTimeout(()=>{
      holdTimer=setInterval(()=>{
        if(state.inBattle||state.inMenu){stopHold();return;}
        move(dx,dy);
      },REPEAT_MS);
    },HOLD_START_MS);
  }

  document.querySelectorAll('[data-dx][data-dy]').forEach(btn=>{
    const dx=Number(btn.dataset.dx),dy=Number(btn.dataset.dy);
    btn.onclick=null;
    btn.addEventListener('pointerdown',ev=>startHold(btn,dx,dy,ev));
    btn.addEventListener('pointerup',stopHold);
    btn.addEventListener('pointercancel',stopHold);
    btn.addEventListener('pointerleave',stopHold);
    btn.addEventListener('contextmenu',ev=>ev.preventDefault());
  });
  window.addEventListener('pointerup',stopHold);
  window.addEventListener('blur',stopHold);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopHold();});

  const pressed=new Set();
  let keyTimer=null;
  function stopKeyLoop(){if(keyTimer){clearInterval(keyTimer);keyTimer=null;}}
  function currentKeyVector(){
    for(const k of pressed){if(keyMap[k])return keyMap[k];}
    return null;
  }
  function ensureKeyLoop(){
    if(keyTimer)return;
    keyTimer=setInterval(()=>{
      const v=currentKeyVector();
      if(!v){stopKeyLoop();return;}
      if(!state.inBattle&&!state.inMenu)move(...v);
    },REPEAT_MS);
  }
  window.onkeydown=function(ev){
    const k=ev.key.toLowerCase();
    if(!keyMap[k])return;
    ev.preventDefault();
    if(!pressed.has(k))move(...keyMap[k]);
    pressed.add(k);
    ensureKeyLoop();
  };
  window.onkeyup=function(ev){
    pressed.delete(ev.key.toLowerCase());
    if(!pressed.size)stopKeyLoop();
  };
})();