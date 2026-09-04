// v34: HD-2D-inspired inn interior prototype.
(function(){
  function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
  function glow(x,y,r,inner,outer){
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,inner);g.addColorStop(1,outer);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  function drawInnHD2D(){
    // deep background
    rect(0,0,canvas.width,canvas.height,'#120f12');
    // perspective floor
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
      const px=x*TILE,py=y*TILE;
      const shade=((x+y)%2===0)?'#6c4a2e':'#775236';
      rect(px,py,TILE,TILE,shade);
      ctx.strokeStyle='rgba(20,10,5,.28)';ctx.strokeRect(px+1,py+1,TILE-2,TILE-2);
    }
    // far wall
    rect(0,0,640,120,'#3a2a24');
    rect(0,110,640,10,'#251914');
    // ceiling beams
    for(let x=0;x<640;x+=120){rect(x,0,12,120,'#241711');rect(x+5,0,3,120,'#4b3020')}
    // windows + shafts of light
    for(const wx of [115,455]){
      rect(wx,30,70,58,'#1f2d39');rect(wx+5,35,60,48,'#7fb0c4');
      ctx.fillStyle='rgba(255,231,176,.18)';ctx.beginPath();ctx.moveTo(wx+8,88);ctx.lineTo(wx+62,88);ctx.lineTo(wx+125,300);ctx.lineTo(wx-35,300);ctx.closePath();ctx.fill();
      rect(wx+33,35,4,48,'#40302a');rect(wx+5,57,60,4,'#40302a');
    }
    // beds
    for(const bx of [70,470]){
      rect(bx,285,110,70,'#d7c6a7');rect(bx,285,110,12,'#7d314c');rect(bx+10,300,90,45,'#e8dcc4');rect(bx+8,350,95,9,'#4a2f20');
      rect(bx+12,295,38,14,'#f1e8d8');
    }
    // counter
    rect(235,125,170,70,'#4c2f20');rect(228,120,184,12,'#8a5b34');rect(245,138,150,12,'#5f3b26');
    // shelves
    for(let i=0;i<5;i++){rect(250+i*30,150,18,30,['#6b8f62','#9b5c4d','#5878a8','#b48c4d','#7d5a8f'][i]);}
    // lamps
    for(const [lx,ly] of [[210,210],[430,210]]){
      rect(lx-3,ly,6,30,'#3b271b');rect(lx-10,ly-8,20,10,'#b28342');glow(lx,ly-4,70,'rgba(255,208,120,.20)','rgba(255,208,120,0)');
    }
    // vignette / depth blur illusion
    const vg=ctx.createRadialGradient(320,240,120,320,240,390);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.48)');ctx.fillStyle=vg;ctx.fillRect(0,0,640,480);

    // NPC and hero stay pixel-art
    if(typeof drawHero==='function') drawHero(state.interiorX||8,state.interiorY||9);
    // innkeeper
    rect(8*TILE+11,4*TILE+17,18,15,'#9b3157');rect(8*TILE+13,4*TILE+8,15,10,'#edbc89');rect(8*TILE+11,4*TILE+5,19,5,'#5a3528');
    // foreground blur-ish silhouettes
    ctx.globalAlpha=.5;rect(-20,395,120,95,'#1b1110');rect(555,390,120,100,'#1b1110');ctx.globalAlpha=1;
  }

  const oldDrawCurrent=window.drawCurrent;
  window.drawCurrent=function(){
    if(state.area==='interior'&&state.interiorType==='inn'){drawInnHD2D();return}
    return oldDrawCurrent.apply(this,arguments);
  };

  // intercept direct inn redraws from older code
  const oldMove=window.move;
  window.move=function(dx,dy){
    const before=state.area==='interior'&&state.interiorType==='inn';
    const r=oldMove(dx,dy);
    if(before&&state.area==='interior'&&state.interiorType==='inn')drawInnHD2D();
    return r;
  };
  const oldAction=window.action;
  window.action=function(){
    const r=oldAction.apply(this,arguments);
    if(state.area==='interior'&&state.interiorType==='inn')setTimeout(drawInnHD2D,0);
    return r;
  };

  const style=document.createElement('style');
  style.textContent=`
    body.hd2d-inn #game-wrap{box-shadow:0 0 0 3px #111,0 18px 45px rgba(0,0,0,.55)!important}
  `;document.head.appendChild(style);

  setInterval(()=>document.body.classList.toggle('hd2d-inn',state.area==='interior'&&state.interiorType==='inn'),300);
  if(state.area==='interior'&&state.interiorType==='inn')drawInnHD2D();
})();