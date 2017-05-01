define(['services/portraitSvc',
        'services/cameraSvc',
        'services/audioSvc'
        ],

function (portraitSvc, cameraSvc, audioSvc){

    var svc = {};

    svc.splitBody = function(body, currentConfig) {
      var bodyChunks = [];
      var splitBody = body.match( /[^\.!\?]+[\.!\?]+/g );
      if (!splitBody) {
        bodyChunks = [body];
        return bodyChunks;
      }

      function _buildChunk() {
        var maxCharCount = currentConfig.portrait ? 90 : 200;
        var chunk = '';
        var characterCount = 0;
        for (var i = 0; i < splitBody.length; i ++) {
          if (characterCount < maxCharCount){
            characterCount += splitBody[i].length;
            chunk = chunk + splitBody[i];
            splitBody.shift();
            i -= 1;
          }
        }

        bodyChunks.push(chunk.trim());
      }
      while (splitBody.length > 0){
        _buildChunk();
      }
      return bodyChunks;
    };

    svc.getChoices = function(currentDialogueElement, currentConfig) {
      var text = svc.setTextConditionally(currentDialogueElement.body);
      if (text.startsWith('[[')||text.startsWith('\n[[')) {
        currentConfig.startsWithChoice = true;
      } else {
        currentConfig.startsWithChoice = false;
      }
      var choicesFinal = [];
      if (currentDialogueElement.body) {
        var choices = text.match(/\[(.*?)\]/g);
        if (!choices) {
          return false;
        }
        for (var i = 0; i < choices.length; i++){
          var replaceOpenBracket = choices[i].replace(/\[/g,'');
          var replaceClosedBracket = replaceOpenBracket.replace(/\]/g,'');
          var replaceArray = replaceClosedBracket.split('|');
          choicesFinal.push({
            "text": replaceArray[0].trim(),
            "followup": replaceArray[1].trim()
          });
        }
      }
      return choicesFinal;
    };

    svc.setTextConditionally = function(text) {
      var parseValues = svc.addValuesToText(text);
      var parseShowIf = svc.parseShowIf(parseValues);
      var parseHideIf = svc.parseHideIf(parseShowIf);
      return parseHideIf.trim();
    };

    svc.addValuesToText = function(text) {
      var re = /<<\$(.*?)>>/g;
      var match;
      var matches = [];

      while ((match = re.exec(text)) !== null) {
        matches.push(match);
      }

      for (var i = 0; i < matches.length; i ++) {
        var conditionalMatchRegex = /\$(.*?)>>/;
        var conditionalRegexMatch = conditionalMatchRegex.exec(matches[i][0])[1].trim();
        var regexString = '<<$' + conditionalRegexMatch + '>>';
        if (app.stateManager.invEval[conditionalRegexMatch] !== null &&
            app.stateManager.invEval[conditionalRegexMatch] !== undefined) {
          text = text.replace(regexString, app.stateManager.invEval[conditionalRegexMatch]);
        } else {
          text = text.replace(regexString, '');
        }
      }
      return text;
    };

    svc.parseShowIf = function(text) {
      var re = /<<if([\s\S]*?)<<\/if>>/g;
      var match;
      var matches = [];

      while ((match = re.exec(text)) !== null) {
        matches.push(match);
      }
      for (var i = 0; i < matches.length; i ++) {

        var conditionalMatchRegex = /\$([\s\S]*?)>>/;
        var conditionalRegexMatch = conditionalMatchRegex.exec(matches[i][0])[1].trim();

        if (
          conditionalRegexMatch.indexOf('=') > -1 ||
          conditionalRegexMatch.indexOf('>') > -1 ||
          conditionalRegexMatch.indexOf('<') > -1
        ) {
          _parseWithEval(conditionalRegexMatch);
        } else {
          _parseWithoutEval(conditionalRegexMatch);
        }
      }

      // hide segment unless the variable exists in the sm.inv array
      function _parseWithoutEval(conditionalRegexMatch) {
        var conditions = [];
        var regexString = '<<if \\$' + conditionalRegexMatch + '>>.*?<<\/if>>';

        if (conditionalRegexMatch.indexOf('&&') > -1) {
          conditions = conditionalRegexMatch.split('&&');
          _evalAndConditions();
        } else if (conditionalRegexMatch.indexOf('||') > -1) {
          regexString = regexString.replace('||', '\\|\\|');
          conditions = conditionalRegexMatch.split('||');
          _evalOrConditions();
        } else {
          conditions.push(conditionalRegexMatch);
          _evalAndConditions();
        }

        function _evalAndConditions() {
          for (var i = 0; i < conditions.length; i++ ) {
            var cond;
            var negateCondition = _checkNegative(conditions[i]);
            if (negateCondition) {
              cond = conditions[i].split('!')[1];
              if (app.stateManager.inv.indexOf(cond) !== -1) {
                _replace();
              }
            } else {
              cond = conditions[i];
              if (app.stateManager.inv.indexOf(cond) === -1) {
                _replace();
              }
            }
          }
        }

        function _replace() {
          var replace = new RegExp(regexString, "g");
          text = text.replace(replace,'');
        }

        function _checkNegative(item) {
          return item.startsWith('!');
        }

        function _evalOrConditions() {
          for (var i = 0; i < conditions.length; i++ ) {
            var negateCondition = _checkNegative(conditions[i]);
            var cond;
            if (negateCondition) {
              cond = conditions[i].split('!')[1];
              if (app.stateManager.inv.indexOf(cond) === -1) {
                return;
              }
            } else {
              cond = conditions[i];
              if (app.stateManager.inv.indexOf(cond) > -1) {
                return;
              }
            }
          }
          var replace = new RegExp(regexString, "g");
          text = text.replace(replace,'');
        }
      }

      // hide segment unless the key of the sm.invEval object equals the value provided
      function _parseWithEval(conditionalRegexMatch) {
        var evalType;
        var regexString = '<<if \\$' + conditionalRegexMatch + '>>.*?<<\/if>>';
        var evalArray = conditionalRegexMatch.split(/[=><]/);
        var key = evalArray[0].trim();
        var value = isNaN(evalArray[1].trim()) ? evalArray[1].trim() : parseInt(evalArray[1].trim());
        var keyExists = app.stateManager.invEval[key] !== null && app.stateManager.invEval[key] !== undefined;

        if (!keyExists) {
          _replace();
          return;
        }
        // replace if false, else keep
        if (conditionalRegexMatch.indexOf('=') > -1) {
          if (app.stateManager.invEval[key] !== value) {
            _replace();
          }
        } else if (conditionalRegexMatch.indexOf('>') > -1) {
          if (!(app.stateManager.invEval[key]>value)) {
            _replace();
          }
        } else if (conditionalRegexMatch.indexOf('<') > -1) {
          if (!(app.stateManager.invEval[key]<value)) {
            _replace();
          }
        }

        function _replace() {
          var replace = new RegExp(regexString, "g");
          text = text.replace(replace,'');
        }
      }
      var replaceOpenIf = text.replace(/<<if (.*?)>>/,'');
      var replaceClosedIf = replaceOpenIf.replace(/<<\/if>>/,'');
      return replaceClosedIf;
    };

    svc.parseHideIf = function(text) {

      var re = /<<hideif(.*?)<<\/hideif>>/g;
      var match;
      var matches = [];
      while ((match = re.exec(text)) !== null) {
        matches.push(match);
      }
      for (var i = 0; i < matches.length; i ++) {
        var conditionalMatchRegex = /\$(.*?)>>/;
        var conditionalRegexMatch = conditionalMatchRegex.exec(matches[i][0])[1].trim();
        var regexString = '<<hideif \\$' + conditionalRegexMatch + '>>.*?<<\/hideif>>';

        if (app.stateManager.inv.indexOf(conditionalRegexMatch) > -1) {
          var replace = new RegExp(regexString, "g");
          text = text.replace(replace,'');
        }
      }
      var replaceOpenIf = text.replace(/<<hideif .*?>>/,'');
      var replaceClosedIf = replaceOpenIf.replace(/<<\/hideif>>/,'');
      return replaceClosedIf;
    };

    svc.getHighlightedTextIndices = function(matches) {
      var current = {};
      var currentArray = [];
      var offset = 0;
      for (var i = 0; i < matches.length; i ++) {
        var startOffset = 0;
        var iteratedOffset = '<<highlight-r>>'.length;
        if (i > 0) {
          offset += iteratedOffset;
          //startOffset = 2;
        }
        if (matches[i][1] === 'highlight-r') {
          current.color = '#ffa1ff';
          current.start = matches[i].index - offset + startOffset;
        } else if (matches[i][1] === 'highlight-g') {
          current.color = '#aaff55';
          current.start = matches[i].index - offset + startOffset;
        } else if (matches[i][1] === 'highlight-y') {
          current.color = '#ffff55';
          current.start = matches[i].index - offset + startOffset;
        } else if (matches[i][1] === '/highlight') {
          offset += '<</highlight>>'.length - iteratedOffset;
          current.stop = matches[i].index - offset - 1;
        }
        if (current.stop) {
          currentArray.push(current);
          current = {};
        }
      }
      return currentArray;
    };

    svc.getItems = function(element) {
      var items = [];
      if (element.tags) {
        var tags = element.tags.split(',');
        for (var i = 0; i < tags.length; i ++) {
          if (tags[i].trim().startsWith('i-')) {
            items.push(tags[i].trim().split('i-')[1]);

          }
        }
        return items;
      }
      return false;
    };

    // if the element doesn't have choices, go to this element
    svc.getNext = function(element) {
      if (element.tags) {
        var tags = element.tags.split(',');
        for (var i = 0; i < tags.length; i ++) {
          if (tags[i].trim().startsWith('next-')) {
            return tags[i].trim().split('next-')[1];
          }
        }
      }
      return false;
    };

    svc.getPortait = function(element) {
      if (element.tags) {
        var tags = element.tags.split(',');
        for (var i = 0; i < tags.length; i ++) {
          if (tags[i].trim().startsWith('p-')) {
            return tags[i].trim().split('p-')[1];
          }
        }
      }
      return false;
    };

    svc.getAnimation = function(element) {
      if (element.tags) {
        var tags = element.tags.split(',');
        for (var i = 0; i < tags.length; i ++) {
          if (tags[i].trim().startsWith('a-')) {
            return tags[i].trim().split('a-')[1];
          }
        }
      }
      return false;
    };

    svc.getName = function(element) {
      if (element.tags) {
        var tags = element.tags.split(',');
        for (var i = 0; i < tags.length; i ++) {
          if (tags[i].trim().startsWith('n-')) {
            return tags[i].trim().split('n-')[1];
          }
        }
      }
      return false;
    };

    svc.playMusic = function(element) {
      if (element.tags) {
        var tags = element.tags.split(',');
        for (var i = 0; i < tags.length; i ++) {
          if (tags[i].trim().startsWith('music-')) {
            var theme = tags[i].trim().split('music-')[1];
            var track = audioSvc.themes[theme];

            audioSvc.crossfadetrack(track);
            return theme;
          }
        }
      }
      return false;
    };

    svc.getSoundEffect = function(element) {
      if (element.tags) {
        var tags = element.tags.split(',');
        for (var i = 0; i < tags.length; i ++) {
          if (tags[i].trim().startsWith('sound-')) {
            var sfx = tags[i].trim().split('sound-')[1];
            return sfx;
          }
        }
      }
      return false;
    };

    // set evaluative inventory items passed in as tags
    svc.setVars = function(element) {
      var items = [];
      if (element.tags) {
        var tags = element.tags.split(',');
        for (var i = 0; i < tags.length; i ++) {
          if (tags[i].trim().startsWith('set-')) {
            var stateVarKeyVal = tags[i].trim().split('set-')[1];
            if (stateVarKeyVal.indexOf('+=') > -1) {
              _increment(stateVarKeyVal);
            } else if (stateVarKeyVal.indexOf('-=') > -1) {
              _decrement(stateVarKeyVal);
            } else {
              _set(stateVarKeyVal);
            }
          }
        }
      }

      function _set(stateVarKeyVal) {
        var stateVarKey = stateVarKeyVal.split('=')[0];
        var stateVarVal = stateVarKeyVal.split('=')[1];
        if (isNaN(stateVarVal)) {
          app.stateManager.invEval[stateVarKey] = stateVarVal;
        } else {
          app.stateManager.invEval[stateVarKey] = Number(stateVarVal);
        }

      }

      function _increment(stateVarKeyVal) {
        var stateVarKey = stateVarKeyVal.split('+=')[0];
        var stateVarVal = stateVarKeyVal.split('+=')[1];
        if (!app.stateManager.invEval[stateVarKey]) {
          app.stateManager.invEval[stateVarKey] = 0;
        }
        app.stateManager.invEval[stateVarKey] += Number(stateVarVal);

      }

      function _decrement(stateVarKeyVal) {
        var stateVarKey = stateVarKeyVal.split('-=')[0];
        var stateVarVal = stateVarKeyVal.split('-=')[1];
        if (!app.stateManager.invEval[stateVarKey]) {
          app.stateManager.invEval[stateVarKey] = 0;
        }
        app.stateManager.invEval[stateVarKey] -= Number(stateVarVal);

      }
    };

    svc.removeItems = function(element) {
      var items = [];
      if (element.tags) {
        var tags = element.tags.split(',');
        for (var i = 0; i < tags.length; i ++) {
          if (tags[i].trim().startsWith('rm-')) {
            app.stateManager.removeFromInv(tags[i].trim().split('rm-')[1]);
          }
        }
      }
    };

    svc.returnToPreviousTrack = function(element) {
      var items = [];
      var trackChange = svc.playMusic(element);
      if (element.tags) {
        var tags = element.tags.split(',');
        for (var i = 0; i < tags.length; i ++) {

          if (tags[i].trim() === 'returntoprevioustrack') {
            if (audioSvc.previousTrack || trackChange) {
              return true;
            }
          }
        }
      }
      return false;
    };

    svc.getState = function(element) {
      if (element.tags) {
        var tags = element.tags.split(',');
        for (var i = 0; i < tags.length; i ++) {
          if (tags[i].trim().startsWith('s-')) {
            var state = tags[i].trim().split('s-')[1];

            if (app.dialogueBorder && app.dialogueBorder.alive) {
              if (app.dialogueBorder.animations &&
                  app.dialogueBorder.animations.currentAnim.name === 'openPortrait') {
                    app.dialogueSvc.animateBorderClose(false, _closeFrame);
              } else {
                _closeFrame();
              }
            } else {
              cameraSvc.fade('out', _changeState);
            }
          }
        }
      }
      function _closeFrame() {
        if (app.stateManager.puc && app.stateManager.puc.fullscreenButton.alpha) {
          app.stateManager.puc.fullscreenButton.alpha = 0;
        }
        game.sound.play('cameraclose', 0.1);
        app.dialogueBorder.play('closeframe');
        app.dialogueBorder.animations.currentAnim.onComplete.add(function() {
          _changeState();
        });
      }
      function _changeState() {
        app.stateManager.currentDialogue.callback = null;
        app.dialogueSvc.closeDialogueWindow(function() {
          game.state.start('loadState', true, false, state);
        });
      }
      return false;
    };

    svc.getBody = function(element) {
      if (element.body) {
        return element.body.split('\n\n')[0].trim();
      }
    };

    svc.fireEvents = function(element) {
      var events = [];
      if (element.tags) {
        var tags = element.tags.split(',');
        for (var i = 0; i < tags.length; i ++) {
          if (tags[i].trim().startsWith('event-')) {
            events.push(tags[i].trim().split('event-')[1]);
          }
        }
      }
      for (var i = 0; i < events.length; i ++) {
        if (app.stateManager.events[app.stateManager.currentState] && app.stateManager.events[app.stateManager.currentState][events[i]]) {
          app.stateManager.events[app.stateManager.currentState][events[i]]();
        }
      }
    };

    svc.hasElement = function(el, dialogue) {
      if (!el) { return false; }
      var elements = dialogue.elements;
      for (var i = 0; i < elements.length; i ++) {
        if (elements[i].title === el) {
          return true;
        }
      }
      return false;
    };

    svc.hasPlaceholderPortrait = function(element, dialogue) {
      var elements = dialogue.elements;
      for (var i = 0; i < elements.length; i ++) {
        if (elements[i].title === element) {
          if (elements[i].tags.indexOf('p-placeholder') > -1) {
            return true;
          }
        }
      }
      return false;
    };

    svc.getDialogueGroupChildByKey = function(key) {
      var match;
      app.dialogueGroup.forEach(function(e) {
        if (e.key === key) {
          match = e;
        }
      });
      return match;
    };

    svc.playDialogueGroupChildAnimation = function(key, animation) {
      app.dialogueGroup.forEach(function(e) {
        if (e.key === key) {
          e.play(animation);
        }
      });
    };

    return svc;

});
