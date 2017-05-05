define([], assetDir);

function assetDir(){

  var buttonPath = './assets/buttons/';
  var spritePath = './assets/sprites/';

  var svc = {

    "backbutton": {
        name: "backbutton",
        width: 14,
        height: 50,
        path: "./assets/sprites/backbutton.png"
    },

    "dialoguecontinue": {
        name: "dialoguecontinue",
        width: 31,
        height: 28,
        path: './assets/sprites/dialoguecontinue.png'
    },

    "fullscreen": {
      name: 'fullscreen',
      path: './assets/sprites/fullscreen.png'
    },

    //PARTICLES

    "white": {
        name: 'white',
        path: './assets/particles/white.png'
    },

    "microwhite": {
        name: 'microwhite',
        path: './assets/particles/microwhite.png'
    },

  };

  return svc;
}
