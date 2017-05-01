require([
'states/boot/boot','states/example/example','states/loadState'
], function(
boot,example,loadState
) {
game.state.add('boot', boot);game.state.add('loadState', loadState);
game.state.add('example', example);game.state.start('boot');
});
