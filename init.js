require(['states/boot',
         'states/loadState',
         'states/test'
], function(
  boot,
  loadState,
  test
) {
  for (var i = 0; i < arguments.length; i ++) {
    console.log(arguments[i]);
  }
});
