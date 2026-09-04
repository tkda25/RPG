// v27: text-fit and scroll safety for all dialogue/menu screens.
(function(){
 const style=document.createElement('style');
 style.textContent=`
  #overlay{justify-content:center!important;overflow:hidden!important}
  .field-menu{height:min(94%,440px)!important;max-height:94%!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
  .field-menu-title{flex:0 0 auto!important;white-space:normal!important;overflow-wrap:anywhere!important}
  .field-menu-body{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;padding-right:4px!important}
  .field-menu-hint{flex:0 0 auto!important}
  .npc-box,.menu-card,.story-scene p,.shop-choice,.shop-item,.quest-report,.report-card{white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important}
  .story-scene{min-height:min-content!important;padding-bottom:6px!important}
  .story-scene p{font-size:clamp(12px,2.2vw,16px)!important;line-height:1.55!important}
  .story-portrait{font-size:clamp(30px,7vw,48px)!important}
  .story-choice{flex:0 0 auto!important}
  .shop-list{min-height:min-content!important}.shop-choice{min-height:54px!important}
  .field-menu-body::-webkit-scrollbar{width:7px}.field-menu-body::-webkit-scrollbar-thumb{background:#64748b;border-radius:8px}
  @media(max-width:760px){
   .field-menu{height:96%!important;max-height:96%!important;padding:8px!important}
   .field-menu-title{font-size:16px!important;padding:2px 3px 6px!important;margin-bottom:5px!important}
   .field-menu-body{gap:5px!important}
   .npc-box,.menu-card,.shop-choice,.shop-item,.report-card{font-size:11px!important;line-height:1.35!important;padding:7px!important}
   .story-scene{gap:6px!important}.story-scene h2{font-size:15px!important}.story-scene p{font-size:11px!important;line-height:1.4!important}
   .story-portrait{font-size:26px!important}.story-choice{padding:7px!important;font-size:11px!important}
   .field-menu-list{gap:4px!important}.field-menu-list button,.menu-back,.equip-choice,.skill-node{padding:7px 8px!important;font-size:11px!important;min-height:34px!important}
   .field-menu-hint{font-size:8px!important;margin-top:3px!important}
  }
  @media(max-height:700px){
   .field-menu{height:97%!important}.story-portrait{font-size:24px!important}.story-scene p{font-size:10px!important;line-height:1.32!important}
   .npc-box,.menu-card,.shop-choice{font-size:10px!important;padding:6px!important}
  }
 `;
 document.head.appendChild(style);
})();