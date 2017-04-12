define(
app.config.default_service_routes,


//@TODO: figure out how to pass args as array
function (req){
  console.log(req);
  var state = {};

  state.preload = function() {
    if (app.config.devStart) {
      game.time.advancedTiming = true;
    }
  };

  state.create = function() {
    cameraSvc.fade('in');
    onscreen = onscreenSvc.get();
    cameraSvc.openFrameAndInitDialogue('diamondhouse');

    if (app.config.devStart === true){
    }

  };

  state.update = function() {


    cameraSvc.foreground([
    ]);

    //update onscreen objects
    // e.g. onscreen.truck.update();
  };

  state.render = function() {

    if (gameConfig.devStart) {
      game.debug.text(game.time.fps || '--', 10, 20, "#00ff00");
    }

  };

  return state;
});
