define(['services/portraitSvc',
        'services/dialogue/TextParser',
        'services/dialogue/config'
        ],

function(portraitSvc, TextParser, dialogueConfig) {

  var svc = {};

  function _animateDialogue() {
    // don't animate the menu dialogue unless it's the journal
    if (app.config.unsupportedBrowser && !svc.current.speaker) {
      svc.current.animateDialogue = false;
    } else {
      svc.current.animateDialogue = true;
    }
  }

  var _killInputBlocker = function() {
    if (app.dialogueSvc.blockerSprite && app.dialogueSvc.blockerSprite.alive) {
      app.dialogueSvc.blockerSprite.kill();
    }
  };

  svc.getStyle = function(name) {
    var style = dialogueConfig.styles[name];
    style.wordWrapWidth = dialogueConfig.getTextWidth(svc.current.portrait);
    return style;
  };

  /**
   * WordWrapper.
   * @constructor
   * @param {object} current - Current dialogue object.
   * @param {object} contentRaw - Current dialogue text.
   * @param {function} callback - Callback after dialogue is complete.
   */

  svc.WordWrapper = function(current, contentRaw, cb) {
    app.autocompleteDialogueElement = false;
    app.dialogueTextGroup = game.add.group();
    svc.current = current;
    _animateDialogue();
    var profileImageHasName = app.dialogueProfileImage && app.dialogueProfileImage.statevars && app.dialogueProfileImage.statevars.name;

    _this = this;
    _this.ended = false;
    _this.content = TextParser.parseText(contentRaw[0], svc.current);
    _this.line = [];
    _this.wordIndex = 0;
    _this.lineIndex = 0;
    _this.wordDelay = app.config && app.config.messagespeed === 'fast' ? 10 : 40;
    _this.lineDelay = app.config && app.config.messagespeed === 'fast' ? 10 : 120;
    _this.audio = game.add.audio(svc.current.speakervoice || 'genericdialogue');
    _this.audio.loop = true;
    _this.top = svc.current.speaker ||
                (app.dialogueProfileImage && app.dialogueProfileImage.alive && profileImageHasName) ?
                dialogueConfig.borderTop + 27 : dialogueConfig.borderTop + 10;

    _this.create = function() {
      if (!svc.current.animateDialogue) {
        portraitSvc.animatePortrait(svc.current);
        _this.text = game.add.text(dialogueConfig.borderLeft, _this.top, _this.content,
                                   svc.getStyle('speech'));
        app.dialogueTextGroup.add(_this.text);
        _highlightText();
        _this.end();
        return;
      }
      if (svc.current.startsWithChoice) {
        _this.end();
        return;
      }
      app.dialogueSvc.createInputBlocker();
      _this.audio.onDecoded.add(_play, this);
      _this.text = game.add.text(dialogueConfig.borderLeft, _this.top, '',
                                 svc.getStyle('speech'));
      _highlightText();
      app.dialogueTextGroup.add(_this.text);
      _this.nextLine();
    };

    function _highlightText() {
      if (svc.current.highlightedTextIndexes) {
        for (var i = 0; i < svc.current.highlightedTextIndexes.length; i ++) {
          var startIndex = svc.current.highlightedTextIndexes[i].start;
          var endIndex = svc.current.highlightedTextIndexes[i].stop;
          var color = svc.current.highlightedTextIndexes[i].color;
          app.dialogueTextGroup.add(_this.text);
          _this.text.addColor(color, startIndex);
          _this.text.addColor('#ffffff', endIndex);
        }
      }
    }

    function _play() {
      portraitSvc.animatePortrait(svc.current);
      if (svc.current.speaker) {
        _this.audio.play('', 0, app.config.soundfx, true);
      }
    }

    //@TODO: fix audio bug, plays
    _this.pauseAudio = function() {
      if (_this.audio) {
        _this.audio.pause();
        _this.audio.destroy();
      }
    };

    function _playDefaultPortraitAnimation() {
      if (app.dialogueProfileImage && app.menuActivated === 0) {
        app.dialogueProfileImage.animations.play('default');
      }
    }

    _this.nextLine = function() {
      if (app.autocompleteDialogueElement) {
        return;
      }
      if (_this.lineIndex === _this.content.length) {
        _this.end();
        return;
      }
      _this.line = _this.content[_this.lineIndex].split(' ');

      _this.wordIndex = 0;
      game.time.events.repeat(_this.wordDelay, _this.line.length, _this.nextWord, this);
      _this.lineIndex++;
    };

    _this.end = function() {
      if (!_this.ended) {
        _this.pauseAudio();
        _killInputBlocker();
        _playDefaultPortraitAnimation();
        if ((svc.current.choices && svc.current.choices.length > 0 &&
             svc.current.chunkCount > svc.current.text.length) ||
             svc.current.startsWithChoice) {
          app.dialogueSvc.addChoices(svc.current.startsWithChoice);
        } else {
          app.dialogueSvc.addFollowup();
        }
        _this.ended = true;
      }
    };

    _this.nextWord = function (){
      if (app.autocompleteDialogueElement || !_this.text) {
        return;
      }
      if (_this.line[_this.wordIndex] === undefined) {
        if (!svc.current.ended) {
          _this.end();
          _this.ended = true;
        }
        return;
      }
      _this.text.text = _this.text.text.concat(_this.line[_this.wordIndex] + " ");
      _this.wordIndex++;
      if (_this.wordIndex === _this.line.length) {
        _this.text.text = _this.text.text.concat("\n");
        game.time.events.add(_this.lineDelay, _this.nextLine, this);
      }
    };
    return _this;
  };

  return svc.WordWrapper;

});
