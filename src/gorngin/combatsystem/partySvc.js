define([
       ],
function(){

  var svc = {};

  svc.party = [
    {
      statevars: {
        'name': 'You',
        'id': 'you',
        'type': 'party',
        'portrait': 'you',
        'hp': 120,
        'maxHP': 120,
        'defense': 8,
        'strength': 12,
        'weapon': 'fists',
        'speed': 11,
        'active': false,
        'include': true,
        'alive': true
      }
    },
    {
      statevars: {
        'name': 'Million',
        'id': 'million',
        'portrait': 'robit',
        'type': 'party',
        'hp': 230,
        'maxHP': 230,
        'weapon': 'armcannon',
        'strength': 60,
        'defense': 20,
        'speed': 15,
        'active': false,
        'include': true,
        'alive': true
      }
    }
  ];

  svc.setStat = function(id, stat, value) {
    for (var i = 0; i < svc.party.length; i ++) {
      if (svc.party[i].statevars.id === id) {
        svc.party[i].statevars[stat] = value;
      }
    }
  };

  svc.getStats = function(id) {
    for (var i = 0; i < svc.party.length; i ++) {
      if (svc.party[i].statevars.id === id) {
        return svc.party[i];
      }
    }
  };

  return svc;
});
