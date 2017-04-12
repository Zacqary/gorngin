define([
], function(stateAssetHandler, stateConfigs, loadScreenSvc,
                 dialogueSvc, worldMapSvc, menuSvc, musicSvc){

  var state = {};
  var stateName;

  state.init = function(name) {
    stateName = name;
    app.sm.currentState = stateName;
  };

  state.preload = function() {
  };

  state.create = function(){
    game.state.start(stateName, true, false);
  };

  return state;

});
