(function (Engine, Base, Vector) {
  if (!String.prototype.substitute) {
    String.prototype.substitute = function (object, regexp) {
      return String(this).replace(regexp || /\\?\{([^{}]+)\}/g, function (match, name) {
        if (match.charAt(0) == '\\') return match.slice(1);
        return object[name] !== null ? object[name] : '';
      });
    };
  }

  function hasMotionSupport() {
    return 'DeviceMotionEvent' in window && window.DeviceMotionEvent.requestPermission != null;
  }

  Engine.Controls = Base.extend({
    shown: true,
    useDeviceAccellerometer: false,
    gravity: null,

    constructor: function (engine) {
      this.engine = engine;

      this.container = document.createElement('div');
      this.container.className = 'controls';

      // Hide the controls on mobile, by default...
      if (window.innerWidth <= 640) {
        this.toggleControls();
      }

      this.generateControls();
      this.handleDeviceMotion = this.handleDeviceMotion.bind(this);

      this.attach();
    },

    handleDeviceMotion: function (event) {
      this.gravity = new Vector(event.accelerationIncludingGravity.x, event.accelerationIncludingGravity.y * -1);
    },

    generateControls: function () {
      var html = '<h1>Environment Settings</h1><div class="inner-container">';

      if (hasMotionSupport()) {
        html += Engine.Controls.ButtonTemplate.substitute({
          id: 'gravity-button',
          text: 'Enable Accelerometer',
          className: 'gravity-toggle',
        });
      }

      Engine.Controls.Ranges.forEach(function (obj) {
        obj.value = this.engine[obj.id];
        html += Engine.Controls.ControlTemplate.substitute(obj);
      }, this);

      html += '</div><div>Total Particles: <span id="total-particles">0</span></div>';

      this.container.innerHTML += html;

      document.body.appendChild(this.container);

      this.totalParticle = document.getElementById('total-particles');
      this.gravityButton = document.getElementById('gravity-button');
    },

    setTotalParticles: function (total) {
      this.totalParticle.innerHTML = total || 0;
      return this;
    },

    attach: function () {
      this.container.addEventListener('touchmove', this.stopPropagation, false);
      this.container.addEventListener('input', this._handleChange.bind(this), false);
      this.controlTitle = this.container.querySelector('h1');
      this.controlTitle.addEventListener('click', this.toggleControls.bind(this), false);
      if (this.gravityButton != null) {
        this.gravityButton.addEventListener('click', this.toggleGravity.bind(this), false);
      }
    },

    toggleGravity: function (event) {
      if (!hasMotionSupport()) return;
      window.DeviceMotionEvent.requestPermission().then((response) => {
        if (response === 'granted' && !this.useDeviceAccellerometer) {
          this.useDeviceAccellerometer = true;
          window.addEventListener('devicemotion', this.handleDeviceMotion);
          this.gravityButton.innerHTML = 'Disable Accellerometer';
        } else {
          this.useDeviceAccellerometer = false;
          window.removeEventListener('devicemotion', this.handleDeviceMotion);
          this.gravityButton.innerHTML = 'Enable Accellerometer';
          this.gravity = null;
        }
      });
    },

    toggleControls: function (event) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }

      if (this.shown) {
        this.container.setAttribute('data-minimize', 1);
        this.shown = false;
      } else {
        this.container.removeAttribute('data-minimize');
        this.shown = true;
      }
    },

    _handleChange: function (event) {
      var target = event.target,
        key = target.id,
        value = parseFloat(target.value) || 0;

      this.engine[key] = value;

      document.getElementById(key + '_value').innerHTML = value;
    },

    stopPropagation: function (event) {
      event.stopPropagation();
    },
  });

  Engine.Controls.Ranges = [
    {
      id: 'gravity',
      label: 'Gravity',
      min: 0,
      max: 4000,
      step: 1,
    },
    {
      id: 'smoothingRadius',
      label: 'Smoothing Radius',
      min: 1,
      max: 100,
      step: 1,
    },
    {
      id: 'stiff',
      label: 'Stiffness',
      min: 1,
      max: 10000,
      step: 1,
    },
    {
      id: 'stiffN',
      label: 'Stiffness Near',
      min: 1,
      max: 10000,
      step: 1,
    },
    {
      id: 'restDensity',
      label: 'Rest Density',
      min: 1,
      max: 10,
      step: 0.01,
    },
    {
      id: 'radius',
      label: 'Particle Radius',
      min: 1,
      max: 20,
      step: 1,
    },
  ];

  Engine.Controls.ControlTemplate = [
    '<label for="{id}">',
    '{label}: ',
    '<span id="{id}_value">{value}</span>',
    '</label>',
    '<input ',
    'type="range" ',
    'id="{id}" ',
    'min="{min}" ',
    'max="{max}" ',
    'step="{step}" ',
    'value="{value}" ',
    '/>',
  ].join('');
  Engine.Controls.ButtonTemplate = ['<button type="button" id={id} class="{className}">{text}</button>'].join('');
})(window.Engine, window.Base, window.Vector);
