define([
    'gorngin/dialogue/config',
    'gorngin/combatsystem/config',
    'gorngin/combatsystem/partySvc',
    'gorngin/spriteClasses'
],
function (dialogueConfig, combatConfig, partySvc, spriteClasses){

var svc = {};
var combatBackgroundSprite = null;
var combatFlashSprite = null;

app.combatBackgroundGroup = game.add.group();

svc.createCombatBackground = function() {
  combatBackgroundSprite = new spriteClasses.TileSprite({
    x: 0,
    y: 0,
    width: game.width + 50,
    height: 240,
    img: 'battlegrid',
    allowGravity: false,
    scale: [1, 1],
    fixedToCamera: true,
    collideWorldBounds: true,
    parallax: false,
    statevars: {
    }
  });
  combatBackgroundSprite.alpha = 0;

  game.add.tween(combatBackgroundSprite).to({alpha: 1}, 700,
                 Phaser.Easing.Linear.None, true);
  app.combatBackgroundGroup.add(combatBackgroundSprite);
};

svc.createFlash = function() {
  var tweenIn, tweenOut;
  var flash = game.add.bitmapData(700, 240);
  flash.ctx.rect(0, 0, 700, 240);
  flash.ctx.fillStyle = '#FFFFFF';
  flash.ctx.fill();
  flash.fixedToCamera = true;
  combatFlashSprite = new spriteClasses.Sprite({
    x: 0,
    y: 0,
    width: game.width + 50,
    height: 240,
    img: flash,
    allowGravity: false,
    scale: [1, 1],
    fixedToCamera: true,
    collideWorldBounds: true,
    parallax: false,
    statevars: {
    }
  });
  combatFlashSprite.alpha = 0;
  tweenIn = game.add.tween(combatFlashSprite).to({alpha: 0.6}, 70,
                 Phaser.Easing.Linear.None, true);
  tweenOut = function() {
    game.add.tween(combatFlashSprite).to({alpha: 0}, 70,
                                Phaser.Easing.Linear.None, true);
  };
  tweenIn.onComplete.add(tweenOut);
  app.combatBackgroundGroup.add(combatFlashSprite);

};

svc.addCombatBackgroundEffect = function(effect) {
  if (!combatBackgroundSprite) { return; }
  if (effect === 'hide') {
    game.add.tween(combatBackgroundSprite).to({alpha: 0}, 700,
                   Phaser.Easing.Linear.None, true);
  } else if (effect === 'flashwhite') {
    svc.createFlash();
  }
};

return svc;

});
