(function(){

var Grid = Bit.Grid = new Class({

	Implements: [Options, Events],

	Binds: ['select','unselect','mouseMove','mouseEnter','mouseLeave','addPiece','mouseDown','mouseUp'],

	options: {

		gridSize: 24,
		width: 20,
		height: 20,
		backgroundColor:'rgba(0,0,0,.5)',
		offsetY: 11,
		offsetX: 405
	},

	marks: [],

	grid: [],

	selected: {
		top: 0,
		left: 0,
		template: null,
		element: null
	},

	initialize: function(options){
		this.setOptions(options);

		var opts = this.options;

		this.container = new Element('div',{

			'class': 'Module container',

			styles: {
				overflow: 'hidden',
				width: this.options.gridSize * this.options.width,
				height: this.options.gridSize * this.options.height
			}

		}).inject(document.body);

		(this.options.height).times(function(y){
			this.grid[y] = [];
			(this.options.width).times(function(x){
				this.grid[y][x] = {
					element:null,
					left:null,
					top:null
				};
				/* Temporarily removing this for now...
				this.marks[this.marks.length] = new Element('div',{
					styles: {
						position:'absolute',
						left: ((x + 1) * this.options.gridSize) - 1,
						top: ((y + 1) * this.options.gridSize) - 1,
						width: 2,
						height: 2,
						backgroundColor: this.options.backgroundColor
					}
				}).inject(this.container);
				*/
			},this);
		},this);
	},

	select: function(left,top,template,size){
		if (!this.selected.element){

			this.selected.element = new Element('div',{
				styles: {
					position:'absolute',
					width:size,
					height:size,
					opacity:.7,
					display:'none',
					zIndex:2
				}
			}).inject(this.container);

			this.container.addEvents({
				mousemove: this.mouseMove,
				mouseenter: this.mouseEnter,
				mouseleave: this.mouseLeave,
				mousedown: this.mouseDown,
				mouseup: this.mouseUp
			});
		}

		this.selected.element.setStyles({
			backgroundPosition: -left+'px '+-top+'px',
			backgroundImage:'url('+template+')'
		});

		this.selected.top = top;
		this.selected.left = left;
		this.selected.template = template;
		
		this.container.addClass('selected');
	},
	
	
	unselect: function(left,top,template,size){
		this.container.removeEvents({
			mouseenter: this.showBrush,
			mouseleave: this.hideBrush,
			mousedown: this.mouseDown
		});

		if (this.selected.element) this.selected.element.destroy();

		this.selected.element = null;
		this.container.removeClass('selected');
	},
	
	mouseDown: function(e){
		if (e && e.stop) e.stop();
		this.addPiece(e);
		this.container.addEvent('mousemove',this.addPiece);
	},
	
	mouseUp: function(e){
		if (e && e.stop) e.stop();
		this.container.removeEvent('mousemove',this.addPiece);
	},

	addPiece: function(e){
		var sel = Bit.getGridPosition(e.client.x - this.options.offsetX, e.client.y - this.options.offsetY, this.options.gridSize),
			x = sel.left / this.options.gridSize,
			y = sel.top / this.options.gridSize;
		
		// Ensure x and y are valid
		x = (x >= this.options.width) ? this.options.width - 1 : x;
		y = (y >= this.options.height) ? this.options.height - 1 : y;

		// If there was already the same piece created here, kill the method
		if (this.grid[y][x].left === this.selected.left && this.grid[y][x].top === this.selected.top) return;

		// Destroy the existing element, if it exists
		if (this.grid[y][x].element){
			this.grid[y][x].element.destroy();
		}
		
		// Create the new tile
		this.grid[y][x].element = new Element('div',{
			styles:{
				position:'absolute',
				width:this.options.gridSize,
				height:this.options.gridSize,
				zIndex:0,
				left: sel.left,
				top: sel.top,
				backgroundPosition: -this.selected.left+'px '+-this.selected.top+'px',
				backgroundImage:'url('+this.selected.template+')'
			}
		}).inject(this.container);
		
		// Store the selected coordinates on the texture map
		this.grid[y][x].left = this.selected.left;
		this.grid[y][x].top = this.selected.top;
	},

	mouseEnter: function(){
		this.selected.element.setStyle('display','block');
	},

	mouseLeave: function(){
		this.selected.element.setStyle('display','none');
		this.mouseUp();
	},

	mouseMove: function(e){
		var sel = Bit.getGridPosition(e.client.x - this.options.offsetX,e.client.y - this.options.offsetY,this.options.gridSize);

		this.selected.element.setStyles({
			top: sel.top,
			left: sel.left
		});
	}
});

})();
