// v31: walkable Royal Capital Regnas after Chapter 1.
(function(){
 if(state.capitalX==null)state.capitalX=7;if(state.capitalY==null)state.capitalY=10;
 const B=[
  {id:'castle',name:'レグナス城',x:6,y:0,w:4,h:3,doorX:7,doorY:2,sign:'♛'},
  {id:'weapon',name:'王都武器屋',x:1,y:3,w:3,h:3,doorX:2,doorY:5,sign:'⚔'},
  {id:'armor',name:'王都防具屋',x:12,y:3,w:3,h:3,doorX:13,doorY:5,sign:'◆'},
  {id:'item',name:'王都道具屋',x:1,y:8,w:3,h:3,doorX:2,doorY:10,sign:'●'},
  {id:'inn',name:'王都宿屋',x:12,y:8,w:3,h:3,doorX:13,doorY:10,sign:'♨'},
  {id:'church',name:'星の教会',x:6,y:7,w:4,h:3,doorX:7,doorY:9,sign:'✦'}
 ];
 function road(x,y){ctx.fillStyle='#a99b84';ctx.fillRect(x*TILE,y*TILE,TILE,TILE);ctx.strokeStyle='rgba(30,30,30,.12)';ctx.strokeRect(x*TILE+3,y*TILE+3,TILE-6,TILE-6)}
 function grass(x,y){ctx.fillStyle='#477b45';ctx.fillRect(x*TILE,y*TILE,TILE,TILE)}
 function house(b){const px=b.x*TILE,py=b.y*TILE,w=b.w*TILE,h=b.h*TILE;ctx.fillStyle='#c9b78f';ctx.fillRect(px+6,py+25,w-12,h-28);ctx.fillStyle=b.id==='castle'?'#64748b':'#7c3f35';ctx.fillRect(px+2,py+8,w-4,25);ctx.fillStyle='#4b2d20';ctx.fillRect(b.doorX*TILE+11,b.doorY*TILE-17,18,30);ctx.fillStyle='#172033';ctx.fillRect(px+w/2-16,py+38,32,20);ctx.fillStyle='#fde68a';ctx.font='bold 15px monospace';ctx.textAlign='center';ctx.fillText(b.sign,px+w/2,py+53)}
 window.drawCapital=function(){for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)grass(x,y);for(let y=0;y<ROWS;y++){road(7,y);road(8,y)}for(let x=0;x<COLS;x++){road(x,6);road(x,11)}B.forEach(house);ctx.fillStyle='#475569';ctx.fillRect(0,0,5,ROWS*TILE);ctx.fillRect(COLS*TILE-5,0,5,ROWS*TILE);drawHero(state.capitalX,state.capitalY)}
 function door(x,y){return B.find(b=>b.doorX===x&&b.doorY===y)}
 function block(x,y){if(x<0||y<0||x>=COLS||y>=ROWS)return true;return B.some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h&&!(x===b.doorX&&y===b.doorY))}
 function capitalMenu(title,txt){state.inMenu=true;overlay.classList.remove('hidden');overlay.innerHTML=`<div class="field-menu"><div class="field-menu-title">${title}</div><div class="field-menu-body"><div class="npc-box">${txt}</div><button id="capBack" class="menu-back">外へ出る</button></div><div class="field-menu-hint">A 決定　B 戻る</div></div>`;document.getElementById('capBack').onclick=()=>{state.inMenu=false;closeOverlay();drawCapital()};if(window.astriaSelectFirst)window.astriaSelectFirst()}
 function enter(b){
  if(b.id==='castle'){capitalMenu('🏰 レグナス城',state.story?.stage>=4?'国王「風の星晶石は西方の森、その先にある古代神殿に眠ると伝わる。まずは西へ向かうのだ。」':'城門兵「王がお待ちだ。父の紋章を見せてくれ。」');return}
  if(b.id==='inn'){capitalMenu('🏨 王都宿屋','女将「王都へようこそ。旅人なら休んでいきな。」<br><br><button id="capRest" class="story-choice">泊まる（無料）</button>');setTimeout(()=>{const r=document.getElementById('capRest');if(r)r.onclick=()=>{state.hp=state.maxHp;state.mp=state.maxMp;updateUI();say('王都の宿屋で休み、HPとMPが全回復した。')}},0);return}
  if(b.id==='church'){capitalMenu('✦ 星の教会','神官「四つの星晶石――風・水・炎・大地。そのすべてに異変が起きています。」');return}
  if(b.id==='weapon'){renderShop('weapon');return}
  if(b.id==='armor'){renderShop('armor');return}
  if(b.id==='item'){capitalMenu('🧪 王都道具屋','商人「アルネ村より珍しい品も扱っているよ。品揃えはこれから増やす予定だ。」');return}
 }
 window.enterCapital=function(){state.area='capital';state.capitalX=7;state.capitalY=10;state.inMenu=false;closeOverlay();drawCapital();say('王都レグナス。高い城壁の向こうに王城がそびえている。')}
 const oldMove=window.move;window.move=function(dx,dy){if(state.inBattle||state.inMenu)return;if(state.area!=='capital')return oldMove(dx,dy);const nx=state.capitalX+dx,ny=state.capitalY+dy;if(block(nx,ny)){say('そこには進めない。');return}state.capitalX=nx;state.capitalY=ny;drawCapital();const b=door(nx,ny);if(b)say(`${b.name}の入口だ。Aボタンで入れる。`);else if(ny===11&&(nx===7||nx===8)){state.area='world';state.x=4;state.y=8;drawCurrent();say('王都レグナスを出た。');}else say('王都レグナスの大通りを歩いている。')};
 const oldAction=window.action;window.action=function(){if(!state.inBattle&&!state.inMenu&&state.area==='capital'){const b=door(state.capitalX,state.capitalY);if(b)enter(b);else say('王都の人々が行き交っている。');return}oldAction()};
 const oldDraw=window.drawCurrent;window.drawCurrent=function(){if(state.area==='capital')drawCapital();else oldDraw()};
 // After Chapter 1 audience, A on the world-town tile can revisit the capital once unlocked.
 const oldEnterTown=window.enterTown;window.enterTown=function(){if(state.story?.stage>=4&&state.story?.flags?.includes('chapter1Complete')){enterCapital();return}oldEnterTown()};
 if(state.area==='capital')drawCapital();
})();