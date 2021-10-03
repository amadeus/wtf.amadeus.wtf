var FullCanvas = new Class({

	Implements: [Options, Events, Class.Binds],

	options: {
		attach: true,
		styles: {
			position: 'absolute',
			top: 0,
			left: 0
		}
	},

	initialize: function(canvas, options){
		this.canvas = document.id(canvas);
		this.setOptions(options);

		this.canvas.setStyles(this.options.styles);

		if (this.options.attach) this.attach();
		this.resize();
	},

	attach: function(){
		window.addEvent('resize', this.bound('resize'));
	},

	detach: function(){
		window.removeEvent('resize', this.bound('resize'));
	},

	resize: function(){
		var info = window.getSize();
		this.canvas.setStyles({
			width: info.x,
			height: info.y
		});

		this.canvas.width = info.x;
		this.canvas.height = info.y;

		System.size = info;

		this.fireEvent('resize', info);
	},

	toElement: function(){
		return this.canvas;
	}
});
