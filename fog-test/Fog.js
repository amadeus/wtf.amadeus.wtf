/* global PIXI, console, Util, Base */
(function(window, Base){

var Fog = Base.extend({

	spawnTime     : 350,
	spriteAlpha   : 0.25,
	spriteSpacing : 3.5,
	spriteTint    : 0xffccb3,

	spriteBlendMode: PIXI.blendModes.ADD,

	size: {
		x: 20,
		y: 20
	},

	position: {
		x: 0,
		y: 0
	},

	scale: {
		x: 1,
		y: 1
	},

	constructor: function(settings){
		Util.merge(this, settings);
		this.container = new PIXI.DisplayObjectContainer();
		this.container.position.x = this.position.x;
		this.container.position.y = this.position.y;
		this.container.scale.x = this.scale.x;
		this.container.scale.y = this.scale.y;
		this.generateSprites();
	},

	generateSprites: function(){
		var spacing = this.spriteSpacing,
			len = ((this.size.x + 50) / spacing) >> 0,
			x, xPos;

		console.log('Fog instance has generated ' + len + ' sprites');

		for (x = 0; x < len; x++) {
			xPos = (x * spacing) - (25);
			this.createSprite(xPos);
		}
	},

	createSprite: function(x){
		var sprite, angle;

		if (Fog._pool.length) {
			sprite = Fog._pool.pop();
		} else {
			sprite = new PIXI.Sprite(this.texture);
			sprite.anchor.x = 0.5;
			sprite.anchor.y = 0.5;
			sprite.tint = this.spriteTint;
			sprite.alpha = this.spriteAlpha;
			angle = Util.randomInt(0, 360) * Math.PI / 180;
			sprite.blendMode = this.spriteBlendMode;

			// sprite.speed = this.spriteSpeed;
			// sprite.velocity = {};
			// sprite.velocity.x  = sprite.speed * Math.cos(angle);
			// sprite.velocity.y  = sprite.speed * Math.sin(angle) * -1;
		}

		sprite.position.x = x;
		sprite.position.y = 15;
		sprite.rotationSpeed = 0.002 * (Util.randomInt(0, 2) === 1 ? 1 : -1);
		sprite.rotation = Util.randomFloat(0, 360 * Math.PI / 180);

		this.container.addChild(sprite);
	},

	update: function(delta){
		var x, sprite, clouds;

		clouds = this.container.children;

		for (x = 0; x < clouds.length; x++) {
			sprite = clouds[x];
			sprite.life -= delta;
			if (sprite.position.x >= this.width + 100) {
				this.fog.container.removeChild(sprite);
				this.pool[sprite.texture._index].push(sprite);
			} else {
				sprite.rotation += sprite.rotationSpeed;
			}
		}

		clouds = null;
	}

});

/* Create textures
for (x = 0; x < 1; x++) {
	texture = PIXI.Texture.fromImage('/cloud_' + x + '.png');
	texture._index = x;
	textures.push(texture);
}
*/

Fog._pool = [];

window.Fog = Fog;

})(window, Base);
