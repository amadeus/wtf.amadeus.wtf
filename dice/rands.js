(function(){ 'use strict';

var DiceTests = window.DiceTests = new Class({

	tests: 100000,
	currentWidth: 1,
	width: 20,

	initialize: function(rolls, number, sides, width, highest){
		var before, after;

		this.rolls   = window.parseInt(rolls, 10)  || 1;
		this.number  = window.parseInt(number, 10) || 1;
		this.sides   = window.parseInt(sides, 10)  || 1;
		this.width   = window.parseInt(width, 10)  || 15;
		this.highest = !!highest;

		if (!this.number || !this.sides) {
			return;
		}

		before = Date.now();
		this.results = new Array(this.number * this.sides + 1);
		this.evaluateDice();
		after = Date.now();
		document.getElementById('footnote').innerHTML = 'Test Processing time: ' + (after - before) + 'ms. A single roll took ' + ((after - before) / this.tests) + 'ms';

		this.displayResults();
	},

	rollDice: function(n, s){
		var value = 0, i;

		for (i = 0; i < n; i++) {
			value += Number.random(1,this.sides);
		}

		return value;
	},

	evaluateDice: function(){
		var values = [], value, rolls, x;

		for (x = 0; x < this.tests; x++) {
			values.length = 0;

			for (rolls = 0; rolls < this.rolls; rolls++) {
				values.push(
					this.rollDice(this.number, this.sides)
				);
			}

			if (this.highest) {
				value = this.getHighest(values);
			} else {
				value = this.getLowest(values);
			}

			if (!this.results[value]) {
				this.results[value] = 0;
			}

			this.results[value]++;
		}

	},

	getHighest: function(values){
		var value = 0, i;

		for (i = 0; i < values.length; i++) {
			if (values[i] > value) {
				value = values[i];
			}
		}

		return value;
	},

	getLowest: function(values){
		var value = Infinity, i;

		for (i = 0; i < values.length; i++) {
			if (values[i] < value) {
				value = values[i];
			}
		}

		return value;
	},

	displayResults: function(){
		var R = DiceTests.results.set('html', ''), x;

		this.getMax();

		for (x = 1; x < this.results.length; x++) {
			this.generateBar(this.results[x] || 0, x);
		}

		R.setStyle('width', this.currentWidth - 1 + 'px');

		setTimeout(function() {
			DiceTests.results.className = 'grow';
		}, 0);
	},

	getMax: function(){
		var x = 0;
		this.results.each(function(val){
			if (val > x) x = val;
		});

		this.max = x;
	},

	generateBar: function(value, index){
		var percentage = (value / this.max) * 100,
			rounded = Math.round10(value / this.tests * 100, -2),
			column;

		column = new Element('div', {
			'class': 'column',
			styles: {
				left: this.currentWidth + 'px',
				width: this.width + 'px'
			}
		});

		new Element('span', {
			'class': 'bar',
			styles: {
				height: percentage + '%'
			}
		}).inject(column);

		new Element('span', {
			'class': 'number',
			html: index
		}).inject(column);

		new Element('span', {
			'class': 'percentage',
			html: rounded + '%'
		}).inject(column);

		column.inject(DiceTests.results);

		this.currentWidth += this.width + 1;
	}

});

DiceTests.extend({

	results: document.id('container')

});

})();
