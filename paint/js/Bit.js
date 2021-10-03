// Initial variables
var Bit = {};

window.Data = {};

Bit.getGridPosition = function(x,y,size,maxX,maxY){
	return {
		left: x - (x % size),
		top: y - (y % size)
	};
};