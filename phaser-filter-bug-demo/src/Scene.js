define([
	'phaser',
	'States',
	'States/Init',
	'States/Menu'
],
function(
	Phaser,
	States
){

var Scene = function(width, height){
	var state, resolution;

	resolution = parseInt(window.location.hash.substr(1)) || 1;

	Phaser.Game.call(
		this,
		{
			width: width,
			height: height,
			renderer: Phaser.WEBGL,
			parent: document.body,
			antialias: false,
			resolution: resolution,
			state: null
		});

	this.antialias = false;

	for (state in States) {
		this.state.add(state, States[state]);
	}

	this.state.start('Init');

	console.log('Instantiating game with resolution:', resolution);
	console.log(this);
};

Scene.prototype = Object.create(Phaser.Game.prototype);
Scene.prototype.constructor = Scene;

return Scene;

});
