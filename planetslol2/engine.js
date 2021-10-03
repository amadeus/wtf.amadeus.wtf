(function(exports){ 'use strict';

// Request Animation Fix
exports.requestAnimationFrame =
	exports.requestAnimationFrame ||
	exports.mozRequestAnimationFrame ||
	exports.webkitRequestAnimationFrame ||
	exports.msRequestAnimationFrame;

var preventDefault = function(event){
	event.preventDefault();
};

exports.Engine = new Class({

	Implements: Class.Binds,

	items: [],
	forces: [],
	clear: true,
	disabled: false,

	itemDict: {},

	initialize: function(canvas, noClear){
		this.canvas = document.id(canvas);
		this.ctx = this.canvas.getContext('2d');
		this.scale = window.devicePixelRatio || 1;

		if (noClear) {
			this.clear = false;
		}

		this.resizeCanvas();

		exports.addEvent('resize', this.bound('resizeCanvas'));

		exports.document.body.addEvent('touchstart', preventDefault);
		exports.document.body.addEvent('touchmove',  preventDefault);

		this.mouse = new exports.Vector(0, 0);
		exports.document.body.addEvent('mousemove', this.bound('_handleMouseMove'));

		this.generateControls();

		this.run = this.run.bind(this);
		this.last = exports.Date.now() / 1000;
		this.run();
	},

	getItemById: function(id){
		return this.itemDict[id] || null;
	},

	generateControls: function(){
		this.container = new Element('div', {
			'class': 'controls'
		});

		this.toggleButton = new Element('button', {
				html: 'Pause Engine'
			})
			.addEvent('click', this.bound('toggleEngine'))
			.inject(this.container);

		this.container.inject(document.body);
	},

	toggleEngine: function(){
		this.disabled = !this.disabled;

		if (this.disabled) {
			this.toggleButton.set('html', 'Resume Engine');
		} else {
			this.toggleButton.set('html', 'Pause Engine');
			this.last = exports.Date.now() / 1000;
			this.run();
		}

		return this;
	},

	_handleMouseMove: function(event){
		this.mouse.x = event.pageX;
		this.mouse.y = event.pageY;
	},

	resizeCanvas: function(){
		this.width  = window.innerWidth;
		this.height = window.innerHeight;
		this.canvas.width  = this.width  * this.scale;
		this.canvas.height = this.height * this.scale;
	},

	addItem: function(item){
		if (item._id) {
			this.itemDict[item._id] = item;
		}
		this.items.push(item);
	},

	run: function(){
		if (this.disabled) {
			return;
		}
		var items = this.items,
			len   = items.length,
			now   = Date.now() / 1000,
			i;

		if (this.clear) {
			this.ctx.clearRect(
				0, 0,
				this.width  * this.scale,
				this.height * this.scale
			);
		}

		this.tick = now - this.last;

		// First we update
		for (i = 0; i < len; i++) {
			items[i].update(this);
		}

		// Then we draw
		for (i = 0; i < len; i++) {
			items[i].draw(this);
		}

		this.last = now;

		// Then we wait for the next
		exports.requestAnimationFrame(this.run);
	}

});

})(this);
