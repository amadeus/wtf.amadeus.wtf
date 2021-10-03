(function(){

var amadeus, enemy, log,
	tests = 10000,
	turns = 0;

// Character
amadeus = window.amadeus = new Character({
	name: 'Amadeus',
	display: document.id('amadeus'),
	level     : 1,
	strength  : 8,
	stamina   : 5,
	dexterity : 8
	//strength  : 7,
	//stamina   : 8,
	//dexterity : 6
});

// Enemy
enemy = window.enemy = new Character({
	name: 'Enemy',
	display: document.id('enemy'),
	level     : 1,
	strength  : 8,
	stamina   : 7,
	dexterity : 6
	//strength  : 9,
	//stamina   : 4,
	//dexterity : 8
});

Character.log = log = document.id('log');

// Clear the simulation logs
document.id('clear').addEvent('click', function(){
	log.innerHTML = '';
});

// Reset character's health
document.id('reset').addEvent('click', function(){
	amadeus.health = amadeus.hitpoints;
	enemy.health = enemy.hitpoints;

	amadeus.displayStats();
	enemy.displayStats();
});

// Level up characters
document.id('levelup-amadeus').addEvent('click', function(){
	amadeus.increaseLevel();
	amadeus.displayStats();
});

document.id('levelup-enemy').addEvent('click', function(){
	enemy.increaseLevel();
	enemy.displayStats();
});

document.id('simulate-battles').addEvent('click', function(){
	var chars, r, turns,
		logContent = '',
		results = {
			amadeus: 0,
			enemy: 0,
			turns: 0
		},
		fn = function(){
			var res, d;
			// Simulate an attack from each side, alternating
			res = Character.determineAttack(chars[0], chars[1]);
			d = Character.determineDamage(chars[0], chars[1], res);
			chars[1].dealDamage(d);

			// Stop secondary attack from happening if character dead
			if (chars[1].health === 0) return;
			res = Character.determineAttack(chars[1], chars[0]);
			d = Character.determineDamage(chars[1], chars[0], res);
			chars[0].dealDamage(d);
		};


	for (var x = 0; x < tests; x++){
		amadeus.health = amadeus.hitpoints;
		enemy.health = enemy.hitpoints;
		turns = 0;

		// Randomize starts
		chars = [amadeus, enemy];
		r = chars.splice(Number.random(0,1), 1);
		chars.unshift(r[0]);

		// Attack each other until 1 is dead
		while (amadeus.health > 0 && enemy.health > 0){
			turns++;
			fn();
		}

		if (amadeus.health === 0) results.enemy++;
		else results.amadeus++;

		results.turns += turns;
	}

	results.aPercentage = Math.ceil((results.amadeus / tests).round(2) * 100);
	results.ePercentage = Math.ceil((results.enemy   / tests).round(2) * 100);
	results.avgTurns = Math.ceil(results.turns / tests);

	logContent =
		'<strong>Simulated 1000x Battles</strong><br />' +
		'Amadeus won: ' + results.aPercentage + '%, Enemy won: ' + results.ePercentage + '%<br />' +
		'With an average of ' + results.avgTurns + ' turns per battle <br /><br />';

	log.innerHTML = logContent + log.innerHTML;

	amadeus.health = amadeus.hitpoints;
	enemy.health = enemy.hitpoints;
});

// Simulates a full battle, turn based, randomized start and end
document.id('simulate-battle').addEvent('click', function(){
	var chars = [amadeus, enemy], logContent = '',
		fn = function(){
			var res, d,
				model = {
					name1: chars[0].name,
					name2: chars[1].name
				},
				template = [
						'<tr>',
							'<td>{name1} - {hp1}hp</td>',
							'<td style="text-align:right;width:70px">{arrow}</td>',
							'<td style="text-align:center;width:50px">{damage}</td>',
							'<td style="text-align:left;width:70px">{arrow}</td>',
							'<td style="">{name2} - {hp2}hp</td>',
						'</tr>'
				].join('');

			turns++;

			// Simulate an attack from each side, alternating
			res = Character.determineAttack(chars[0], chars[1]);
			d = Character.determineDamage(chars[0], chars[1], res);
			chars[1].dealDamage(d);
			model.hp1 = chars[0].health;
			model.hp2 = chars[1].health;
			model.damage = res[0] === 'miss' ? 'miss' : d;
			model.arrow = '==>';
			logContent += template.substitute(model);

			// Stop secondary attack from happening if character dead
			if (chars[1].health === 0) return;
			res = Character.determineAttack(chars[1], chars[0]);
			d = Character.determineDamage(chars[1], chars[0], res);
			chars[0].dealDamage(d);
			model.hp1 = chars[0].health;
			model.hp2 = chars[1].health;
			model.damage = res[0] === 'miss' ? 'miss' : d;
			model.arrow = '<==';
			logContent += template.substitute(model);
		};

	// Randomize starts
	var r = chars.splice(Number.random(0,1), 1);
	chars.unshift(r[0]);


	logContent += '<strong style="display:block;text-align:center;">' + chars[0].name + ' vs ' + chars[1].name + '</strong><br />';

	logContent += '<table style="font-family:Courier;font-size:12px;border-spacing:0;margin:0 auto 8px;" cellsspacing=0 cellpadding=0>';
	// Attack each other until 1 is dead
	while (amadeus.health > 0 && enemy.health > 0)
		fn();

	logContent += '</table>';

	var winner = (amadeus.health) ? amadeus : enemy;
	logContent += winner.name + ' won and it took ' + turns + ' turns with ' + winner.health +  'hp remaining<br /><br />';

	log.innerHTML = logContent + log.innerHTML;

	turns = 0;
	amadeus.health = amadeus.hitpoints;
	enemy.health = enemy.hitpoints;

	amadeus.displayStats();
	enemy.displayStats();
});

var simulateDamage = function(a, b){
	var damages = [], d,
		obj = {
			tests: tests,
			lowest: Infinity,
			highest: -Infinity
		},
		template = [
			'<strong>{a} damages {b} ({tests}x)</strong><br />',
			'min: {lowest}, max: {highest}, spread: {spread}<br /><br />'
		];

	for (var x = 0; x < tests; x++){
		res = Character.determineAttack(a, b);
		d = Character.determineDamage(a, b, ['hit']);
		if (d < obj.lowest)
			obj.lowest = d;
		if (d > obj.highest)
			obj.highest = d;

		damages.push(d);
	}

	obj.spread = obj.highest - obj.lowest;
	obj.a = a.name;
	obj.b = b.name;

	log.innerHTML = template.join('').substitute(obj) + log.innerHTML;
};

document.id('simulate-damage1').addEvent('click', function(){
	simulateDamage(amadeus, enemy);
});
document.id('simulate-damage2').addEvent('click', function(){
	simulateDamage(enemy, amadeus);
});

var determineAttack = function(a, b){
	var types = {
			miss: 0,
			hit: 0,
			critical: 0
		},
		template = [
			'<table>',
				'<tr>',
					'<th colspan="3">{a} attacks {b} ({tests}x)</th>',
				'</tr>',
				'<tr>',
					'<td>hit</td>',
					'<td>{hit}</td>',
					'<td>{hitPerc}%</td>',
				'</tr>',
				'<tr>',
					'<td>miss</td>',
					'<td>{miss}</td>',
					'<td>{missPerc}%</td>',
				'</tr>',
				'<tr>',
					'<td>critical</td>',
					'<td>{critical}</td>',
					'<td>{criticalPerc}%</td>',
				'</tr>',
			'</table><br />'
		], res;

	for (var x = 0; x < tests; x++){
		res = Character.determineAttack(a, b);
		types[res[0]]++;
 	}

	types.total = (types.miss + types.hit + types.critical);
	types.missPerc =     Math.ceil((types.miss     / types.total).round(2) * 100);
	types.hitPerc =      Math.ceil((types.hit      / types.total).round(2) * 100);
	types.criticalPerc = Math.ceil((types.critical / types.total).round(2) * 100);
	types.tests = tests;
	types.a = a.name;
	types.b = b.name;

	log.innerHTML = template.join('').substitute(types) + log.innerHTML;

};

document.id('simulate-attack1').addEvent('click', function(){
	determineAttack(amadeus, enemy);
});

document.id('simulate-attack2').addEvent('click', function(){
	determineAttack(enemy, amadeus);
});

})();
