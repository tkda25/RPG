// Compatibility hotfix for saves created before the explorable cave update.
// Old saves may already have bossDefeated=true. The cave should still remain explorable.
(function(){
  window.enterCave = function(){
    state.area='dungeon';
    state.dungeonFloor=1;
    state.dungeonX=2;
    state.dungeonY=1;
    state.inMenu=false;
    closeOverlay();
    drawDungeon();
    say(state.bossDefeated
      ? '黒曜の洞窟 1F。黒曜の騎士はすでに倒されているが、洞窟の探索は続けられる。'
      : '黒曜の洞窟 1F。奥から不気味な気配がする。階段を探そう。');
  };
})();
