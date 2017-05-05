define([], spriteClasses);

function spriteClasses(){
  var svc = {};

  svc.Sprite = function(args) {

    this.args = args;
    this.hide = this.args.hide || false;

    if (this.hide) { return false; }

    this.sprite = game.add.sprite(this.args.x , this.args.y, this.args.img);
    this.sprite.parallax = this.args.parallax || null;
    this.sprite.alpha = (this.args.alpha !== null && this.args.alpha !== undefined) ? this.args.alpha : 1;
    this.sprite.collideWorldBounds = this.args.collideWorldBounds || false;
    this.sprite.fixedToCamera = this.args.fixedToCamera || false;
    this.sprite.update = this.args.update || function(){ return false; };

    if (this.args.anchor) {
      this.sprite.anchor.setTo(this.args.anchor);
    }

    if (this.args.animation && game.device.desktop ||
        (!game.device.desktop && this.args.animation &&
         this.args.disableAnimationForMobile !== true)) {
      for (var i = 0; i < this.args.animation.length; i ++) {
        var loop = this.args.animation[i].loop ===  false ? false : true;
        this.sprite.animations.add(this.args.animation[i].name,
          this.args.animation[i].sequence, this.args.animation[i].speed, loop);
        if (this.args.animation[i].play) {
          this.sprite.animations.play(this.args.animation[i].name);
        }
      }
    }

    if (this.args.onInputDown !== null && this.args.onInputDown !== undefined &&
        this.args.onInputDown !== false) {
      this.sprite.inputEnabled = true;
      this.sprite.input.useHandCursor = false;
      this.sprite.events.onInputDown.add(this.args.onInputDown, this);
      this.sprite.events.onInputOver.add(function(){
        game.sound.play('lightclick', 0.06, false);
      }, this);
      this.sprite.events.onInputOut.add(function(){
        game.sound.play('lightclick', 0.06, false);
      }, this);
    }

    if (this.args.physics) {
      game.physics.enable(this.sprite, Phaser.Physics[this.args.physics]);
      this.sprite.body.allowGravity = this.args.allowGravity || false;
      if (this.args.velocity) {
        this.sprite.body.velocity.x = this.args.velocity.x || 0;
        this.sprite.body.velocity.y = this.args.velocity.y || 0;
      }
    }

    if (this.args.scale)  {
      this.sprite.scale.setTo(this.sprite.scale.x * this.args.scale[0],
                              this.sprite.scale.y * this.args.scale[1]);
    }

    if (this.args.statevars) {
      this.sprite.statevars = {};

      for (var key in this.args.statevars) {
        this.sprite.statevars[key] = this.args.statevars[key];
      }
    }

    return this.sprite;
  };

  svc.TileSprite = function(args) {
    this.args = args;
    this.sprite = game.add.tileSprite(this.args.x, this.args.y,
                                          this.args.width, this.args.height,
                                          this.args.img);
    this.sprite.parallax = this.args.parallax;
    this.sprite.fixedToCamera = this.args.fixedToCamera;
    if (this.args.animation && game.device.desktop ||
        (!game.device.desktop && this.args.animation &&
         this.args.disableAnimationForMobile !== true)) {
      for (var i = 0; i < this.args.animation.length; i ++) {
        var loop = this.args.animation[i].loop ===  false ? false : true;
        this.sprite.animations.add(this.args.animation[i].name,
          this.args.animation[i].sequence, this.args.animation[i].speed, loop);
        if (this.args.animation[i].play) {
          this.sprite.animations.play(this.args.animation[i].name);
        }
      }
    }
    if (this.args.autoScroll) {
      this.sprite.autoScroll(this.args.autoScroll[0], this.args.autoScroll[1]);
    }
    if (this.args.onInputDown !== null && this.args.onInputDown !== undefined &&
        this.args.onInputDown !== false) {
      this.sprite.inputEnabled = true;
      this.sprite.events.onInputDown.add(this.args.onInputDown, this);
    }
    return this.sprite;
  };

  return svc;

}
