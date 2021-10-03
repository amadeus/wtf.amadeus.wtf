(function(){

var Anim = window.DrawDiamond = new Class({

	Implements: Class.Options,

	options: {
		size: 20,

		rows: 15,
		colums: 20,

		startCol: 10,
		startRow: 7,

		fillStyle: '#000',

		iterations: 10,

		speed: 15
	},

	radius: 0,
	squares: [],
	remove: [],

	initialize: function(canvas, options){
		this.canvas = document.id(canvas);
		this.ctx = this.canvas.getContext('2d');
		this.ctx.fillStyle = this.options.fillStyle;
		this.animHandler = this.animHandler.bind(this);

		this.setOptions(options);
		this.squares = [];
		this.remove = [];

		this.options.iterations.times(this.generateLocations, this);

		Anim.addInstance(this.animHandler);
	},

	animHandler: function(){
		if (this.squares.length)
			this.options.speed.times(this.updateCanvas, this);
		else if (!this.squares.length && this.remove.length)
			this.options.speed.times(this.hideCanvas, this);
		else if (!this.squares.length && !this.remove.length)
			 Anim.removeInstance(this.animHandler);
	},

	hideCanvas: function(){
		if (!this.remove.length) return;
		var toDraw = this.remove.shift();
		this.removeSquare(toDraw[0], toDraw[1]);
	},

	updateCanvas: function(){
		if (!this.squares.length) return;
		var toDraw = this.squares.shift();
		this.remove.push(toDraw);
		this.drawSquare(toDraw[0], toDraw[1]);
	},

	generateLocations: function(){
		if (this.radius === 0){
			this.squares.push([0, 0]);
			this.radius++;
			return;
		}

		var len = 4 * this.radius,
			i = 0,
			x = 0,
			y = this.radius;


		for (i = 0; i < len; i++){
			// Side 1
			if (i < len / 4){
				this.squares.push([x, y]);
				x++;
				y--;
			}
			// Side 2
			else if (i < (len / 4 * 2)){
				this.squares.push([x, y]);
				x--;
				y--;
			}
			// Side 3
			else if (i < (len / 4 * 3)){
				this.squares.push([x, y]);
				x--;
				y++;
			}
			else if (i < len){
				this.squares.push([x, y]);
				x++;
				y++;
			}
		}

		this.radius++;
	},

	removeSquare: function(x, y){
		var size = this.options.size;
		x = (this.options.startCol * size) + (x * size);
		y = (this.options.startRow * size) + (y * size);
		this.ctx.clearRect(x, y, size, size);
	},

	drawSquare: function(x, y){
		var size = this.options.size;
		x = (this.options.startCol * size) + (x * size);
		y = (this.options.startRow * size) + (y * size);
		this.ctx.fillRect(x, y, size, size);
	}

});

var Timer = null,
	removeQueue = [];

Anim.extend({

	running: false,

	interval: 1000 / 60,

	instances: [],

	addInstance: function(func){
		Anim.instances.push(func);
		//Anim.startTimer();
	},

	removeInstance: function(func){
		removeQueue.push(func);
	},

	_removeInstance: function(func){
		var i = Anim.instances.indexOf(func);
		if (i < 0) return;
		Anim.instances.splice(i, 1);
		if (!Anim.instances.length)
			Anim.stopTimer();
	},

	_update: function(){
		for (var x = 0, l = Anim.instances.length; x < l; x++){
			Anim.instances[x]();
		}

		if (removeQueue.length){
			removeQueue.each(Anim._removeInstance);
			removeQueue = [];
		}
	},

	startTimer: function(){
		if (Anim.running) return;
		Anim.running = true;
		Timer = setInterval(Anim._update, Anim.interval);
	},

	stopTimer: function(){
		Anim.running = false;
		clearInterval(Timer);
	}

});

document.body.addEvent('click', function(){
	for (var r = -1; r < 4; r++){
		for (var c = -1; c < 5; c++){
			new Anim('anims', {
				size: 10,
				startCol: (100 * c) / 10 + 5,
				startRow: (100 * r) / 10 + 5,
				iterations: 11
			});
		}
	}

	Anim.startTimer();
});

})();
