define([], musicSvc);

function musicSvc(){
  var svc = {};
  var browserPlayer = $('#browser-player');
  var currentTrackType;

  browserPlayer[0].ontimeupdate = function(){
    var buffer = 0.44;
    if(this.currentTime > this.duration - buffer){
      this.currentTime = 0;
      this.play();
    }
  };

  game.onPause.add(function(){
    browserPlayer[0].pause();
  }, this);

  game.onResume.add(function(){
    browserPlayer[0].play();
  }, this);

  svc.currentTrack = null;
  svc.previousTrack = null;

  svc.themes = {
    'menu': {
      'name': 'opening',
      'type': 'browser',
      'id'  : 'mainmenu'
    },
    'highway': {
      'name': 'livingroomting',
      'type': 'browser',
      'id'  : 'highway'
    },
    'bar': {
      'name': 'norconoir',
      'type': 'browser',
      'id'  : 'bar'
    },
    'comebacktome': {
      'name': 'comebacktome',
      'type': 'browser',
      'id'  : 'bike'
    },
    'conveniencestore': {
      'name': 'cavejazz',
      'type': 'browser',
      'id'  : 'cavejazz'
    },
    'videostore': {
      'name': 'norcotheme',
      'type': 'browser',
      'id'  : 'videostore'
    }
  };

  function preloadTracks() {
    for (var track in svc.themes) {
       if (svc.themes.hasOwnProperty(track)) {
         if (svc.themes[track].type === 'browser') {
           var audio = new Audio();
           if (audio.canPlayType('audio/ogg')) {
             audio.src = 'assets/audio/' + svc.themes[track].name + '.ogg';
           } else {
             audio.src = 'assets/audio/' + svc.themes[track].name + '.mp3';
           }
        }
      }
    }
  }

  preloadTracks();

  var volIndex = {
    'comebacktome': 0.7,
    'norconoir'   : 1,
    'overworld'   : 0.15,
    'pleasantnightshit' : 0.5,
    'deadofthebrainstaffroll': 0.2,
    'serenitybells': 0.15,
    'opening': 0.8,
    'modarchive_a_new_frontend': 1
  };

  svc.playTrack = function(track){

    var vol = gameConfig.devStart ? gameConfig.music : volIndex[track.name];
    if (  svc.currentTrack === track ) { return; }
    svc.previousTrack = svc.currentTrack;
    svc.currentTrack = track;
    if (music) { music.destroy(); }
    if (track.type === 'browser') {
      currentTrackType = 'browser';
      browserPlayer.animate({volume: vol}, 1); //= volIndex[track.name];
      var src= 'assets/audio/' + track.name;
      if (browserPlayer[0].canPlayType('audio/ogg')) {
        src = src + '.ogg';
        browserPlayer.attr('src', src)[0];
      } else {
        src = src + '.mp3';
        browserPlayer.attr('src', src)[0];
      }
      browserPlayer[0].loop = true;
      browserPlayer[0].play();
    } else {
      currentTrackType = 'phaser';
      browserPlayer[0].pause();
      music = game.add.audio(track.name);
      music.onDecoded.add(start, this);
      music.loop = true;
      function start(){
        music.play('', 0, (volIndex[track.name]) , true);
      }
    }


  };

  svc.fadeTrack = function() {
    if (currentTrackType === 'phaser') {
      music.fadeOut(5000);
    } else {
      browserPlayer.animate({volume: 0}, 5000);
    }
  };

  //@TODO: add phaser crossfade in conditional
  svc.crossfadetrack = function(track) {
    var vol = gameConfig.devStart ? gameConfig.music : volIndex[track.name] || 1;
    if (  svc.currentTrack === track ) { return; }
    if (currentTrackType === 'phaser') {
      music.fadeOut(5000);
    } else {
      var musicFade = browserPlayer.animate({volume: 0}, 2500, null, _playNext);
    }

    function _playNext() {
      svc.playTrack(track);
      browserPlayer.animate({volume: vol}, 1);
    }
  };


  return svc;
}
