// jshint unused:false, onevar:false, smarttabs:true
(function(exports){ 'use strict';

var Attractor = new Class({

	Extends: exports.Mover,

	fillStyle: 'transparent',

	mass   : 10000,
	radius : 5,
	friction: 0, // No friction in space, bro

	initialize: function(){
		this.parent('initialize', engine.width / 2, engine.height / 2);
	},

	update: function(engine){
		engine.items.each(this.applyForces, this);
		this.parent('update', engine);
	},

	checkEdges: function(){
		var rad = this.radius;
		if (this.loc.x > engine.width - rad)  {
			this.vel.x *= -1;
			this.loc.x = engine.width - rad;
		} else if (this.loc.x < 0 + rad) {
			this.vel.x *= -1;
			this.loc.x = rad;
		}

		if (this.loc.y > engine.height - rad) {
			this.loc.y = engine.height - rad;
			this.vel.y *= -1;
		} else if (this.loc.y < 0 + rad) {
			this.loc.y = rad;
			this.vel.y *= -1;
		}
	}
});

var MyMover = new Class({

	Extends: exports.Mover,

	friction: 0, // No friction in space, bro

	fillStyle: 'rgba(0,0,0,0.01)',

	initialize: function(x, y, settings){
		this.parent('initialize', x, y, settings);
		// this.vel = new exports.Vector(Number.random(-100, 100), Number.random(-100, 100));
		// this.vel = new exports.Vector(Number.random(-200, 200), Number.random(-200, 200));
	},

	update: function(engine){
		// dbg.log(this.att.attract(this));
		engine.items.each(this.applyForces, this);
		this.parent('update', engine);
	},

	checkEdges: function(){}

});

// Setup engine
var engine = exports.engine = new exports.Engine('canvas', true);

engine.addItem(new Attractor());
// Add wind force
// engine.forces.push(new exports.Vector(Number.random(-5, 5), 0));

(50).times(function(){
	var radius = Number.random(1, 10);
	engine.addItem(new MyMover(
		Number.random(20, engine.width - 20),
		Number.random(20, engine.height - 40),
		{
			// mass: Number.random(2, 2)
			mass   : radius * 100,
			radius : radius * 1
		}
	));
});

})(this);
