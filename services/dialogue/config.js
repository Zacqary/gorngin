define([],
function() {
  var svc = {};
  var _styles = {
    basic: {
      font: "16px " + gameConfig.defaultfont,
      fill: "#fff",
      align: "left",
      wordWrap: true,
    },
    speech: {
      font: "16px " + gameConfig.defaultfont,
      fill: "#fff",
      align: "left",
      wordWrap: true,
    },
    name: {
      font: "16px " + gameConfig.defaultfont,
      fill: "#ffffaa",
      align: "left",
      wordWrap: true,
    },
    selectedchoice: {
      font: "17px " + gameConfig.defaultfont,
      fill: "#aaaaff",
      align: "left",
      wordWrap: true,
    },
    unselectedchoice: {
      font: "17px " + gameConfig.defaultfont,
      fill: "#fff",
      align: "left",
      wordWrap: true,
    },
    hover: {
      font: "18px " + gameConfig.defaultfont,
      fill: "#aaffaa",
      align: "left",
      wordWrap: true
      //backgroundColor: '#1155dc'
    }
  };

  var _sounds = {
    hover: {
      sound: 'lightclick',
      vol: 0.1
    },
    back: {
      sound: 'unclick',
      vol: 0.3
    },
    init: {
      sound: 'dialogue_appear',
      vol: 0.2
    },
    click: {
      sound: 'begingame',
      vol: 0.2
    }
  };

  svc.config = {
    height: gameConfig.dialogue.height,
    background: false,
    borderLeft: gameConfig.dialogue.openFrom === 'TOP' ? 10 : 5,
    borderTop: gameConfig.dialogue.openFrom === 'TOP' ? 20 : game.height - gameConfig.dialogue.height,
    openFrom: gameConfig.dialogue.openFrom,
    getTextWidth: function(hasPortrait) {
      return hasPortrait ? 500 : 630;
    },
    styles: _styles,
    sounds: _sounds,
    keywords: ['ask', 'buy', 'cancel', 'look', 'move', 'talk', 'speak', 'use', 'purchase', 'leave', 'open', 'destination'] // these keywords will remain highlighted
  };

  return svc.config;
});
