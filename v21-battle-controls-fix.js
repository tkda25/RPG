// v21: force field controller hidden for the full duration of battle.
(function(){
  const controls=document.querySelector('.game-controls');
  if(!controls)return;

  function syncBattleControls(){
    const battling=!!state.inBattle || document.body.classList.contains('in-battle');
    controls.style.setProperty('display',battling?'none':'grid','important');
    controls.style.setProperty('visibility',battling?'hidden':'visible','important');
    controls.style.setProperty('pointer-events',battling?'none':'auto','important');
  }

  const originalStartBattle=window.startBattle;
  window.startBattle=function(enemy){
    const result=originalStartBattle(enemy);
    controls.style.setProperty('display','none','important');
    controls.style.setProperty('visibility','hidden','important');
    controls.style.setProperty('pointer-events','none','important');
    return result;
  };

  const observer=new MutationObserver(syncBattleControls);
  observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  observer.observe(document.getElementById('overlay'),{attributes:true,attributeFilter:['class']});

  setInterval(syncBattleControls,150);
  syncBattleControls();
})();