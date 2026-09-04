// v26: cleaner quest UI + reliable villager conversations.
(function(){
  // Remove the always-on objective bar; objective remains available from the menu/report.
  const hud=document.querySelector('.story-hud');
  if(hud)hud.style.display='none';

  const villagers=[
    {name:'少年',lines:['北の洞窟で変な声を聞いたんだ。夜は絶対に近づかない方がいいよ！','王都レグナスって、ここよりずっと大きい町なんだって。いつか行ってみたいな。']},
    {name:'おばさん',lines:['旅に出るなら薬草は持った？ 道具屋で買っておくと安心よ。','あなたのお父さんも昔、この村から旅立ったのよ。立派な人だったわ。']},
    {name:'兵士',lines:['北の洞窟で魔物が増えている。装備を整えてから向かえ。','王都から「星の封印」に関する命令が届いている。何かが起きているようだ。']}
  ];
  let talkIndex={};

  function currentTownNpcs(){
    // living-town.js keeps its NPC list private, so identify visible NPCs by their known roaming colors/roles
    return [
      {key:'boy',name:'少年',color:'#3767b1'},
      {key:'woman',name:'おばさん',color:'#9b4d66'},
      {key:'soldier',name:'兵士',color:'#65758b'}
    ];
  }

  // Conversation is handled through the canvas NPC proximity already present in living-town.
  // Patch say() output into a proper dialogue window when a villager line is emitted.
  const oldSay=window.say;
  window.say=function(text){
    if(typeof text==='string' && /^(少年|おばさん|兵士)「/.test(text)){
      const m=text.match(/^(少年|おばさん|兵士)「(.*)」$/);
      if(m){
        const name=m[1];
        const v=villagers.find(x=>x.name===name);
        const idx=(talkIndex[name]||0)%v.lines.length;
        talkIndex[name]=idx+1;
        oldSay.call(this,`${name}「${v.lines[idx]}」`);
        return;
      }
    }
    oldSay.apply(this,arguments);
  };

  // Add quest objective to Report instead of occupying the play field.
  const observer=new MutationObserver(()=>{
    const title=overlay.querySelector('.field-menu-title');
    if(!title||title.textContent.trim()!=='レポート'||overlay.querySelector('.quest-report'))return;
    const card=overlay.querySelector('.report-card');
    if(!card)return;
    const q=document.createElement('div');q.className='quest-report';
    const st=state.story&&state.story.stage||0;
    const txt=st<=0?'アルネ村で旅立ちの朝を迎える':st===1?'北の洞窟で異変の正体を探る':st===2?'父の紋章をアルネ村へ持ち帰る':st===3?'王都レグナスの使者に会う':st===4?'4つの星晶石を探す旅へ':'アストリアを巡る冒険';
    q.innerHTML=`<strong>現在の目的</strong><small>${txt}</small>`;
    card.insertBefore(q,card.firstChild);
  });
  observer.observe(overlay,{childList:true,subtree:true});

  const style=document.createElement('style');
  style.textContent=`.quest-report{display:grid;gap:4px;padding:8px;border:1px solid #475569;border-radius:7px;background:#111827}.quest-report strong{color:#fde68a}.quest-report small{color:#f8fafc;line-height:1.4}`;
  document.head.appendChild(style);
})();