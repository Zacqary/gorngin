define(['services/portraitSvc',
        'services/spriteClasses',
        'services/cameraSvc',
        'services/audioSvc',
        'services/keyboardSvc',
        'services/dialogue/config',
        'services/dialogue/dialogueHelpers',
        'services/dialogue/WordWrapper',
        'services/dialogue/completeDialogueSet'
        ],

function (portraitSvc, spriteClasses, cameraSvc,
                     audioSvc, keyboardSvc, dialogueConfig, dialogueHelpers,
                     WordWrapper, completeDialogueSet){
  var svc = {};
  svc.current = {};
  app.dialogueGroup = game.add.group();
  // previous element from same dialogue
  svc.previousElement = {
    portrait: ''
  };
  //previous element from previous dialogue
  svc.persistentPreviousElement = {
    portrait: ''
  };

  svc.set = function(attribute, value) {
    svc[attribute] = value;
  };

  svc.borderAnimationSignal = new Phaser.Signal();

  svc.createInputBlocker = function() {
    var blocker = game.add.bitmapData(game.world.width + 15, game.world.height);
    blocker.ctx.rect(0, 240, 715, 415);
    blocker.ctx.fillStyle = '#000000';
    blocker.ctx.fill();
    blocker.fixedToCamera = true;
    svc.blockerSprite = game.add.sprite(0, 240, blocker);
    svc.blockerSprite.fixedToCamera = true;
    svc.blockerSprite.scale.setTo(1,1);
    svc.blockerSprite.alpha = 0;
    svc.blockerSprite.inputEnabled = true;
    svc.blockerSprite.input.priorityID = 1;
    svc.blockerSprite.events.onInputDown.add(svc.handleInputBlockerClick);
  };

  svc.handleInputBlockerClick = function() {
    //@TODO: make available as general input
    var _this = this;
    app.autocompleteDialogueElement = true;
    app.dialogueTextGroup.callAll('kill');
    svc.current.animateDialogue = false;
    app.dialogueSvc.wordwrapper.create();
    _this.audio = game.add.audio('bloop');
    _this.audio.loop = false;
    _this.audio.onDecoded.add(function() {
      _this.audio.play('', 0, app.config.soundfx, false);
    }, this);
  };

  svc.sounds = dialogueConfig.sounds;

  app.sounds = svc.sounds;

  svc.getStyle = function(name) {
    var style = dialogueConfig.styles[name];
    style.wordWrapWidth = dialogueConfig.getTextWidth(svc.current.portrait);
    return style;
  };

  svc.createBackButton = function() {
    var _this = this;
    _this.backbutton = new spriteClasses.Sprite({
      x: 2,
      y: dialogueConfig.borderTop + 39,
      img: 'backbutton',
      animation: [
        {
          name: 'open',
          sequence: [4,3,2,0],
          speed: 5,
          play: false,
          loop: false
        },
        {
          name: 'default',
          sequence: [0],
          speed: 7,
          play: true,
          loop: false
        },
        {
          name: 'hide',
          sequence: [5],
          speed: 4,
          play: false,
          loop: false
        },
        {
          name: 'hover',
          sequence: [1],
          speed: 4,
          play: false,
          loop: false
        },
        {
          name: 'close',
          sequence: [5],
          speed: 4,
          play: false,
          loop: false
        }
      ],
      fixedToCamera: true,
      physics: 'ARCADE',
      collideWorldBounds: true,
      onInputDown: function(self) {
        _this.click(self);
      }
    });

    _this.backbutton.inputEnabled = true;
    _this.backbutton.input.priorityID = 1;

    _this.backbutton.events.onInputOver.add(function(self) {
      _this.backbutton.select(self);
    });

    _this.backbutton.events.onInputOut.add(function(self) {
      _this.backbutton.unselect(self);
    });

    _this.backbutton.select = function(self) {
      self.play('hover');
    };

    _this.backbutton.unselect = function(self) {
      self.play('default');
    };

    _this.click = function(self) {
      svc.destroyDialogueGroup();
      svc.advanceDialogueState('options');
    };

    _this.backbutton.click = _this.click;

    app.dialogueGroup.add(_this.backbutton);
  };

  svc.createDialogueBox = function() {
    if (dialogueConfig.background) {
      var dialogue = game.add.bitmapData(game.world.width + 15, game.world.height);
      var dialogueSprite;
      var dialogueDropdownTween;
      var startX;
      var startY;

      if (dialogueConfig.openFrom === 'TOP') {
        startX = -5;
        startY = -5;
      } else {
        startX = game.height + 5;
        startY = game.width + 5;
      }
      dialogue.ctx.rect(startX, startY, 715, dialogueConfig.height);
      dialogue.ctx.fillStyle = '#000000';
      dialogue.ctx.fill();
      dialogue.fixedToCamera = true;
      svc.dialogueSprite = game.add.sprite(startX, startY, dialogue);
      svc.dialogueSprite.fixedToCamera = true;
      svc.dialogueSprite.scale.setTo(1,0);
      svc.dialogueSprite.alpha = 0.7;
      svc.dialogueSprite.inputEnabled = true;
      svc.dialogueSprite.input.priorityID = 1;
      dialogueDropdownTween = game.add.tween(svc.dialogueSprite.scale).to({ x: 1, y: 1}, 500, Phaser.Easing.Back.Out, true, 0);
      app.dialogueGroup.add(svc.dialogueSprite);
      dialogueDropdownTween.onComplete.add(function(){
        svc.addText();
      });
    }
  };

  svc.addPortrait = function() {
    if (!svc.current.portrait) {
      svc.addText();
      return;
    }
    var newPortrait;
    app.dialoguePortraitGroup = game.add.group();
    newPortrait = portraitSvc.get(svc.current.portrait);
    app.dialoguePortraitGroup.add(newPortrait);
    if (newPortrait !== app.dialogueProfileImage) {
      app.dialogueProfileImage = newPortrait;
      if (dialogueConfig.openFrom === 'TOP') {
        app.dialogueProfileImage.height = app.dialogueProfileImage.height * 0.75;
        app.dialogueProfileImage.width = app.dialogueProfileImage.width * 0.75;
      }
      portraitSvc.animatePortrait(svc.current);
    }
    svc.playOpenPortraitFrameAnim();
  };

  svc.borderAnimationSignal.add(function(borderstate, reopen) {
    if (borderstate === 'closed' && svc.previousElement.portrait){
      svc.addPortrait();
    } else {
      svc.addText();
    }
  }, this);

  svc.playOpenPortraitFrameAnim = function() {
    if (svc.current.portrait === 'worldmaplocations') {
      app.dialogueBorder.animations.play('defaultOpenPortrait');
      svc.addText();
    } else if (svc.persistentPreviousElement.portrait !== svc.current.portrait &&
               svc.persistentPreviousElement.portrait !== 'worldmaplocations') {
      game.sound.play(svc.sounds.init.sound, svc.sounds.init.vol, false);
      app.dialogueBorder.animations.play('openPortrait');
      app.dialogueBorder.animations.currentAnim.onComplete.add(svc.addText);
    } else {
      svc.addText();
    }
  };

  svc.addText = function() {
    /*
      capture previous dialogue element data
    */

    svc.previousElement.portrait = svc.current.portrait;
    svc.persistentPreviousElement.portrait = svc.current.portrait;
    svc.persistentPreviousElement.animation = svc.current.animation;

    var textContent;
    var textStyle = svc.getStyle('basic');
    svc.destroyDialogueGroup();

    textContent = svc.current.text[svc.current.chunkCount];

    var profileImageHasName = (app.dialogueProfileImage &&
                              app.dialogueProfileImage.statevars &&
                              app.dialogueProfileImage.statevars.name) ||
                              svc.current.speaker;
    if (app.dialogueProfileImage && app.dialogueProfileImage.alive &&
       profileImageHasName || svc.current.speaker) {
      var _getName = function() {
        var name = null;
        if (svc.current.speaker) {
          return svc.current.speaker;
        } else if (profileImageHasName) {
          svc.current.speaker = app.dialogueProfileImage.statevars.name;
          svc.current.speakervoice = app.dialogueProfileImage.statevars.voice ? app.dialogueProfileImage.statevars.voice : 'genericdialogue';
          return app.dialogueProfileImage.statevars.name;
        }
      };
      app.dialogueGroup.add(game.add.text(dialogueConfig.borderLeft, dialogueConfig.borderTop + 5, _getName(),
                        svc.getStyle('name')));
    }

    svc.wordwrapper = new WordWrapper(svc.current, [textContent]);
    svc.wordwrapper.create();
    svc.current.chunkCount ++;
  };

  svc.incrementChoice = function() {
    var len = app.dialogueSelections.length;
    if (svc.current.choiceIndex === len - 1) {
      svc.current.choiceIndex = 0;
    } else {
      svc.current.choiceIndex ++;
    }
  };

  svc.decrementChoice = function() {
    var len = app.dialogueSelections.length;
    if (svc.current.choiceIndex <= 0) {
      svc.current.choiceIndex = len - 1;
    } else {
      svc.current.choiceIndex --;
    }
  };

  svc.highlightChoice = function(choice) {
      if (!choice) {
        return;
      }
      svc.current.selectedItem = choice;
      game.sound.play(svc.sounds.hover.sound, svc.sounds.hover.vol, false);
      choice.setStyle(svc.getStyle('hover'), 2);

      for (var i = 0; i < app.dialogueSelections.length; i++) {
        if (app.dialogueSelections[i] !== choice) {
          svc.unhighlightChoice(app.dialogueSelections[i]);
        }
      }
  };

  svc.unhighlightChoice = function(choice) {
    if (!choice) {
      return;
    }
    game.sound.play(svc.sounds.hover.sound, svc.sounds.hover.vol, false);
    choice.setStyle(svc.getChoiceStyle(null, choice.followup, choice.textKey), 2);
  };

  svc.unhighlightChoices = function() {
    for (var i = 0; i < app.dialogueSelections.length; i ++) {
      var choice = app.dialogueSelections[i];
      choice.setStyle(svc.getChoiceStyle(null, choice.followup, choice.textKey), 2);
    }
  };

  svc.getChoiceStyle = function(choice, followup, textKey) {
    var choiceStyle;
    fu = followup ? followup : choice.followup;
    tk = textKey ? textKey : choice.textKey;
    var choiceId = app.currentState + '_' + svc.current.dialogueJSONID +
                   '-' + fu + '-' + tk;
    if ((app.stateManager.choicesSelected.indexOf(choiceId) === -1) ||
         svc.current.dialogueJSONID.toLowerCase().startsWith('move') ||
         svc.current.dialogueJSONID.toLowerCase().startsWith('use') ||
         svc.current.dialogueJSONID.toLowerCase() === 'talk' ||
         svc.current.dialogueJSONID.toLowerCase() === 'speak' ||
         dialogueConfig.keywords.indexOf(textKey.toLowerCase().trim()) > -1) {
      choiceStyle = svc.getStyle('unselectedchoice');
    } else {
      choiceStyle = svc.getStyle('selectedchoice');
    }
    return choiceStyle;
  };

  svc.addChoices = function(startsWithChoice) {
    svc.current.choiceIndex = -1;
    svc.current.choicesActive = true;
    svc.destroyDialogueGroup();
    if (dialogueConfig.keywords.indexOf(svc.current.dialogueJSONID.toLowerCase().trim()) > -1) {
      svc.createBackButton();
    }
    var choices = svc.current.choices;
    var followupCallback;
    if (!choices || choices.length === 0) { return false; }
    for (var i = 0; i < choices.length; i++) {
      var _this = this;
      var followup = choices[i].followup;
      var textKey = choices[i].text.replace(/ /g, '_');
      var choiceTop = dialogueConfig.borderTop + 10;
      var initStyle = svc.getChoiceStyle(null, followup, textKey);
      if (i < 4) {
        var choiceSeperator = i * 27;
        this.choice = game.add.text(dialogueConfig.borderLeft, choiceTop +
                      choiceSeperator, i + 1 + ". " + choices[i].text, initStyle);
      } else {
        var choiceSeperator = (i - 4) * 27;
        this.choice = game.add.text(dialogueConfig.borderLeft + 250,
                      choiceTop + choiceSeperator, i + 1 + ". " + choices[i].text,
                      initStyle);
      }
      _this.choice.followup = followup;
      _this.choice.textKey = textKey;
      _this.choice.inputEnabled = true;
      _this.choice.input.priorityID = 2;
      _this.choice.input.useHandCursor = false;
      _this.choice.events.onInputOver.add(function(self){
        svc.highlightChoice(self);
      }, this);
      _this.choice.events.onInputOut.add(function(self) {
        svc.unhighlightChoice(self);
      }, this);
      _this.choice.fixedToCamera = true;
      _this.choice.inputEnabled = true;
      _this.choice.events.onInputDown.add(function(self) {
        svc.choiceFollowup(self);
      });

      // register keypad
      _this.numberInputKey = keyboardSvc.registerNumberKey(parseInt(i) + 1);
      if (_this.numberInputKey) {
        _this.numberInputKey.followup = _this.choice.followup;
        _this.numberInputKey.textKey = _this.choice.textKey;
        _this.numberInputKey.onDown.add(function(self) {
          svc.choiceFollowup(self);
        });
      }
      app.dialogueSelections.push(_this.choice);
      app.dialogueTextGroup.add(_this.choice);
    }

    svc.lockDialogue = false;
  };

  svc.choiceFollowup = function(choice){
    app.stateManager.currentDialogue.callback = null;
    var choiceId = app.currentState + '_' + svc.current.dialogueJSONID +
                  '-' + choice.followup + '-' + choice.textKey;
    if (app.stateManager.choicesSelected.indexOf(choiceId) === -1) {
      app.stateManager.choicesSelected.push(choiceId);
    }
    //game.sound.play(svc.sounds.click.sound, svc.sounds.click.vol, false);
    svc.destroyDialogueGroup();
    if (choice.followup === 'end') {
      svc.closeDialogueWindow();
    } else {
      svc.advanceDialogueState(choice.followup);
    }
  };

  svc.addFollowup = function() {
    var _this = this;
    svc.lockDialogue = false;
    if (!svc.current.choices && svc.current.text && !svc.current.next &&
        (svc.current.chunkCount >= svc.current.text.length /*||
        !svc.current.animateDialogue*/)) {
      svc.endDialogue();
    } else {
      svc.followUpIconSet = svc.addFollowupIcon();
      svc.followUpIconSet.inputSprite.events.onInputDown.add(function() {
        svc.current.selectedItem = null;
        svc.continueDialogue();
      });
    }
  };

  svc.continueDialogue = function() {
    if (svc.current.selectedItem && svc.lockDialogue === false ||
        (app.dialogueSelections && app.dialogueSelections.length === 1 &&
        !svc.current.selectedItem)) {
      if (app.dialogueSelections &&
          app.dialogueSelections.length === 1 &&
          !svc.current.selectedItem) {
        svc.current.selectedItem = app.dialogueSelections[0];
      }
      svc.lockDialogue = true;
      svc.choiceFollowup(svc.current.selectedItem);
      svc.current.selectedItem = null;
      return;
    } else if (svc.current.choicesActive) {
      return false;
    }

    if (
        svc.lockDialogue === false &&
        (!svc.current.choices && svc.current.text && !svc.current.next) &&
        (svc.current.chunkCount === svc.current.text.length)
       ) {

      svc.lockDialogue = true;
      svc.closeDialogueWindow();
    } else if (svc.lockDialogue === false) {
      svc.lockDialogue = true;
      svc.followUpIconSet.followupIcon.kill();
      svc.followUpIconSet.followupIcon.destroy();
      svc.followUpIconSet.inputSprite.kill();
      svc.followUpIconSet.inputSprite.destroy();
      svc.destroyDialogueGroup();
      game.sound.play(svc.sounds.click.sound, svc.sounds.click.vol, false);
      if (svc.current.chunkCount &&
          svc.current.chunkCount > svc.current.text.length &&
          !svc.current.choices) {
            svc.closeDialogueWindow();
            return false;
      } else if (svc.current.chunkCount < svc.current.text.length){
        svc.addText();
      } else if (svc.current.next) {
        svc.advanceDialogueState(svc.current.next);
      } else {
        svc.addChoices();
      }
    }
   };

  svc.destroyDialogueGroup = function() {
    for (var i = 0; i < app.dialogueGroup.children.length; i ++) {
      if (app.dialogueGroup.children[i]._text) {
        console.log('DESTROY: ', app.dialogueGroup.children[i]._text);
        app.dialogueGroup.children[i].kill();
        app.dialogueGroup.children[i].destroy();
      }
    }
    if (app.dialogueTextGroup) {
      app.dialogueTextGroup.callAll('kill');
      app.dialogueTextGroup.callAll('destroy');
    }
    for (var i = 0; i < app.dialogueGroup.children.length; i ++) {
      var child = app.dialogueGroup.children[i];
      if (child.key === 'backbutton') {
        child.kill();
        child.destroy();
      }
    }
  };

  svc.addFollowupIcon = function(){
    _this.followupIcon = new spriteClasses.Sprite({
      x: game.width - 60,
      y: dialogueConfig.borderTop + 97,
      img: 'dialoguecontinue',
      animation: [
        {
          name: 'default',
          sequence: [0,1,2,3,4,0,4,3,2,1],
          speed: 4,
          play: true,
          loop: true
        }
      ],
      disableAnimationForMobile: true,
      fixedToCamera: true,
      physics: 'ARCADE',
      collideWorldBounds: true,
      inputEnabled: false,
    });
    _this.followupIcon.alpha = 0;
    _this.inputBox = game.add.bitmapData(game.world.width + 15, game.world.height);
    _this.inputBox.inputEnabled = true;
    _this.inputSprite = game.add.sprite(0, 0, _this.inputBox);
    _this.inputSprite.inputEnabled = true;
    _this.inputSprite.priorityID = 1;
    game.add.tween(_this.followupIcon).to({ alpha: 1 }, 1000,
                                 Phaser.Easing.Linear.None,true);
    app.stateManager.currentDialogue.followupIcon = _this.followupIcon;
    return _this;
  };

  svc.endDialogue = function() {
    svc.followUpIconSet = svc.addFollowupIcon();
    svc.followUpIconSet.inputSprite.events.onInputDown.add(function(){
      svc.closeDialogueWindow();
    });
  };

  /*
    Pass whatever you want to happen after closing the dialogue window
    as a callback cus it's async
  */
  svc.closeDialogueWindow = function(callback, killPortrait) {
    this.callback = callback;
    if (app.dialogueProfileImage && killPortrait) {
      _killPortrait();
    }
    if (svc.followUpIconSet) {
      svc.followUpIconSet.followupIcon.kill();
      svc.followUpIconSet.followupIcon.destroy();
      svc.followUpIconSet.inputSprite.kill();
      svc.followUpIconSet.inputSprite.destroy();
    }
    svc.destroyDialogueGroup();
    if (dialogueConfig.background) {
      game.sound.play(svc.sounds.init.sound, svc.sounds.init.vol, false);
      var dialogueDropdownTweenOut = game.add.tween(svc.dialogueSprite.scale).to({ x: 1, y: 0}, 500, Phaser.Easing.Back.Out, true, 0);
      dialogueDropdownTweenOut.onComplete.add(function(){
        svc.destroyDialogueGroup();
      });
    }
    app.stateManager.currentDialogue.dialogueInitialized = false;
    if (this.callback) {
      this.callback();
    } else if (svc.dialogueCallback) {
      svc.dialogueCallback();
    }
  };

  svc.getCurrentDialogueElement = function(){
    app.stateManager.currentDialogue.currentDialogueJSON = svc.getOriginalDialogueJson();
    var dialogueKey = app.stateManager.currentDialogue.currentDialogueKey;
    if (dialogueKey === "undefined" || dialogueKey === ""){ return false; }

    for (var i = 0; i < app.stateManager.currentDialogue.currentDialogueJSON.elements.length; i ++){
      if (app.stateManager.currentDialogue.currentDialogueJSON.elements[i].title === dialogueKey){
        var elementCopy = jQuery.extend(true, {},
                          app.stateManager.currentDialogue.currentDialogueJSON.elements[i]);
        return elementCopy;
      }
    }
  };

  svc.getOriginalDialogueJson = function() {
    var textJson = jQuery.extend(true, {}, svc.originalText);
    return textJson;
  };

  // build the dialogue window in the DOM and set it to its initial state.
  svc.initializeDialogue = function(dialogue, initElement, cb){
    svc.initElement = initElement;
    // if the dialogue is requested as a string, get from state directory
    if (completeDialogueSet[dialogue] && !app.config.devStart) {
      var dialogueData = {
        'elements': completeDialogueSet[dialogue]
      };
      svc.handleDialogue(dialogueData, initElement, cb);
    } else if (typeof dialogue === 'string') {
       var oReq = new XMLHttpRequest();
       oReq.onload = _req;
       oReq.open("get", './assets/yarn/' + dialogue + '.json', true);
       oReq.send();
    } else {
      svc.handleDialogue(dialogue, initElement, cb);
    }

    function _req(e) {
      var dialogueData = {
        'elements': JSON.parse(this.responseText)
      };
      svc.handleDialogue(dialogueData, initElement, cb);
    }
  };

  svc.handleDialogue = function(textJsonOrig, initElement, cb) {
    // create a deep copy of original dialogue so content doesn't get removed in memory
    // `true` arg is critical
    svc.originalText = textJsonOrig;
    var textJson = jQuery.extend(true, {}, textJsonOrig);
    svc.current = {};
    svc.previousElement = {};
    app.stateManager.currentDialogue.dialogueInitialized = true;

    if (cb) {
      svc.dialogueCallback = cb;
    }

    // store dialogue to return to after leaving menu
    if (app.previousDialogue !== textJsonOrig && app.menuActivated === 0) {
      app.previousDialogue = textJsonOrig;
      app.previousDialogueCallback = cb;
    }

    // store current dialogue/cb for access by handler
    app.stateManager.currentDialogue.currentDialogueJSON = textJson;
    if (cb){
      app.stateManager.currentDialogue.callback = cb;
    } else {
      app.stateManager.currentDialogue.callback = null;
    }

    //Pass dialogue to handler
    if (initElement && dialogueHelpers.hasElement(initElement, app.stateManager.currentDialogue.currentDialogueJSON)) {
      svc.advanceDialogueState(initElement);
    } else {
      svc.advanceDialogueState('init');
    }
  };

  svc.advanceDialogueState = function(dialogueKey, goBack, cb){
    keyboardSvc.reset();
    svc.lockDialogue = true;
    app.dialogueSelections = [];
    app.selectedItem = null;
    if (svc.current) {
      svc.current.choicesActive = false;
    }
    svc.destroyDialogueGroup();

    if (dialogueKey === 0 || dialogueKey === "" || !dialogueKey) {
      svc.closeDialogueWindow();
      return false;
    }

    app.stateManager.currentDialogue.currentDialogueKey = dialogueKey;

    var currentDialogueElement = svc.getCurrentDialogueElement();
    currentDialogueElement.body = dialogueHelpers.setTextConditionally(currentDialogueElement.body);

    // Store the options element in order to return to it with the back button
    if (dialogueKey === 'options') {
      svc.current.optionsElement = currentDialogueElement;
    }

    svc.processText(currentDialogueElement);
    svc.modifyPortraitWidth();
    svc.pushItemsIntoInventory();

    var dialogueJSONID = currentDialogueElement.title;
    svc.current.dialogueJSONID = dialogueJSONID;

    if (!currentDialogueElement || !currentDialogueElement.body) {
      // If a callback was provided for the end of the dialogue, call it now
      if (app.stateManager.currentDialogue.callback){
        app.stateManager.currentDialogue.callback();
        app.stateManager.currentDialogue.callback = null;
      }
      return false;
    }

    if (app.dialogueProfileImage && svc.previousElement.portrait &&
        (svc.previousElement.portrait !== svc.current.portrait)) {
      _killPortrait();
    }

    if (svc.current.portrait || svc.previousElement.portrait) {
      if (svc.previousElement.portrait !== svc.current.portrait &&
         app.dialogueProfileImage && app.dialogueProfileImage.animations &&
         app.dialogueProfileImage.animations.currentAnim &&
         !app.dialogueProfileImage.animations.currentAnim.isPlaying){
           return;
      } else {
        if (!svc.previousElement.portrait) {
          svc.addPortrait();
        } else if (svc.previousElement.portrait === svc.current.portrait) {
          svc.addText();
        }
      }
    } else {
      svc.addText();
    }

    if (dialogueKey !== 'init' && dialogueKey !== svc.initElement) {
      if (goBack) {
        _killPortrait();
        game.sound.play(svc.sounds.back.sound, svc.sounds.back.vol, false);
      } else if (svc.current.sfx) {
        game.sound.play(svc.current.sfx, 0.4, false);
      } else {
        game.sound.play(svc.sounds.click.sound, svc.sounds.click.vol, false);
      }
    }
  };

  svc.modifyPortraitWidth = function() {
    if (svc.current.portrait) {
      dialogueConfig.borderLeft = 155;
      dialogueConfig.textWidth = 500;
    } else {
      dialogueConfig.borderLeft = app.config.dialogue.openFrom === 'TOP' ? 10 : 35;
      dialogueConfig.textWidth = 500;
    }
  };

  svc.pushItemsIntoInventory = function() {
    if (svc.current.items){
      for (var i = 0; i < svc.current.items.length; i++){
        if (svc.current.items[i] && app.stateManager.inv.indexOf(svc.current.items[i]) === -1){
          app.stateManager.inv.push(svc.current.items[i]);
        }
      }
    }
  };

  svc.processText = function(currentDialogueElement) {
    if (!currentDialogueElement) {
      return;
    }

    svc.current.items = dialogueHelpers.getItems(currentDialogueElement);
    dialogueHelpers.getState(currentDialogueElement);
    var body = dialogueHelpers.getBody(currentDialogueElement);
    if (!body) {
      return;
    }
    dialogueHelpers.fireEvents(currentDialogueElement);
    svc.current.chunkCount = 0;
    svc.current.type = 'npc'; //svc.getCurrentDialogueElement()['type'];
    svc.current.choices = dialogueHelpers.getChoices(currentDialogueElement, svc.current);
    svc.current.next = dialogueHelpers.getNext(currentDialogueElement);
    svc.current.portrait = dialogueHelpers.getPortait(currentDialogueElement);
    svc.current.text = dialogueHelpers.splitBody(body, svc.current);
    svc.current.animation = dialogueHelpers.getAnimation(currentDialogueElement);
    svc.current.speaker = dialogueHelpers.getName(currentDialogueElement);
    svc.current.music = dialogueHelpers.playMusic(currentDialogueElement);
    svc.current.sfx = dialogueHelpers.getSoundEffect(currentDialogueElement);
    svc.current.returntoprevioustrack = dialogueHelpers.returnToPreviousTrack(currentDialogueElement);
    dialogueHelpers.setVars(currentDialogueElement);
    dialogueHelpers.removeItems(currentDialogueElement);
  };

  svc.animateBorderClose = function(sendDispatch, cb) {
    var fired = false;
    game.sound.play(svc.sounds.init.sound, svc.sounds.init.vol, false);
    var closeAnimation = app.dialogueBorder.animations.play('closePortrait');
    closeAnimation.onComplete.add(_cont);

    function _cont() {
      if (cb && !fired) {
        cb();
        fired = true;
        if (sendDispatch) {
          svc.borderAnimationSignal.dispatch('closed');
        }
      }
    }
  };

  function _killPortrait() {

    if (svc.persistentPreviousElement.portrait !== svc.current.portrait ) {
      svc.animateBorderClose(true, _kill);
    } else {
      _kill();
    }

    function _kill() {
      app.dialoguePortraitGroup.callAll('kill');
      app.dialoguePortraitGroup.callAll('destroy');
      app.dialogueProfileImage.kill();
      app.dialogueProfileImage.destroy();
    }
  }

  app.dialogueSvc = svc;
  return svc;
});
