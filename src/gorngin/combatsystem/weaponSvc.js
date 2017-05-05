define([
       ],
function(){
  var svc = {};

  svc.weapons = [
    {
      'id': 'knife',
      'name': 'knife',
      'sound': 'slash'
    },
    {
      'id': 'armcannon',
      'name': 'arm cannon',
      'sound': 'blast'
    },
    {
      'id': 'assaultcannon',
      'name': 'arm cannon',
      'sound': 'blast'
    },
    {
      'id': 'fists',
      'name': 'fists',
      'sound': 'hit'
    }
  ];

  svc.getWeapon = function(id) {
    for (var i = 0; i < svc.weapons.length; i ++) {
      if (svc.weapons[i].id === id) {
        return svc.weapons[i];
      }
    }
  };

  return svc;

});
