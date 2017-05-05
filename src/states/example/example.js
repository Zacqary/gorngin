define([
    'gorngin/dialogue/dialogueSvc',
    'gorngin/stateAssetHandler',
    'gorngin/cameraSvc',
    'states/example/onscreen',
    'states/example/config'
],
function (dialogueSvc, stateAssetHandler, cameraSvc, onscreenSvc, config){
  var state = {};

  state.preload = function() {
    stateAssetHandler.preload(config);
  };

  state.create = function() {
    app.stateManager.events.example = {
    };
    onscreen = onscreenSvc.get();
    cameraSvc.fadeInAndInitDialogue('example');
  };

  state.update = function() {


    cameraSvc.foreground([
    ]);

    //update onscreen objects
    // e.g. onscreen.truck.update();
  };

  state.render = function() {
    app.devRender();
  };

  return state;
});
