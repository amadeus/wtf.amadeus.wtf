/* global Phaser */
define([
	'States'
],
function(
	States
){

States.Init = {
	init: function(){
		this.setScale();
	},

	create: function(game){
		game.state.start('Menu');

		this.select = document.getElementById('game-resolution');
		this.select.addEventListener('change', this.onChange.bind(this), false);
		this.select.value = this.game.resolution;
	},

	onChange: function(){
		window.location.hash = this.select.value;
		window.location.reload(true);
	},

	setScale: function(){
		this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
		this.game.scale.setUserScale(this.game.resolution / (window.devicePixelRatio || 1), this.game.resolution / (window.devicePixelRatio || 1));
	}
};

return States.Init;

});
