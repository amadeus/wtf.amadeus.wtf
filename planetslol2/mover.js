(function(exports){ 'use strict';

var G = 20;

exports.Mover = new Class({

	fillStyle: 'rgba(0,0,0,0.5)',

	maxVel : 1000,
	radius : 10,
	mass   : 1,

	friction: 0.2,

	initialize: function(x, y, settings){
		this.loc = new exports.Vector(x, y);
		this.acc = new exports.Vector(0, 0);
		this.vel = new exports.Vector(0, 0);

		if (settings) {
			Object.merge(this, settings);
		}
	},

	collidesWith: function(item){
		if (
			this.loc.x > item.loc.x &&
			this.loc.x < item.loc.x + item.size.x &&
			this.loc.y > item.loc.y &&
			this.loc.y < item.loc.y + item.size.y
		) {
			return true;
		}
		return false;
	},

	checkEdges: function(engine){
		if (this.loc.x > engine.width) {
			this.loc.x = 0;
		} else if (this.loc.x < 0) {
			this.loc.x = engine.width;
		}

		if (this.loc.y > engine.height) {
			this.loc.y = 0;
		} else if (this.loc.y < 0) {
			this.loc.y = engine.height;
		}
	},

	applyForce: function(force){
		force = force.clone().div(this.mass);
		this.acc.add(force);
		return this;
	},

	applyForces: function(item){
		if (item === this) {
			return;
		}
		this.applyForce(item.attract(this));
	},

	update: function(engine){
		var friction;

		engine.forces.each(this.applyForce, this);
		this.vel.add(this.acc);
		this.vel.limit(this.maxVel);
		friction = this.vel.clone()
			.mult(-1)
			.normalize()
			.mult(this.friction * 1);
		this.vel.add(friction);
		this.loc.add(exports.Vector.mult(this.vel, engine.tick));
		this.checkEdges(engine);
		this.acc.mult(0);
	},

	draw: function(engine){
		var ctx   = engine.ctx,
			scale = engine.scale;

		ctx.beginPath();
		ctx.arc(
			// Circle position
			this.loc.x * scale,
			this.loc.y * scale,
			// Circle radius
			this.radius * scale,
			// Arc angles - to, from
			0, 2 * Math.PI
		);
		ctx.closePath();
		ctx.fillStyle = this.fillStyle;
		ctx.fill();
	},

	attract: function(mover){
		var force    = exports.Vector.sub(this.loc, mover.loc),
			distance = this.constrain(force.mag(), 5, 25),
			strength;

		this.mag = force.mag();

		force.normalize();
		strength = (G * this.mass + mover.mass) / (distance * distance);
		force.mult(strength);

		return force;
	},

	constrain: function(aNumber, aMin, aMax) {
		return aNumber > aMax ? aMax : aNumber < aMin ? aMin : aNumber;
	}

});

})(this);
