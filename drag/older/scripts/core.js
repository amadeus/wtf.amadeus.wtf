function TouchDrag(el)
{
	this.el = $(el);
	this.origin = [0,0];
	this.positions = [];
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
		var self = this;
		//this.timer = setInterval(this.log.bind(this),10);
	},
	
	touchMove:function(e)
	{
		e.preventDefault();
		this.position = [parseInt(e.targetTouches[0].clientX,10),parseInt(e.targetTouches[0].clientY,10)]
		this.origin = [e.targetTouches[0].clientX,e.targetTouches[0].clientY];
	},
	
	touchEnd:function(e)
	{
		e.preventDefault();
		this.physics();
	},
	
	physics: function()
	{
		//clearInterval(this.timer);
//		console.log(this.positions)
		if(this.positions.length>10) this.positions.splice(0,this.positions.length-4);
		
		var distance = 0;
		var time = 0;
		this.positions.each(function(coord,index,all){
			if(index<all.length-2)
			{
				var x1 = parseInt(coord[0],10);
				var y1 = parseInt(coord[1],10);
				var x2 = parseInt(all[index+1][0],10);
				var y2 = parseInt(all[index+1][1],10);
				
				var tDistance = parseInt(Math.sqrt((Math.pow(x2-x1,2))+(Math.pow(y2-y1,2))),10);
				distance += tDistance;
			}
			if(index>0)
			{
				var diff = all[index-1][2].diff(coord[2],'ms');
				time += diff;
			}
		});
		
		//console.log(distance/this.positions.length)
		var speed = (((distance/this.positions.length)/(time/this.positions.length))*1000).round(2);
		
		if(speed>300) document.getElementById('info').innerHTML = speed;
		else document.getElementById('info').innerHTML = 'no flick detected';
		
		this.positions.empty();
	},
	
	log: function()
	{
		this.positions[this.positions.length] = [this._coords[0],this._coords[1]];
	},
	
	// Getter and Setter for Positioning the draggable object
	get position(){ return this._coords; },
	set position(pos)
	{
		pos[0] = (pos[0])-this.origin[0];
		pos[1] = (pos[1])-this.origin[1];
		this.coords = pos;
		
		this.el.style.webkitTransform = 'translate(' + this.coords[0] + 'px, ' + this.coords[1] + 'px)';
	},
	
	// Getter and setter for Coordinates
	get coords(){ return this._coords; },
	set coords(pos)
	{
		if(this._coords)
		{
			this._coords[0]+=pos[0];
			this._coords[1]+=pos[1];	
		}
		else this._coords = [0,0]
		this.positions[this.positions.length] = [this._coords[0],this._coords[1],new Date()];
	},
	
	timer: null,
	// Pixels per mile
	ppm: 10327680
}

window.addEventListener('load',function(){
	window.mover = new TouchDrag('draggable');
},false);
