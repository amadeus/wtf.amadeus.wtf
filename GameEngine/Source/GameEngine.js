var GameEngine = new Class({
	Extends: Fx,

	options: {
		fps: 60,
		autostart: false,
		container: window,
		mouseEvents: ['mousemove','mouseup','mousedown','click', 'touchmove'],
		keyboardEvents: ['keydown','keyup','keypress']
	},

	running: false,

	initialize: function(options){
		this.setOptions(options);

		if (typeOf(this.options.container)==='string') this.options.container = document.id(this.options.container);
		if (!this.options.container) return;

		['step','stop'].each(function(name){
			this[name] = this[name].bind(this);
		},this);

		var fn = function(eventName){
			this[eventName] = (function(event){
				event.gameInstance = this;
				this.fireEvent(eventName,event);
			}).bind(this);
		};

		// Create Events
		this.options.mouseEvents.each(fn,this);
		this.options.keyboardEvents.each(fn,this);

		if (this.options.autostart) return this.start();
		return this;
	},

	start: function(){
		if (this.running) return;
		this.running = true;

		var fn = function(eventName){
			this.options.container.addEvent(eventName,this[eventName]);
		};

		// Attach Events
		this.options.mouseEvents.each(fn,this);
		this.options.keyboardEvents.each(fn,this);

		return this.parent();
	},

	step: function(){
		return this.fireEvent('loop');
	},

	stop: function(){
		return this.cancel();
	},

	cancel: function(){
		if (!this.running) return;

		var fn = function(eventName){
			this.options.container.removeEvent(eventName,this[eventName]);
		};

		// Detach Events
		this.options.mouseEvents.each(fn,this);
		this.options.keyboardEvents.each(fn,this);

		this.running = false;

		return this.parent();
	}
});