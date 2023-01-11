const Stage = {
	Initializing: 0,
	Playing: 1,
	Action: 2,
	Over: 3,
};

class Player {
	constructor() {
		this.mana = 0;
		this.manaSpan = null;
		this.deck = new Deck();
		this.hand = new Hand();
	}
	getDeck() {
		return this.deck;
	}
	getHand() {
		return this.hand;
	}
	setMana(mana) {
		this.mana = mana;
		this.manaSpan.textContent = mana;
	}
	getMana() {
		return this.mana;
	}
}

class Card {
	constructor() {
		
	}
}

class Battleline {
	constructor(hitpoints, healthNode, frontNode) {
		this.hitpoints = hitpoints;
		this.healthNode = healthNode;
		this.frontNode = frontNode;
		this.cards = [];
	}
}

/* ___ Battletrack ___ */
	// friendly cards : array
	// enemy cards : array
class Battletrack {
	constructor(node, friendlyHealth = 40, enemyHealth = 40) {
		this.friendlyBattleline = new Battleline(friendlyHealth);
		this.enemyBattleline = new Battleline(enemyHealth);
		this.node = node;
		this.location = {};
		this.defeated = false;
	}
	getFriendlyHealth() {
		return this.friendlyHealth;
	}
	getEnemyHealth() {
		return this.enemyHealth;
	}
	setFriendlyHealth(health) {
		this.friendlyHealth = health;
		
		this.node
	}
	getLocation() {
		return this.location;
	}
}

class Deck {
	constructor() {

	}
}

class Hand {
	constructor() {
		
	}
}


/* ___ Deck ___ */
	// cards : array

/* ___ Hand ___ */
	// cards : array
	// dom node

/* ___ Card ___ */
	// type : enum
	// name : string
	// cost : number
	// attack : number
	// defense : number
	// health : number
	// speed : number
	// dom node