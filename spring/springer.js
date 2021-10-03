(function(){

if (this.Springer) {
    throw new Error('window.Spring already defined');
}

// requestAnimationFrame shim:
// http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimationFrame = (function(){
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

this.Springer = function(callback, options){
    this.callback = callback;

    options = options || {};

    if (options.position) {
        this.position.x = options.position.x || 0;
        this.position.y = options.position.y || 0;
    }

    if (options.stiffness || options.stiffness === 0) {
        this.stiffness = options.stiffness;
    }

    if (options.friction || options.friction === 0) {
        this.friction = options.friction;
    }

    if (options.threshold || options.threshold === 0) {
        this.threshold = options.threshold;
    }

    this.update = this.update.bind(this);
};

this.Springer.prototype = {

    stiffness : 70,
    friction  : 10,
    threshold : 0.03,

    position: {
        x: 0,
        y: 0
    },

    target: {
        x: 0,
        y: 0
    },

    acceleration: {
        x: 0,
        y: 0
    },

    velocity : {
        x: 0,
        y: 0
    },

    setTarget: function(targetX, targetY) {
        this.target.x = targetX || 0;
        this.target.y = targetY || 0;

        if (this.inMotion) {
            return this;
        }

        this.inMotion = true;
        this._last = Date.now();
        window.requestAnimationFrame(this.update);

        return this;
    },

    update: function(){
        var now, delta;

        if (!this.inMotion) {
            return this.complete();
        }

        now = Date.now();
        // Convert delta into seconds, so all velocities are in
        // pixels per second
        delta = (now - this._last) / 1000;

        this.acceleration.x = this.stiffness * (this.target.x - this.position.x) - this.friction * this.velocity.x;
        this.acceleration.y = this.stiffness * (this.target.y - this.position.y) - this.friction * this.velocity.y;

        this.velocity.x += this.acceleration.x * delta;
        this.velocity.y += this.acceleration.y * delta;

        this.position.x += this.velocity.x * delta;
        this.position.y += this.velocity.y * delta;

        this.inMotion =
            (
                Math.abs(this.acceleration.x) >= this.threshold &&
                Math.abs(this.acceleration.y) >= this.threshold
            ) || (
                Math.abs(this.velocity.x) >= this.threshold &&
                Math.abs(this.velocity.y) >= this.threshold
            );

        this._last = now;
        // We pass in position, delta, and our instance as arguments
        this.callback(this.position, delta, this);
        window.requestAnimationFrame(this.update);
    },

    complete: function(){
        if (!this.inMotion) {
            return this;
        }

        this.velocity.x = 0;
        this.velocity.y = 0;

        this.acceleration.x = 0;
        this.acceleration.y = 0;

        this.position.x = this.target.x;
        this.position.y = this.target.y;

        this.inMotion = false;
        return this;
    }

};

})(this);
