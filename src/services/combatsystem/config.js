define([
       ],
function(){
  var svc = {};

  svc = {
    active: false,
    victory: false
  };

  svc.set = function(attr, val) {
    svc[attr] = val;
  };

  return svc;

});
