var FollowMouse = new Class({
	
	Implements: Options,
	
	options: {
		className: 'disc',
		x: 0,
		y: 0,  
		mouseX: 0,
		mouseY: 0,  
		friction: 16,
		color:'rgba(255,0,0,1)'
	},
	
	accellerated: false,
	
	initialize:function(gameEngine,options){
		this.gameEngine = gameEngine;
		
		if (!this.gameEngine) return;
		
		this.setOptions(options);
		
		if ((Browser.Platform.ios || Browser.safari || Browser.chrome))
			this.accellerated === true;
		
		this.element = new Element('div',{
			'class': this.options.className,
			styles: {
				background: this.options.color,
				position: 'absolute'
			}
		}).inject(document.body);
		
		
		if (this.accellerated) {
			this.element.setStyles({
				top: 0,
				left: 0,
				'-webkit-transforms': 'translate(' + this.options.x + 'px, ' + this.options.y + 'px)'
			});
		} else {
			this.element.setStyles({
				top: this.options.y,
				left: this.options.x
			});
		}

		
		this.gameEngine.addEvent('loop',this.loop.bind(this));
		
		if (Browser.ios)
			this.gameEngine.addEvent('touchmove',this.mouseMove.bind(this));
		else
			this.gameEngine.addEvent('mousemove',this.mouseMove.bind(this));
	},
	
	mouseMove:function(e){
		this.options.mouseX = e.page.x;
		this.options.mouseY = e.page.y;
	},
	
	loop:function(){
		this.options.x += (this.options.mouseX - this.options.x) / this.options.friction;  
		this.options.y += (this.options.mouseY - this.options.y) / this.options.friction;
		
		if (this.accellerated){
			this.element.setStyle('-webkit-transform', 'translate(' + this.options.x + 'px, ' + this.options.y + 'px)');
		} else {
			this.element.setStyles({
				top: this.options.y,
				left: this.options.x
			});
		}

	}
});