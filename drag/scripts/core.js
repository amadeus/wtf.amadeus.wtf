function TouchDrag(el)
{
	this.el = $(el);
	this.origin = [0,0];
	this.positions = [];
	this.position = [120,20];
	
	this.temp = new Element('div',{
		'styles':
		{
			'position':'absolute',
			'width':10,
			'height':10,
			'top':-100,
			'left':-100,
			'background-color':'red',
			'z-index':9999
		}
	});
	
	document.body.adopt(this.temp);
	
	document.body.addEventListener('touchstart',function(e){ e.preventDefault(); },false);
	document.body.addEventListener('touchmove',function(e){ e.preventDefault(); },false);
	
	this.el.addEventListener('touchstart',this.touchStart.bind(this),true);
	this.el.addEventListener('touchmove',this.touchMove.bind(this),true);
	this.el.addEventListener('touchend',this.touchEnd.bind(this),true);
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
		if(this.positions.length>10) this.positions.splice(0,this.positions.length-4);
		
		var distance = 0;
		var time = 0;
		var angles = [];
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
				
				var x1 = all[index-1][0];
				var y1 = all[index-1][1];
				var x2 = all[index][0];
				var y2 = all[index][1];
				
				var tan = Math.atan((y2-y1)/(x2-x1));
				
				//var angle = tan*57.3;
				angles[angles.length] = tan*57.3;
			}
			
		});
		
		var speed = (((distance/this.positions.length)/(time/this.positions.length))*1000).round(2);
		
		/* Detect Flick Code... Disabled for debugging
		if(speed>300)
		{*/
			document.getElementById('info').innerHTML = speed+'pps';

			var x1 = this.positions[this.positions.length-2][0];
			var y1 = this.positions[this.positions.length-2][1];
			var x2 = this.positions[this.positions.length-1][0];
			var y2 = this.positions[this.positions.length-1][1];
			
			var t_angles = 0;
			angles.each(function(angle)
			{
				t_angles+=angle;
			});
			
			var average_angle = t_angles/angles.length;
			
			document.getElementById('info').innerHTML += '<p>'+average_angle+'</p>';
			
			var x3 = parseInt(60*(Math.cos(average_angle)),10)+x2;
			var y3 = parseInt(60*(Math.sin(average_angle)),10)+y2;
			
			this.temp.style.left = x3+40+'px';
			this.temp.style.top = y3+40+'px';
/*		}
		else document.getElementById('info').innerHTML = 'no flick detected';*/
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
