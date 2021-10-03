/* jshint unused:false */
/* global PIXI, console, Util, Base */
(function(){

var Lightning = Base.extend({

	filters: [],

	constructor: function(settings){
		Util.merge(this, settings);
		// this.filters.push(new PIXI.InvertFilter());
		// this.filters.push(new PIXI.InvertFilter());
	},

	update: function(delta, stage){
		// this.stage.filters = [new PIXI.InvertFilter()];
	}

});

window.Lightning = Lightning;

})(window, Base);
