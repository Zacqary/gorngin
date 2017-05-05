define([
  'gorngin/cameraSvc',
  'gorngin/dialogue/dialogueSvc',
  'gorngin/audioSvc',
  'gorngin/spriteClasses'
],
function (cameraSvc, dialogueSvc, audioSvc, spriteClasses) {
  var svc = {};
  svc.get = function() {
    var onscreen = {};
    return onscreen;
  };
  return svc;
});
