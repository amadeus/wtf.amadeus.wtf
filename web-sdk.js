(function(global, undefined){

var Kiip, Unit, Utils, Internal, UID;

if (global.Kiip) {
	return;
}

Utils = {

	isIE8: (function() {
		var rv = -1,
			ua = navigator.userAgent,
			re = new RegExp("Trident\/([0-9]{1,}[.0-9]{0,})");

		if (re.exec(ua) !== null) {
			rv = parseFloat(RegExp.$1);
		}

		return (rv == 4);
	})(),

	origin: window.location.protocol + '//33.33.33.10',
	// origin: window.location.protocol + '//delighted-parrot-1617.vagrantshare.com',

	API: '/2.0/web/moment/?',

	// A quick options factory that merges in
	// the given object
	Options: function(toMerge){
		var options = {
			device_id   : '5C42EC9D-6888-46E9-9A85-37478D679CEC',
			sdk_version : '1.0',
			app_version : '1.0.0',
			r: Utils.now()
		}, key;

		if (typeof toMerge !== 'object') {
			return options;
		}

		// Only merge truthy values that are not objects, arrays or functions
		for (key in toMerge) {
			if (
				(typeof toMerge[key] === 'object' || typeof toMerge[key] === 'function') ||
				!toMerge[key]
			) {
				continue;
			}
			options[key] = toMerge[key];
		}

		return options;
	},

	toQueryString: function(obj){
		var queryString = [],
			value, result, key;

		for (key in obj) {
			value = obj[key];
			result = key + '=' + encodeURIComponent(value);
			if (value) {
				queryString.push(result);
			}
		}

		return queryString.join('&');
	},

	// IE8 compatible Date.now
	now: function now(){
		return +(new Date());
	},

	// Quick typeOf
	typeOf: function(item){
		return Object.prototype.toString.call(item);
	},

	uniqueID: function(){
		if (!UID) UID = Utils.now();
		return (UID++).toString(36);
	}
};

Kiip = function(app_key, callback){
	if (
		Internal.instance &&
		(app_key === Internal.instance.app_key)
	) {
		return Internal.instance;
	} else if (Internal.instance) {
		throw new Error('Kiip Error: Only one Kiip instance is allowed per page');
	} else if (!app_key) {
		throw new Error('Kiip Error: You must supply an app key');
	}

	// Ain't nobody got time if you ain't got JSON or if  you
	// happen to be IE8
	if (!window.JSON || Utils.isIE8) {
		Internal.disabled = true;
	}

	this.app_key = app_key;

	if (Utils.typeOf(callback) === '[object Function]') {
		this.callback = callback;
	}

	if (window.addEventListener) {
		window.addEventListener('message', Internal._handleMessages, false);
	} else {
		window.attachEvent('onmessage', Internal._handleMessages);
	}

	Internal.instance = this;
};

Kiip.prototype.setEmail = function(email){
	Internal.email = email;
	return this;
};

Kiip.prototype.callback = function(unit){
	unit.show();
};

Kiip.prototype.setContainer = function(container){
	if (Utils.typeOf(container) === '[object String]') {
		Internal.container = document.getElementById(container);
	} else {
		Internal.container = container;
	}
	return this;
};

Kiip.prototype.postMoment = function(moment_id, device_id){
	var options;

	if (!moment_id || Internal.disabled) {
		this.callback(null);
		return this;
	}

	options = new Utils.Options({
		moment_id : moment_id,
		app_key   : this.app_key,
		device_id : device_id
	});

	Internal.postMoment(options);

	return this;
};

Kiip.prototype.unload = function(){
	Internal.email     = undefined;
	Internal.container = undefined;

	if (Internal.currentUnit) {
		Internal.currentUnit.destroy();
	}

	if (Internal.request) {
		Internal.request.abort();
	}

	if (window.removeEventListener) {
		window.removeEventListener('message', Internal._handleMessages, false);
	} else {
		window.detachEvent('onmessage', Internal._handleMessages);
	}

	Internal.instance = null;

	return undefined;
};

Unit = function(url){
	var iframe;

	this.id = Utils.uniqueID();

	// Pass various data through the querystring so the iframe and
	// our library can talk to each other.
	url += '&domain=' + window.location.protocol + "//" + window.location.hostname +
		(window.location.port ? ':' + window.location.port: '');
	url += '&frame_id=' + this.id;
	url += '&overlay=' + (Internal.container ? 'false' : 'true');

	iframe = document.createElement('iframe');
	iframe.setAttribute('frameborder', '0');
	iframe.setAttribute('src', url);

	iframe.style.zIndex    = '2147483647';
	iframe.style.width     = '100%';
	iframe.style.height    = '100%';
	iframe.style.minWidth  = '320px';
	iframe.style.minHeight = '330px';

	if (Internal.container) {
		iframe.style.position = 'relative';
		Internal.container.appendChild(iframe);
	} else {
		iframe.style.position = 'fixed';
		iframe.style.top  = '-999999px';
		iframe.style.left = '-999999px';
		document.documentElement.appendChild(iframe);
	}

	this.show = function(container){
		iframe.style.top  = '0px';
		iframe.style.left = '0px';

		iframe.contentWindow.postMessage('show', Utils.origin);

		// If we've been provided an email, set it into the unit
		if (Internal.email) {
			iframe.contentWindow.postMessage('email=' + Internal.email, Utils.origin);
		}

		return this;
	};

	this.destroy = function(){
		iframe.parentNode.removeChild(iframe);
		Internal.nextUnit();
		return this;
	};
};

Internal = {

	request: undefined,
	busy: false,
	requestQueue: [],

	currentUnit: undefined,
	unitQueue: [],

	postMoment: function(data){
		if (this.busy === true) {
			this.requestQueue.push(data);
			return;
		}

		this.busy = true;

		if (!this.request) {
			// IE9 Support - blech
			if (window.XDomainRequest) {
				this.request = new window.XDomainRequest();
				this.request.onload = this._handleXDomainLoad;
				this.request.onerror = this._handleFailure;
				this.request.ontimeout = this._handleFailure;
			} else {
				this.request = new window.XMLHttpRequest();
				this.request.onreadystatechange = this._handleReadyStateChange;
			}
		}

		this.request.open('POST', Utils.origin + Utils.API + 'r=' + Utils.now(), true);
		if (this.request.setRequestHeader) {
			this.request.setRequestHeader('Accept', 'application/json');
			this.request.setRequestHeader('Content-Type', 'application/json');
			this.request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		}

		Internal.request.send(JSON.stringify(data));
	},

	_handleXDomainLoad: function(){
		Internal._handleSuccess();
		Internal.busy = false;
		if (Internal.requestQueue.length) {
			Internal.postMoment(Internal.requestQueue.shift());
		}
	},

	_handleReadyStateChange: function(){
		Internal.readyStateChange();
	},

	readyStateChange: function(){
		if (this.request.readyState !== 4) {
			return;
		}

		if (
			(this.request.status >= 200 && this.request.status < 300) ||
			this.request.status === 0
		) {
			this._handleSuccess();
		} else {
			this._handleFailure();
		}

		this.busy = false;

		if (this.requestQueue.length) {
			this.postMoment(this.requestQueue.shift());
		}
	},

	_handleFailure: function(){
		Internal.instance.callback(null);
	},

	_handleSuccess: function(){
		var data;

		try {
			data = JSON.parse(this.request.responseText);
		} catch(e) {
			data = null;
		}

		if (data && data.view) {
			this.createUnit(data.view.modal);
		} else {
			this._handleFailure();
		}
	},

	_handleMessages: function(event){
		var parsed = event.data.split('|');
		Internal.parseUnitCommand(parsed[0], parsed[1]);
	},

	parseUnitCommand: function(event, id){
		var unit = Internal.currentUnit;

		if (event === 'ready' && unit) {
			Internal.instance.callback(unit);
		}
		if (event === 'destroy' && unit) {
			unit.destroy();
		}

		unit = undefined;
	},

	createUnit: function(modal){
		if (this.currentUnit) {
			this.unitQueue.push(modal);
			return;
		}

		this.currentUnit = new Unit(modal.body_url);
	},

	nextUnit: function(){
		var unit = this.unitQueue.shift();
		this.currentUnit = undefined;

		if (unit) {
			this.createUnit(unit);
		}
	}

};

window.Kiip = Kiip;

})(window);
