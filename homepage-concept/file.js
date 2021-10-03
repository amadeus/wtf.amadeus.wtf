window.addEvent('load', function(){

var el, device, app, moment, unit, transparency,
	appInfo, momentInfo, unitInfo;

el = document.id('feature');

device = document.id('device');
app = document.id('app');
moment = document.id('moment');
unit = document.id('unit');
appInfo = document.id('more-info-app');
momentInfo = document.id('more-info-moment');
unitInfo = document.id('more-info-reward');

transparency = 0.2;

setTimeout(function() {
	el.className += ' split-layers';
}, 1500);

setTimeout(function() {
	el.className += ' moment-breath';

	unitInfo.addEvents({
		mouseenter: function(){
			appInfo.setStyle('opacity', transparency);
			momentInfo.setStyle('opacity', transparency);
			unitInfo.setStyle('opacity', 1);
			device.setStyle('opacity', transparency);
			app.setStyle('opacity', transparency);
			moment.setStyle('opacity', transparency);
			unit.setStyle('opacity', 1);
		},
		mouseleave: function(){
			appInfo.setStyle('opacity', 1);
			momentInfo.setStyle('opacity', 1);
			unitInfo.setStyle('opacity', 1);
			device.setStyle('opacity', 1);
			app.setStyle('opacity', 1);
			moment.setStyle('opacity', 1);
			unit.setStyle('opacity', 1);
		}
	});

	momentInfo.addEvents({
		mouseenter: function(){
			appInfo.setStyle('opacity', transparency);
			momentInfo.setStyle('opacity', 1);
			unitInfo.setStyle('opacity', transparency);
			device.setStyle('opacity', transparency);
			app.setStyle('opacity', transparency);
			moment.setStyle('opacity', 1);
			unit.setStyle('opacity', transparency);
		},
		mouseleave: function(){
			appInfo.setStyle('opacity', 1);
			momentInfo.setStyle('opacity', 1);
			unitInfo.setStyle('opacity', 1);
			device.setStyle('opacity', 1);
			app.setStyle('opacity', 1);
			moment.setStyle('opacity', 1);
			unit.setStyle('opacity', 1);
		}
	});

	appInfo.addEvents({
		mouseenter: function(){
			appInfo.setStyle('opacity', 1);
			momentInfo.setStyle('opacity', transparency);
			unitInfo.setStyle('opacity', transparency);
			device.setStyle('opacity', 1);
			app.setStyle('opacity', 1);
			moment.setStyle('opacity', transparency);
			unit.setStyle('opacity', transparency);
		},
		mouseleave: function(){
			appInfo.setStyle('opacity', 1);
			momentInfo.setStyle('opacity', 1);
			unitInfo.setStyle('opacity', 1);
			device.setStyle('opacity', 1);
			app.setStyle('opacity', 1);
			moment.setStyle('opacity', 1);
			unit.setStyle('opacity', 1);
		}
	});
}, 3000);

});
