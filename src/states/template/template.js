define([
    'gorngin/dialogue/dialogueSvc',
    'gorngin/stateAssetHandler',
    'gorngin/cameraSvc',
    'states/{{name}}/onscreen',
    'states/{{name}}/config'
],
function (dialogueSvc, stateAssetHandler, cameraSvc, onscreenSvc, config){
  var state = {};

  state.preload = function() {
    stateAssetHandler.preload(config);
  };

  state.create = function() {
    app.stateManager.events.{{name}} = {
    };
    onscreen = onscreenSvc.get();
    cameraSvc.fadeInAndInitDialogue('{{name}}');
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
