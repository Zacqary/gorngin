define([
  'services/stateAssetHandler'
], function(stateAssetHandler){

  var state = {};
  var stateName;

  state.init = function(name) {
    stateName = name;
    app.stateManager.currentState = stateName;
  };

  state.preload = function() {
  };

  state.create = function(){
    game.state.start(stateName, true, false);
  };

  return state;
});
