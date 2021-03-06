define(['jquery'], function($){
  var svc = {};
  var detectBrowser =  $('browser-player');
  if (!detectBrowser.length) {
    $('body').append('<audio id="browser-player"></audio>');
  }
  var browserPlayer = $('#browser-player');

  var currentTrackType;

  if (browserPlayer[0]) {
    browserPlayer[0].ontimeupdate = function(){
      var buffer = 0.44;
      if(this.currentTime > this.duration - buffer){
        this.currentTime = 0;
        this.play();
      }
    };
  }

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
    'refinery': {
      'name': 'refinery',
      'type': 'browser',
      'id'  : 'refinery'
    },
    'videostore': {
      'name': 'norcotheme',
      'type': 'browser',
      'id'  : 'videostore'
    },
    'battle': {
      'name': 'modarchive_musix-after',
      'type': 'browser',
      'id'  : 'battle'
    }
  };

  svc.preloadTracks = function() {
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
  };

  var volIndex = {
    'battle': 1,
    'comebacktome': 0.7,
    'norconoir'   : 1,
    'overworld'   : 0.15,
    'livingroomting': 1,
    'pleasantnightshit' : 0.5,
    'deadofthebrainstaffroll': 0.2,
    'serenitybells': 0.15,
    'opening': 0.8,
    'modarchive_a_new_frontend': 1
  };

  svc.playTrack = function(track){
    var vol = app.config.devStart ? app.config.music : volIndex[track.name];

    if (  svc.currentTrack === track ) { return; }
    svc.previousTrack = svc.currentTrack;
    svc.currentTrack = track;
    if (music) { music.destroy(); }
    if (track && track.type === 'browser') {
      currentTrackType = 'browser';
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
      browserPlayer.animate({volume: vol}, 1);
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
  svc.crossfadetrack = function(origTrack, origFade) {
    var track = (typeof origTrack === 'string' || origTrack instanceof String) ? svc.themes[origTrack] : origTrack;
    var fade = origFade ? origFade : 2500;
    var vol = app.config.devStart ? app.config.music : volIndex[track.name] || 1;
    if (  svc.currentTrack === track ) { return; }
    if (currentTrackType === 'phaser') {
      music.fadeOut(5000);
    } else {
      var musicFade = browserPlayer.animate({volume: 0}, fade, null, _playNext);
    }

    function _playNext() {
      svc.playTrack(track);
    }
  };


  return svc;
});
