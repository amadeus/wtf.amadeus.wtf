(function (Engine, Vector) {
  Engine.Particle = function (x, y) {
    this.pos = new Vector(x, y);
    this.posOld = this.pos.clone();
    this.vel = Vector.coerce(this.vel);
  };

  const STILL_COLOR = {
    r: 0,
    g: 100,
    b: 255,
  };

  const INTERMEDIARY_COLOR = {
    r: 246,
    g: 0,
    b: 255,
  };

  const ACTIVE_COLOR = {
    r: 255,
    g: 54,
    b: 0,
  };

  function getInterpolatedPercentage(value, min, max) {
    const cappedValue = Math.min(Math.max(value, min), max) - min;
    return Math.max(Math.min(cappedValue / (max - min), 1), 0);
  }

  function getTweenColor(percentage, min, mid, max) {
    if (percentage === 0.5) return mid;
    if (percentage < 0.5) {
      return ((mid - min) * (percentage / 0.5) + min) >> 0;
    }
    return ((max - mid) * ((percentage - 0.5) / 0.5) + mid) >> 0;
  }

  Engine.Particle.prototype = {
    pos: {
      x: 0,
      y: 0,
    },

    posOld: {
      x: 0,
      y: 0,
    },

    vel: {
      x: 0,
      y: 0,
    },

    dens: 0,
    densN: 0,

    getColor: function () {
      var densPercentage = getInterpolatedPercentage(this.dens, 1, 4.5);
      var velocityPercentage = getInterpolatedPercentage(Math.abs(this.vel.x) + Math.abs(this.vel.y), 0, 8);
      var percentage = (densPercentage + velocityPercentage) / 2;
      var r = getTweenColor(percentage, STILL_COLOR.r, INTERMEDIARY_COLOR.r, ACTIVE_COLOR.r);
      var g = getTweenColor(percentage, STILL_COLOR.g, INTERMEDIARY_COLOR.g, ACTIVE_COLOR.g);
      var b = getTweenColor(percentage, STILL_COLOR.b, INTERMEDIARY_COLOR.b, ACTIVE_COLOR.b);
      return `rgba(${r},${g},${b},1)`;
    },

    draw: function (ctx, radius, scale) {
      ctx.beginPath();
      ctx.arc(this.pos.x * scale, this.pos.y * scale, radius * scale, 0, Math.PI * 2, false);
      ctx.fillStyle = this.getColor();
      ctx.fill();
    },
  };
})(window.Engine, window.Vector);
