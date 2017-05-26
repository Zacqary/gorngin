/*

  Special keys
  =====================================
  F           - fullscreen
  ENTER       - advance dialogue
  NUMBER KEYS - select dialogue options
  SPACEBAR    - menu
*/

define([
        'gorngin/cameraSvc',
        'gorngin/dialogue/dialogueHelpers'
      ],
function(cameraSvc, dialogueHelpers) {
   var svc = {};
   var menuSvc = app.menuSvc;
   var worldMapSvc = app.worldMapSvc;

   svc.numberKeys = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX',
                      'SEVEN', 'EIGHT', 'NINE'];

   svc.registerNumberKey = function(number) {
     this.key = game.input.keyboard.addKey(Phaser.Keyboard[svc.numberKeys[number]]);
     return this.key;
   };

   var mainMenuHover = -1;
   function _tempHackyMenuSelector() {
     if (!app.tempSuperHackyMenuRegister.items[0] &&
         !app.tempSuperHackyMenuRegister.items[0].item) { return; }
     if (mainMenuHover === -1) { mainMenuHover = 0; }
     if (app.tempSuperHackyMenuRegister.items[mainMenuHover].item.active) { return; }
     app.tempSuperHackyMenuRegister.onHover(
       app.tempSuperHackyMenuRegister.items[mainMenuHover].item
     );
     mainMenuHover ++;
     if (mainMenuHover === 2) { mainMenuHover = 0; }
     app.tempSuperHackyMenuRegister.offHover(
       app.tempSuperHackyMenuRegister.items[mainMenuHover].item
     );
   }

   function _tempHackyMenuInput() {
     if (!app.tempSuperHackyMenuRegister.items[0]) {
       app.tempSuperHackyMenuRegister.handleIntroClick();
       return;
     } else if (mainMenuHover === -1) {
       return;
     }
     var i = mainMenuHover === 0 ? 1 : 0;
     if (!app.tempSuperHackyMenuRegister.items[i].active) {
       app.tempSuperHackyMenuRegister.items[i].active = true;
       app.tempSuperHackyMenuRegister.items[i].action();
     } else if (app.tempSuperHackyMenuRegister.items[1].undo) {
       app.tempSuperHackyMenuRegister.items[1].undo();
     }
   }

   svc.actions = {
     selectUp: function() {
       if (app.currentState  && app.currentState === 'mainmenu') {
         _tempHackyMenuSelector();
       } else if (worldMapSvc && worldMapSvc.mapEnabled && app.mapSelections &&
           worldMapSvc.mapOutOfFocus === true) {
         worldMapSvc.set('mapOutOfFocus', false);
         app.dialogueBorder.animations.play('selectMap');
       } else if (worldMapSvc.mapOutOfFocus === false) {
         app.dialogueBorder.animations.play('selectMap');
       } else if (menuSvc && menuSvc.menuFocused && app.menuSelections.length > 0) {
         if (menuSvc.itemSelected) {
           menuSvc.selectMenuItem(app.menuSelections[menuSvc.menuSelection]);
         } else {
           menuSvc.decrementMenuSelection();
           menuSvc.hoverOverMenuItem(app.menuSelections[menuSvc.menuSelection]);
         }
       } else {
         app.dialogueSvc.decrementChoice();
         app.dialogueSvc.highlightChoice(app.dialogueSelections[
           app.dialogueSvc.current.choiceIndex
         ]);
       }
     },
     selectDown: function() {
       if (app.currentState === 'mainmenu') {
         _tempHackyMenuSelector();
       } else if (worldMapSvc && worldMapSvc.mapEnabledAndFocused()) {
         if (app.menuSelections.length === 0) {
           worldMapSvc.killMap();
         }
         app.dialogueBorder.animations.play('selectMenu');
         worldMapSvc.defaultMapPins(
           app.mapSelections[worldMapSvc.pinIndex].pin
         );
       } else if (worldMapSvc.mapEnabledAndOutOfFocus() ||
                  worldMapSvc.pinIndex === -1 && worldMapSvc.mapEnabled) {
         if (worldMapSvc.pinIndex === -1 && worldMapSvc.mapEnabled) {
           app.dialogueBorder.animations.play('selectMenu');
         }
         if (app.menuSelections.length > 0) {
           menuSvc.selectMenuItem(app.menuSelections[menuSvc.menuSelection]);
         }
       } else if (menuSvc.menuFocused && app.menuSelections) {
         if (menuSvc.itemSelected) {
           menuSvc.selectMenuItem(app.menuSelections[menuSvc.menuSelection]);
         } else {
           menuSvc.incrementMenuSelection();
           menuSvc.hoverOverMenuItem(app.menuSelections[menuSvc.menuSelection]);
         }
       } else {
         app.dialogueSvc.incrementChoice();
         app.dialogueSvc.highlightChoice(app.dialogueSelections[
           app.dialogueSvc.current.choiceIndex
         ]);
       }
     },
     selectLeft: function() {
       var backbutton = dialogueHelpers.getDialogueGroupChildByKey('backbutton');

       console.log('SELECT LEFT');

       if (app.dialogueSvc.lockDialogue) {
         return;
       }

       if (backbutton) {
         backbutton.click(backbutton);
         return;
       }

       if (worldMapSvc.mapEnabled && app.mapSelections) {
         worldMapSvc.incrementPin();
         app.mapSelections[worldMapSvc.pinIndex].onInputOver(
           app.mapSelections[worldMapSvc.pinIndex].pin
         );
       } else if (menuSvc.menuEnabled && !menuSvc.menuFocused &&
                  app.menuSelections.length > 0) {
         app.dialogueBorder.animations.play('selectmenu');
         menuSvc.focusFrameComponent('menu');
         menuSvc.set('menuFocused', true);
         if (!menuSvc.itemSelected) {
           menuSvc.set('menuSelection', 0);
           menuSvc.hoverOverMenuItem(app.menuSelections[menuSvc.menuSelection]);
         }
         app.dialogueSvc.unhighlightChoices();
       } else {
         return;
         //svc.actions.selectUp();
       }
     },
     selectRight: function() {
       if (worldMapSvc.mapEnabledAndFocused() ||
           worldMapSvc.pinIndex === -1 && worldMapSvc.mapEnabled) {
         worldMapSvc.decrementPin();
         app.mapSelections[worldMapSvc.pinIndex].onInputOver(
           app.mapSelections[worldMapSvc.pinIndex].pin
         );
       } else if (menuSvc.menuEnabled && menuSvc.menuFocused &&
                  !menuSvc.textBasedMenuOption) {
         menuSvc.set('menuFocused', false);
         if (menuSvc.itemSelected) {
           menuSvc.selectMenuItem(app.menuSelections[menuSvc.menuSelection]);
         } else {
           app.dialogueProfileImage.animations.play('default');
         }
         app.dialogueBorder.animations.play('selectdialogue');
       } else if (menuSvc.menuEnabled && menuSvc.menuFocused &&
                  menuSvc.textBasedMenuOption) {
         menuSvc.set('menuFocused', false);
         app.dialogueBorder.animations.play('selectdialogue');
       } else if (menuSvc.menuEnabled) {
         app.dialogueBorder.animations.play('selectdialogue');
       }
     },
     confirm: function() {
       if (app.currentState === 'mainmenu') {
          _tempHackyMenuInput();
       }
       if (app.dialogueSvc.lockDialogue) {
         if (app.dialogueSvc.blockerSprite.alive) {
           app.dialogueSvc.handleInputBlockerClick();
         }
         return;
       }
       if (worldMapSvc.mapEnabledAndFocused()) {
         if (!app.mapSelections[worldMapSvc.pinIndex].current()) {
           app.mapSelections[worldMapSvc.pinIndex].onInputDown();
         }
       } else if (worldMapSvc.mapEnabledAndOutOfFocus()) {
         app.dialogueBorder.animations.play('selectmenu');
         menuSvc.selectMenuItem(app.menuSelections[menuSvc.menuSelection]);
       } else if (menuSvc.menuFocused && app.menuSelections.length > 0) {
         app.dialogueBorder.animations.play('selectmenu');
         menuSvc.selectMenuItem(app.menuSelections[menuSvc.menuSelection]);
         if (menuSvc.textBasedMenuOption) {
           app.dialogueBorder.animations.play('selectdialogue');
         }
       } else {
         app.dialogueSvc.continueDialogue();
       }
     },
     initMenu: function() {
       menuSvc.initMenu();
     },
     back: function() {
       if (menuSvc.menuFocused || menuSvc.textBasedMenuOption) {
         menuSvc.set('menuFocused', false);
         if (menuSvc.itemSelected) {
           menuSvc.selectMenuItem(app.menuSelections[menuSvc.menuSelection]);
         }
         app.dialogueBorder.animations.play('selectdialogue');
       } else if (app.dialogueSvc.current &&
           app.dialogueSvc.current.dialogueJSONID !== 'options' &&
           app.dialogueSvc.current.optionsElement){
        //   app.dialogueSvc.advanceDialogueState('options', true);
       } else if (worldMapSvc.mapEnabled) {
         menuSvc.defaultMenu(true);
       }
     },
     toggleFullscreen: function() {
       cameraSvc.toggleFullscreen();
     }
   };

   game.input.gamepad.start();
   app.gamepad = game.input.gamepad.pad1;
   svc.pauseGamepad = false;

   app.gamepad.onDisconnectCallback = function() {
   };

   app.gamepad.addCallbacks(this, {
     onConnect: _addGamepadInputs
   });

   if (game.input.gamepad.supported && game.input.gamepad.active && app.gamepad.connected) {
     console.log('PAD REGISTERED');
   }

   function _disableGamepad() {
   }

   function _addGamepadInputs() {
     this.buttonA = app.gamepad.getButton(Phaser.Gamepad.XBOX360_A);
     this.buttonB = app.gamepad.getButton(Phaser.Gamepad.XBOX360_B);
     this.buttonY = app.gamepad.getButton(Phaser.Gamepad.XBOX360_Y);
     this.up = app.gamepad.getButton(Phaser.Gamepad.XBOX360_DPAD_UP);
     this.down = app.gamepad.getButton(Phaser.Gamepad.XBOX360_DPAD_DOWN);
     this.left = app.gamepad.getButton(Phaser.Gamepad.XBOX360_DPAD_LEFT);
     this.right = app.gamepad.getButton(Phaser.Gamepad.XBOX360_DPAD_RIGHT);
     this.up.onDown.add(svc.actions.selectUp, this);
     this.down.onDown.add(svc.actions.selectDown, this);
     this.left.onDown.add(svc.actions.selectLeft, this);
     this.right.onDown.add(svc.actions.selectRight, this);
     this.buttonA.onDown.add(svc.actions.confirm, this);
     this.buttonB.onDown.add(svc.actions.back, this);
     this.buttonY.onDown.add(svc.actions.initMenu, this);
   }


  function _addKeyboardInputs() {
     this.enter = svc.registerEnterKey();
     this.up = game.input.keyboard.addKey(Phaser.Keyboard.UP);
     this.down = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
     this.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
     this.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
     this.shift = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
     this.up.onDown.add(svc.actions.selectUp, this);
     this.down.onDown.add(svc.actions.selectDown, this);
     this.left.onDown.add(svc.actions.selectLeft, this);
     this.right.onDown.add(svc.actions.selectRight, this);
     this.enter.onDown.add(svc.actions.confirm, this);
     this.shift.onDown.add(svc.actions.back, this);
   }

   svc.registerFullscreenButton = function() {
     this.key1 = game.input.keyboard.addKey(Phaser.Keyboard.F);
     this.key2 = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
     this.key1.onDown.add(function() {
       cameraSvc.toggleFullscreen();
     });
     this.key2.onDown.add(function() {
       cameraSvc.toggleFullscreen();
     });
   };

   svc.registerEnterKey = function() {
     this.key = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
     return this.key;
   };

   svc.reset = function() {
     game.input.keyboard.reset(true);
     svc.enable();
   };

   svc.enable = function() {
     svc.registerFullscreenButton();
     _addKeyboardInputs();
   };

   svc.init = function() {
     svc.enable();
   };

   svc.init();

   return svc;
});
