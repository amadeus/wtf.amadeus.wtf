function TouchDrag(el)
{
	this.el = $(el);
	this.origin = [0,0];
	this.position = [0,0];
	
	this.el.addEventListener('touchstart',this.touchStart.bind(this),false);
	this.el.addEventListener('touchmove',this.touchMove.bind(this),false);
	this.el.addEventListener('touchend',this.touchEnd.bind(this),false);
}

TouchDrag.prototype =
{
	touchStart:function(e)
	{
		e.preventDefault();
		this.origin = [e.targetTouches[0].clientX,e.targetTouches[0].clientY];
	},
	
	touchMove:function(e)
	{
		e.preventDefault();
		this.position = [parseInt(e.targetTouches[0].clientX,10),parseInt(e.targetTouches[0].clientY,10)]
		this.origin = [e.targetTouches[0].clientX,e.targetTouches[0].clientY];
	},
	
	touchEnd:function(e){ e.preventDefault(); },
		
	get position(){ return this._coords; },
	set position(pos)
	{
		pos[0] = (pos[0])-this.origin[0];
		pos[1] = (pos[1])-this.origin[1];
		this.coords = pos;
		
		this.el.style.webkitTransform = 'translate(' + this.coords[0] + 'px, ' + this.coords[1] + 'px)';
	},
	
	get coords(){ return this._coords; },
	set coords(pos)
	{
		if(this._coords)
		{
			this._coords[0]+=pos[0];
			this._coords[1]+=pos[1];	
		}
		else this._coords = [0,0]
	}
}

window.addEventListener('load',function(){
	window.mover = new TouchDrag('draggable');
},false);