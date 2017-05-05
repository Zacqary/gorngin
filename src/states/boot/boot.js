define(['gorngin/cameraSvc', 'gorngin/audioSvc'], boot);

function boot(cameraSvc, audioSvc){

  var boot  = {};

  var stateConfig = {};

  boot.init = function () {
    var canvasWidth, canvasHeight;
    audioSvc.preloadTracks();
    if (typeof process !== "undefined" && process.versions['node-webkit']) {
        app.webkit = true;
    }
    game.stage.backgroundColor = app.config.backgroundColor;
    if(this.game.device.desktop) {
      canvasWidth = app.config.devStart || app.config.camera_mode ? app.config.dev_canvas_width : app.config.canvas_width;
      canvasHeight = app.config.devStart || app.config.camera_mode ? app.config.dev_canvas_height : app.config.canvas_height;
      game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
      game.scale.fullScreenTarget = document.getElementById('wrapper');
      game.scale.setMinMax(canvasWidth, canvasHeight, 1220, 700); //(minX, minY, maxX, maxY);
      game.scale.forceLandscape = true;
      game.scale.pageAlignVertically = true;
      game.scale.onFullScreenChange.add(function() {
        if (game.scale.isFullScreen && app.stateManager.puc && app.stateManager.puc.fullscreenButton) {
          app.stateManager.puc.fullscreenButton.alpha = 0;
          app.stateManager.puc.fullscreenButton.alive = 0;
        } else if (!game.scale.isFullScreen && app.stateManager.puc && app.stateManager.puc.fullscreenButton) {
          app.stateManager.puc.fullscreenButton.alpha = 1;
          app.stateManager.puc.fullscreenButton.alive = 1;
        }
      });
      game.scale.refresh();
    } else {
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      game.scale.minWidth = 500;
      game.scale.minHeight = 300;
      game.scale.maxWidth = 500;
      game.scale.maxHeight = 300;
      game.scale.forceLandscape = true;
      game.scale.pageAlignHorizontally = true;
      game.scale.updateLayout(true);
      if(window.orientation === 0) {
        $('#changedeviceorientation').css('display:block');
      }
      $(window).on("orientationchange",function(event){
        if(window.orientation === 0) {
          $('#changedeviceorientation').css('display:block');
        } else {
          $('#changedeviceorientation').css('display:none');
        }
      });
    }
  };

  boot.preload = function () {
    // stateAssetHandler.preload(stateConfig);
  };

  boot.create = function () {
    $('.hideOnStart').css('display', 'none');

    //dev start if state requested in url
    if (app.configHelpers.getURLParameter('state')) {
      app.config.devStart = true;
      app.config.devStartState = app.configHelpers.getURLParameter('state');
    }

    if (app.config.devStart || app.config.camera_mode) {
      game.state.start('loadState', true, false, app.config.devStartState );
    } else {
      game.state.start('loadState', true, false, app.config.startState  );
    }
  };

  return boot;
}
