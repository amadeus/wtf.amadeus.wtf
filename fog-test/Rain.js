/* global PIXI, console, Util, Base */
(function(){

var Rain = Base.extend({

	position: {
		x: 0,
		y: 0
	},

	size: {
		x: 20,
		y: 20
	},

	scale: {
		x: 1,
		y: 1
	},

	spriteSpeed: 600,
	spriteAngle: 277.7,
	spriteAlpha: 0.2,

	spawnMultiplier: 20,

	constructor: function(settings){
		Util.merge(this, settings);
		this.container = new PIXI.SpriteBatch();
		this.container.position.x = this.position.x;
		this.container.position.y = this.position.y;
		this.container.scale.x = this.scale.x;
		this.container.scale.y = this.scale.y;
		console.log('Rain initialized');
	},

	createSprite: function(){
		var sprite, angle, speed;

		if (Rain._pool.length) {
			sprite = Rain._pool.pop();
		} else {
			sprite = new PIXI.Sprite(this.texture);
			sprite.anchor.x = 0.5;
			sprite.anchor.y = 0.5;
			sprite.velocity = {};
			sprite.pos = {};
		}

		sprite.alpha = Util.randomFloat(0.2, 0.4);
		angle = this.spriteAngle * Math.PI / 180;
		speed = Util.randomInt(this.spriteSpeed - 200, this.spriteSpeed + 200);
		sprite.velocity.x = speed * Math.cos(angle);
		sprite.velocity.y = speed * Math.sin(angle) * -1;

		sprite.scale.x = sprite.scale.y = Util.randomFloat(0.1, 0.5);
		sprite.position.x = sprite.pos.x = Util.randomInt(0, this.size.x);
		sprite.position.y = sprite.pos.y = -(Util.randomInt(this.texture.height, this.texture.height + 25));

		this.container.addChild(sprite);
	},

	update: function(delta){
		var drops, x, sprite, toRemove;

		drops = this.container.children;
		toRemove = [];

		for (x = 0; x < drops.length; x++) {
			sprite = drops[x];
			if (sprite.position.y > this.size.y) {
				toRemove.push(sprite);
			} else {
				sprite.pos.x += sprite.velocity.x * delta;
				sprite.pos.y += sprite.velocity.y * delta;
				sprite.position.x = ~~ (sprite.pos.x + 0.5);
				sprite.position.y = ~~ (sprite.pos.y + 0.5);
			}
		}

		for (x = 0; x < toRemove.length; x++) {
			Rain._pool.push(this.container.removeChild(toRemove[x]));
		}
		toRemove.length = 0;

		for (x = 0; x < this.spawnMultiplier; x++) {
			this.createSprite();
		}
	}

});

Rain._pool = [];

window.Rain = Rain;

})(window, Base);
