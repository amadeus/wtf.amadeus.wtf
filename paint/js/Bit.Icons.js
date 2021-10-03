(function(){

var Icons = Bit.Icons = new Class({

	Implements: [Options,Events],

	Binds:['imageInit','selectTile'],

	options: {
		template: 'assets/icons.png',
		gridSize: 24,
		selected: 'rgba(255,0,0,.2)',
		offsetX: 10,
		offsetY: 10
	},

	selected: {
		left: 0,
		top: 0,
		element: null
	},

	initialize:function(options){

		this.setOptions(options);

		this.container = new Element('div',{
			'class':'Module icons'
		}).inject(document.body);

		this.reference = new Element('img',{

			src: this.options.template,

			styles: {
				position: 'absolute',
				visibility: 'hidden',
				zIndex: 0
			},

			events: {
				load: this.imageInit
			}
		}).inject(this.container);

	},

	imageInit: function(e){
		var coords = this.reference.getSize();
		this.container
			.setStyles({
				width: coords.x,
				height: coords.y,
				backgroundImage: 'url('+this.options.template+')'
			})
			.addEvent('click',this.selectTile);
	},

	selectTile:function(e){
		if (e && e.preventDefault) e.preventDefault();
		
		var sel = Bit.getGridPosition(e.page.x - this.options.offsetX,e.page.y - this.options.offsetY,this.options.gridSize);
		
		if (sel.top === this.selected.top && sel.left === this.selected.left){
			if (this.selected.element) this.selected.element.destroy();
			this.selected.element = null;
			this.selected.left = null;
			this.selected.top = null;
			return this.fireEvent('unselect');
		}

		if (!this.selected.element)
			this.selected.element = new Element('div',{
				styles: {
					zIndex: 2,
					position: 'absolute',
					backgroundColor: this.options.selected,
					width: this.options.gridSize - 2,
					height: this.options.gridSize - 2,
					border: '1px solid rgba(255,0,0,.5)'
				}
			}).inject(this.container);

		this.selected.element.setStyles({
			left: sel.left,
			top: sel.top
		});

		this.selected.top = sel.top;
		this.selected.left = sel.left;

		this.fireEvent('select',[sel.left,sel.top,this.options.template,this.options.gridSize]);
	}
});

})();