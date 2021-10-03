/*jslint white: true*/
/*global Phaser*/

/**
 * Defines a glow filter for Web GL.
 * @module
 */
Phaser.Filter.Glow = function (game) {
	'use strict';

	Phaser.Filter.call(this, game);

	this.uniforms.bloom = {
		type: '1f',
		value: 0.004
	};

	this.uniforms.intensity = {
		type: '1f',
		value: 0.24
	};

	this.fragmentSrc = [
		'precision highp float;',
		'uniform sampler2D uSampler;',
		'varying vec2 vTextureCoord;',
		'uniform vec2 resolution;',
		'uniform float bloom;',
		'uniform float intensity;',
		'uniform float time;',

		'void main() {',
			'vec4 sum = vec4(0);',
			'vec2 texcoord = vTextureCoord;',
			'for(float y = -6.0; y < 6.0; y++){',     //Vertical spread?
				'for(float x = -4.0; x < 4.0; x++){', //Horizontal spread?
					// 'sum += texture2D(uSampler, texcoord + vec2(j, i) * bloom) * intensity;',
					// 'sum += texture2D(uSampler, texcoord + vec2(x / resolution.x, y / resolution.y)) * intensity * (((1.0 + sin(time) * 10000.0)) * 0.0001 + 1.0);',
					'sum += texture2D(uSampler, texcoord + vec2(x / resolution.x, y / resolution.y)) * intensity;',
				'}',
			'}',

			// 'vec4 c = sum + texture2D(uSampler, texcoord);', // White blown out effect
			// 'c.a = 1.0;',
			// 'gl_FragColor = c;',

			'if (texture2D(uSampler, texcoord).r < 0.3) {',
				// Applies to colors with very little red?
				// 'gl_FragColor = sum * sum * 0.008 + texture2D(uSampler, texcoord);',
				'gl_FragColor = sum * 0.05 + texture2D(uSampler, texcoord);',
			'} else if (texture2D(uSampler, texcoord).r < 0.5){',
				// Haven't found a scenario where this takes effect
				'gl_FragColor = sum * 0.15 + texture2D(uSampler, texcoord);',
			'} else {',
				'gl_FragColor = sum * sum * 0.0012 + texture2D(uSampler, texcoord);', // White blown out effect
			'}',
		'}',
	];
};

Phaser.Filter.Glow.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.Glow.prototype.constructor = Phaser.Filter.Glow;

Phaser.Filter.Glow.prototype.minInt = 0;
Phaser.Filter.Glow.prototype.maxInt = 500;
Phaser.Filter.Glow.prototype.minFloat = 0.004;
Phaser.Filter.Glow.prototype.maxFloat = 0.006;

Object.defineProperty(Phaser.Filter.Glow.prototype, 'intensity', {

	get: function() {
		return this.uniforms.intensity.value;
	},

	set: function(value) {
		this.dirty = true;
		this.uniforms.intensity.value = value;
	}

});

Phaser.Filter.Glow.prototype._baseIntensity = 0.24;
Object.defineProperty(Phaser.Filter.Glow.prototype, 'baseIntensity', {

	get: function() {
		return this._baseIntensity;
	},

	set: function(value) {
		this.dirty = true;
		this._baseIntensity = value || 0.24;
		this.intensity = this._baseIntensity;
	}

});

Object.defineProperty(Phaser.Filter.Glow.prototype, 'bloom', {

	get: function() {
		return this.game.math.mapLinear(
			this.uniforms.bloom.value,
			this.minFloat,
			this.maxFloat,
			this.minInt,
			this.maxInt
		);
	},

	set: function(value) {
		if (value < this.minInt || !value) {
			value = this.minInt;
		}
		if (value > this.maxInt) {
			value = this.maxInt;
		}
		value = this.game.math.mapLinear(
			value,
			this.minInt,
			this.maxInt,
			this.minFloat,
			this.maxFloat
		);
		this.dirty = true;
		this.uniforms.bloom.value = value;
	}

});

Phaser.Filter.Glow.prototype._flickerRate = 0;
Object.defineProperty(Phaser.Filter.Glow.prototype, 'flickerRate', {
	get: function(){
		return this._flickerRate;
	},

	set: function(value){
		if (!value) {
			this._flickerRate = 0;
		} else {
			this._flickerRate = Math.min(Math.abs(value), 1);
		}
	}
});

Phaser.Filter.Glow.prototype.update = function(pointer){
	Phaser.Filter.prototype.update.call(this, pointer);
	if (this.game.rnd.realInRange(0, 1) < this._flickerRate) {
		this.intensity = this.game.rnd.realInRange(this._baseIntensity - 0.05, this._baseIntensity + 0.05);
	}
};
