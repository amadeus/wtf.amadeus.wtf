'usestrict';

var Character = new Class({

	name: 'no name',

	level     : 0,

	hitpoints : 0,
	health    : 0,

	strength  : 5,
	dexterity : 5,
	stamina   : 5,
	accuracy  : 5,

	weapon: {
		melee: true,
		name: 'fists',
		damageBonus: 0
	},

	initialize: function(stats){
		Object.merge(this, stats);
		this.generateHP();

		this.displayStats();
	},

	increaseLevel: function(){
		this.level++;

		this.strength  += Character.STAT_INCREASE;
		this.dexterity += Character.STAT_INCREASE;
		this.stamina   += Character.STAT_INCREASE;
		this.accuracy  += Character.STAT_INCREASE;

		// Hitpoints are currently based on your health stat
		// Eventually I want to make it a mix of stats
		this.generateHP();
	},

	generateHP: function(){
		this.hitpoints = (this.stamina + Math.ceil(this.dexterity * 0.5)) * Character.HP_RATIO;
		this.health = this.hitpoints;
	},

	displayStats: function(){
		this.display.innerHTML =
			this.name + '<br />' +
			'LVL: ' + this.level     + '<br />' +
			'HP:  ' + this.health    + '<br />' +
			'STR: ' + this.strength  + '<br />' +
			'STM: ' + this.stamina   + '<br />' +
			'DXT: ' + this.dexterity + '<br />' +
			'ACC: ' + this.accuracy;
	},

	kill: function(){
		this.display.innerHTML += '<br />dead';
	},

	dealDamage: function(damage){
		this.health -= damage;

		if (this.health < 0) this.health = 0;
	}

});

Character.extend({

	MELEE_DAMAGE_BASE: 1,
	LEVEL_UP: 1.3,

	STAT_INCREASE: 2,
	HP_RATIO: 12,

	ATTACK_VARIATION: 20,

	determineAttack: function(attacker, attacked){
		var luck = Number.random(0, Character.ATTACK_VARIATION),
			attackBonus = attacker.strength  + (attacker.dexterity / 2) + luck,
			armorClass  = attacked.dexterity + (attacked.stamina   / 2) + (Character.ATTACK_VARIATION * 0.09);

		if (luck === 0 || armorClass >= attackBonus) {
			return ['miss', attackBonus, armorClass];
		} else if (luck === Character.ATTACK_VARIATION) {
			return ['critical', attackBonus, armorClass];
		} else {
			return ['hit', attackBonus, armorClass];
		}
	},

	determineDamage: function(attacker, attacked, attackResults){
		if (attackResults[0] === 'miss')
			return 0;

		var attackType = attackResults[0], damage,
			baseAttack = (attacker.weapon.melee ? Character.MELEE_DAMAGE_BASE : attacker.weapon.damageBonus),
			strUpgrade = (Math.ceil(attacker.dexterity * 0.2) + attacker.strength) + Number.random(0, Math.ceil(attacker.strength * 0.5)),
			defense = 0,
			damageBonus = attacker.weapon.damageBonus,
			strStmDiff = attacked.stamina - attacker.strength;

		if (attackType === 'hit'){
			damage = Math.max(1, Math.ceil(baseAttack + strUpgrade) + damageBonus - defense);
		} if (attackType === 'critical') {
			damage = Math.max(1, Math.ceil(baseAttack + damageBonus + attacker.strength * 2) - defense);
		}

		return Math.round(damage);
	}

});
