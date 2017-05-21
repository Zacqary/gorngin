define([
  'gorngin/dialogue/config'
      ],
function(config) {

  var svc = {};

  svc.cycleCredits = function(textArray, time) {
    app.coverGroup = game.add.group();
    var bmp = game.add.bitmapData(game.world.width, game.world.height + 50);
    bmp.ctx.rect(0, 0, game.world.width, game.world.height + 50);
    bmp.ctx.fillStyle = app.config.backgroundColor;
    bmp.ctx.fill();

    var sprite = game.add.sprite(0, 0, bmp);
    sprite.alpha = 1;

    if (app.coverGroup) {
      app.coverGroup.add(sprite);
    }

    console.log();
    
    for (var i = 0; i < textArray.length; i ++) {
      var t = game.add.text(game.width/2, game.height/2,
                                textArray[i].credit + '\n' + textArray[i].name,
                                config.styles.credits);
      t.anchor = [0.5, 0.5];
      if (app.coverGroup) {
        app.coverGroup.add(t);
      }
    }

  };

  return svc;

});
