// v42: deterministic render guard for Arne Village.
// Guarantees a complete background every frame even if a raster asset fails to decode.
(function(){
  'use strict';
  const S=32,W=20,H=15;
  const prevMove=window.move,prevDraw=window.drawCurrent;
  const V=[
    'TTTTTTTTTTTTTTTTTTTT','TGGGGGGPPGGGGGGGGGGT','TGGGHHHPPGGGHHHGGGGT','TGGGHHHPPGGGHHHGGGGT','TGGGDGGPPGGGDHGGGGGT',
    'TGGGGGGPPGGGGGGGGGGT','TWWWWWWBBWWWWWWWWGGT','TGGGGGGPPGGGGGGGGGGT','TGGHHGGPPGGGGHHHGGGT','TGGHDGGPPGGGGHDHGGGT',
    'TGGGGGGPPGGGGGGGGGGT','TGGGGGGPPPPPPPPGGGGT','TGGGGGGGGGGGGPPGGGGT','TGGGGGGGGGGGGPPGGGGT','TTTTTTTTTTTTTXXTTTTT'
  ];
  const npcs=[
    {x:9,y:3,c:'#315fa8',h:'#5a341f'},
    {x:6,y:10,c:'#a34d65',h:'#6b3a2a'},
    {x:15,y:11,c:'#65758b',h:'#4b3426'}
  ];
  const doors={'4,4':'#9b4638','14,4':'#3f66a7','3,9':'#b17832','14,9':'#a84256'};
  function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
  function grass(x,y){R(x,y,S,S,'#4b8f3f');R(x,y+25,S,7,'#3f7d36');R(x+5,y+7,2,5,'#2c6c31');R(x+21,y+18,2,5,'#2c6c31');R(x+25,y+8,3,2,'#77b35c')}
  function path(x,y){R(x,y,S,S,'#aaa082');R(x+1,y+1,S-2,S-2,'#bbb194');R(x+3,y+5,10,4,'#ccc1a3');R(x+18,y+20,10,4,'#93896e');R(x+8,y+25,6,3,'#81775f')}
  function water(x,y){R(x,y,S,S,'#2269a8');R(x,y+20,S,12,'#1b5c95');R(x+3,y+7,13,2,'#63aadd');R(x+18,y+16,10,2,'#58a0d6');R(x+7,y+25,12,2,'#79bce9')}
  function bridge(x,y){R(x,y,S,S,'#563621');for(let yy=2;yy<S;yy+=6){R(x+1,y+yy,S-2,4,'#996239');R(x+2,y+yy+1,S-4,1,'#bf8550')}R(x+3,y,3,S,'#d1a25c');R(x+26,y,3,S,'#d1a25c')}
  function tree(x,y){grass(x,y);R(x+13,y+20,7,12,'#634021');R(x+4,y+8,25,17,'#154927');R(x+7,y+4,21,18,'#216434');R(x+11,y+2,14,14,'#2f813f');R(x+14,y+5,6,4,'#68b159')}
  function house(x,y,door,roof){R(x,y,S,S,'#bda77d');R(x,y,S,11,'#463127');R(x+1,y+1,S-2,8,roof||'#8d4338');R(x+3,y+12,S-6,20,'#cbbb93');R(x+3,y+13,S-6,3,'#dbcaa0');if(door){R(x+9,y+13,14,19,'#493022');R(x+11,y+15,10,17,'#69462d');R(x+19,y+22,2,2,'#efc75a')}else{R(x+7,y+19,18,9,'#315d6f');R(x+9,y+20,14,3,'#78b5c9');R(x+15,y+19,2,9,'#244654')}}
  function person(gx,gy,c,h){const x=gx*S+4,y=gy*S+1;R(x+8,y+29,14,3,'rgba(0,0,0,.25)');R(x+8,y+2,14,5,h);R(x+5,y+6,20,7,h);R(x+8,y+11,14,9,'#efbd8b');R(x+11,y+14,2,2,'#111');R(x+18,y+14,2,2,'#111');R(x+6,y+20,20,10,c);R(x+3,y+22,5,7,'#efbd8b');R(x+24,y+22,5,7,'#efbd8b');R(x+8,y+30,6,2,'#26354a');R(x+18,y+30,6,2,'#26354a')}
  function hero(gx,gy){person(gx,gy,'#315fc0','#3e332e');const x=gx*S+4,y=gy*S+1;R(x+24,y+5,3,18,'#d8dfe4');R(x+22,y+20,7,3,'#e0b448')}
  function well(x,y){grass(x,y);R(x+5,y+11,22,15,'#555b60');R(x+7,y+13,18,11,'#777d80');R(x+9,y+15,14,7,'#1d5f8f');R(x+4,y+9,24,4,'#3b3f42')}
  function flower(x,y){grass(x,y);R(x+3,y+19,26,8,'#5d3e25');for(let i=0;i<4;i++){R(x+6+i*6,y+14,3,3,['#f36b7f','#ffd15b','#ef7ca7','#fff1a8'][i]);R(x+7+i*6,y+17,1,4,'#2e7034')}}
  function drawTownSafe(){
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const ch=V[y][x],X=x*S,Y=y*S;if(ch==='G')grass(X,Y);else if(ch==='P'||ch==='X')path(X,Y);else if(ch==='W')water(X,Y);else if(ch==='B')bridge(X,Y);else if(ch==='T')tree(X,Y);else if(ch==='H')house(X,Y,false,'#8d4338');else if(ch==='D')house(X,Y,true,doors[x+','+y]||'#8d4338');else grass(X,Y)}
    flower(2*S,5*S);well(10*S,9*S);flower(16*S,8*S);npcs.forEach(n=>person(n.x,n.y,n.c,n.h));hero(state.townX??9,state.townY??13);ctx.restore();
  }
  function blocked(x,y){if(x<0||y<0||x>=W||y>=H)return true;if(['T','H','W'].includes(V[y][x]))return true;if(npcs.some(n=>n.x===x&&n.y===y))return true;if((x===10&&y===9)||(x===2&&y===5)||(x===16&&y===8))return true;return false}
  window.drawTown=drawTownSafe;
  window.drawCurrent=function(){if(state.area==='town'){drawTownSafe();return}prevDraw.apply(this,arguments)};
  window.move=function(dx,dy){
    if(state.area!=='town')return prevMove(dx,dy);
    if(state.inBattle||state.inMenu)return;
    state.facing=dx>0?'right':dx<0?'left':dy<0?'up':'down';
    const nx=(state.townX??9)+dx,ny=(state.townY??13)+dy;if(blocked(nx,ny)){say('そこには進めない。');return}
    state.townX=nx;state.townY=ny;drawTownSafe();
    if(V[ny][nx]==='X'){state.area='world';state.worldX=9;state.worldY=19;prevDraw();say('アルネ村を出た。')}
  };
  if(state.area==='town')drawTownSafe();
})();