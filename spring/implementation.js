// jshint unused: false
/* global console, Springer */
(function(){

var el, spring, mouse, callback;

// Create springed element
el = document.createElement('div');
el.className = 'disc';
document.body.appendChild(el);

// Callback method - fired 60 times a second
// after the spring instance updates its data
callback = function(pos){
	var str = 'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)';
	el.style.webkitTransform = str;
	el.style.mozTransform = str;
	el.style.msTransform = str;
	el.style.transform = str;
};

// Create spring instance
spring = new Springer(callback);

// Set target for spring on mousemove
document.body.parentNode.addEventListener('mousemove', function(event){
	spring.setTarget(event.clientX, event.clientY);
}, false);

})();
