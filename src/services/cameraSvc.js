define([
  'services/spriteClasses'
],

function (spriteClasses){

  var svc = {};

  (function(){
    if (app.config.screencap_enabled && (app.config.devStart || app.config.camera_mode)) {
      $('#wrapper').on('dblclick', function(){
        game.capture.screenshot(function(dataUrl) {
          window.open(dataUrl,
               '_blank');
        });
      });
    }
  })();

  svc.borders = {
    getDefault: function() {
      if (app.config.borderType === 'menu') {
        return svc.borders.getMenu();
      } else {
        return svc.borders.getLandscape();
      }
    },
    getLandscape: function(){
      var frame = new spriteClasses.Sprite({
        x: 0,
        y: 0,
        img: 'landscapeframe',
        animation: [
          {
            name: 'default',
            sequence: [16],
            speed: 5,
            play: false,
            loop: false
          },
          {
            name: 'openframe',
            sequence: [33,32,31,30,29,28,27,26,25,24,23,16],
            speed: 15,
            play: false,
            loop: false
          },
          {
            name: 'closeframe',
            sequence: [16,23,24,25,26,27,28,29,30,31,32],
            speed: 15,
            play: false,
            loop: false
          },
          {
            name: 'defaultOpenPortrait',
            sequence: [22],
            speed: 5,
            play: false,
            loop: false
          },
          {
            name: 'closePortrait',
            sequence: [22,21,20,19,18,17,16],
            speed: 25,
            play: false,
            loop: false
          },
          {
            name: 'openPortrait',
            sequence: [16,17,18,19,20,21,22],
            speed: 25,
            play: false,
            loop: false
          },
          {
            name: 'selectdialogue',
            sequence: [1,2,3,4,5,0],
            speed: 7,
            play: false,
            loop: false
          },
          {
            name: 'selectmenu',
            sequence: [6,7,8,9,10,0,10,9,8,7,6],
            speed: 7,
            play: false,
            loop: true
          },
          {
            name: 'selectmap',
            sequence: [11,12,13,14,15,0,15,14,13,12],
            speed: 7,
            play: false,
            loop: true
          }
        ],
        allowGravity: false,
        fixedToCamera: false,
        physics: 'ARCADE',
        collideWorldBounds: true,
        inputEnabled: false,
      });
      return frame;
    },
    getMenu: function(){
      return new spriteClasses.Sprite({
        x: 0,
        y: 0,
        img: 'landscapeframeportrait',
        allowGravity: false,
        fixedToCamera: false,
        physics: 'ARCADE',
        collideWorldBounds: true,
        inputEnabled: false,
        animation: [
          {
            name: 'default',
            sequence: [0],
            speed: 5,
            play: true,
            loop: true
          },
          {
            name: 'selectDialogue',
            sequence: [1,2,3,4,5,0],
            speed: 7,
            play: false,
            loop: false
          },
          {
            name: 'selectMenu',
            sequence: [6,7,8,9,10,0,10,9,8,7,6],
            speed: 7,
            play: false,
            loop: true
          },
          {
            name: 'selectMap',
            sequence: [11,12,13,14,15,0,15,14,13,12],
            speed: 7,
            play: false,
            loop: true
          }
        ]
      });
    },
    getFullscreen: function(){
      return new spriteClasses.Sprite({
        x: 0,
        y: 0,
        img: 'fullscreenframe',
        allowGravity: false,
        fixedToCamera: false,
        physics: 'ARCADE',
        collideWorldBounds: true,
        inputEnabled: false,
      });
    }
  };

  svc.fadeInAndInitDialogue = function(state, initElement, cb) {
    svc.fade('in');
    if (app.config.enableFullscreen) {
      svc.createFullscreenButton();
    }
    app.dialogueSvc.initializeDialogue(state, initElement, cb);
  };

  svc.createFullscreenButton = function() {
    app.stateManager.fullscreenButton = game.add.sprite(game.width - 30, 5, 'fullscreen');
    app.stateManager.fullscreenButton.scale.setTo(0.9, 0.9);
    app.stateManager.fullscreenButton.fixedToCamera = true;
    app.stateManager.fullscreenButton.inputEnabled = true;
    app.stateManager.fullscreenButton.useHandCursor = false;
    app.stateManager.fullscreenButton.input.priorityID = 2;
    if (game.scale.isFullScreen) {
      app.stateManager.fullscreenButton.alpha = 0;
    }

    app.stateManager.fullscreenButton.events.onInputDown.add(svc.toggleFullscreen);
  };

  svc.toggleFullscreen = function(){
    if (!game.scale.isFullScreen) {
      game.scale.startFullScreen();
    } else if (game.scale.isFullScreen) {
      game.scale.stopFullScreen();
    }
  };

  svc.handleParallax = function(onscreen, previousLayerPositionX) {
    // move left
    if (player.x < player.previousPosition.x && onscreen.baseLayer.position.x < previousLayerPositionX) {
      for (var key in onscreen) {
        if (onscreen.hasOwnProperty(key) && onscreen[key].parallax) {
          if (onscreen[key].tilePosition) {
            onscreen[key].tilePosition.x += onscreen[key].parallax;
          } else if (onscreen[key].body) {
            onscreen[key].body.x += onscreen[key].parallax;
          } else {
            onscreen[key].x += onscreen[key].parallax;
          }
        }
      }
      if (onscreen.birds) {
        for (var i = 0 ; i < onscreen.birds.length; i ++){
          if (onscreen.birds[i].body){
            onscreen.birds[i].body.x -= 0.5;
          }
        }
      }
    //move right
    } else if (player.x > player.previousPosition.x && onscreen.baseLayer.position.x > previousLayerPositionX) {
      for (var key in onscreen) {
        if (onscreen.hasOwnProperty(key) && onscreen[key].parallax) {
          if (onscreen[key].tilePosition) {
            onscreen[key].tilePosition.x -= onscreen[key].parallax;
          } else if (onscreen[key].body){
            onscreen[key].body.x -= onscreen[key].parallax;
          } else {
            onscreen[key].x -= onscreen[key].parallax;
          }
        }
      }
      if (onscreen.birds) {
        for (var i = 0 ; i < onscreen.birds.length; i ++){
          if (onscreen.birds[i].body){
            onscreen.birds[i].body.x += 2;
          }
        }
      }
    }
  };

  svc.cycleSprites = function(group, time, transition, cb) {
    var i = 0;
    var groupChildren = group.children ? group.children : group;

    _tweenIn = function(sprite) {
      var tween_in = game.add.tween(sprite).to({ alpha: 1 }, transition,
                                   Phaser.Easing.Linear.None,true);
      if (sprite.animations && sprite.animations._anims.init) {
        sprite.animations.play('init');
        if (sprite.animations._anims.init.loop === false) {
          sprite.animations.currentAnim.onComplete.add(
            function () {
              if (sprite.animations._anims.idle) {
                sprite.animations.play('idle');
              }
            }, this);
        }
      }
      tween_in.onComplete.add(function(){
        setTimeout(function() {
          _tweenOut(sprite);
        }, time);
      });
    };
    _tweenOut = function(sprite) {
      var tween_out = game.add.tween(sprite).to({ alpha: 0 }, transition,
                                   Phaser.Easing.Linear.None,true);
      tween_out.onComplete.add(_next);
    };
    _next = function() {
      i ++;
      if (i === groupChildren.length) {

        cb();
      } else {
        _tweenIn(groupChildren[i]);
      }
    };
    _tweenIn(groupChildren[i]);
  };

  svc.fade = function(type, cb) {
    var fromAlpha = type === 'in' ? 1 : 0;
    var toAlpha = type === 'in' ? 0 : 1;
    var fade = game.add.bitmapData(game.world.width, game.world.height + 50);
    fade.ctx.rect(0, 0, game.world.width, game.world.height + 50);
    fade.ctx.fillStyle = app.config.backgroundColor;
    fade.ctx.fill();

    app.fadeSprite = game.add.sprite(0, 0, fade);
    app.fadeSprite.alpha = fromAlpha;
    var fade = game.add.tween(app.fadeSprite).to( { alpha: toAlpha }, 500, Phaser.Easing.Linear.None, true).start();
    if (cb) {
      fade.onComplete.add(cb, this);
    }
  };

  svc.foreground = function(a) {
    foregroundGroup = game.add.group();

    var _defaultForegroundElements = [
      app.dialoguePortraitGroup,
      app.menuDisplayGroup,
      app.menuTextGroup,
      app.dialogueBorder,
      app.dialogueGroup,
      app.dialogueTextGroup,
      app.stateManager.currentDialogue.followupIcon,
      app.stateManager.puc.fullscreenButton,
      app.fadeSprite,
      app.loadGroup
    ];

    var _addToForeGroundGroup = function(element) {
      if (element && element['alive']) {
        foregroundGroup.add(element);
      }
    };

    if (a &&  Object.prototype.toString.call( a ) === '[object Array]') {
      for (var i = 0; i < a.length; i ++) {
        if (a[i] && a[i].hide !== true) {
          foregroundGroup.add(a[i]);
        }
      }
    } else if (a && typeof a === 'object') {
      for (var key in a) {
        if (a[key] && a[key].hide !== true) {
          foregroundGroup.add(a[key]);
        }
      }
    }

    if (foregroundGroup) {
      foregroundGroup.setAll('checkWorldBounds', true);
      foregroundGroup.setAll('outOfBoundsKill', true);
    }

    for (var j = 0; j < _defaultForegroundElements.length; j ++) {
      _addToForeGroundGroup(_defaultForegroundElements[j]);
    }
  };

  app.cameraSvc = svc;
  return svc;
});
