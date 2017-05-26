var app = {};
var music;
app.dialogueManager = {};

/*
  Config Helpers
*/

app.configHelpers = {};
app.configHelpers.getURLParameter = function(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
};

app.configHelpers.getBrowser = function(){
    var ua= navigator.userAgent, tem,
    M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
    }
    if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem !== null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem= ua.match(/version\/(\d+)/i))!== null) M.splice(1, 1, tem[1]);
    return M.join(' ');
};

app.browser = app.configHelpers.getBrowser();

app.configHelpers.getDefaultServices = function() {
  var services = [];
  for (var i = 0; i < app.config.default_service_routes.length; i ++) {
    var a = app.config.default_service_routes[i].split('/');
    services.push(a[a.length - 1]);
  }
};

/*
  State Manager
*/

app.stateManager = {
  currentDialogue: {},
  events      : {
    highway: {
      test: function() {

      }
    }
  }, //story events
  inv: [

  ], //player inventory
  invEval     : {
  }, //inventory that can be evaluated (example `money: 20`)
  choicesSelected: [],
  puc         : {}, //player update control
  foreground  : [], //active objects to be added to foreground group
  currentState: ''
};

if (app.configHelpers.getURLParameter('items')) {
  var items = app.configHelpers.getURLParameter('items').split(',');
  for (var i = 0; i < items.length; i ++) {
    app.stateManager.inv.push(items[i]);
  }
}

app.stateManager.removeFromInv = function(item) {
  var index = app.stateManager.inv.indexOf(item);
  app.stateManager.inv.splice(index, 1);
};

//Save functionality
app.stateManager.saveGame = function(slot){
  if (!localStorage.getItem('norcofarawaylights')){
    localStorage.setItem('norcofarawaylights', '{}');
  }
  var gorLocalStorage = JSON.parse(localStorage.getItem('norcofarawaylights'));
  gorLocalStorage['slot_' + slot] = {
    "inv" : app.stateManager.inv
  };

  initSaveText = function() {
    var saveText = game.add.text(600, 370, 'SAVING...',
                   {font: "15px munroregular",
                    fill: "#ffff00", align: "center" }
                  );

    saveText.fixedToCamera = true;
    saveText.cameraOffset.setTo(600, 370);
    saveText.anchor.set(0.5);
    saveText.alpha = 0;
    var saveTextTween = game.add.tween(saveText).to({ alpha: 1 }, 1700, Phaser.Easing.Linear.None, true);
    saveTextTween.onComplete.add(function(){
      game.add.tween(saveText).to({ alpha: 0 }, 1700, Phaser.Easing.Linear.None, true);
    });
    if (app.stateManager.puc.playerUIGroup) {
      if (app.stateManager.puc.playerUIGroup.getAt(0)._text === saveText._text) {
        app.stateManager.puc.playerUIGroup.removeChildAt(0);
      }
      app.stateManager.puc.playerUIGroup.addAt(saveText, 0);
    }
  };

  localStorage.setItem('norcofarawaylights', JSON.stringify(gorLocalStorage));
  initSaveText();
};

app.stateManager.getSaveObj = function(slot){
  var gorLocalStorage = JSON.parse(localStorage.getItem('norcofarawaylights'));
  if (gorLocalStorage) {
    return gorLocalStorage['slot_' + slot];
  } else {
    return false;
  }
};

app.stateManager.loadGame = function(slot) {
  var gorLocalStorage = JSON.parse(localStorage.getItem('norcofarawaylights'));
  if (gorLocalStorage['slot_' + slot]){
    app.stateManager.inv = gorLocalStorage['slot_' + slot].inv;
  }
};

//Player update control (populated by gorngin/playerCtrl.js)
app.stateManager.puc = {};

app.stateManager.obtained = function(item) {
  var obtained = app.stateManager.inv.indexOf(item) > -1 ? true : false;
  return obtained;
};

/*
  Config
*/

app.config = {
  browser: app.configHelpers.browser,
	title: 'Game',
	defaultfont: 'munroregular',
  music: 0.3,
  soundfx: 0.1,
  borderType: app.configHelpers.getURLParameter('bordertype') || 'landscape',
  messagespeed: app.configHelpers.getURLParameter('messagespeed') || 'normal',
  canvas_width: 700,
  canvas_height: 387,

  // sounds that are shared across all states
  common_sounds: [
    'lightclick',
    'confirm'
  ],

  // sprites that are shared across all states
  common_sprites: [
    'backbutton',
    'dialoguecontinue',
    'fullscreen'
  ],

  demo: true,
  dev_canvas_width: 700, //700
	dev_canvas_height: 390, //350
  backgroundColor: '#000000',
  dialogue: {
    openFrom: 'BOTTOM',
    height: 137
  },
  enableFullscreen: app.configHelpers.getURLParameter('enablefullscreen') ===  'false' ? false : true,
  startState: 'example',
  startFullscreen: false,
  screencap_enabled: true,
  debug: app.configHelpers.getURLParameter('debug') ===  'false' ? false : true,
  liveDebug: false,
  unsupportedBrowser: app.browser.startsWith('Firefox'),
  devStart: false,
  devStartState: 'example',
  devStartMusic: ''
};

var game = new Phaser.Game(app.config.canvas_width, app.config.canvas_height, Phaser.CANVAS, 'game');
app.devRender = function() {
  if (app.config.devStart && app.config.debug || app.config.liveDebug) {
    game.time.advancedTiming = true;
    game.debug.text("FPS: " + game.time.fps || 'FPS: --', 10, 20, "#00ff00");
    //var pos = game.input.activePointer.position;
    //game.debug.text("x:" + pos.x + " y:" + pos.y, 10, 35, "#00ff00");
  }
};
