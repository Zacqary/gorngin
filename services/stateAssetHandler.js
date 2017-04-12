define(['services/assetDir', 'services/audioSvc'], statePreloader);

function statePreloader(assetDir, audioSvc){

  var svc = {};

  svc.preload = function(config){

    var beginMessage, beginStyle, beginText, loadTitleText, loadTitle, loadTitleImage, fileComplete;

    if (config['audio']){
      for (var i = 0; i < config.audio.length; i ++){
        if ((typeof config.audio[i] === 'object' && config.audio[i].type === 'phaser') &&
             !game.cache.checkSoundKey(config.audio[i].name)) {
          game.load.audio(config.audio[i].name, ['./assets/audio/' + config.audio[i].name +
                          '.ogg', './assets/audio/' + config.audio[i].name + '.mp3', ]);
        } else if (typeof config.audio[i] === 'string' && !game.cache.checkSoundKey(config.audio[i])) {
          game.load.audio(config.audio[i], ['./assets/audio/' + config.audio[i] +
                          '.ogg', './assets/audio/' + config.audio[i] + '.mp3', ]);
        }
      }
    }

    if (config['map']){
      for (var i = 0; i < config.map.length; i ++) {
        if (!game.cache.checkTilemapKey(config['map'][i])){
          game.load.tilemap(config.map, './assets/tilemaps/' + config.map[i] + '.json', null, Phaser.Tilemap.TILED_JSON);
        }
      }
    }

    if (config.images){
      for (var i = 0; i < config.images.length; i ++){
        var image = assetDir[config.images[i]];
        if (game.cache.checkImageKey(image) !== true){
          game.load.image(image.name, image.path);
        }
      }
    }

    if (config.spritesheets){
      for (var i = 0; i < config.spritesheets.length; i ++) {
        var sprite = assetDir[config.spritesheets[i]];
        if (!game.cache.checkImageKey(sprite) && sprite && sprite.name){
          game.load.spritesheet(sprite.name, sprite.path, sprite.width, sprite.height);
        } else {
          console.log('---> Sprite load error', sprite);
        }
      }
    }

  };

  svc.nullStateObjects = function(state) {

    for (var key in game.state.states[state].sprites) {
      if (game.state.states[state].sprites[key].constructor === Array) {
        for (var i = 0; i < game.state.states[state].sprites[key].length; i ++) {
          game.state.states[state].sprites[key][i].destroy();
          game.state.states[state].sprites[key][i] = null;
        }
        game.state.states[state].sprites[key] = null;
      } else if (game.state.states[state].sprites[key].destroy) {

        game.state.states[state].sprites[key].destroy();
        game.state.states[state].sprites[key] = null;
      }
    }
  };

  return svc;
}
