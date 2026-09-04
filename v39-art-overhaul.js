// v39: detailed original pixel-art overhaul for Arne Village and inn.
(function(){
  window.astriaArtV39=true;
  var S=32,W=20,H=15;
  var oldMove=window.move,oldAction=window.action,oldDraw=window.drawCurrent;
  var V=[
    "TTTTTTTTTTTTTTTTTTTT","TGGGGGGPPGGGGGGGGGGT","TGGGHHHPPGGGHHHGGGGT","TGGGHHHPPGGGHHHGGGGT","TGGGDGGPPGGGDHGGGGGT",
    "TGGGGGGPPGGGGGGGGGGT","TWWWWWWBBWWWWWWWWGGT","TGGGGGGPPGGGGGGGGGGT","TGGHHGGPPGGGGHHHGGGT","TGGHDGGPPGGGGHDHGGGT",
    "TGGGGGGPPGGGGGGGGGGT","TGGGGGGPPPPPPPPGGGGT","TGGGGGGGGGGGGPPGGGGT","TGGGGGGGGGGGGPPGGGGT","TTTTTTTTTTTTTXXTTTTT"
  ];
  var doors={"4,4":"home","14,4":"weapon","3,9":"item","14,9":"inn"};
  var names={home:"民家",weapon:"武器屋",item:"道具屋",inn:"宿屋"};
  var NPC=[
    {id:"tom",name:"トム",x:9,y:3,hair:"#5b351f",skin:"#efbd8c",body:"#3c67aa",accent:"#193a68",lines:["北の洞窟で変な音を聞いたんだ。夜は近づかない方がいいよ。","王都レグナスって、この村よりずっと大きいんだって！"]},
    {id:"mira",name:"ミラ",x:6,y:10,hair:"#70402f",skin:"#efbc8b",body:"#a74f67",accent:"#5b2940",lines:["旅に出るなら薬草は忘れないでね。","あなたのお父さん、昔は村で一番剣が強かったのよ。"]},
    {id:"guard",name:"衛兵ローデン",x:15,y:11,hair:"#4b3328",skin:"#d8a777",body:"#65758b",accent:"#303b48",lines:["北の洞窟で魔物が増えている。装備を整えて向かえ。","王都から星晶石についての知らせが届いている。"]}
  ];
  var I=[
    "####################","#....bbbb....bbbb..#","#....bbbb....bbbb..#","#..................#","#....rrrrrrrr......#",
    "#....rrrrrrrr......#","#.......CCCC.......#","#.......CNC........#","#.......CCCC.......#","#..................#",
    "#..SS..........SS..#","#..SS..........SS..#","#..................#","#.........E........#","#########XX#########"
  ];
  if(state.townX==null){state.townX=9;state.townY=13}
  if(state.interiorX==null){state.interiorX=10;state.interiorY=13}
  if(!state.faceTalkIndex)state.faceTalkIndex={};

  function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
  function grass(x,y){R(x,y,S,S,"#4d913f");R(x,y+25,S,7,"#438238");R(x+5,y+6,2,5,"#2f6d31");R(x+7,y+8,2,3,"#71ae54");R(x+22,y+19,2,5,"#2e6f31");R(x+27,y+8,2,3,"#6faa52")}
  function path(x,y){R(x,y,S,S,"#a99f82");R(x+1,y+1,S-2,S-2,"#b9b093");R(x+3,y+5,10,4,"#c9c0a4");R(x+18,y+19,11,4,"#93896f");R(x+7,y+25,5,3,"#817861")}
  function water(x,y){R(x,y,S,S,"#2368a7");R(x,y+20,S,12,"#1b5a94");R(x+3,y+7,13,2,"#63a9dd");R(x+18,y+16,10,2,"#58a0d6");R(x+7,y+25,12,2,"#79bce9")}
  function bridge(x,y){R(x,y,S,S,"#5a3926");for(var yy=2;yy<S;yy+=6){R(x+1,y+yy,S-2,4,"#9a6539");R(x+2,y+yy+1,S-4,1,"#bd8350")}R(x+3,y,3,S,"#d1a25c");R(x+26,y,3,S,"#d1a25c")}
  function tree(x,y){grass(x,y);R(x+13,y+20,7,12,"#634021");R(x+4,y+8,25,17,"#154927");R(x+7,y+4,21,18,"#206334");R(x+11,y+2,14,14,"#2f813f");R(x+14,y+5,6,4,"#68b159")}
  function flower(x,y){grass(x,y);R(x+3,y+19,26,8,"#5d3e25");var cs=["#f36b7f","#ffd15b","#ef7ca7","#fff1a8"];for(var i=0;i<4;i++){R(x+6+i*6,y+14,3,3,cs[i]);R(x+7+i*6,y+17,1,4,"#2e7034")}}
  function well(x,y){grass(x,y);R(x+5,y+11,22,15,"#555b60");R(x+7,y+13,18,11,"#777d80");R(x+9,y+15,14,7,"#1d5f8f");R(x+4,y+9,24,4,"#3b3f42")}
  function house(x,y,door,type){
    var roof=type==="inn"?"#9a3d32":type==="weapon"?"#496aa1":type==="item"?"#a46a2e":"#884139";
    R(x,y,S,S,"#bda77d");R(x,y,S,11,"#453127");R(x+1,y+1,S-2,8,roof);R(x+3,y+12,S-6,20,"#cbbb93");R(x+3,y+13,S-6,3,"#dbcaa0");
    if(door){R(x+9,y+13,14,19,"#493022");R(x+11,y+15,10,17,"#69462d");R(x+19,y+22,2,2,"#efc75a")}
    else{R(x+7,y+19,18,9,"#315d6f");R(x+9,y+20,14,3,"#78b5c9");R(x+15,y+19,2,9,"#244654")}
  }
  function person(x,y,o){
    var X=x*S+4,Y=y*S+1;R(X+8,Y+29,14,3,"rgba(0,0,0,.25)");R(X+8,Y+2,14,5,o.hair);R(X+5,Y+6,20,7,o.hair);R(X+8,Y+11,14,9,o.skin);
    R(X+11,Y+14,2,2,"#1a1a1a");R(X+18,Y+14,2,2,"#1a1a1a");R(X+6,Y+20,20,10,o.body);R(X+3,Y+22,5,7,o.skin);R(X+24,Y+22,5,7,o.skin);R(X+8,Y+30,6,2,o.accent);R(X+18,Y+30,6,2,o.accent)
  }
  function hero(x,y){person(x,y,{hair:"#3e332e",skin:"#efbd8b",body:"#315fc0",accent:"#172f65"});var X=x*S+4,Y=y*S+1;R(X+24,Y+5,3,18,"#d8dfe4");R(X+22,Y+20,7,3,"#e0b448")}
  function drawVillage(){
    ctx.imageSmoothingEnabled=false;
    for(var y=0;y<H;y++)for(var x=0;x<W;x++){var ch=V[y][x],X=x*S,Y=y*S;if(ch==="G")grass(X,Y);else if(ch==="P")path(X,Y);else if(ch==="W")water(X,Y);else if(ch==="B")bridge(X,Y);else if(ch==="T")tree(X,Y);else if(ch==="H")house(X,Y,false,"home");else if(ch==="D")house(X,Y,true,doors[x+","+y]||"home");else path(X,Y)}
    flower(2*S,5*S);well(10*S,9*S);flower(16*S,8*S);NPC.forEach(function(n){person(n.x,n.y,n)});hero(state.townX,state.townY)
  }

  function floor(x,y){R(x,y,S,S,"#725034");for(var xx=1;xx<S;xx+=8){R(x+xx,y,2,S,"#4b3223");R(x+xx+3,y+3,1,S-6,"#956943")}R(x,y+15,S,2,"#573a26")}
  function wall(x,y){R(x,y,S,S,"#2b2e31");for(var yy=2;yy<S;yy+=8){for(var xx=-6;xx<S;xx+=16){var off=(yy/8)%2?8:0;R(x+xx+off,y+yy,14,6,"#454a4d");R(x+xx+off+2,y+yy+1,10,2,"#606669")}}}
  function bed(x,y){floor(x,y);R(x+4,y+3,24,27,"#3e2b21");R(x+7,y+5,18,22,"#e8dfca");R(x+7,y+17,18,10,"#8e2f43");R(x+9,y+19,14,2,"#d9ac4c")}
  function rug(x,y){floor(x,y);R(x+2,y+2,28,28,"#6f2132");R(x+5,y+5,22,22,"#b33b48");R(x+8,y+8,16,2,"#d9ae4f");R(x+8,y+22,16,2,"#d9ae4f")}
  function counter(x,y){floor(x,y);R(x+2,y+8,28,20,"#4a2e20");R(x,y+6,32,7,"#9c673b");R(x+5,y+12,22,3,"#6c452d")}
  function shelf(x,y){floor(x,y);R(x+3,y+2,26,27,"#3b281e");R(x+5,y+5,22,21,"#67462d");for(var yy=8;yy<26;yy+=7)R(x+5,y+yy,22,3,"#39271c");R(x+7,y+6,3,6,"#78945d");R(x+14,y+14,3,6,"#a45d52");R(x+21,y+21,3,5,"#5879a8")}
  function torch(x,y){R(x-2,y+5,4,10,"#593822");R(x-5,y+2,10,4,"#8f4f25");var f=(Date.now()/140|0)%3;R(x-4,y-6-f,8,10+f,"#e85f20");R(x-2,y-4-f,4,7+f,"#ffb92d");R(x,y-2-f,2,3,"#fff3a0")}
  function drawInn(){
    ctx.imageSmoothingEnabled=false;
    for(var y=0;y<H;y++)for(var x=0;x<W;x++){var ch=I[y][x],X=x*S,Y=y*S;if(ch==="#")wall(X,Y);else if(ch==="b")bed(X,Y);else if(ch==="r")rug(X,Y);else if(ch==="C")counter(X,Y);else if(ch==="S")shelf(X,Y);else floor(X,Y)}
    torch(3*S+16,3*S+16);torch(16*S+16,3*S+16);torch(3*S+16,12*S+16);torch(16*S+16,12*S+16);
    person(8,7,{hair:"#6d402e",skin:"#efbc8b",body:"#a54a63",accent:"#572b3c"});hero(state.interiorX,state.interiorY)
  }
  function blockedVillage(x,y){if(x<0||y<0||x>=W||y>=H)return true;if(["T","H","W"].includes(V[y][x]))return true;if(NPC.some(function(n){return n.x===x&&n.y===y}))return true;if((x===10&&y===9)||(x===2&&y===5)||(x===16&&y===8))return true;return false}
  function blockedInn(x,y){if(x<0||y<0||x>=W||y>=H)return true;return ["#","b","C","S","N"].includes(I[y][x])}
  function portrait(o){
    var c=document.createElement("canvas");c.width=64;c.height=64;var q=c.getContext("2d");q.imageSmoothingEnabled=false;q.fillStyle="#0d151d";q.fillRect(0,0,64,64);
    q.fillStyle=o.hair;q.fillRect(14,7,36,11);q.fillRect(9,16,46,11);q.fillStyle=o.skin;q.fillRect(14,22,36,29);q.fillStyle="#1b1b1b";q.fillRect(22,33,4,4);q.fillRect(39,33,4,4);q.fillRect(30,43,6,3);q.fillStyle=o.body;q.fillRect(8,52,48,12);q.fillStyle=o.accent;q.fillRect(8,60,48,4);return c.toDataURL()
  }
  function talk(n){
    var i=(state.faceTalkIndex[n.id]||0)%n.lines.length;state.faceTalkIndex[n.id]=i+1;state.inMenu=true;overlay.classList.remove("hidden");
    overlay.innerHTML='<div class="field-menu"><div class="field-menu-title">'+n.name+'</div><div class="field-menu-body"><div class="npc-box portrait-dialog-v39"><img src="'+portrait(n)+'"><div>'+n.lines[i]+'</div></div><button id="v39close" class="menu-back">閉じる</button></div></div>';
    document.getElementById("v39close").onclick=function(){state.inMenu=false;closeOverlay();drawVillage()};if(window.astriaSelectFirst)window.astriaSelectFirst()
  }
  window.enterArneVillage=function(){state.area="town";state.townX=9;state.townY=13;state.inMenu=false;closeOverlay();drawVillage();say("アルネ村。")};
  window.drawTown=drawVillage;
  window.drawCurrent=function(){if(state.area==="town"){drawVillage();return}if(state.area==="interior"&&state.interiorType==="inn"){drawInn();return}oldDraw.apply(this,arguments)};
  window.move=function(dx,dy){
    if(state.inBattle||state.inMenu)return;
    if(state.area==="town"){state.facing=dx>0?"right":dx<0?"left":dy<0?"up":"down";var nx=state.townX+dx,ny=state.townY+dy;if(blockedVillage(nx,ny)){say("そこには進めない。");return}state.townX=nx;state.townY=ny;drawVillage();if(V[ny][nx]==="D")say((names[doors[nx+","+ny]]||"建物")+"の入口だ。Aボタンで入れる。");if(V[ny][nx]==="X"){state.area="world";state.worldX=9;state.worldY=19;drawCurrent();say("アルネ村を出た。")}return}
    if(state.area==="interior"&&state.interiorType==="inn"){state.facing=dx>0?"right":dx<0?"left":dy<0?"up":"down";var ix=state.interiorX+dx,iy=state.interiorY+dy;if(blockedInn(ix,iy)){say("そこには進めない。");return}state.interiorX=ix;state.interiorY=iy;if(I[iy][ix]==="X"){state.area="town";state.interiorType=null;state.townX=14;state.townY=10;drawVillage();say("宿屋を出た。");return}drawInn();return}
    oldMove(dx,dy)
  };
  window.action=function(){
    if(!state.inBattle&&!state.inMenu&&state.area==="town"){var key=state.townX+","+state.townY;if(V[state.townY][state.townX]==="D"&&doors[key]==="inn"){state.area="interior";state.interiorType="inn";state.interiorX=10;state.interiorY=13;closeOverlay();drawInn();say("宿屋。女将エルナに話しかけよう。");return}var n=NPC.find(function(v){return Math.abs(v.x-state.townX)+Math.abs(v.y-state.townY)<=1});if(n){talk(n);return}}
    if(!state.inBattle&&!state.inMenu&&state.area==="interior"&&state.interiorType==="inn"&&Math.abs(state.interiorX-8)+Math.abs(state.interiorY-7)<=2){var e={name:"女将エルナ",hair:"#6d402e",skin:"#efbc8b",body:"#a54a63",accent:"#572b3c"};state.inMenu=true;overlay.classList.remove("hidden");overlay.innerHTML='<div class="field-menu"><div class="field-menu-title">女将エルナ</div><div class="field-menu-body"><div class="npc-box portrait-dialog-v39"><img src="'+portrait(e)+'"><div>いらっしゃいませ。旅の疲れを癒していきますか？</div></div><div class="field-menu-list"><button id="v39rest">泊まる</button><button id="v39no">やめる</button></div></div></div>';document.getElementById("v39rest").onclick=function(){state.hp=state.maxHp;state.mp=state.maxMp;updateUI();state.inMenu=false;closeOverlay();drawInn();say("HPとMPが全回復した。")};document.getElementById("v39no").onclick=function(){state.inMenu=false;closeOverlay();drawInn()};if(window.astriaSelectFirst)window.astriaSelectFirst();return}
    oldAction()
  };
  var st=document.createElement("style");st.textContent='.portrait-dialog-v39{display:grid!important;grid-template-columns:72px 1fr!important;gap:12px!important;align-items:center!important}.portrait-dialog-v39 img{width:64px;height:64px;image-rendering:pixelated;border:3px solid #f4f4f4;background:#0d151d}';document.head.appendChild(st);
  if(state.area==="town")drawVillage();if(state.area==="interior"&&state.interiorType==="inn")drawInn();
})();