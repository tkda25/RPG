// v36: original high-detail 16-bit inn interior inspired by classic JRPG inns.
(function(){
  const oldDraw=window.drawCurrent;
  const oldMove=window.move;
  let flameTick=0;

  function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
  function stone(x,y,w,h){
    R(x,y,w,h,'#45484b');
    for(let yy=y;yy<y+h;yy+=12){
      for(let xx=x;xx<x+w;xx+=24){
        const off=((yy-y)/12)%2?12:0, bx=xx-off;
        R(bx,yy,22,10,'#565a5d');R(bx+2,yy+2,18,2,'#6a6e70');R(bx,yy+9,22,2,'#2b2e30');
      }
    }
  }
  function wood(x,y,w,h){
    R(x,y,w,h,'#7b512f');
    for(let xx=x;xx<x+w;xx+=12){R(xx, y,2,h,'#4e321f');R(xx+3,y+3,1,h-6,'#9a6a3e')}
    for(let yy=y+15;yy<y+h;yy+=24)R(x,yy,w,2,'#5a3923');
  }
  function rug(x,y,w,h){
    R(x,y,w,h,'#6e1f2f');R(x+3,y+3,w-6,h-6,'#b33a43');R(x+7,y+7,w-14,h-14,'#7d2434');
    for(let xx=x+10;xx<x+w-10;xx+=12){R(xx,y+5,4,4,'#e1b653');R(xx,y+h-9,4,4,'#e1b653')}
    R(x+10,y+10,w-20,3,'#d6a947');R(x+10,y+h-13,w-20,3,'#d6a947');
  }
  function bed(x,y){
    R(x,y,42,70,'#3a261c');R(x+3,y+3,36,64,'#d5c49f');R(x+5,y+7,32,18,'#eee0bd');
    R(x+5,y+27,32,35,'#8d2739');R(x+8,y+30,26,4,'#d9ad48');R(x+8,y+54,26,4,'#d9ad48');
    R(x-3,y-3,48,5,'#593824');R(x-3,y+66,48,5,'#593824');
  }
  function chest(x,y){
    R(x,y+8,30,20,'#5a311b');R(x+2,y+4,26,9,'#a35c27');R(x+4,y+6,22,3,'#d58b38');
    R(x+13,y+10,5,8,'#e1b64e');R(x,y+18,30,3,'#2c1b13');
  }
  function torch(x,y){
    R(x-2,y+7,5,15,'#5b3a22');R(x-5,y+4,11,5,'#a85a24');
    const f=flameTick%3;
    R(x-4,y-5-f,9,12+f,'#e65c20');R(x-2,y-3-f,5,8+f,'#ffb52e');R(x,y-1-f,2,4,'#fff09a');
  }
  function shelf(x,y){
    R(x,y,55,50,'#35231a');R(x+4,y+4,47,42,'#69452a');
    for(let yy=y+13;yy<y+44;yy+=14)R(x+3,yy,49,4,'#3e291d');
    const cols=['#7e9b5c','#a55749','#536e9c','#c19345','#8b668e'];
    for(let i=0;i<5;i++)R(x+7+i*9,y+7+(i%2)*14,6,9,cols[i]);
  }
  function npc(x,y){
    R(x+6,y+4,16,7,'#70422c');R(x+8,y+10,12,10,'#e7b17e');R(x+5,y+20,18,18,'#3f9a58');
    R(x+3,y+25,5,12,'#e7b17e');R(x+20,y+25,5,12,'#e7b17e');R(x+7,y+38,6,8,'#50362c');R(x+16,y+38,6,8,'#50362c');
  }
  function hero(x,y){
    const px=x*TILE+7,py=y*TILE+3;
    R(px+6,py,16,7,'#355a9a');R(px+8,py+7,12,9,'#efbd87');R(px+4,py+16,20,17,'#4d77c7');
    R(px+7,py+33,6,8,'#eee6d3');R(px+16,py+33,6,8,'#eee6d3');
  }
  function inn(){
    flameTick++;
    R(0,0,640,480,'#17191a');
    // outer masonry shell
    stone(20,18,600,444);
    // interior floor
    wood(70,62,500,350);
    // back sleeping alcoves
    stone(70,62,500,30); stone(70,190,500,20);
    R(290,62,12,148,'#292b2d');
    rug(92,105,175,75);rug(325,105,175,75);
    bed(105,95);bed(210,95);bed(340,95);bed(445,95);
    // lower hall stone floor
    stone(70,210,500,202);
    // center runner
    rug(230,270,180,105);
    // counter and shelves
    R(245,218,150,44,'#4a2e1f');R(240,214,160,10,'#9a6338');R(252,230,136,7,'#6d4328');
    shelf(425,220); chest(105,235);chest(505,235);
    // stairs / doorway
    R(505,330,45,65,'#242526');for(let i=0;i<5;i++)R(510,340+i*10,35-i*4,5,'#6d665b');
    // torches
    torch(82,235);torch(558,235);torch(180,400);torch(460,400);
    // innkeeper
    npc(306,226);
    // hero uses custom compact sprite matching room scale
    hero(state.interiorX||8,state.interiorY||9);
    // subtle light pools
    ctx.globalCompositeOperation='screen';
    for(const [x,y] of [[82,230],[558,230],[180,395],[460,395]]){
      const g=ctx.createRadialGradient(x,y,0,x,y,55);g.addColorStop(0,'rgba(255,170,60,.18)');g.addColorStop(1,'rgba(255,120,30,0)');
      ctx.fillStyle=g;ctx.fillRect(x-55,y-55,110,110);
    }
    ctx.globalCompositeOperation='source-over';
    // crisp pixel frame
    R(20,18,600,4,'#242628');R(20,458,600,4,'#242628');R(20,18,4,444,'#242628');R(616,18,4,444,'#242628');
  }

  window.drawCurrent=function(){
    if(!window.astriaTilemapV37&&state.area==='interior'&&state.interiorType==='inn'){inn();return}
    oldDraw.apply(this,arguments);
  };
  window.move=function(dx,dy){
    const was=state.area==='interior'&&state.interiorType==='inn';
    const r=oldMove(dx,dy);
    if(!window.astriaTilemapV37&&was&&state.area==='interior'&&state.interiorType==='inn')inn();
    return r;
  };
  setInterval(()=>{if(window.astriaTilemapV37)return;if(state.area==='interior'&&state.interiorType==='inn'&&!state.inMenu&&!state.inBattle)inn()},180);
})();