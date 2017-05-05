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
       app.dialogueSvc.decrementChoice();
       app.dialogueSvc.highlightChoice(app.dialogueSelections[
         app.dialogueSvc.current.choiceIndex
       ]);
     },
     selectDown: function() {
       app.dialogueSvc.incrementChoice();
       app.dialogueSvc.highlightChoice(app.dialogueSelections[
         app.dialogueSvc.current.choiceIndex
       ]);
     },
     selectLeft: function() {
       var backbutton = dialogueHelpers.getDialogueGroupChildByKey('backbutton');

       if (app.dialogueSvc.lockDialogue) {
         return;
       }

       if (backbutton) {
         backbutton.click(backbutton);
         return;
       }
     },
     selectRight: function() {
     },
     confirm: function() {
       if (app.dialogueSvc.lockDialogue) {
         if (app.dialogueSvc.blockerSprite.alive) {
           app.dialogueSvc.handleInputBlockerClick();
         }
         return;
       }
       app.dialogueSvc.continueDialogue();
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
