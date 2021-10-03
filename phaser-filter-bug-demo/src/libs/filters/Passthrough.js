/* global Phaser */

// A generic filter used to bypass a bug in Phaser
// It appear that the last filter gets applied incorrectly to the entire
// canvas, this is a generic placeholder used to circumvent this bug and have a
// filter that essentially does nothing
Phaser.Filter.Passthrough = function(game){
	'use strict';
	Phaser.Filter.call(this, game);

	this.fragmentSrc = [
		'precision highp float;',
		'uniform sampler2D uSampler;',
		'varying vec2 vTextureCoord;',
		'void main() {',
			'gl_FragColor = texture2D(uSampler, vTextureCoord);',
		'}'
	];
};

Phaser.Filter.Passthrough.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.Passthrough.prototype.constructor = Phaser.Filter.Passthrough;
