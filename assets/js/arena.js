/**
 * Enum for the current state of play.
 * @Initializing The game is setting itself up.
 * @Playing The game is allowing the players to play cards to the active battletrack.
 * @Action The game is allowing the players to decide their card's actions.
 * @Over The game has ended.
 */
const Stage = {
	Initializing: 0,
	Playing: 1,
	Action: 2,
	Over: 3,
};

/**
 * This class is used to represent a player.
 * I manages the mana, deck, and hand.
 */
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

/**
 * The battleline is one-half of the battletrack.
 * It manages the hitpoints, and cards in play on
 * its half.
 */
class Battleline {
	/**
	 * Constructs a new Battleline object.
	 * 
	 * @param {number} hitpoints The number of hitpoints this battleline should start with.
	 * @param {Element} hitpointNode The element to write the number of hitpoints to.
	 * @param {Element} zoneNode The element that contains the cards in play.
	 */
	constructor(hitpoints, hitpointNode, zoneNode) {
		// TODO: Add an event listener
		zoneNode.addEventListener();
		this.hitpoints = hitpoints;
		this.healthNode = hitpointNode;
		this.cards = [];
	}

	setHitpoints(hitpoints) {
		this.hitpoints = hitpoints;
		this.hitpointsNode.textContent = hitpoints;
	}

}

/**
 * The Battletrack is the lane that play and action happens whithin.
 * 
 * The game consists of three battletracks, each of which has hitpoints,
 * and cards in play.
 */
class Battletrack {
	/**
	 * Constructs a new battletrack object.
	 * 
	 * @param {Element} node The root node on the DOM that represents this battletrack.
	 * @param {Location} location The location data.
	 * @param {number} friendlyHitpoints The amount of hitpoints the friendly side of the battletrack should start with. Defaults to 40.
	 * @param {number} enemyHitpoints The amount of hitpoints the enemy side of the battletrack should start with. Defaults to 40.
	 */
	constructor(node, location, friendlyHitpoints = 40, enemyHitpoints = 40) {
		// TODO: Crawl the node to get the hitpoints and selection area nodes
		const friendlyHitpointsNode = null;
		const friendlyCardZoneNode = null;
		const enemyHitpointsNode = null;
		const enemyCardZoneNode = null;

		this.node = node;
		this.friendlyBattleline = new Battleline(friendlyHitpoints, friendlyHitpointsNode, friendlyCardZoneNode);
		this.enemyBattleline = new Battleline(enemyHitpoints, enemyHitpointsNode, enemyCardZoneNode);
		this.location = location;
		// TODO: Crawl the node to get the elements used to indicate location
		this.defeated = false;
	}
	/**
	 * A getter for the hitpoints the friendly side of the battletrack.
	 * @returns the amount of hitpoints the friendly side of the track has.
	 */
	getFriendlyHitpoints() {
		return this.friendlyBattleline.getHitpoints();
	}
	/**
	 * A getter for the hitpoints the enemy side of the battletrack.
	 * @returns the amount of hitpoints the friendly side of the track has.
	 */
	getEnemyHitpoints() {
		return this.enemyBattleline.getHitpoints();
	}
	/**
	 * Sets the amount of hitpoints that the friendly side of the battletrack has.
	 * @param {number} hitpoints The new amount of hitpoints.
	 */
	setFriendlyHealth(hitpoints) {
		this.friendlyBattleline.setHitpoints(hitpoints);
	}
	/**
	 * Sets the amount of hitpoints that the enemy side of the battletrack has.
	 * @param {number} hitpoints The new amount of hitpoints.
	 */
	setEnemyHealth(hitpoints) {
		this.enemyBattleline.setHitpoints(hitpoints);
	}
	/**
	 * Gets the location data associated with this battlelane.
	 * @returns the location.
	 */
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