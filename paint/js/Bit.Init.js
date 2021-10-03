(function(){

var hasRun = false;

var Init = Bit.Init = new Class({

	initialize: function(debug){
		if (hasRun === true) return;
		hasRun = true;

		if (debug) dbg.enable();
		else dbg.disable();

		window.addEvents({ domready:this.domready.bind(this) });
	},

	domready: function(){
		var grid = new Bit.Grid('container');
		var icons = new Bit.Icons();
		
		icons.addEvents({
			select: grid.select,
			unselect: grid.unselect
		});
	}
});

new Init(true);

})();