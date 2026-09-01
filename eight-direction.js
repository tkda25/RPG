// Eight-direction controls for touch and keyboard.
(function(){
  const bindPad=()=>{
    document.querySelectorAll('[data-dx][data-dy]').forEach(btn=>{
      btn.onclick=()=>move(Number(btn.dataset.dx),Number(btn.dataset.dy));
    });
  };
  bindPad();
  const keyMap={
    q:[-1,-1],w:[0,-1],e:[1,-1],
    a:[-1,0],d:[1,0],
    z:[-1,1],x:[0,1],c:[1,1],
    arrowup:[0,-1],arrowdown:[0,1],arrowleft:[-1,0],arrowright:[1,0]
  };
  window.onkeydown=function(ev){
    const k=ev.key.toLowerCase();
    if(keyMap[k]){ev.preventDefault();move(...keyMap[k]);}
  };
})();