/* global Phaser */

Phaser.Filter.Aberration = function(game){
	Phaser.Filter.call(this, game);

	this.fragmentSrc = [
		'precision highp float;',
		'uniform sampler2D uSampler;',
		'varying vec2 vTextureCoord;',
		'void main(){',
			'vec2 uv = vTextureCoord;',
			'float amount = 0.003;',
			'vec3 col;',
			'col.r = texture2D(uSampler, vec2(uv.x + amount,uv.y) ).r;',
			'col.g = texture2D(uSampler, uv ).g;',
			'col.b = texture2D(uSampler, vec2(uv.x - amount,uv.y)).b;',
			'col *= (1.0 - amount * 0.5);',
			'gl_FragColor = vec4(col,1.0);',
		'}'
	];
};

Phaser.Filter.Aberration.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.Aberration.prototype.constructor = Phaser.Filter.Aberration;
