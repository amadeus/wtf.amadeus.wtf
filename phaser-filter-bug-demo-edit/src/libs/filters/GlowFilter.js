Phaser.Filter.GlowFilter = function(
	game //, distance, outerStrength, innerStrength, color, quality
){
	Phaser.Filter.call(this, game);


	this.fragmentSrc = [
		'precision mediump float;',

		'varying vec2 vTextureCoord;',
		'varying vec4 vColor;',

		'uniform sampler2D uSampler;',

		'uniform float distance;',
		'uniform float outerStrength;',
		'uniform float innerStrength;',
		'uniform vec4 glowColor;',
		'uniform float pixelWidth;',
		'uniform float pixelHeight;',
		'vec2 px = vec2(pixelWidth, pixelHeight);',

		'void main(void) {',
		'    const float PI = 3.14159265358979323846264;',
		'    vec4 ownColor = texture2D(uSampler, vTextureCoord);',
		'    vec4 curColor;',
		'    float totalAlpha = 0.0;',
		'    float maxTotalAlpha = 0.0;',
		'    float cosAngle;',
		'    float sinAngle;',
		'    for (float angle = 0.0; angle <= PI * 2.0; angle += ' + (1 / 0.5 / 15).toFixed(7) + ') {',
		'       cosAngle = cos(angle);',
		'       sinAngle = sin(angle);',
		'       for (float curDistance = 1.0; curDistance <= ' + (15).toFixed(7) + '; curDistance++) {',
		'           curColor = texture2D(uSampler, vec2(vTextureCoord.x + cosAngle * curDistance * px.x, vTextureCoord.y + sinAngle * curDistance * px.y));',
		'           totalAlpha += (distance - curDistance) * curColor.a;',
		'           maxTotalAlpha += (distance - curDistance);',
		'       }',
		'    }',
		'    maxTotalAlpha = max(maxTotalAlpha, 0.0001);',

		'    ownColor.a = max(ownColor.a, 0.0001);',
		'    ownColor.rgb = ownColor.rgb / ownColor.a;',
		'    float outerGlowAlpha = (totalAlpha / maxTotalAlpha)  * outerStrength * (1. - ownColor.a);',
		'    float innerGlowAlpha = ((maxTotalAlpha - totalAlpha) / maxTotalAlpha) * innerStrength * ownColor.a;',
		'    float resultAlpha = (ownColor.a + outerGlowAlpha);',

		'    gl_FragColor = vec4(mix(mix(ownColor.rgb, glowColor.rgb, innerGlowAlpha / ownColor.a), glowColor.rgb, outerGlowAlpha / resultAlpha) * resultAlpha, resultAlpha);',
		'}'
	].join('\n');

	this.uniforms.distance      = { type: '1f', value: 15 };
	this.uniforms.outerStrength = { type: '1f', value: 0 };
	this.uniforms.innerStrength = { type: '1f', value: 0 };
	this.uniforms.glowColor     = { type: '4f', value: new Float32Array([0, 0, 0, 1]) };
	this.uniforms.pixelWidth    = { type: '1f', value: 0 };
	this.uniforms.pixelHeight   = { type: '1f', value: 0 };

	this.quality = Math.pow(0.5, 1/3);
	this.uniforms.distance.value *= this.quality;

	this.color = 0xFF0000;
	this.outerStrength = 2;
	this.innerStrength = 1;
	this.viewWidth	= game.width * this.quality;
	this.viewHeight = game.height * this.quality;
};

Phaser.Filter.GlowFilter.prototype = Object.create(Phaser.Filter.prototype);
Phaser.Filter.GlowFilter.prototype.constructor = Phaser.Filter.GlowFilter;

Object.defineProperties(Phaser.Filter.GlowFilter.prototype, {
	color: {
		get: function () {
			return Phaser.Filter.GlowFilter.rgb2hex(this.uniforms.glowColor.value);
		},
		set: function(value) {
			this.dirty = true;
			Phaser.Filter.GlowFilter.hex2rgb(value, this.uniforms.glowColor.value);
		}
	},

	outerStrength: {
		get: function () {
			return this.uniforms.outerStrength.value;
		},
		set: function (value) {
			this.dirty = true;
			this.uniforms.outerStrength.value = value;
		}
	},

	innerStrength: {
		get: function () {
			return this.uniforms.innerStrength.value;
		},
		set: function (value) {
			this.dirty = true;
			this.uniforms.innerStrength.value = value;
		}
	},

	viewWidth: {
		get: function () {
			return 1 / this.uniforms.pixelWidth.value;
		},
		set: function(value) {
			this.dirty = true;
			this.uniforms.pixelWidth.value = 1 / value;
		}
	},

	viewHeight: {
		get: function () {
			return 1 / this.uniforms.pixelHeight.value;
		},
		set: function(value) {
			this.dirty = true;
			this.uniforms.pixelHeight.value = 1 / value;
		}
	}
});

Phaser.Filter.GlowFilter.hex2rgb = function (hex, out){
	out = out || [];

	out[0] = (hex >> 16 & 0xFF) / 255;
	out[1] = (hex >> 8 & 0xFF) / 255;
	out[2] = (hex & 0xFF) / 255;

	return out;
};

Phaser.Filter.GlowFilter.rgb2hex = function (rgb) {
	return ((rgb[0]*255 << 16) + (rgb[1]*255 << 8) + rgb[2]*255);
};
