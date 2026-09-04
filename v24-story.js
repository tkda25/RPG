// v24: Chapter 1 story layer for LEGEND OF ASTRIA
(function(){
  if(state.story==null||typeof state.story!=='object')state.story={};
  const story=state.story;
  if(story.stage==null)story.stage=0;
  if(!Array.isArray(story.keyItems))story.keyItems=[];
  if(!Array.isArray(story.flags))story.flags=[];
  const has=f=>story.flags.includes(f);
  const flag=f=>{if(!has(f))story.flags.push(f)};
  const saveStory=()=>{try{localStorage.setItem('astria-save',JSON.stringify({...state,inBattle:false,inMenu:false}));localStorage.setItem('astria-save-backup',JSON.stringify({...state,inBattle:false,inMenu:false}))}catch(e){}};

  const style=document.createElement('style');
  style.textContent=`
    .story-hud{position:absolute;left:10px;right:10px;bottom:10px;z-index:12;pointer-events:none;display:flex;justify-content:center}
    .story-hud>div{max-width:92%;padding:7px 11px;border:2px solid rgba(255,255,255,.8);border-radius:8px;background:rgba(2,6,23,.88);font-size:12px;color:#f8fafc;box-shadow:0 4px 14px rgba(0,0,0,.35)}
    .story-hud b{color:#fde047}.story-scene{display:grid;gap:12px}.story-scene h2{margin:0;color:#fde68a;letter-spacing:2px}.story-scene p{margin:0;line-height:1.75}.story-portrait{font-size:48px;text-align:center}.story-choice{width:100%;border:2px solid #e5e7eb;border-radius:8px;background:#0f172a;color:white;padding:12px;font:inherit;font-weight:800}
  `;document.head.appendChild(style);
  const wrap=document.getElementById('game-wrap');
  const hud=document.createElement('div');hud.className='story-hud';hud.innerHTML='<div id="storyQuest"></div>';wrap.appendChild(hud);
  function questText(){
    if(story.stage<=0)return '序章：アルネ村で旅立ちの朝を迎える';
    if(story.stage===1)return '第1章：北の洞窟で異変の正体を探る';
    if(story.stage===2)return '第1章：父の紋章をアルネ村へ持ち帰る';
    if(story.stage===3)return '第1章：王都レグナスの使者に会う';
    if(story.stage===4)return '第1章 完：4つの星晶石を探す旅へ';
    return 'アストリアを巡る冒険';
  }
  function paintQuest(){const q=document.getElementById('storyQuest');if(q)q.innerHTML='<b>目的</b>　'+questText()}
  paintQuest();

  function scene(title,portrait,body,buttons){
    state.inMenu=true;overlay.classList.remove('hidden');
    overlay.innerHTML=`<div class="field-menu"><div class="field-menu-title">${title}</div><div class="field-menu-body"><div class="story-scene"><div class="story-portrait">${portrait}</div>${body}</div></div><div class="field-menu-hint">A 決定　B 戻る</div></div>`;
    const box=overlay.querySelector('.story-scene');
    buttons.forEach((b,i)=>{const el=document.createElement('button');el.className='story-choice'+(i===0?' menu-selected':'');el.textContent=b.label;el.onclick=b.action;box.appendChild(el)});
  }
  function closeScene(){state.inMenu=false;closeOverlay();drawCurrent();paintQuest();saveStory()}

  function intro1(){
    scene('LEGEND OF ASTRIA','🌠',`<h2>星が落ちた夜</h2><p>かつてこの世界は、四つの「星晶石」によって守られていた。<br>300年前、魔王ヴァルガスは四人の英雄に敗れ、その魂は星晶石へ封じられた――そう伝えられている。</p><p>そして今夜。辺境のアルネ村の空を、巨大な赤い星が切り裂いた。</p>`,[{label:'次へ',action:intro2}]);
  }
  function intro2(){
    scene('序章　アルネ村','🏡',`<h2>18年目の朝</h2><p>主人公はアルネ村で母と暮らす18歳の青年。幼い頃、父は「王国の任務へ向かう」と言い残したまま戻らなかった。</p><p>翌朝、王都の兵士が村へ駆け込む。</p><p>兵士「北の封印が破られた。魔物が増えている。村の外へ出る者は十分に気をつけろ！」</p>`,[{label:'母の話を聞く',action:intro3}]);
  }
  function intro3(){
    scene('旅立ち','👩',`<h2>父が残した剣</h2><p>母「あなたに隠していたことがあるの。お父さんはただの旅人じゃない。王国騎士だったの。」</p><p>母は古びた剣と、星形の小さな飾りを差し出した。</p><p>母「この剣は、あなたが旅立つ日が来たら渡してほしいと言われていたわ。」</p>`,[{label:'剣を受け取り、北の洞窟へ向かう',action:()=>{story.stage=1;flag('introSeen');if(!story.keyItems.includes('父の古剣'))story.keyItems.push('父の古剣');closeScene();say('父の古剣を受け取った。北の洞窟で起きている異変を調べよう。')}}]);
  }

  const oldStartBattle=startBattle;
  startBattle=function(enemy){
    if(enemy&&enemy.boss&&enemy.name==='黒曜の騎士'){
      enemy={...enemy,name:'ゴブリンロード',emoji:'👹',hp:78,maxHp:78,atk:14,def:5,xp:70,gold:90,boss:true};
    }
    oldStartBattle(enemy);
  };

  const oldWin=win;
  win=function(enemy){
    const boss=!!(enemy&&enemy.boss);
    oldWin(enemy);
    if(boss&&!has('chapter1Boss')){
      flag('chapter1Boss');story.stage=2;
      if(!story.keyItems.includes('父の紋章'))story.keyItems.push('父の紋章');
      setTimeout(()=>{scene('北の洞窟','⚔️',`<h2>父の紋章</h2><p>ゴブリンロードが倒れると、その首飾りから古い銀の紋章が落ちた。</p><p>主人公「これは……父さんの剣に刻まれている紋章と同じだ。」</p><p>紋章の裏には、小さく「REGNAS」と刻まれている。</p>`,[{label:'アルネ村へ戻る',action:closeScene}]);paintQuest();saveStory()},250);
    }
  };

  const oldEnterTown=enterTown;
  enterTown=function(){
    oldEnterTown();
    if(story.stage===2&&!has('villageReturn')){
      flag('villageReturn');story.stage=3;
      setTimeout(()=>scene('アルネ村','🛡️',`<h2>王都からの使者</h2><p>村へ戻ると、王国騎士の一団が待っていた。</p><p>使者「その紋章……どこで手に入れた？」</p><p>主人公が洞窟での出来事を話すと、使者の表情が変わる。</p><p>使者「王がお前に会いたいと仰せだ。王都レグナスへ来てほしい。」</p>`,[{label:'王都レグナスへ向かう',action:audience1}]),300);
      paintQuest();saveStory();
    }
  };

  function audience1(){
    scene('王都レグナス','🏰',`<h2>王との謁見</h2><p>数日の旅を経て、主人公は巨大な城壁に囲まれた王都レグナスへ到着した。</p><p>玉座の間で、王は父の紋章を長い間見つめる。</p><p>国王「そなたの父は18年前、魔王復活の兆しを追って姿を消した王国騎士だ。」</p>`,[{label:'父について尋ねる',action:audience2}]);
  }
  function audience2(){
    scene('王都レグナス','👑',`<h2>四つの星晶石</h2><p>国王「各地で四つの星晶石に異変が起きている。風、水、炎、大地――すべての封印を確認せねばならぬ。」</p><p>国王「そして、そなたの父が生きているならば、その行方も星晶石の先にあるはずだ。」</p><p>こうして主人公は、世界を巡る長い旅へ踏み出す。</p>`,[{label:'第1章を終える',action:()=>{story.stage=4;flag('chapter1Complete');state.gold+=120;updateUI();closeScene();say('第1章クリア！ 王から旅の支度金120Gを受け取った。次の目的は「風の星晶石」。')}}]);
  }

  const oldLoad=load;
  // load() has already executed before this extension. Show intro only for new or pre-story saves.
  setTimeout(()=>{
    if(!has('introSeen')&&!state.inBattle&&!state.inMenu){
      intro1();
    }else{
      paintQuest();
    }
  },500);

  window.astriaStory={intro:intro1,quest:questText};
})();