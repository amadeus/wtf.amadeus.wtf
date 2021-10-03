var transform = (Browser.Engine.gecko) ? 'mozTransform' : 'webkitTransform',
	transition = (Browser.Engine.gecko) ? 'mozTransition' : 'webkitTransition',
	transitionVal = (Browser.Engine.gecko) ? '-moz-transform 2000ms ease-out' : '-webkit-transform 2000ms ease-out';

var DragRotate = new Class({
	friction:.8,
	currentRotationX:0,
	currentRotationY:0,
	mode:'2d',
	
	lastX:0,
	lastY:0,

	initialize:function(el){
		this.body = $(document.body);

		this.el = $(el);

		this.touch = new Touch(this.body);

		this.touch.addEvents({
			start:this.start.bindWithEvent(this),
			move:this.move.bindWithEvent(this),
			end:this.end.bindWithEvent(this)
		});
	},

	start:function(){
		this.el.setStyle(transition,'');
		this.lastX = 0;
		this.lastY = 0;
		
		if(this.currentRotationY!==NaN && $type(this.currentRotationY)!='number') this.currentRotationY = 0;
		if(this.currentRotationX!==NaN && $type(this.currentRotationX)!='number') this.currentRotationX = 0;
	},

	move:function(x,y){
		this.currentRotationY+=((x-this.lastX)*this.friction);
		this.currentRotationX+=((y-this.lastY)*this.friction);
		
		this.lastX = x;
		this.lastY = y;
		if(this.mode==='2d')
			this.el.setStyle(transform,'rotateY('+this.currentRotationY+'deg)');
		if(this.mode==='3d')
			this.el.setStyle(transform,'rotateX('+-this.currentRotationX+'deg) rotateY('+this.currentRotationY+'deg)');
	},

	end:function(){
		this.el.setStyle(transition, transitionVal);
		this.move(this.lastX*2.8,this.lastY*2.8);
	}
});