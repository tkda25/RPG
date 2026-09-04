// v25: fully selectable item shop with product details and quantity purchase.
(function(){
  if(state.highHerbs==null)state.highHerbs=0;
  if(state.magicWaters==null)state.magicWaters=0;
  if(state.smokeOrbs==null)state.smokeOrbs=0;

  const products=[
    {id:'herb',name:'薬草',price:15,desc:'HPを30回復する。',count:()=>state.herbs||0,add:q=>state.herbs=(state.herbs||0)+q},
    {id:'highHerb',name:'上薬草',price:40,desc:'HPを80回復する。',count:()=>state.highHerbs||0,add:q=>state.highHerbs=(state.highHerbs||0)+q},
    {id:'magicWater',name:'魔法の水',price:35,desc:'MPを15回復する。',count:()=>state.magicWaters||0,add:q=>state.magicWaters=(state.magicWaters||0)+q},
    {id:'smokeOrb',name:'けむり玉',price:30,desc:'戦闘から逃げやすくなる道具。',count:()=>state.smokeOrbs||0,add:q=>state.smokeOrbs=(state.smokeOrbs||0)+q}
  ];

  let shopOpen=false;
  const A=document.getElementById('btnA'),B=document.getElementById('btnB');
  const prevA=A&&A.onclick,prevB=B&&B.onclick;
  const oldAction=window.action;

  function persist(){try{localStorage.setItem('astria-save',JSON.stringify({...state,inMenu:false,inBattle:false}));localStorage.setItem('astria-save-backup',JSON.stringify({...state,inMenu:false,inBattle:false}))}catch(e){}}
  function selectFirst(){if(window.astriaSelectFirst)window.astriaSelectFirst();else requestAnimationFrame(()=>{const b=overlay.querySelector('button:not([disabled])');if(b)b.classList.add('menu-selected')})}
  function shopShell(title,body){
    state.inMenu=true;shopOpen=true;overlay.classList.remove('hidden');
    overlay.innerHTML=`<div class="field-menu"><div class="field-menu-title">${title}</div><div class="field-menu-body">${body}</div><div class="field-menu-hint">スティック 選択　A 決定　B 戻る</div></div>`;
    selectFirst();
  }
  function renderList(){
    shopShell('🧪 道具屋',`
      <div class="npc-box">店員「いらっしゃい！ 欲しいものを選んでね。」<br>所持金 <strong>${state.gold}G</strong></div>
      <div class="shop-list">
        ${products.map((p,i)=>`<button class="shop-choice" data-item="${i}"><span><strong>${p.name}</strong><small>${p.desc}</small></span><span>${p.price}G<br><small>所持 ${p.count()}</small></span></button>`).join('')}
      </div>
      <button id="shopExit" class="menu-back">買い物をやめる</button>
    `);
    overlay.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>renderDetail(Number(b.dataset.item)));
    document.getElementById('shopExit').onclick=closeShop;
  }
  function renderDetail(i){
    const p=products[i];
    shopShell(p.name,`
      <div class="menu-card"><strong>${p.name}</strong><small>${p.desc}</small><small>価格：${p.price}G　所持：${p.count()}個</small><small>所持金：${state.gold}G</small></div>
      <div class="field-menu-list quantity-list">
        <button data-qty="1">1個買う <span>${p.price}G</span></button>
        <button data-qty="3">3個買う <span>${p.price*3}G</span></button>
        <button data-qty="5">5個買う <span>${p.price*5}G</span></button>
        <button id="detailBack">商品一覧へ戻る</button>
      </div>
    `);
    overlay.querySelectorAll('[data-qty]').forEach(b=>b.onclick=()=>buy(p,Number(b.dataset.qty),i));
    document.getElementById('detailBack').onclick=renderList;
  }
  function buy(p,qty,i){
    const total=p.price*qty;
    if(state.gold<total){
      shopShell('お金が足りない',`
        <div class="npc-box">店員「ごめんね。${qty}個買うには ${total}G 必要だよ。」<br><br>今の所持金：${state.gold}G</div>
        <button id="moneyBack" class="menu-back">戻る</button>
      `);
      document.getElementById('moneyBack').onclick=()=>renderDetail(i);
      return;
    }
    state.gold-=total;p.add(qty);updateUI();persist();
    shopShell('購入しました',`
      <div class="npc-box"><strong>${p.name} × ${qty}</strong> を ${total}G で購入した！<br><br>所持：${p.count()}個<br>残り：${state.gold}G</div>
      <div class="field-menu-list">
        <button id="buyMore">同じ商品をもう一度見る</button>
        <button id="backList">商品一覧へ戻る</button>
      </div>
    `);
    document.getElementById('buyMore').onclick=()=>renderDetail(i);
    document.getElementById('backList').onclick=renderList;
  }
  function closeShop(){
    shopOpen=false;state.inMenu=false;closeOverlay();persist();drawCurrent();
    say('道具屋を出た。');
  }
  function nearItemClerk(){return state.area==='interior'&&state.interiorType==='item'&&Math.abs((state.interiorX||8)-8)+Math.abs((state.interiorY||9)-4)<=2}

  window.action=function(){
    if(!state.inBattle&&!state.inMenu&&nearItemClerk()){renderList();return}
    oldAction();
  };

  if(A)A.onclick=function(){
    if(shopOpen){
      const selected=overlay.querySelector('button.menu-selected:not([disabled])')||overlay.querySelector('button:not([disabled])');
      if(selected)selected.click();
      return;
    }
    if(prevA)prevA.call(A);
  };
  if(B)B.onclick=function(){
    if(shopOpen){renderList();return}
    if(prevB)prevB.call(B);
  };

  const style=document.createElement('style');
  style.textContent=`
    .shop-choice{width:100%;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;text-align:left;border:2px solid #64748b;border-radius:8px;background:#0f172a;color:#f8fafc;padding:10px 12px;font:inherit}
    .shop-choice span:last-child{text-align:right;color:#fde68a;font-weight:800}.shop-choice small{display:block;color:#cbd5e1;font-weight:500;line-height:1.35;margin-top:3px}
    .shop-choice.menu-selected{border-color:#facc15;background:#1e293b}.quantity-list{grid-template-rows:repeat(4,minmax(0,1fr))!important}
  `;document.head.appendChild(style);
})();