// jshint strict:false, eqnull:true, onevar:false
(function(){
var Atlas, Type;

Atlas = this.Atlas = {

	version: '0.2',

	// Stolen and simplified from Mootools
	typeOf: function(item){
		if (item == null) return 'null';
		if (item.prototype && item.prototype.__type__) return item.prototype.__type__;
		if (item.__type__) return item.__type__;

		if (item.nodeName) {
			if (item.nodeType == 1) return 'element';
			if (item.nodeType == 3) return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
		} else if (typeof item.length == 'number') {
			if (item.callee) return 'arguments';
			if (item.charAt) return 'string';
			if ('item' in item) return 'collection';
		}

		return typeof item;
	},

	// Stolen from MooTools
	instanceOf: function(item, object){
		if (item == null) return false;

		var constructor = item.__constructor__;
		while (constructor){
			if (constructor === object) return true;
			constructor = constructor.__super__;
		}

		// @block: ie
		if (!item.hasOwnProperty) return false;
		// @end

		return item instanceof object;
	},

	// Stolen from MooTools
	__isEnumerable__: function(item){
		return (item != null && typeof item.length == 'number' && Object.prototype.toString.call(item) != '[object Function]' );
	},

	// Adds to parent's prototype
	implement: function(parent, a, b, c){
		var type = Atlas.typeOf(a),
			safe = type === 'string' ? !!c : !!b, base;

		base = Atlas.__getObject__(type, a, b);

		return Atlas.__setProperty__(base, parent.prototype, safe);
	},

	// Adds to parent
	extend: function(parent, a, b, c){
		var type = Atlas.typeOf(a),
			safe = type === 'string' ? !!c : !!b, base;

		base = Atlas.__getObject__(type, a, b);

		return Atlas.__setProperty__(base, parent, safe);
	},

	__getObject__: function(type, a, b){
		var base = {};

		if (type === 'string') base[a] = b;
		else base = a;

		return base;
	},

	__setProperty__: function(base, parent, safe){
		var implemented = true, key;

		for (key in base){
			if (safe && parent[key]){
				implemented = false;
				continue;
			}

			parent[key] = base[key];
		}

		return implemented;
	},

	// Generic Atlas clone wrapper
	__clone__: function(item){
		var type = Atlas.typeOf(item),
			Base = Atlas.Types[type] || {};

		if (Base && Base.clone) return Base.clone(item);
		return item;
	},

	// Generic Atlas merge wrapper
	__merge__: function(source, key, current){
		switch (Atlas.typeOf(current)){
			case 'object':
				if (Atlas.typeOf(source[key]) === 'object')
					Object.merge(source[key], current);
				else
					source[key] = Object.clone(current);
			break;

			case 'array':
				source[key] = Array.clone(current);
			break;

			default:
				source[key] = current;
		}
		return source;
	}

};

Type = Atlas.Type = function(name, object, isNative){
	if (Atlas.Types[name]) return Atlas.Types[name];

	if (!isNative && object !== Object){
		object.extend(this);
		Atlas.extend(object, 'constructor', Atlas.Type);
	}

	if (object !== Object){
		Atlas.extend(object, '__type__', 'type');
		Atlas.implement(object, '__type__', name);
		Atlas.implement(object, 'constructor', object);
	}

	Atlas.Types[name] = object;
	return object;
};

Atlas.extend(Type, '__type__', 'type');

Atlas.Types = {};

}).call(this);

// jshint strict:false, eqnull:true
(function(global){

var Atlas, METHODS, ENUMERABLES;

Atlas = global.Atlas;
if (!Atlas) return;

// Adding type
new Atlas.Type('object', Object, true);

// Basic utilities
// Stolen and modified from MooTools Prime
METHODS = 'constructor,toString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString'.split(',');
ENUMERABLES = !({ valueOf: 0 }).propertyIsEnumerable('valueOf') ? METHODS : false;

Atlas.extend(Object, {

	// Iterate through an object, stolen from Mootools
	each: function(object, method, context){
		var i = (ENUMERABLES) ? ENUMERABLES.length : 0,
			key, value;

		for (key in object)
			method.call(context, object[key], key, object);

		while (i--){
			key = ENUMERABLES[i];
			value = object[key];
			if (value === Object.prototype[key]) break;
			method.call(context, value, key, object);
		}

		return object;
	},

	clone: function(obj, shallow){
		var newObj = {};

		Object.each(obj, function(value, key){
			if (!shallow) value = Atlas.__clone__(value);
			newObj[key] = value;
		});

		return newObj;
	},

	// Merge Object - stolen from MooTools
	merge: function(source, k, v){
		var i, object, key, l;
		if (Atlas.typeOf(k) === 'string')
			return Atlas.__merge__(source, k, v);

		for (i = 1, l = arguments.length; i < l; i++){
			object = arguments[i];
			for (key in object) Atlas.__merge__(source, key, object[key]);
		}

		return source;
	},

	// Append Object - Stolen from MooTools
	append: function(original){
		var i, extended, key, l;
		for (i = 1, l = arguments.length; i < l; i++){
			extended = arguments[i] || {};
			for (key in extended)
				original[key] = extended[key];
		}

		return original;
	},

	toQueryString: function(obj){
		var queryString = [], value, result, key;

		for (key in obj) {
			value = obj[key];
			result = key + '=' + encodeURIComponent(value);
			if (value != null) queryString.push(result);
		}

		return queryString.join('&');
	}

}, true);

}).call(this, this);

// jshint eqnull:true, strict:false
(function(global){
var Atlas, fixNodelist, each;

Atlas = global.Atlas;
if (!Atlas) return;

// Add type
new Atlas.Type('array', Array, true);

Atlas.extend(Array, {

	// Clone an array
	clone: function(arr, shallow){
		var newArr = [];

		arr.forEach(function(value, i){
			if (!shallow) value = Atlas.__clone__(value);
			newArr[i] = value;
		});

		return newArr;
	},

	// Stolen from Mootools
	from: function(item){
		return (Atlas.__isEnumerable__(item) && typeof item != 'string') ? (Atlas.typeOf(item) === 'array') ? item : Array.prototype.slice.call(item) : [item];
	},

	// Flatten all args
	flatten: function(){
		return Array.prototype.concat.apply([], Array.from(arguments)).flatten();
	}

}, true);

fixNodelist = function(nodelist){
	var ret = [], x;
	for (x = 0; x < nodelist.length; x++)
	ret[x] = nodelist[x];

	return ret;
};

each = Array.prototype.forEach;

// @block: ie
// Provide forEach shim - stolen from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
if (!each) {
	each = function(callback, thisArg) {
		var T, k, O, len, kValue;

		if (this == null)
			throw new TypeError('this is null or not defined');

		O = Object(this);

		len = O.length >>> 0;

		if (Atlas.typeOf(callback) !== 'function')
			throw new TypeError(callback + ' is not a function');

		if (thisArg) T = thisArg;

		k = 0;

		while (k < len) {
			if (k in O) {
				kValue = O[k];
				callback.call(T, kValue, k, O);
			}

			k++;
		}
	};
}
// @end

Atlas.implement(Array, {

	// @block: ie
	forEach: each,
	// @end

	each: function(){
		each.apply(this, Array.from(arguments));
		return this;
	},

	// @block: ie
	// Array indexOf shim - https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
	indexOf: function (searchElement) {
		var t, len, n, k;
		if (this == null) throw new TypeError();

		t = Object(this);
		len = t.length >>> 0;
		if (len === 0) return -1;

		n = 0;
		if (arguments.length > 0) {
			n = Number(arguments[1]);
			if (n != n) n = 0;
			else if (n !== 0 && n != Infinity && n != -Infinity)
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
		}
		if (n >= len) return -1;

		k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement)
				return k;
		}

		return -1;
	},
	// @end

	clone: function(shallow){
		return Array.clone(this, shallow);
	},

	append: function(array){
		this.push.apply(this, array);
		return this;
	},

	// Stolen from MooTools
	flatten: function(){
		var array = [], type, i, l;
		for (i = 0, l = this.length; i < l; i++){
			type = Atlas.typeOf(this[i]);

			if (type == 'null') continue;

			array = array.concat(
				(type == 'array' || type == 'collection' || type == 'arguments' || Atlas.instanceOf(this[i], Array)) ? Array.from(this[i]).flatten() : this[i]);
		}

		return array;
	},

	// Stolen from MooTools
	invoke: function(methodName){
		var args = Array.prototype.slice.call(arguments, 1);
		return this.each(function(item){
			item[methodName].apply(item, args);
		});
	},

	getLast: function(){
		return this[this.length - 1];
	}

}, true);


}).call(this, this);

// jshint strict:false, eqnull:true, expr:true
(function(global){

var Atlas, METHODS, ENUMERABLES;

Atlas = global.Atlas;
if (!Atlas) return;

METHODS = 'constructor,toString,valueOf,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString'.split(','),
ENUMERABLES = !({ valueOf: 0 }).propertyIsEnumerable('valueOf') ? METHODS : false;

// Add type
new Atlas.Type('function', Function, true);

Atlas.implement(global.Function, {

	// Stolen from MooTools
	pass: function(args, bind){
		var self = this;
		if (args != null) args = Array.from(args);
		return function(){
			return self.apply(bind, args || arguments);
		};
	},

	// Stolen from MooTools
	delay: function(delay, bind, args){
		return setTimeout(this.pass((args == null ? [] : args), bind), delay);
	},

	// Stolen from MooTools
	periodical: function(periodical, bind, args){
		return setInterval(this.pass((args == null ? [] : args), bind), periodical);
	},

	// Function bind shim - https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
	bind: function (oThis) {
		if (typeof this !== 'function') {
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		var aArgs = Array.prototype.slice.call(arguments, 1),
		fToBind = this,
		FNOP = function() {},
		fBound = function() {
			return fToBind.apply(this instanceof FNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
		};

		FNOP.prototype = this.prototype;
		fBound.prototype = new FNOP();

		return fBound;
	},

	// Stolen from MooTools
	overloadGetter: function(usePlural){
		var self = this;
		return function(a){
			var args, result, i;
			if (typeof a != 'string') args = a;
			else if (arguments.length > 1) args = arguments;
			else if (usePlural) args = [a];
			if (args){
				result = {};
				for (i = 0; i < args.length; i++) result[args[i]] = self.call(this, args[i]);
			} else {
				result = self.call(this, a);
			}
			return result;
		};
	},

	// Stolen from MooTools
	overloadSetter: function(usePlural){
		var self = this;
		return function(a, b){
			var k, i;
			if (a == null) return this;
			if (usePlural || typeof a != 'string'){
				for (k in a) self.call(this, k, a[k]);
				if (ENUMERABLES) for (i = ENUMERABLES.length; i--;){
					k = ENUMERABLES[i];
					if (a.hasOwnProperty(k)) self.call(this, k, a[k]);
				}
			} else {
				self.call(this, a, b);
			}
			return this;
		};
	}

}, true);


// Ripped from Mootools
Atlas.implement(Function, {

	extend: (function(key, value){
		this[key] = value;
	}).overloadSetter(),

	implement: (function(key, value){
		this.prototype[key] = value;
	}).overloadSetter()

}, true);


}).call(this, this);

// jshint strict:false
(function(global){

var Atlas = global.Atlas;
if (!Atlas) return;

// Add type
new Atlas.Type('number', Number);

Atlas.extend(Number, {

    // Stolen from MooTools
	random: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

}, true);


Atlas.implement(Number, {

    // Stolen from MooTools
	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

    // Stolen from MooTools
	round: function(precision){
		precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
		return Math.round(this * precision) / precision;
	},

    // Stolen from MooTools
	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, this);
	}

}, true);

}).call(this, this);

// jshint strict:false
// @block: ie
(function(global){

var Atlas = global.Atlas;
if (!Atlas) return;

Atlas.extend(Date, {

	// Date.now shim, from MDN
	now: function now(){
		return +(new Date());
	}

}, true);

}).call(this, this);
// @end

// jshint strict:false
(function(global){

var Atlas = global.Atlas, UID;
if (!Atlas) return;

// Add type
new Atlas.Type('string', String, true);

Atlas.extend(String, {

	// Stolen from MooTools
	uniqueID: function(){
		if (!UID) UID = Date.now();
		return (UID++).toString(36);
	}

}, true);

Atlas.implement(String, {

	// Stolen from MooTools
	trim: function(){
		return String(this).replace(/^\s+|\s+$/g, '');
	},

	// Stolen from MooTools
	camelCase: function(){
		return String(this).replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	// Stolen from MooTools
	hyphenate: function(){
		return String(this).replace(/[A-Z]/g, function(match){
			return ('-' + match.charAt(0).toLowerCase());
		});
	},

	// Stolen from MooTools
	contains: function(string, separator){
		return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : String(this).indexOf(string) > -1;
	},

	// Stolen from MooTools
	substitute: function(object, regexp){
		return String(this).replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != null) ? object[name] : '';
		});
	},

	escapeRegExp: function(){
		return String(this).replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	// Stolen from MooTools
	parseQueryString: function(decodeKeys, decodeValues){
		if (decodeKeys == null) decodeKeys = true;
		if (decodeValues == null) decodeValues = true;

		var vars = this.split(/[&;]/),
			object = {};
		if (!vars.length) return object;

		vars.each(function(val){
			var index = val.indexOf('=') + 1,
				value = index ? val.substr(index) : '',
				keys = index ? val.substr(0, index - 1).match(/([^\]\[]+|(\B)(?=\]))/g) : [val],
				obj = object;
			if (!keys) return;
			if (decodeValues) value = decodeURIComponent(value);
			keys.each(function(key, i){
				if (decodeKeys) key = decodeURIComponent(key);
				var current = obj[key];

				if (i < keys.length - 1) obj = obj[key] = current || {};
				else if (Atlas.typeOf(current) == 'array') current.push(value);
				else obj[key] = current != null ? [current, value] : value;
			});
		});

		return object;
	},

	queryStringAppend: function(str){
		str = (Atlas.typeOf(str) === 'object') ? Object.toQueryString(str) : str;
		var sep = this.indexOf('?') == -1 ? '?' : '&';
		return this + sep + str;
	}

}, true);

}).call(this, this);

// jshint strict:false, loopfunc:true
(function(global){

var Atlas, parent, Class;

Atlas = global.Atlas;
if (!Atlas) return;

/*
 *
 * Fast and simple Class implementation
 *
 * Based on http://myjs.fr/my-class/
 * API inspired by MooTools
 *
 */

// Parent method for class Extends
parent = function(){
	var args = Array.from(arguments),
		key  = args.splice(0, 1)[0],
		method, toReturn;

	if (key === 'initialize')
		method = this.__constructor__;
	else
		method = this[key];

	// Store a reference to the parent this if not set
	if (!method.__parent__)
		method.__parent__ = this;

	// Move up the proto chain to the next level of __super__
	method.__parent__ = method.__parent__.__super__ || method.__parent__.prototype.__super__;

	// Execute the __super__ method, initialize is a special case
	if (key === 'initialize')
		toReturn = method.__parent__.apply(this, args);
	else
		toReturn = method.__parent__.prototype[key].apply(this, args);

	// Remove the reference to parent, since we are done extending
	delete method.__parent__;

	// Support return values
	return toReturn;
};

Class = function(base){
	var constr = function(){},
		isFunc = false,
		SuprProto = function(){};

	base = base || {};

	if (Atlas.typeOf(base) === 'function'){
		constr = base;
		isFunc = true;
	} else if (base.initialize){
		constr = base.initialize;
		delete base.initialize;
	}

	if (!isFunc && base.Extends){
		SuprProto.prototype = base.Extends.prototype;

		constr.prototype = new SuprProto();

		constr.implement({
			__super__ : base.Extends,
			parent    : parent
		});

		delete base.Extends;
	}

	if (!isFunc && base.Implements){
		Array.from(base.Implements).each(function(kls){
			constr.implement(kls.prototype);
		}, this);

		delete base.Implements;
	}

	constr.implement(this);

	if (!isFunc)
		constr.implement(base);

	Atlas.extend(constr, 'implement', function(key, value){
		Atlas.implement(this, key, value);
	}.overloadSetter());

	Atlas.extend(constr, 'extend', function(key, value){
		Atlas.extend(this, key, value);
	}.overloadSetter());

	if (!constr.prototype.__constructor__)
		constr.implement('__constructor__', Class);

	return constr;
};

new Atlas.Type('class', Class);

Atlas.extend(global, 'Class', Class);

Atlas.extend(Class, {

	// Stolen from MooTools - called reset
	instantiate: function(object){
		var key, value, F;

		for (key in object){
			value = object[key];
			switch (Atlas.typeOf(value)){
				case 'object':
					F = function(){};
					F.prototype = value;
					object[key] = Class.instantiate(new F());
				break;
				case 'array':
					object[key] = value.clone();
				break;
			}
		}

		return object;
	},

	// Stolen from Mootools
	Options: new Class({

		setOptions: function(){
			this.options = Object.merge.apply(null, [{}, this.options].append(arguments));
			return this;
		}

	}),

	// My refactored events mix in
	Events: new Class({

		addEvent: function(event, fn){
			if (!this.__events__) this.__events__ = {};
			var list = this.__events__[event] || (this.__events__[event] = []);
			if (list.indexOf(fn) !== -1) return this;
			list.push(fn);
			return this;
		},

		removeEvent: function(event, fn){
			if (!this.__events__) this.__events__ = {};

			var list = this.__events__[event], i;
			if (!list) return this;
			if (list.indexOf(fn) === -1) return this;
			list.splice(i, 1);
			if (!list.length) delete this.__events__[event];
			return this;
		},

		fireEvent: function(event){
			var list, f, args, l;
			if (!this.__events__) this.__events__ = {};

			list = this.__events__[event];
			if (!list) return this;
			args = Array.prototype.slice.call(arguments, 1);
			for (f = 0, l = list.length; f < l; f++) list[f].apply(this, args);
			return this;
		}

	}),

	// Stolen from PowerTools, http://github.com/cpojer
	Binds: new Class({

		bound: function(name){
			if (!this.__bound__) this.__bound__ = {};
			return this.__bound__[name] ? this.__bound__[name] : this.__bound__[name] = this[name].bind(this);
		}

	})

});

// Add plurals to addEvent/removeEvent
Atlas.implement(Class.Events, {

	addEvents: Class.Events.prototype.addEvent.overloadSetter(true),

	removeEvents: Class.Events.prototype.removeEvent.overloadSetter(true)

}, true);

}).call(this, this);

//jshint strict:false
(function(global){

var Atlas, Element, Elements, badProto, ElProto, constructor, ie7Hack, ElsProto,
	oListeners, runListeners, getCompatElement;

Atlas = global.Atlas;
if (!Atlas || !document) return;


Atlas.extend(document, {
	/*

		@api: document.id

		@notes: Stolen from MooTools

		@arguments: String, Element or Class with toElement property

		@returns: valid element or null

	*/
	id: function(el){
		var type = Atlas.typeOf(el);

		if (type === 'string') el = document.getElementById(el) || null;
		if (type === 'class' && el.toElement) el = el.toElement();
		if (el && el.nodeType !== 1) el = null;
		if (el && !el.__extended__) Atlas.extend(el, ElProto, true);

		return el || null;
	},

	getDocument: function(){
		return this;
	}

}, true);


/*

	@api: new Element

	@notes: API inspired by MooTools

	@arguments: String(html tag), [optional: Object(properties)]

	@returns: a new HTML element, extended with specified properties

*/

Element = function(tag, options){
	var el = document.createElement(tag || 'div');
	if (!el.__extended__) Atlas.extend(el, ElProto, true);
	el.set(options);
	return el;
};

constructor = window.Element || Element;
badProto = (Element === constructor);

// Add type
new Atlas.Type('element', Element, true);

Atlas.extend(document, '__type__', 'document');

// Preserving a reference to the actual element constructor
Atlas.extend(Element, 'constructor', constructor);


/*

	@api: new Elements

	@notes: A constructor to manage multiple elements at once in an
	array like object

	@arguments: Any numer of elements or arrays of elements

	@returns: a type Elements array like object

*/

Elements = function Element(){
	var args = Array.from(arguments).flatten(),
		self = (ie7Hack) ? [] : this;

	args.each(function(el){
		el = document.id(el);
		if (!el) return;
		self.push(el);
	});

	// @block: ie
	if (ie7Hack){
		Atlas.extend(self, ElsProto, true);
		Atlas.extend(self, '__type__', 'elements');
	}
	// @end

	return self;
};

ElsProto = {};

	// IE7 Hack...
	// Because we cannot subclass Array, we completely break
	// the Elements constructor. This allows it to actually still work
ie7Hack = (document.all && (!document.documentMode || (document.documentMode && document.documentMode < 8))) ? true : false;

// Elements is essentially an extended Array, so we inherit
// from Array first
Elements.prototype = [];

// Add Elements type
new Atlas.Type('elements', Elements);

// @block: ie
// Utilities for add|removeEventListener shim
oListeners = {};
runListeners = function(oEvent) {
	if (!oEvent) { oEvent = window.event; }
	for (var iLstId = 0, iElId = 0, oEvtListeners = oListeners[oEvent.type]; iElId < oEvtListeners.aEls.length; iElId++) {
		if (oEvtListeners.aEls[iElId] === this) {
			for (iLstId; iLstId < oEvtListeners.aEvts[iElId].length; iLstId++){
				oEvtListeners.aEvts[iElId][iLstId].call(this, oEvent);
			}
			break;
		}
	}
};

// Quick and dirty shim for getComputedStyle
Atlas.extend(global, {

	getComputedStyle: function(el) {
		this.el = el;
		this.getPropertyValue = function(prop) {
			var re = /(\-([a-z]){1})/g;
			if (prop == 'float') prop = 'styleFloat';
			if (re.test(prop)) {
				prop = prop.replace(re, function () {
					return arguments[2].toUpperCase();
				});
			}
			return el.currentStyle[prop] ? el.currentStyle[prop] : null;
		};

		return this;
	}

}, true);
// @end


// Element Prototype
ElProto = {

	__extended__: true,

	getDocument: function(){
		return this.ownerDocument;
	},

	// @block: ie
	addEventListener: function(sEventType, fListener) { // Shim
		var oEvtListeners, nElIdx, iElId, aElListeners, iLstId;
		if (oListeners.hasOwnProperty(sEventType)) {
			oEvtListeners = oListeners[sEventType];
			for (nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) {
				if (oEvtListeners.aEls[iElId] === this) { nElIdx = iElId; break; }
			}
			if (nElIdx === -1) {
				oEvtListeners.aEls.push(this);
				oEvtListeners.aEvts.push([fListener]);
				this['on' + sEventType] = runListeners;
			} else {
				aElListeners = oEvtListeners.aEvts[nElIdx];
				if (this['on' + sEventType] !== runListeners) {
					aElListeners.splice(0);
					this['on' + sEventType] = runListeners;
				}
				for (iLstId = 0; iLstId < aElListeners.length; iLstId++) {
					if (aElListeners[iLstId] === fListener) { return; }
				}
				aElListeners.push(fListener);
			}
		} else {
			oListeners[sEventType] = { aEls: [this], aEvts: [ [fListener] ] };
			this['on' + sEventType] = runListeners;
		}
	},

	removeEventListener: function (sEventType, fListener) { // Shim
		var oEvtListeners, nElIdx, iElId, iLstId, aElListeners;
		if (!oListeners.hasOwnProperty(sEventType)) { return; }
		oEvtListeners = oListeners[sEventType];
		for (nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) {
			if (oEvtListeners.aEls[iElId] === this) { nElIdx = iElId; break; }
		}
		if (nElIdx === -1) { return; }
		for (iLstId = 0, aElListeners = oEvtListeners.aEvts[nElIdx]; iLstId < aElListeners.length; iLstId++) {
			if (aElListeners[iLstId] === fListener) { aElListeners.splice(iLstId, 1); }
		}
	},

	// Simple Shim
	hasAttribute: function(attr){
		var value = this.getAttribute(attr);
		return Atlas.typeOf(value) === 'null' ? false : true;
	},
	// @end

	getElements: function(query){
		return new Elements(this.querySelectorAll(query));
	},

	set: (function(key, value){
		value = (value || value !== 0) ? value : '';
		if (key === 'html') key = 'innerHTML';
		switch(key){
			case 'class':
				this.className = value;
			break;

			case 'events':
				this.addEvents(value);
			break;

			case 'style':
				this.setStyles(value);
			break;

			case 'styles':
				this.setStyles(value);
			break;

			case 'innerHTML':
				this.innerHTML = value;
			break;

			default:
				this.setAttribute(key, value || '');
			break;
		}

		return this;
	}).overloadSetter(),

	get: (function(value){
		return this.getAttribute(value) || this[value] || null;
	}).overloadGetter(),

	setStyle: function(key, value){
		this.style[key.camelCase()] = value;
		return this;
	},

	getStyle: function(style){
		var result;

		if (window.getComputedStyle)
			result = window.getComputedStyle(this).getPropertyValue(style);

		if (!result && result !== 0)
			result = this.style[style.camelCase()];

		return (result === '') ? null : result;
	},

	addEvent: function(ev, func, bubble){
		if (Element.Delegate){
			var evs = ev.split(':');
			if (evs.length > 1){
				new Element.Delegate(evs[0], evs[1], this).addEvent(func);
				return this;
			}
		}
		this.addEventListener(ev, func, bubble || false);
		return this;
	},

	removeEvent: function(ev, func, bubble){
		if (Element.Delegate){
			var evs = ev.split(':');
			if (evs.length > 1){
				new Element.Delegate(evs[0], evs[1], this).removeEvent(func);
				return this;
			}
		}
		this.removeEventListener(ev, func, bubble || false);
		return this;
	},

	// Stolen from MooTools
	inject: function(el, where){
		var parent = el.parentNode,
			sibling = el.nextSibling,
			child = el.firstChild;

		switch(where) {

			case 'before':
				if (parent)
					parent.insertBefore(this, el);
			break;

			case 'after':
				if (parent)
					parent.insertBefore(this, sibling);
			break;

			case 'top':
				el.insertBefore(this, child);
			break;

			default:
				el.appendChild(this);
			break;
		}

		return this;
	},

	addClass: function(newClass){
		var classes = (this.className === '') ? [] : this.className.split(' '),
			index = classes.indexOf(newClass);
		// No need to add the class if it has already been added
		if (index >= 0)
			return this;
		classes.push(newClass);
		this.className = classes.join(' ');
		return this;
	},

	removeClass: function(removeClass){
		var classes = this.className.split(' '),
			index = classes.indexOf(removeClass);
		// No need to remove the class if it doesn't exist
		if (index <= 0) return this;
		classes.splice(index, 1);
		if (classes.length)
			this.className = classes.join(' ');
		else
			this.removeAttribute('class');
		return this;
	},

	hasClass: function(className){
		var classes = this.className.split(' '),
			index = classes.indexOf(className);
		if (index >= 0)
			return true;
		else
			return false;
	},

	getChildren: function(){
		return new Elements(this.childNodes);
	},

	getFirst: function(){
		return this.getChildren()[0] || null;
	},

	destroy: function(){
		this.dispose();
		return null;
	},

	dispose: function(){
		return this.parentNode ? this.parentNode.removeChild(this) : this;
	},

	// Stolen from MooTools
	getSize: function(){
		return {
			x: this.offsetWidth,
			y: this.offsetHeight
		};
	},

	// Stolen from MooTools
	getScroll: function(){
		if (this === document.body)
			return window.getScroll();

		return {
			x: this.scrollLeft,
			y: this.scrollTop
		};
	},

	// Stolen from MooTools
	getScrolls: function(){
		var element = this.parentNode,
			position = {
				x: 0,
				y: 0
			};

		while (element && element !== document.body){
			position.x += element.scrollLeft;
			position.y += element.scrollTop;
			element = element.parentNode;
		}

		return position;
	},

	getOffsets: function(){
		var element = this, position = {
			x: 0,
			y: 0
		};

		if (element === document.body) return position;

		while (element && element !== document.body){
			position.x += element.offsetLeft;
			position.y += element.offsetTop;

			element = element.offsetParent;
		}

		return position;
	},


	getPosition: function(){
		var offset = this.getOffsets(),
			scroll = this.getScrolls(),
			position = {
				x: offset.x - scroll.x,
				y: offset.y - scroll.y
			};

		return position;
	},

	getParent: function(){
		return document.id(this.parentNode);
	}

};


// Adding plural methods from singulars
ElProto.setStyles = ElProto.setStyle.overloadSetter(true);
ElProto.getStyles = ElProto.getStyle.overloadGetter(true);
ElProto.addEvents = ElProto.addEvent.overloadSetter(true);
ElProto.removeEvents = ElProto.removeEvent.overloadSetter(true);

// Implement the new prototype onto Elements
if (!badProto) Atlas.implement(Element.constructor, ElProto, true);


// Create the Elements prototype from Element
Object.each(ElProto, function(val, key){
	var prefix = (key.length >= 3) ? key.substr(0, 3) : '',
		setter = function(){
			var arr = Array.from(arguments);
			arr.unshift(key);
			this.invoke.apply(this, arr);

			// Clear the array on destroy
			if (key === 'destroy') this.splice(0,this.length);

			return this;
		},
		getter = function(){
			var arr = Array.from(arguments),
				returns = [];

			this.each(function(el){
				returns.push(el[key].apply(el, arr));
			});

			return returns;
		};

	if (Atlas.typeOf(val) !== 'function') ElsProto[key] = val;
	else if (prefix === 'get' || prefix === 'has') ElsProto[key] = getter;
	else ElsProto[key] = setter;
});

// Implement the Elements prototype onto the Elements constructor
Atlas.implement(Elements, ElsProto, true);

// Extend the global namespace with Element and Elements
Atlas.extend(global, 'Element', Element);
Atlas.extend(global, 'Elements', Elements);

getCompatElement = function (element){
	var doc = element.getDocument();
	return (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
};

// Adding special window methods
Atlas.extend(window, {

	addEvent: function(ev, func, bubble){
		if (ev === 'domready') ev = 'DOMContentLoaded';
		this.addEventListener(ev, func, bubble || false);
		return this;
	},

	removeEvent: function(ev, func, bubble){
		if (ev === 'domready') ev = 'DOMContentLoaded';
		this.removeEventListener(ev, func, bubble || false);
		return this;
	},

	getSize: function(){
		return {
			x: document.body.clientWidth,
			y: document.body.clientHeight
		};
	},

	getScroll: function(){
		var win = this.getWindow(), doc = getCompatElement(this);
		return {x: win.pageXOffset || doc.scrollLeft, y: win.pageYOffset || doc.scrollTop};
	},

	getScrollSize: function(){
		var doc = getCompatElement(this),
			min = this.getSize(),
			body = this.getDocument().body;

		return {x: Math.max(doc.scrollWidth, body.scrollWidth, min.x), y: Math.max(doc.scrollHeight, body.scrollHeight, min.y)};
	},

	getPosition: function(){
		return {x: 0, y: 0};
	},

	getDocument: function(){
		return this.document;
	}

}, true);

}).call(this, this);

// jshint strict:false
(function(global){

var Atlas, DELEGATES, getDelegate, Delegate;

Atlas = global.Atlas;
if (!Atlas || !document) return;

// Used to store all delegates in use
DELEGATES = [];

// Find delegate if it exists based on the key (eg: event:tags,.classes,data-attributes)
// and parentEl element
getDelegate = function(key, parentEl){
	var valid = null;

	DELEGATES.each(function(instance){
		if (instance.key === key && instance.parentEl === parentEl)
			valid = instance;
	});

	return valid;
};

// Because my Class implementation is so lightweight,
// I am using that instead of base functions
Delegate = new Class({

	// By using Class.Events, we get a lot of free functionality
	Extends: Class.Events,

	// Specified tags are stored here
	tags       : [],
	// Specified CSS classes are stored here.
	// Must be prefixed with  a '.'
	classes    : [],
	// Specified data attributes are stored here.
	// Must be prefixed with 'data-'
	attributes : [],
	// Cleaned up string of all stored tags, classes and attributes
	type       : null,

	// Constructor
	initialize: function(event, types, parentEl){
		this.event = event;
		// Clean types
		this.types = types.split(',').each(Delegate.cleanType, this);
		this.parentEl = document.id(parentEl);

		// Special ID used in conjunction with the parentEl element
		// to store a reference to this class internally
		this.key = this.event + ':' + this.types.join(',');

		// Find the stored delegate, if it exists
		var delegate = getDelegate(this.key, this.parentEl);
		if (delegate) return delegate;

		// Ensures that we don't embed our items in the class prototype
		this.tags = [];
		this.classes = [];
		this.attributes = [];

		// Parse all the types out, and add them to the appropriate arrays
		this.types.each(Delegate.parseType, this);

		// Prebind fireEvent for easy adding and removing
		this.fireEvent = this.fireEvent.bind(this);

		// Add pre-bound fireEvent to parentEl element
		this.parentEl.addEvent(this.event, this.fireEvent);

		// Add instance to internal delegates store
		DELEGATES.push(this);
	},

	addEvent: function(func){
		this.parent('addEvent', this.event, func);
		if (DELEGATES.indexOf(this) < 0) DELEGATES.push(this);
		return this;
	},

	removeEvent: function(func){
		this.parent('removeEvent', this.event, func);
		// Garbage collect the delegate instance if removing the final event
		// and remove the parentEl event
		if (!this.__events__[this.event]){
			DELEGATES.splice(DELEGATES.indexOf(this), 1);
			this.parentEl.removeEvent(this.event, this.fireEvent);
		}
		return this;
	},

	fireEvent: function(){
		var args = Array.from(arguments),
			element = null,
			toCheck = args[0].target || args[0].srcElement, // Support for standard browsers and IE
			tagIndex, classIndex, attributeIndex;

		// Test for delegation here
		while(!element && toCheck){
			if (toCheck === this.parentEl) break; // Quick escape if parentEl clicked

			// Test toCheck against tags, classes and attributes
			tagIndex = Delegate.checkTag(toCheck, this.tags);
			classIndex = Delegate.checkClasses(toCheck, this.classes);
			attributeIndex = Delegate.checkAttributes(toCheck, this.attributes);

			if (tagIndex || classIndex || attributeIndex){
				element = toCheck;
				break;
			}

			// toCheck did not contain a tag, class or attribute match,
			// cycle up to the parentNode
			toCheck = (toCheck.parentNode) ? toCheck.parentNode : null;
		}

		// No element match, escape out
		if (!element) return;

		// Add event as the first argument, for fireevent
		args.unshift('fireEvent', this.event);
		// Add the element as a secondary argument for fired events
		args.push(element);
		// Call Class.Events.fireEvent
		this.parent.apply(this, args);
	}

});


Atlas.extend(Delegate, {

	checkTag: function(element, tags){
		var index = tags.indexOf(element.tagName.toLowerCase()) + 1;
		return !!index;
	},

	checkClasses: function(element, classes){
		var hasClass = false;
		classes.each(function(cls){
			if (element.hasClass(cls)) hasClass = true;
		});
		return hasClass;
	},

	checkAttributes: function(element, attributes){
		var hasAttr = false;
		attributes.each(function(attr){
			if (element.hasAttribute(attr)) hasAttr = true;
		});
		return hasAttr;
	},

	cleanType: function(str, i, arr){
		str = str.trim();
		str = str.toLowerCase();
		if (str === '') return;
		arr[i] = str.trim();
	},

	parseType: function(type){
		var dataPrefix = (type.length > 5) ? type.substr(0, 5) : null;

		if (dataPrefix === 'data-')
			return this.attributes.push(type);
		if (type.charAt(0) === '.')
			return this.classes.push(type.substr(1));
		this.tags.push(type);
	}

});

Atlas.extend(global.Element, 'Delegate', Delegate, true);

}).call(this, this);

// jshint strict:false
// @block: req
(function(global){

var Request, errors;

Request = new Class({

	Implements: [Class.Options, Class.Events],

	options: {
		method: 'POST',
		url: global.location.href,
		async: true,
		headers: {
			'Accept': 'text/plain,text/html,application/xhtml+xml,application/xml',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest'
		}
	},

	initialize: function(options){
		this.xhr = new XMLHttpRequest();
		this.xhr.onreadystatechange = this.readyStateChange.bind(this);
		this.setOptions(options);
		return this;
	},

	post: function(){
		this.options.method = 'post';
		this.send.apply(this, arguments);
	},

	get: function(){
		this.options.method = 'get';
		this.send.apply(this, arguments);
	},

	send: function(data){
		var method = this.options.method.toUpperCase(),
			url = this.options.url,
			query = Object.toQueryString(data),
			isGet = (method === 'GET') ? true : false,
			hasQuery = url.contains('?'),
			headers, header;

		if (isGet && hasQuery)
			url += '&' + query;
		else if (isGet)
			url += '?' + query;

		this.xhr.open(method, url, this.options.async);

		// Set Headers
		headers = this.options.headers;
		for (header in headers) {
			this.xhr.setRequestHeader(header, headers[header]);
		}

		if (isGet)
			this.xhr.send(null);
		else
			this.xhr.send(query);
	},

	readyStateChange: function(){
		if (this.xhr.readyState !== 4) return;
		if ((this.xhr.status >= 200 && this.xhr.status < 300) || this.xhr.status === 0) this.success();
		else this.failure();
		this.fireEvent('complete', this.xhr.responseText);
	},

	success: function(){
		this.fireEvent('success', this.xhr.responseText);
	},

	failure: function(){
		this.fireEvent('failure', this.xhr.responseText);
	}

});

Request.JSON = new Class({

	Extends: Request,

	options: {
		method: 'POST',
		url: global.location.href,
		async: true,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'X-Requested-With': 'XMLHttpRequest'
		}
	},

	initialize: function(options){
		this.parent('initialize', options);
	},

	send: function(data){
		this.jsonResponse = null;
		return this.parent('send', data);
	},

	readyStateChange: function(){
		if (this.xhr.readyState !== 4) return;
		try {
			this.jsonResponse = JSON.parse(this.xhr.responseText);
		}
		catch (e){}
		if ((this.xhr.status >= 200 && this.xhr.status < 300) || this.xhr.status === 0) this.success();
		else this.failure();
		this.fireEvent('complete', this.jsonResponse);
	},

	success: function(){
		// Validate as an error if undefined JSON response
		if (this.jsonResponse === undefined) {
			this.jsonResponse = errors('success');
			return this.fireEvent('failure', this.jsonResponse);
		}
		this.fireEvent('success', this.jsonResponse);
	},

	failure: function(){
		if (this.jsonResponse === undefined)
			this.jsonResponse = errors();
		this.fireEvent('failure', this.jsonResponse);
	}
});

errors = function(success){
	return {
		error: true,
		message: success ? 'No data received' : 'Unable to complete the request'
	};
};

global.Atlas.extend(global, 'Request', Request, true);

}).call(this, this);
// @end

// @block: anim
(function(global){

var Animator = new Class({

	Implements: [Class.Options, Class.Events],

	options: {
		duration: 500,
		tween: 'easeOutSine'
	},

	values: {
		from    : [],
		to      : [],
		current : []
	},

	running   : false,
	startTime : 0,
	tween     : null,
	duration  : 0,

	initialize: function(callback, options){
		this.callback = callback;

		this.setOptions(options);

		this._iterate = this._iterate.bind(this);
	},

	start: function(to, from, duration){
		// Currently you can only start an animation if one is not currently running
		if (this.running) return this;

		// Set starting variables
		this.running     = true;

		this.values.from = (from !== undefined) ? Array.from(from) : Array.clone(this.values.current || this.values.from);
		this.values.to   = (to   !== undefined) ? Array.from(to)   : this.values.to;

		// Always clone so we don't modify the from array
		this.values.current	= Array.clone(this.values.from);

		this.duration  = (duration !== undefined) ? duration : this.options.duration;
		this.tween     = Animator.Tweens[this.options.tween] || Animator.Tweens.linear;
		this.startTime = 0;

		// Add animation iterate to be managed by internal timer
		Animator.addInstance(this._iterate);
		return this;
	},

	// Used to stop an existing animation, fails silently
	cancel: function(toValues){
		if (!this.running) return this;
		this._halt(toValues);
		this.fireEvent('cancel', this);
		return this;
	},

	// Internal iteration handler
	_iterate: function(now){
		var time = now - this.startTime,
			duration = this.duration,
			change, from;

		// First frame of animation
		if (!this.startTime) {
			this.startTime = now;
			this.values.current = Array.clone(this.values.from);
			return this.callback(this.values.from);
		}

		// End of animation
		if (time >= this.duration){
			this.startTime = null;
			this._halt(this.values.to);
			return this.fireEvent('complete', this);
		}

		// Run current values through easing method
		this.values.current = [];
		for (var v = 0, l = this.values.from.length; v < l; v++){
			from   = this.values.from[v];
			change = this.values.to[v] - from;
			this.values.current[v] = this.tween(time, from, change, duration);
		}

		this.callback(this.values.current);
	},

	// Halt the animation
	_halt: function(toValues){
		Animator.removeInstance(this._iterate);
		this.values.current = (toValues !== undefined) ? Array.from(toValues) : this.values.current;
		this.callback(this.values.current);
		this.running = false;
	}

});

Animator.extend({

	// Add animator instance to animate
	addInstance: function(iterateFunc){
		I.instances.push(iterateFunc);
		I.startTimer();
	},

	// Queue the removal of an instance - actual removal occurs after next frame is processed
	removeInstance: function(iterateFunc){
		I.toRemove.push(iterateFunc);
	},

	// Sets the framerate and also restarts the timer if it's running to use the new FPS
	setFramerate: function(fps){
		I.fps = fps;
		I.startTimer();
	},

	// Various tweens supported
	Tweens: {

		linear: function(t, b, c, d){
			return c * t / d + b;
		},

		easeInQuad: function(t, b, c, d) {
			return c * (t /= d) * t + b;
		},

		easeOutQuad: function(t, b, c, d) {
			return -c * (t /= d) * (t - 2) + b;
		},

		easeOutSine: function (t, b, c, d) {
			return c * Math.sin(t/d * (Math.PI/2)) + b;
		},

		easeInOutSine: function (t, b, c, d) {
			return c/2 * (1 - Math.cos(Math.PI*t/d)) + b;
		}

	}
});

// Internal timer and supporting methods
var I = {

	running   : false, // Status of whether the internal timer is animating or not
	instances : [],    // All animator instances currently animating
	toRemove  : [],    // Animator removal queue
	fps       : 60,    // Current animator FPS
	timer     : null,  // Reference to timer instance

	// Starts internal timer, called by addInstance
	startTimer: function(){
		// Dissallow start to execute if a timer is running or if there are no instances
		if (!I.instances.length) return I.stopTimer();
		if (I.running) return;

		// Good practice to ALWAYS stop timer before starting it since you can end up with ghost timers
		I.stopTimer();
		I.running = true;
		I.timer = setInterval(I.iterate, 1000 / I.fps);
	},

	// Stops the timer and clears the timer instance
	stopTimer: function(){
		clearInterval(this.timer);
		this.timer = null;
		I.running = false;
	},

	// Animation frame handler, called every frame, executes all added instances
	iterate: function(){
		// Stop the timer if all instances have been removed
		if (!I.instances.length) return I.stopTimer();

		// Get time in milliseconds and execute all animator instances
		var now = Date.now();
		for (var i = 0, len = I.instances.length; i < len; i++)
			I.instances[i](now);

		// We handle removals after the frame has finished firing
		while (I.toRemove.length)
			I.removeInstance(I.toRemove.splice(0,1)[0]);
	},

	// Remove an instance
	removeInstance: function(iterateFunc){
		var index = I.instances.indexOf(iterateFunc);
		if (index < 0) return;
		I.instances.splice(index, 1);
	}

};

global.Atlas.extend(global, 'Animator', Animator, true);

}).call(this, this);
// @end
