/* global PIXI, Fog, Stats, Rain, Lightning, Base */
(function(){

var Scene = Base.extend({

	pool: [],
	textures: [],

	width  : 446,
	height : 250,

	last: 0,

	constructor: function(){
		PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

		this.loader = new PIXI.AssetLoader([
			'sprite.json',
			'bg.png'
		]);

		this.loader.onComplete = this.setupScene.bind(this);
		this.loader.load();
	},

	setupScene: function(){
		this.canvas = document.createElement('canvas');
		this.canvas.id = 'canvas';
		document.body.appendChild(this.canvas);
		this.render = this.render.bind(this);

		this.setupStage();
		this.setupFog();
		this.setupRain();
		this.setupLightning();

		// Filter tests
		document.body.addEventListener('click', (function(){
			if (this.stage.filters) {
				this.stage.filters = null;
			} else {
				this.stage.filters = [new PIXI.InvertFilter()];
			}
		}).bind(this), false);

		this.render();
	},

	setupStage: function(){
		this.stage = new PIXI.Stage(0x000000);

		this.renderer = new PIXI.WebGLRenderer(
			this.width,
			this.height,
			{
				view: document.getElementById('canvas'),
				resolution: 3
			}
		);

		if (window.ejecta) {
			this.renderer.view.style.width  = window.innerWidth + 2 + 'px';
			this.renderer.view.style.height = window.innerHeight + 'px';
		} else {
			this.renderer.view.style.width  = 669 + 'px';
			this.renderer.view.style.height = 375 + 'px';
		}

		this.bg = new PIXI.Sprite(PIXI.TextureCache['bg.png']);
		this.stage.addChild(this.bg);

		if (window.Stats) {
			this.stats = new Stats();
			this.stats.setMode(0);
			this.stats.domElement.style.position = 'absolute';
			this.stats.domElement.style.top = '0px';
			this.stats.domElement.style.left = '0px';
			document.body.appendChild(this.stats.domElement);
		}
	},

	setupFog: function(){
		this.fog = new Fog({
			texture: PIXI.TextureCache['cloud.png'],
			position: {
				y: 150,
				x: 0
			},
			size: {
				x: this.width
			},
		});


		this.fogMask = new PIXI.Graphics();
		this.fogMask.beginFill();
		this.fogMask.drawRect(
			0,
			0,
			this.width,
			156
		);
		this.fogMask.endFill();

		this.fog.container.mask = this.fogMask;

		this.stage.addChild(this.fog.container);
		this.stage.addChild(this.fogMask);
	},

	setupRain: function(){
		this.rain = new Rain({
			texture: PIXI.TextureCache['drop.png'],
			position: {
				x: -40,
				y: 0
			},
			size: {
				x: this.width + 40,
				y: this.height
			}
		});
		window.rain = this.rain;

		this.stage.addChild(this.rain.container);
	},

	setupLightning: function(){
		this.lightning = new Lightning({
			size: {
				x: this.width,
				y: this.height
			}
		});
	},

	render: function(since){
		var delta;
		if (this.stats) {
			this.stats.begin();
		}

		since = since || 0;

		delta = (since - this.last) / 1000;
		this.last = since;

		this.fog.update(delta);
		this.rain.update(delta);
		this.lightning.update(delta, this.stage);

		this.renderer.render(this.stage);

		if (this.stats) {
			this.stats.end();
		}
		window.requestAnimationFrame(this.render);
	}

});

new Scene();

/*
ADD: 1
COLOR: 15
COLOR_BURN: 8
COLOR_DODGE: 7
DARKEN: 5
DIFFERENCE: 11
EXCLUSION: 12
HARD_LIGHT: 9
HUE: 13
LIGHTEN: 6
LUMINOSITY: 16
MULTIPLY: 2
NORMAL: 0
VERLAY: 4
SATURATION: 14
SCREEN: 3
SOFT_LIGHT: 10
*/

})();
