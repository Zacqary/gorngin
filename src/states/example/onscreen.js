define([
  'gorngin/cameraSvc',
  'gorngin/dialogue/dialogueSvc',
  'gorngin/audioSvc',
  'gorngin/spriteClasses'
],
function (stateAssetHandler, stateConfigs, cameraSvc, dialogueSvc, audioSvc, mapHelpers, spriteClasses, npcCtrl) {
  var svc = {};
  svc.get = function() {
    var onscreen = {};
    return onscreen;  
  };
  return svc;
});
