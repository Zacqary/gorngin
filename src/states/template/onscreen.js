define([
  'services/cameraSvc',
  'services/dialogue/dialogueSvc',
  'services/audioSvc',
  'services/spriteClasses'
],
function (cameraSvc, dialogueSvc, audioSvc, spriteClasses) {
  var svc = {};
  svc.get = function() {
    var onscreen = {};
    return onscreen;
  };
  return svc;
});
