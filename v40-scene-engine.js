// v40.1: authoritative scene renderer for Arne Village + inn.
// Uses dedicated pixel-art assets, strict collision, and a bottom dialogue window.
(function(){
  'use strict';
  const TILE=32, COLS40=20, ROWS40=15;
  const gameWrap=document.getElementById('game-wrap');
  const btnA=document.getElementById('btnA'), btnB=document.getElementById('btnB');
  const prevMove=window.move, prevAction=window.action, prevDrawCurrent=window.drawCurrent;

  const VILLAGE=[
    'TTTTTTTTTTTTTTTTTTTT','TGGGGGGPPGGGGGGGGGGT','TGGGHHHPPGGGHHHGGGGT','TGGGHHHPPGGGHHHGGGGT','TGGGDGGPPGGGDHGGGGGT',
    'TGGGGGGPPGGGGGGGGGGT','TWWWWWWBBWWWWWWWWGGT','TGGGGGGPPGGGGGGGGGGT','TGGHHGGPPGGGGHHHGGGT','TGGHDGGPPGGGGHDHGGGT',
    'TGGGGGGPPGGGGGGGGGGT','TGGGGGGPPPPPPPPGGGGT','TGGGGGGGGGGGGPPGGGGT','TGGGGGGGGGGGGPPGGGGT','TTTTTTTTTTTTTXXTTTTT'
  ];
  const INN=[
    '####################','#....bbbb....bbbb..#','#....bbbb....bbbb..#','#..................#','#....rrrrrrrr......#',
    '#....rrrrrrrr......#','#.......CCCC.......#','#.......C.C........#','#.......CCCC.......#','#..................#',
    '#..SS..........SS..#','#..SS..........SS..#','#..................#','#.........E........#','#########XX#########'
  ];

  const doors={'4,4':'home','14,4':'weapon','3,9':'item','14,9':'inn'};
  const doorNames={home:'民家',weapon:'武器屋',item:'道具屋',inn:'宿屋'};
  const npcs=[
    {id:'tom',name:'トム',x:9,y:3,sprite:1,portrait:1,lines:['北の洞窟で変な音を聞いたんだ。夜は近づかない方がいいよ。','王都レグナスって、この村よりずっと大きいんだって！']},
    {id:'mira',name:'ミラ',x:6,y:10,sprite:2,portrait:2,lines:['旅に出るなら薬草は忘れないでね。','あなたのお父さん、昔は村で一番剣が強かったのよ。']},
    {id:'guard',name:'衛兵ローデン',x:15,y:11,sprite:3,portrait:3,lines:['北の洞窟で魔物が増えている。装備を整えて向かえ。','王都から星晶石についての知らせが届いている。']}
  ];

  const images={};
  let assetsReady=false;
  const assetDefs=window.ASTRIA_V40_ASSETS||{};
  function loadImage(key,src){return new Promise(resolve=>{const im=new Image();im.onload=()=>{images[key]=im;resolve()};im.onerror=()=>resolve();im.src=src})}
  Promise.all(Object.entries(assetDefs).map(([k,v])=>loadImage(k,v))).then(()=>{assetsReady=true;drawCurrent40()});

  const dialog=document.createElement('div');
  dialog.id='v40-dialog'; dialog.className='v40-dialog hidden';
  dialog.innerHTML='<div class="v40-portrait"></div><div class="v40-copy"><b class="v40-name"></b><div class="v40-text"></div></div><div class="v40-choice"></div>';
  gameWrap.appendChild(dialog);
  let dialogState=null;

  function showDialog({name,text,portrait=0,choice=null,onYes=null,onNo=null,onClose=null}){
    state.inMenu=true; dialogState={choice,onYes,onNo,onClose};
    dialog.querySelector('.v40-name').textContent=name||'';
    dialog.querySelector('.v40-text').textContent=text||'';
    const p=dialog.querySelector('.v40-portrait'); p.innerHTML='';
    if(images.portraits){const c=document.createElement('canvas');c.width=64;c.height=64;const q=c.getContext('2d');q.imageSmoothingEnabled=false;q.drawImage(images.portraits,portrait*64,0,64,64,0,0,64,64);p.appendChild(c)}
    const ch=dialog.querySelector('.v40-choice');
    if(choice) ch.innerHTML='<span class="selected">▶ はい</span><span>　いいえ</span>'; else ch.innerHTML='<span>▶ A / B</span>';
    dialog.classList.remove('hidden');
  }
  function closeDialog(){const cb=dialogState&&dialogState.onClose;dialogState=null;dialog.classList.add('hidden');state.inMenu=false;if(cb)cb();drawCurrent40()}
  function dialogA(){if(!dialogState)return false;if(dialogState.choice){const cb=dialogState.onYes;dialogState=null;dialog.classList.add('hidden');state.inMenu=false;if(cb)cb();drawCurrent40()}else closeDialog();return true}
  function dialogB(){if(!dialogState)return false;if(dialogState.choice){const cb=dialogState.onNo;dialogState=null;dialog.classList.add('hidden');state.inMenu=false;if(cb)cb();drawCurrent40()}else closeDialog();return true}

  function beginFrame(){
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';
    ctx.imageSmoothingEnabled=false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  function endFrame(){ctx.restore()}

  function drawSprite(index,gx,gy){
    if(!images.sprites)return;
    ctx.drawImage(images.sprites,index*32,0,32,32,gx*TILE,gy*TILE,32,32);
  }
  function drawBackdrop(key){
    if(images[key])ctx.drawImage(images[key],0,0,640,480);
    else {ctx.fillStyle='#111';ctx.fillRect(0,0,640,480)}
  }
  function drawVillage40(){
    beginFrame();
    drawBackdrop('arne_bg');
    npcs.forEach(n=>drawSprite(n.sprite,n.x,n.y));
    drawSprite(0,state.townX,state.townY);
    endFrame();
  }
  function drawInn40(){
    beginFrame();
    drawBackdrop('inn_bg');
    drawSprite(4,8,7);
    drawSprite(0,state.interiorX,state.interiorY);
    endFrame();
  }
  function drawCurrent40(){
    if(!assetsReady)return;
    if(state.area==='town')drawVillage40();
    else if(state.area==='interior'&&state.interiorType==='inn')drawInn40();
  }

  function villageBlocked(x,y){
    if(x<0||y<0||x>=COLS40||y>=ROWS40)return true;
    if(['T','H','W'].includes(VILLAGE[y][x]))return true;
    if(npcs.some(n=>n.x===x&&n.y===y))return true;
    if((x===10&&y===9)||(x===2&&y===5)||(x===16&&y===8))return true;
    return false;
  }
  function innBlocked(x,y){
    if(x<0||y<0||x>=COLS40||y>=ROWS40)return true;
    return ['#','b','C','S'].includes(INN[y][x]) || (x===8&&y===7);
  }

  function enterArne40(){state.area='town';state.townX=9;state.townY=13;state.inMenu=false;state.interiorType=null;closeOverlay();drawVillage40();say('アルネ村。')}
  window.enterArneVillage=enterArne40;
  window.drawTown=drawVillage40;

  function enterInn40(){state.area='interior';state.interiorType='inn';state.interiorX=10;state.interiorY=13;state.facing='up';state.inMenu=false;closeOverlay();drawInn40();say('アルネ村 宿屋。')}
  function leaveInn40(){state.area='town';state.interiorType=null;state.townX=14;state.townY=10;state.inMenu=false;drawVillage40();say('宿屋を出た。')}

  window.drawCurrent=function(){
    if(state.area==='town'){drawVillage40();return}
    if(state.area==='interior'&&state.interiorType==='inn'){drawInn40();return}
    prevDrawCurrent.apply(this,arguments);
  };

  window.move=function(dx,dy){
    if(dialogState||state.inBattle||state.inMenu)return;
    if(state.area==='town'){
      state.facing=dx>0?'right':dx<0?'left':dy<0?'up':'down';
      const nx=state.townX+dx,ny=state.townY+dy;
      if(villageBlocked(nx,ny)){say('そこには進めない。');return}
      state.townX=nx;state.townY=ny;drawVillage40();
      if(VILLAGE[ny][nx]==='D')say((doorNames[doors[nx+','+ny]]||'建物')+'の入口だ。Aボタンで入れる。');
      if(VILLAGE[ny][nx]==='X'){state.area='world';state.worldX=9;state.worldY=19;window.drawCurrent();say('アルネ村を出た。')}
      return;
    }
    if(state.area==='interior'&&state.interiorType==='inn'){
      state.facing=dx>0?'right':dx<0?'left':dy<0?'up':'down';
      const nx=state.interiorX+dx,ny=state.interiorY+dy;
      if(innBlocked(nx,ny)){say('そこには進めない。');return}
      state.interiorX=nx;state.interiorY=ny;
      if(INN[ny][nx]==='X'){leaveInn40();return}
      drawInn40();return;
    }
    prevMove(dx,dy);
  };

  window.action=function(){
    if(dialogState){dialogA();return}
    if(!state.inBattle&&!state.inMenu&&state.area==='town'){
      const key=state.townX+','+state.townY;
      if(VILLAGE[state.townY][state.townX]==='D'&&doors[key]==='inn'){enterInn40();return}
      const n=npcs.find(v=>Math.abs(v.x-state.townX)+Math.abs(v.y-state.townY)<=1);
      if(n){const i=(state.faceTalkIndex?.[n.id]||0)%n.lines.length;state.faceTalkIndex=state.faceTalkIndex||{};state.faceTalkIndex[n.id]=i+1;showDialog({name:n.name,text:n.lines[i],portrait:n.portrait});return}
    }
    if(!state.inBattle&&!state.inMenu&&state.area==='interior'&&state.interiorType==='inn'){
      if(Math.abs(state.interiorX-8)+Math.abs(state.interiorY-7)<=2){
        showDialog({name:'女将エルナ',text:'いらっしゃいませ。ひと晩 20ゴールドでお泊まりになれますよ。',portrait:4,choice:true,onYes:()=>{
          if(state.gold<20){showDialog({name:'女将エルナ',text:'20ゴールド必要ですよ。',portrait:4});return}
          state.gold-=20;state.hp=state.maxHp;state.mp=state.maxMp;updateUI();say('宿屋で休んだ。HPとMPが全回復した。');
        }});return;
      }
    }
    prevAction();
  };

  if(btnA){const oldA=btnA.onclick;btnA.onclick=function(e){if(dialogState){dialogA();return}if(oldA)oldA.call(btnA,e)}}
  if(btnB){const oldB=btnB.onclick;btnB.onclick=function(e){if(dialogState){dialogB();return}if(oldB)oldB.call(btnB,e)}}

  const css=document.createElement('style');
  css.textContent=`
    .v40-dialog{position:absolute;z-index:50;left:2.5%;right:2.5%;bottom:2.5%;min-height:118px;background:#07131f;border:4px double #eef3f7;box-shadow:0 0 0 3px #07131f,0 4px 18px rgba(0,0,0,.7);display:grid;grid-template-columns:72px 1fr auto;gap:12px;align-items:center;padding:10px 14px;color:#fff;pointer-events:none}
    .v40-dialog.hidden{display:none}.v40-portrait canvas{width:64px;height:64px;image-rendering:pixelated;border:2px solid #e7edf2}.v40-copy{min-width:0}.v40-name{display:block;font-size:16px;border-bottom:1px solid #8b9aaa;padding-bottom:5px;margin-bottom:7px}.v40-text{font-size:14px;line-height:1.55}.v40-choice{display:grid;gap:8px;font-size:15px;min-width:80px}.v40-choice .selected{color:#ffe66a}
    @media(max-width:760px){.v40-dialog{left:1.5%;right:1.5%;bottom:1.5%;min-height:92px;grid-template-columns:52px 1fr auto;gap:7px;padding:7px 9px}.v40-portrait canvas{width:48px;height:48px}.v40-name{font-size:11px;margin-bottom:4px}.v40-text{font-size:10px;line-height:1.35}.v40-choice{font-size:10px;min-width:58px;gap:5px}}
  `;
  document.head.appendChild(css);

  setTimeout(drawCurrent40,120);
})();