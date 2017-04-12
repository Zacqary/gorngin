define(['services/portraitSvc',
        'services/dialogue/config'
        ],

function(portraitSvc, dialogueConfig) {

  var svc = {};

  svc.parseText = function(text, currentDialogue) {
    svc.current = currentDialogue;
    var re = /<<(.*?)>>/g;
    var match;
    var matches = [];
    var replaceConditionals = text.replace(/<<(?=if|hideif|\/hideif|\/if)(.*?)>>/g,'');
    while ((match = re.exec(replaceConditionals)) !== null) {
      matches.push(match);
    }
    svc.current.highlightedTextIndexes = _getHighlightedTextIndices(matches);
    var reOpenHighlight = replaceConditionals.replace(/<<(.*?)>>/g,'');
    var reClosedHighlight = reOpenHighlight.replace(/<<(\/.*?)>>/g,'');
    return [reClosedHighlight];
  };

  function _getHighlightedTextIndices(matches) {
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
  }

  return svc;

});
