define(['gorngin/spriteClasses'],
function(spriteClasses) {
  var svc = {};

  svc.animatePortrait = function(currentDialogue) {

    if (currentDialogue.portrait === 'placeholder' && app.menuActivated > 0) {
      app.dialogueProfileImage.animations.play('option' + app.menuActivated);
    } else if (app.dialogueProfileImage && app.dialogueProfileImage.animations && currentDialogue.animation) {
      app.dialogueProfileImage.animations.play(currentDialogue.animation);
    } else if (app.dialogueProfileImage && app.dialogueProfileImage.animations && app.dialogueProfileImage.animations.getAnimation('talking')){
      app.dialogueProfileImage.animations.play('talking');
      return true;
    } else if (app.dialogueProfileImage && app.dialogueProfileImage.animations && app.dialogueProfileImage.animations.getAnimation('default')) {
      app.dialogueProfileImage.animations.play('default');
    }
  };

  svc.get = function(name) {
    if (svc[name]) {
      return svc[name]();
    }
  };

  function getY() {
    return app.config.dialogue.openFrom === 'TOP' ? 20 : game.height - app.config.dialogue.height - 5;
  }

  function getX() {
    return app.config.dialogue.openFrom === 'TOP' ? 10 : 3;
  }

  svc.getY = getY;
  svc.getX = getX;

  return svc;
});
