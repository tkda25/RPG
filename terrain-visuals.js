// v17: richer 16-bit overworld + safe terrain-aware battle scenery.
(function(){
  function r(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
  function grass(X,Y){r(X,Y,40,40,'#4b9345');r(X,Y+30,40,10,'#43883d');r(X+5,Y+7,2,8,'#2f7434');r(X+8,Y+5,2,5,'#78bd61');r(X+28,Y+24,2,7,'#347a36');r(X+31,Y+22,2,5,'#70b75a');r(X+16,Y+34,8,2,'#397e38')}
  function water(X,Y){r(X,Y,40,40,'#2874b7');r(X,Y+7,15,3,'#52a5d2');r(X+18,Y+18,18,3,'#1e609d');r(X+5,Y+30,22,2,'#64b1d7')}
  function road(X,Y){r(X,Y,40,40,'#b89a65');r(X+2,Y+2,36,36,'#c9ae79');r(X+6,Y+8,13,3,'#dac491');r(X+24,Y+26,9,2,'#9d8358');r(X+8,Y+33,7,2,'#ad9465')}
  function forest(X,Y){grass(X,Y);r(X+17,Y+24,7,14,'#654020');r(X+4,Y+13,31,18,'#14562a');r(X+9,Y+7,24,20,'#207936');r(X+14,Y+3,16,17,'#349148');r(X+16,Y+7,7,5,'#61b35e');r(X+7,Y+18,7,5,'#0e4220')}
  function mountain(X,Y){r(X,Y,40,40,'#657179');ctx.fillStyle='#858e92';ctx.beginPath();ctx.moveTo(X+2,Y+37);ctx.lineTo(X+20,Y+5);ctx.lineTo(X+38,Y+37);ctx.fill();ctx.fillStyle='#d4d7d5';ctx.beginPath();ctx.moveTo(X+14,Y+16);ctx.lineTo(X+20,Y+5);ctx.lineTo(X+27,Y+17);ctx.lineTo(X+22,Y+15);ctx.lineTo(X+19,Y+20);ctx.fill();r(X+6,Y+33,28,4,'#50595e')}
  function town(X,Y){grass(X,Y);r(X+5,Y+16,30,20,'#d1b071');r(X+8,Y+19,24,17,'#e1c68d');r(X+3,Y+9,34,10,'#793426');r(X+7,Y+5,26,9,'#a84a32');r(X+17,Y+25,7,11,'#59321f');r(X+11,Y+22,5,5,'#75bfd1');r(X+26,Y+22,5,5,'#75bfd1')}
  function cave(X,Y){grass(X,Y);ctx.fillStyle='#69665f';ctx.beginPath();ctx.arc(X+20,Y+25,17,Math.PI,0);ctx.fill();r(X+4,Y+25,32,11,'#69665f');ctx.fillStyle='#11151a';ctx.beginPath();ctx.arc(X+20,Y+28,11,Math.PI,0);ctx.fill();r(X+9,Y+28,22,8,'#11151a');r(X+4,Y+33,7,4,'#807d74');r(X+31,Y+31,6,5,'#807d74')}
  window.drawWorld=function(){
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
      const ch=worldMap[y][x],X=x*TILE,Y=y*TILE;
      if(ch==='W')water(X,Y);else if(ch==='R')road(X,Y);else if(ch==='F')forest(X,Y);else if(ch==='M')mountain(X,Y);else if(ch==='T')town(X,Y);else if(ch==='C')cave(X,Y);else grass(X,Y);
      ctx.strokeStyle='rgba(0,0,0,.035)';ctx.strokeRect(X,Y,40,40)
    }
    [[2,1],[6,3],[10,4],[12,8],[5,9]].forEach(([x,y],i)=>{if(worldMap[y][x]==='G'){r(x*TILE+9,y*TILE+12,3,3,i%2?'#f5d35c':'#e88da9');r(x*TILE+10,y*TILE+15,2,5,'#2f7132')}});
    [[3,8],[11,3],[13,9]].forEach(([x,y])=>{if(worldMap[y][x]==='G'){r(x*TILE+23,y*TILE+26,8,5,'#747973');r(x*TILE+25,y*TILE+23,5,3,'#a4a7a0')}});
    drawHero(state.x,state.y)
  };
  function terrain(){if(state.area==='dungeon')return 'cave';const ch=(worldMap[state.y]||'')[state.x]||'G';return ch==='F'?'forest':ch==='R'?'road':'grass'}
  const css=document.createElement('style');css.textContent=`
    .battle15-field.terrain-grass{background:linear-gradient(#6da9d4 0 45%,#bed58a 45% 48%,#4b8e3e 48% 100%)}
    .battle15-field.terrain-grass:after{content:'';position:absolute;inset:52% 0 0;background:repeating-linear-gradient(100deg,transparent 0 20px,rgba(35,92,40,.18) 20px 23px)}
    .battle15-field.terrain-road{background:linear-gradient(#77acd1 0 44%,#b8d58f 44% 48%,#6e9b4a 48% 100%)}
    .battle15-field.terrain-road:after{content:'';position:absolute;left:24%;right:24%;bottom:-10%;height:62%;background:linear-gradient(#b99a66,#d1b27b);clip-path:polygon(43% 0,57% 0,100% 100%,0 100%);opacity:.95}
    .battle15-field.terrain-forest{background:linear-gradient(#4d7f67 0 32%,#274b35 32% 52%,#315f35 52% 100%)}
    .battle15-field.terrain-forest:before{content:'';position:absolute;left:0;right:0;bottom:33%;height:44%;background:repeating-linear-gradient(90deg,#163e25 0 24px,#245a31 24px 46px,#1b4728 46px 68px);opacity:.95}
    .battle15-field.terrain-cave{background:linear-gradient(#17191c 0 62%,#2e3033 62% 100%)}
    .battle15-field.terrain-cave:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 32%,rgba(130,120,100,.13),transparent 38%),linear-gradient(135deg,rgba(255,255,255,.03) 25%,transparent 25% 75%,rgba(255,255,255,.03) 75%);background-size:auto,42px 42px}
    .terrain-rock{position:absolute;background:#66635d;border:4px solid #4c4a45;z-index:1}.terrain-rock.r1{width:54px;height:38px;left:7%;bottom:18%;clip-path:polygon(12% 35%,36% 0,80% 12%,100% 65%,72% 100%,15% 90%,0 58%)}.terrain-rock.r2{width:42px;height:30px;right:9%;bottom:29%;clip-path:polygon(18% 30%,45% 0,88% 24%,100% 72%,62% 100%,10% 82%,0 48%)}
    .terrain-grass-tuft{position:absolute;width:28px;height:18px;bottom:22%;z-index:1;background:repeating-linear-gradient(100deg,transparent 0 4px,#2e6f35 4px 7px,transparent 7px 10px)}.terrain-grass-tuft.g1{left:9%}.terrain-grass-tuft.g2{right:12%;bottom:31%}
  `;document.head.appendChild(css);
  function decorate(){
    const f=document.querySelector('.battle15-field');if(!f)return;
    const t=terrain();
    if(f.dataset.terrainDecorated===t)return;
    f.dataset.terrainDecorated=t;
    f.classList.remove('terrain-grass','terrain-road','terrain-forest','terrain-cave');
    f.classList.add('terrain-'+t);
    f.querySelectorAll('.terrain-rock,.terrain-grass-tuft').forEach(n=>n.remove());
    if(t==='cave')f.insertAdjacentHTML('beforeend','<i class="terrain-rock r1"></i><i class="terrain-rock r2"></i>');
    else f.insertAdjacentHTML('beforeend','<i class="terrain-grass-tuft g1"></i><i class="terrain-grass-tuft g2"></i>');
  }
  // Only watch direct overlay replacements. Do not observe decorations inside the battle field,
  // otherwise adding rocks/grass recursively triggers this observer and freezes encounters.
  const obs=new MutationObserver(()=>requestAnimationFrame(decorate));
  obs.observe(overlay,{childList:true,subtree:false});
  if(state.area==='world')drawWorld();
})();