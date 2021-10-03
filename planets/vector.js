// jshint es3:true
(function(exports){ 'use strict';

exports.Vector = new Class({

	initialize: function(x, y){
		this.x = x || 0;
		this.y = y || 0;
	},

	clone: function(){
		return new exports.Vector(this.x, this.y);
	},

	add: function(vec){
		this.x += vec.x;
		this.y += vec.y;
		return this;
	},

	sub: function(vec){
		this.x -= vec.x;
		this.y -= vec.y;
		return this;
	},

	mult: function(mul){
		this.x *= mul;
		this.y *= mul;
		return this;
	},

	div: function(div){
		this.x /= div;
		this.y /= div;
		return this;
	},

	mag: function(){
		return Math.sqrt(
			this.x * this.x +
			this.y * this.y
		);
	},

	limit: function(max){
		if (this.mag() > max) {
			this.normalize();
			this.mult(max);
		}
		return this;
	},

	normalize: function(){
		var mag = this.mag();
		if (mag === 0) {
			return this;
		}
		this.div(mag);
		return this;
	}

});

exports.Vector.extend({

	add: function(vec1, vec2){
		return vec1.clone().add(vec2.clone());
	},

	sub: function(vec1, vec2){
		return vec1.clone().sub(vec2.clone());
	},

	mult: function(vec, mult){
		return vec.clone().mult(mult);
	},

	div: function(vec, div){
		return vec.clone().div(div);
	},

	// Ripped from processing
	random2D: function(){
		var angle = Math.random(0, 1) * Math.PI * 2;
		return new exports.Vector(Math.cos(angle), Math.sin(angle));
	}

});

})(this);
