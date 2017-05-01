define(['services/dialogue/config',
        'services/spriteClasses'
       ],
function(dialogueConfig, spriteClasses){
  var svc = {};

  svc.get = function(name, x, y) {
    if (svc[name]) {
      var enemy = svc[name](x, y);
      app.enemyGroup.add(enemy);
      return enemy;
    }
  };

  svc.getEnemyInstance = function(id){
    for (var i = 0; i < app.enemyGroup.children.length; i ++) {
      if (app.enemyGroup.children[i].statevars && app.enemyGroup.children[i].statevars.id === id) {
        return app.enemyGroup.children[i];
      }
    }
  };

  svc.getEnemyIndex = function(id){
    for (var i = 0; i < app.enemyGroup.children.length; i ++) {
      if (app.enemyGroup.children[i].statevars && app.enemyGroup.children[i].statevars.id === id) {
        return i;
      }
    }
  };

  svc.shieldguard = function(x, y){
    return new spriteClasses.Sprite({
      x: x,
      y: y,
      img: 'shieldguard',
      animation: [
        {
          name: 'default',
          sequence: [0],
          speed: 4,
          play: true,
          loop: false
        },
        {
          name: 'attack',
          sequence: [1, 1, 1, 0],
          speed: 4,
          play: false,
          loop: false
        }
      ],
      disableAnimationForMobile: true,
      allowGravity: false,
      scale: [1, 1],
      fixedToCamera: true,
      collideWorldBounds: true,
      inputEnabled: false,
      onInputDown: false,
      parallax: false,
      statevars: {
        hp: 120,
        maxHP: 120,
        name: 'Shield Guard',
        weapon: 'assaultcannon',
        active: false, // active turn in combat
        include: true, // include in combat
        type: 'enemy',
        alive: true,
        strength: 10,
        defense: 12,
        speed: 5
      }
    });
  };

  return svc;

});
