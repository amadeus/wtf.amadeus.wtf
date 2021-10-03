/* global Phaser */

Phaser.Filter.ScreenAberration = function(game){
	Phaser.Filter.call(this, game);

	this.fragmentSrc = [
		'precision highp float;',
		'uniform sampler2D uSampler;',
		'varying vec2 vTextureCoord;',
		'uniform float time;',
		'void main(){',
			'vec2 uv = vTextureCoord;',
			'float amount = 0.0;',
			'float dist = distance(uv, vec2(0.5, 0.5));',
			'vec2 norml = normalize(uv - vec2(0.5, 0.5));',
			// 'amount += dist * dist * (0.01 + (sin(time * 100.0) * 0.001));',
			'amount += dist * dist * (0.014);',
			'vec3 col;',
			'col.r = texture2D(uSampler, vec2(uv.x,uv.y) + (norml * amount)).r;',
			'col.g = texture2D(uSampler, uv ).g;',
			'col.b = texture2D(uSampler, vec2(uv.x,uv.y) - (norml * amount)).b;',
			'col *= (1.0 - amount * 0.5);',
			'gl_FragColor = vec4(col,1.0);',
		'}'
	];
};

Phaser.Filter.ScreenAberration.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.ScreenAberration.prototype.constructor = Phaser.Filter.ScreenAberration;
