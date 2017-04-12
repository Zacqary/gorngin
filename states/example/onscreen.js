define([
  'services/cameraSvc',
  'services/dialogue/dialogueSvc',
  'services/audioSvc',
  'services/spriteClasses'
],
function (stateAssetHandler, stateConfigs, cameraSvc, dialogueSvc, audioSvc, mapHelpers, spriteClasses, npcCtrl) {
  var svc = {};
  svc.get = function() {
    var onscreen = {};
    return onscreen;  
  };
  return svc;
});
