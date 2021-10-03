// Pop Click Consructor
// Code Copyright 2009, Amadeus Demarzi
// Utilizes Mootools Framework

var PopClick = new Class({
	
	Implements:[Options],
	
	options:
	{
		el: null,
		img: new Element('img',{'src':'assets/images/poof.png','height':114,'width':114,'styles':{'z-index':9999}}),
		offsetX: null,
		offsetY: null
	},
	
	element: null,
	
	initialize:function(el,options)
	{
		this.element = $(el);
		
		if(this.element.getStyle('position')=='static') this.element.setStyle('position','relative');
		this.options.offsetX = this.element.getPosition().x;
		this.options.offsetY = this.element.getPosition().y;
		
		this.setOptions(options);
		
		this.element.addEvent('mousedown',this.shrink.bind(this),true);
		this.element.addEvent('mouseup',this.poof.bind(this),true);
	},
	
	shrink:function(e)
	{
		e.preventDefault();
		
		var newPoof = this.create(150);
		newPoof.set(this.parameters(true,50,0,'-25px 0 0 -25px',e.event.pageX-this.options.offsetX,e.event.pageY-this.options.offsetY));
		this.element.adopt(newPoof.element);
		newPoof.start(this.parameters(false,0,1,0));
	},
	
	poof:function(e)
	{
		e.preventDefault();
		
		var newPoof = this.create(500);
		newPoof.set(this.parameters(true,0,1,0,e.event.pageX-this.options.offsetX,e.event.pageY-this.options.offsetY));
		this.element.adopt(newPoof.element);
		newPoof.start(this.parameters(false,114,0,'-57 0 0 -57'));
	},
	
	done:function(e){ e.destroy(); },
	
	create:function(dur){ return new Fx.Morph(this.options.img.clone(),{duration:dur,fps:1000,transition:'quad:out',onComplete:this.done.bind(this)}); },
	
	parameters:function(set,wh,o,m,x,y)
	{
		if(set==true) return {'position':'absolute','left':x,'top':y,'opacity':o,'width':wh,'height':wh,'margin':m};
		else return {'opacity':o,'width':wh,'height':wh,'margin':m};
	}
});