define([],
function() {
  var svc = {};
  var _styles = {
    basic: {
      font: "16px " + app.config.defaultfont,
      fill: "#fff",
      align: "left",
      wordWrap: true,
    },
    credits: {
      font: "22px " + app.config.defaultfont,
      fill: "#fff",
      align: "center",
      wordWrap: false,
    },
    stats: {
      font: "12px " + app.config.defaultfont,
      fill: "#fff",
      align: "left",
      wordWrap: true,
    },
    speech: {
      font: "16px " + app.config.defaultfont,
      fill: "#fff",
      align: "left",
      wordWrap: true,
    },
    name: {
      font: "16px " + app.config.defaultfont,
      fill: "#ffffaa",
      align: "left",
      wordWrap: true,
    },
    selectedchoice: {
      font: "17px " + app.config.defaultfont,
      fill: "#aaaaff",
      align: "left",
      wordWrap: true,
    },
    unselectedchoice: {
      font: "17px " + app.config.defaultfont,
      fill: "#fff",
      align: "left",
      wordWrap: true,
    },
    hover: {
      font: "18px " + app.config.defaultfont,
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
      sound: 'confirm',
      vol: 0.2
    }
  };

  svc.setConfig = function(config) {
    dialogueConfig = jQuery.extend(config, svc.config);
    svc.config = config;
  };

  svc.config = {
    height: app.config.dialogue.height,
    background: false,
    borderLeft: app.config.dialogue.openFrom === 'TOP' ? 10 : 5,
    borderTop: app.config.dialogue.openFrom === 'TOP' ? 20 : game.height - app.config.dialogue.height,
    openFrom: app.config.dialogue.openFrom,
    getTextWidth: function(hasPortrait) {
      return hasPortrait ? 500 : 630;
    },
    getConfig: function() {
      return svc.config;
    },
    setConfig: svc.setConfig,
    styles: _styles,
    sounds: _sounds,
    keywords: ['ask', 'buy', 'cancel', 'look', 'move', 'talk', 'speak', 'use', 'purchase', 'leave', 'open', 'destination'] // these keywords will remain highlighted
  };

  return svc.config;
});
