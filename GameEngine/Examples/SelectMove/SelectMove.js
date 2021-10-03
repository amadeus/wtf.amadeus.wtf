var SelectMove = new Class({

	Implements:Options,

	options:{
		className:'disc',
		selectedClass:'selected',
		color:'rgba(255,0,0,1)',
		x:0,
		y:0,
		targetX:0,
		targetY:0,
		friction:40,
		speed:0,
		maxSpeed:20,
		accellerator:0,
		constant:20,
		vector:0
	},

	selected:false,
	moving:false,

	initialize:function(gameEngine,options){
		this.gameEngine = gameEngine;

		if(!this.gameEngine) return;

		this.setOptions(options);

		this.options.targetX = this.options.x;
		this.options.targetY = this.options.y;

		this.element = new Element('div',{
			'class':this.options.className,
			styles:{
				backgroundColor:this.options.color,
				position:'absolute',
				top:this.options.y,
				left:this.options.x
			}
		}).inject(document.body);

		['enable','disable','elementClick','windowClick','loop'].each(function(eventName){
			this[eventName] = this[eventName].bind(this);
		},this);

		this.gameEngine.addEvents({
			start:this.enable,
			cancel:this.disable
		});

		if(this.gameEngine.running) this.enable();
	},

	elementClick:function(e){
		if(e && e.stop) e.stop();

		this.selected = (this.selected) ? false : true;

		if(this.selected) this.element.addClass(this.options.selectedClass);
		else this.element.removeClass(this.options.selectedClass);
	},

	windowClick:function(e){
		if(!this.selected) return;
		if(e && e.preventDefault) e.preventDefault();
		this.options.targetX = e.page.x;
		this.options.targetY = e.page.y;

		// Calculate angle
		var dx = (this.options.targetX - this.options.x);
		if (dx < 0) this.options.inverse = true;
		else this.options.inverse = false;
		
		var dy = (this.options.targetY - this.options.y);
		var distance = Math.sqrt( dx * dx + dy * dy );

		this.options.angle = Math.acos( dy / distance );
		
		this.options.speed = 0;
		
		this.gameEngine.addEvent('loop',this.loop);
	},

	loop:function(){
		if (this.options.speed < this.options.maxSpeed){
			this.options.speed += (this.options.speed + this.options.constant) / this.options.friction;
			if (this.options.speed > this.options.maxSpeed) this.options.speed = this.options.maxSpeed;
		}

		if (this.options.inverse) this.options.x -= Math.sin(this.options.angle) * this.options.speed;
		else this.options.x += Math.sin(this.options.angle) * this.options.speed;

		this.options.y += Math.cos(this.options.angle) * this.options.speed;

		this.element.setStyles({
			top:this.options.y,
			left:this.options.x
		});
	},

	disable:function(){
		this.element.removeEvent('click',this.elementClick);
		this.gameEngine.removeEvent('click',this.windowClick);
	},

	enable:function(){
		this.element.addEvent('click',this.elementClick);
		this.gameEngine.addEvent('click',this.windowClick);
	}
});