define([
	'phaser',
	'States'
],
function(
	Phaser,
	States
){

States.Menu = {

	assets: {
		bg   : 'assets/images/parallax-bg.png',
		mg   : 'assets/images/parallax-mg.png',
	},

	scripts: {
		'Noise'       : 'src/libs/filters/Noise.js',
		'Aberration'  : 'src/libs/filters/Aberration.js',
		'Passthrough' : 'src/libs/filters/Passthrough.js'
	},

	passthroughFix: false,

	sceneFilter: false,

	preload: function(game){
		var key;

		for (key in this.assets) {
			game.load.image(key, this.assets[key]);
		}

		for (key in this.scripts) {
			game.load.script(key, this.scripts[key]);
		}
	},

	create: function(game){
		this.passthroughButton = document.getElementById('passthrough-fix');
		this.passthroughButton.addEventListener('click', this.togglePassthrough.bind(this), false);
		this.passthrough = game.make.filter('Passthrough');

		this.sceneButton = document.getElementById('scene-filter');
		this.sceneButton.addEventListener('click', this.toggleSceneFilter.bind(this), false);
		this.aberration = game.make.filter('Aberration');

		this.setupScene(game);
	},

	togglePassthrough: function(){
		if (this.passthroughFix) {
			this.passthroughFix = false;
			this.scene.bg.filters = [this.noise];
			this.passthroughButton.innerHTML = 'Add Passthrough';
		} else {
			this.passthroughFix = true;
			this.scene.bg.filters = [this.noise, this.passthrough];
			this.passthroughButton.innerHTML = 'Remove Passthrough';
		}
	},

	toggleSceneFilter: function(){
		if (this.sceneFilter) {
			this.sceneFilter = false;
			this.game.stage.filters = null;
			this.sceneButton.innerHTML = 'Add Scene Filter';
		} else {
			this.sceneFilter = true;
			this.game.stage.filters = [this.noise2, this.aberration, this.passthrough];
			this.sceneButton.innerHTML = 'Remove Scene Filter';
		}
	},

	setupScene: function(game){
		var aberration, pass, noise;
		game.world.setBounds(0, 0, 316, 238);

		this.scene = {};

		this.scene.group = game.add.group();
		this.scene.bg = game.make.image(-10, -70, 'bg');
		this.scene.mg = game.make.image(-10, -70, 'mg');

		this.scene.group.add(this.scene.bg);
		this.scene.group.add(this.scene.mg);

		this.noise = game.add.filter('Noise');
		this.noise2 = game.add.filter('Noise');
		this.scene.bg.filters = [this.noise];
	},

	update: function(game){
		var x;
		if (this.noise) {
			this.noise.update();
		}
	}
};

});
