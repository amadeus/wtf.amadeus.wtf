var System = new Class({

	Implements: [Options, Events, Class.Binds],

	options: {
		autostart: true,
		fps: 50
	},

	cells: [],

	initialize: function(canvas, options){
		// SINGLETON BABY!
		if (System.instance) return System.instance;
		System.instance = this;

		this.canvas = new FullCanvas(canvas);
		this.setOptions(options);

		this.ctx = document.id(this.canvas).getContext('2d');
		this.canvas.addEvent('resize', this.bound('update'));

		if (this.options.autostart) this.start();
		else System.running = false;
		this.baseWorld();

		window.addEvent('keydown', (function(e){
			if (e.key !== 'space') return;
			if (System.running) this.pause();
			else this.start();
		}).bind(this));
	},

	baseWorld: function(){
		(100).times(function(){
			var instance = new Prey(this.ctx, {
				x: Number.random(30, System.size.x-30),
				y: Number.random(30, System.size.y-30)
			}, {
				size: Number.random(2, 40),
				speed: Number.random(1,4),
				color: 'rgba({r},{g},{b},{a})'.substitute({ r: Number.random(0,255), g: Number.random(0,255), b: Number.random(0, 255), a: Math.random() }),
				angle: Number.random(0, 360)
			});

			this.registerCell(instance);
		}, this);
	},

	registerCell: function(instance){
		this.cells.push(instance);
	},

	start: function(){
		this.pause();
		this.timer = this.update.periodical(1000 / this.options.fps, this);
		System.running = true;
	},

	pause: function(){
		clearInterval(this.timer);
		System.running = false;
	},

	update: function(){
		this.ctx.clearRect(0,0,System.size.x,System.size.y);
		this.cells.invoke('update');
	}

});

System.extend({
	size: { x: 0, y: 0 },
	instance: null,
	running: false
});

var Cell = new Class({

	Implements: [Options, Events, Class.Binds],

	options: {
		speed: 1,
		age: 0,
		color: 'rgba(0,0,0,.5)',
		size: 20,
		angle: 0,
		gender: null
	},

	position: {
		x: 0,
		y: 0
	},

	velocity: {
		x: 0,
		y: 0
	},

	initialize: function(ctx, position, options){
		this.ctx = ctx;
		this.setOptions(options);

		this.position.x = position.x;
		this.position.y = position.y;
		
		if (!this.options.gender)
			this.options.gender = Number.random(0,1) ? 'male' : 'female';

		this.update = this.update.bind(this);
		this.determineVelocity();
		this.update();
	},

	update: function(){
		
		if (System.running){
			this.position.x += this.velocity.x;
			this.position.y += this.velocity.y;
		}


		var size = this.options.size,
			half = size;


		if (this.position.y >= System.size.y - size || this.position.y <= size) this.velocity.y *= -1;
		if (this.position.x >= System.size.x - size || this.position.x <= size) this.velocity.x *= -1;

		if (this.position.x <= size) this.position.x = size;
		if (this.position.x > System.size.x - size) this.position.x = System.size.x - size;
		if (this.position.y <= size) this.position.y = size;
		if (this.position.y > System.size.y - size) this.position.y = System.size.y - size;


		this.ctx.fillStyle = this.options.color;
		this.ctx.beginPath();
		this.ctx.arc(this.position.x, this.position.y, this.options.size, 0, Math.PI * 2, true); 
		this.ctx.closePath();
		this.ctx.fill();
	},

	determineVelocity: function(){
		var angle = this.options.angle,
			speed = this.options.speed;
		// Ensuring angle is never greater than 360
		if (angle >= 360) angle = angle % 360;
		
		// Handle vertical and horizontal directions
		switch(angle) {
			case 0: // 0
				return this.velocity.x = speed;
			case 90:
				return this.velocity.y = -(speed);
			case 180:
				return this.velocity.x = (speed);
			case 270:
				return this.velocity.y = speed;
		}

		// Calculate other directions
		if (angle < 90) {
			this.velocity.y = -(Math.sin(angle * Math.PI/180) * speed);
			this.velocity.x = (Math.cos(angle * Math.PI/180) * speed);
			return;
		}
		if (angle < 180) {
			angle -= 90;
			this.velocity.y = -(Math.cos(angle * Math.PI/180) * speed);
			this.velocity.x = -(Math.sin(angle * Math.PI/180) * speed);
			return;
		}
		if (angle < 270){
			angle -= 180;
			this.velocity.y = Math.sin(angle * Math.PI/180) * speed;
			this.velocity.x = -(Math.cos(angle * Math.PI/180) * speed);
			return;
		}
		angle -= 270;
		this.velocity.y = Math.cos(angle * Math.PI/180) * speed;
		this.velocity.x = Math.sin(angle * Math.PI/180) * speed;
		
	},

	calculateMovement: function(){
		var angle = this.options.angle,
			speed = this.options.speed;
		// Ensuring angle is never greater than 360
		if (angle >= 360) angle = angle % 360;
		
		// Handle vertical and horizontal directions
		switch(angle) {
			case 0: // 0
				return this.position.x += speed;
			case 90:
				return this.position.y -= speed;
			case 180:
				return this.position.x -= speed;
			case 270:
				return this.position.y += speed;
		}

		// Calculate other directions
		if (angle < 90) {
			this.position.y -= Math.sin(angle * Math.PI/180) * speed;
			this.position.x += Math.cos(angle * Math.PI/180) * speed;
			return;
		}
		if (angle < 180) {
			angle -= 90;
			this.position.y -= Math.cos(angle * Math.PI/180) * speed;
			this.position.x -= Math.sin(angle * Math.PI/180) * speed;
			return;
		}
		if (angle < 270){
			angle -= 180;
			this.position.y += Math.sin(angle * Math.PI/180) * speed;
			this.position.x -= Math.cos(angle * Math.PI/180) * speed;
			return;
		}
		angle -= 270;
		this.position.y += Math.cos(angle * Math.PI/180) * speed;
		this.position.x += Math.sin(angle * Math.PI/180) * speed;

	}

});

var Prey = new Class({

	Extends: Cell,

	options: {
		color: 'rgba(0,0,180,.4)'
	}

});
