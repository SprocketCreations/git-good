/**
 * Enum for the current state of play.
 * @Initializing The game is setting itself up.
 * @Playing The game is allowing the players to play cards to the active battletrack.
 * @Action The game is allowing the players to decide their card's actions.
 * @Over The game has ended.
 */
const Stage = {
	/** The game is setting itself up */
	Initializing: 0,
	/** The game is allowing the players to play cards to the active battletrack. */
	Playing: 1,
	/** The game is allowing the players to decide their card's actions. */
	Action: 2,
	/** The game has ended. */
	Over: 3,
};

/**
 * This class is used to represent a player.
 * I manages the mana, deck, and hand.
 * 
 * @property
 */
class Player {
	/**
	 * Constructs a new player.
	 * 
	 * The player contains all information relavent to a specific player.
	 * 
	 * @param {Card[]} cards The cards that start in this player's deck.
	 * @param {Element} manaNode The HTML element on the DOM that the player's mana amount should be displayed in.
	 * @param {Element} handNode The HTML element on the DOM that is the player's hand. Cards will be appended to this element.
	 * @param {number} wins the number of times this player has won. Defaults to 0.
	 */
	constructor(cards, manaNode, handNode, wins = 0) {
		/** @type {number} The amount of mana this player has. */
		this.mana = 0;
		/** @type {Element} The HTML element to display the amount of mana this player has. */
		this.manaNode = manaNode;
		/** @type {number} The number of times this player has won the game. */
		this.wins = wins;
		/** @type {Deck} The player's deck. */
		this.deck = new Deck(cards, this);
		/** @type {Hand} The player's hand. */
		this.hand = new Hand(handNode);
		/** @type {number} The number of battlelanes the player has conquored. */
		this.conquored = 0;
	}
	/**
	 * @returns {Deck} the player's deck.
	 */
	getDeck() {
		return this.deck;
	}
	/**
	 * @returns {Hand} the player's hand.
	 */
	getHand() {
		return this.hand;
	}
	/**
	 * Increases the tracking of how many battlelanes this player has conquored.
	 */
	conquor() {
		++this.conquored;
	}
	/**
	 * @returns {boolean} true if this player has conquored two battletracks.
	 */
	isWinner() {
		return this.conquored > 1;
	}
	/**
	 * Sets the amount of mana that the player has, and updates the
	 * HTML on the DOM to reflect this.
	 * 
	 * @param {number} mana The amount of mana to set the player to.
	 */
	setMana(mana) {
		this.mana = mana;
		this.manaNode.textContent = mana;
	}
	/**
	 * @returns {number} the amount of mana this player has.
	 */
	getMana() {
		return this.mana;
	}
	/**
	 * @returns {boolean} true if the player has at least
	 * one card in their hand that they can play.
	 */
	canPlayCard() {
		const numberOfCards = this.hand.cards;
		for (let i = 0; i < numberOfCards; ++i) {
			const cost = this.hand.cards[i].getCost();
			if (cost <= this.mana) {
				return true;
			}
		}
		return false;
	}
}

/**
 * A card is the central piece of the game.
 * 
 * This contains all the stats and information about a card,
 * as well as a number of helpful functions for getting and
 * manipulating the card.
 */
class Card {
	/**
	 * Creates a new card.
	 * 
	 * @param {string} name The name of the character on the card.
	 * @param {object} art The art of the character on the card.
	 * @param {number} cost The mana cost of the card.
	 * @param {number} attack The attack power of the card.
	 * @param {number} defense The defense power of the card.
	 * @param {number} hitpoints The number of hitpoints the card has.
	 * @param {number} speed The speed of the card.
	 */
	constructor(name, art, cost, attack, defense, hitpoints, speed) {
		/** @type {string} The name of the character on this card. */
		this.name = name;
		/** @type {Object} The artwork on this card. */
		this.art = art;
		/** @type {number} The mana cost of this card. */
		this.cost = cost;
		/** @type {number} The attack power of this card. */
		this.attack = attack;
		/** @type {number} The defense of this card. */
		this.defense = defense;
		/** @type {number} The total number of hitpoints this card has. */
		this.totalHitpoints = hitpoints;
		/** @type {number} The current number of hitpoints this card has. */
		this.currentHitpoints = hitpoints;
		/** @type {number} The speed of this card. */
		this.speed = speed;
		/** @type {Element} The HTML element on the DOM that represents this card. */
		this.node = null;
	}
	/**
	 * Kills this card, sending it back to the graveyard.
	 */
	die() {
		this.deleteNode();
		this.owner.getDeck().addToGraveyard(this);
	}
	/**
	 * Returns a reference to the element in the DOM
	 * for this card. If one does not exist, it will
	 * create one.
	 * 
	 * @returns {Element} a reference to the html element for this card.
	 */
	getNode() {
		// TODO: Add code to clone the card template that does not yet exist
		const fragment = null;
		const root = fragment.children[0];
		this.node = root;
	}
	/**
	 * Destroys this card's HTML on the DOM.
	 */
	deleteNode() {
		if (this.node != null) {
			this.node.remove();
			this.node = null;
		}
	}
	/**
	 * @param {Player} player the player that will own this card.
	 */
	setOwner(player) {
		this.owner = player;
	}
	/**
	 * @returns {Player} a referense to the player that owns this card.
	 */
	getOwner() {
		return this.owner;
	}
	/**
	 * @returns {number} the cost of this card
	 */
	getCost() {
		return this.cost;
	}
	/**
	 * @returns {number} how much damage this card can deal.
	 */
	getAttack() {
		return this.attack;
	}
	/**
	 * @returns {number} the defense of this card.
	 */
	getDefense() {
		return this.defense;
	}
	/**
	 * @returns {number} the speed of this card.
	 */
	getSpeed() {
		return this.speed;
	}
	/**
	 * @returns {number} the number of hitpoints this card currently has.
	 */
	getCurrentHitpoints() {
		return this.currentHitpoints;
	}
	/**
	 * @returns {number} the total number of hitpoints this card can have.
	 */
	getTotalHitpoints() {
		return this.totalHitpoints;
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
	 * @param {Element} hitpointsNode The HTML element to write the number of hitpoints to.
	 * @param {Element} zoneNode The HTML element that contains the cards in play.
	 */
	constructor(hitpoints, hitpointsNode, zoneNode) {
		// TODO: Add an event listener
		zoneNode.addEventListener();

		/** @type {number} The number of hitpoints this side of the battletrack has. */
		this.hitpoints = hitpoints;
		/** @type {Element} The HTML element that the hitpoints will be written to. */
		this.hitpointsNode = hitpointsNode;
		/** @type {Card[]} The cards in play on this side of the battletrack. */
		this.cards = [];
	}
	/**
	 * @returns {number} the number of hitpoints this battleline has.
	 */
	getHitpoints() {
		return this.hitpoints;
	}
	/**
	 * @param {number} hitpoints The number of hitpoints to set this battleline to.
	 */
	setHitpoints(hitpoints) {
		this.hitpoints = hitpoints;
		this.hitpointsNode.textContent = hitpoints;
	}
	/**
	 * Kills all the cards present in this battleline, sending them back to their graveyards.
	 */
	conquor() {
		this.cards.forEach(card => card.die());
		this.cards = [];
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

		/** @type {Element} A reference to the HTML on the DOM that is the root node for this battletrack. */
		this.node = node;
		/** @type {Battleline} The battleline on the player's side. */
		this.friendlyBattleline = new Battleline(friendlyHitpoints, friendlyHitpointsNode, friendlyCardZoneNode);
		/** @type {Battleline} The battleline on the enemy's side. */
		this.enemyBattleline = new Battleline(enemyHitpoints, enemyHitpointsNode, enemyCardZoneNode);
		/** @type {Object} The location of this battletrack. */
		this.location = location;
		// TODO: Crawl the node to get the elements used to indicate location
	}
	/**
	 * A getter for the hitpoints the friendly side of the battletrack.
	 * @returns {number} the amount of hitpoints the friendly side of the track has.
	 */
	getFriendlyHitpoints() {
		return this.friendlyBattleline.getHitpoints();
	}
	/**
	 * A getter for the hitpoints the enemy side of the battletrack.
	 * @returns {number} the amount of hitpoints the friendly side of the track has.
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
	 * @returns {Object} the location.
	 */
	getLocation() {
		return this.location;
	}
	/**
	 * @returns {boolean} true if this battletrack has 0 hitpoints at one of its sides.
	 */
	isConquored() {
		return this.friendlyBattleline.getHitpoints() === 0 || this.enemyBattleline.getHitpoints() === 0;
	}
	/**
	 * Destroys every card present, returning them to their graveyards.
	 */
	conquor() {
		this.friendlyBattleline.conquor();
		this.enemyBattleline.conquor();
	}
}

/**
 * This class manages and represents a player's deck.
 * 
 * I contains the cards in that deck, as well as the
 * graveyard.
 * 
 * Has several functions to help manage the deck.
 */
class Deck {
	/**
	 * Constructs a new Deck, which manages the cards the player can
	 * draw, as well as the cards that have died in the line of battle.
	 * 
	 * @param {Card[]} cards An array of the cards this deck should start with.
	 * @param {Player} player The player that owns this deck.
	 */
	constructor(cards, player) {
		/** @type {Player} The player that owns this deck. */
		this.owner = player;
		// Clone the cards array using the spread operator
		/** @type {Card[]} The cards that are in this deck. */
		this.cards = [...cards];
		/** @type {Card[]} The cards that have died in battle. */
		this.graveyard = [];
		this.cards.forEach(card => card.setOwner(this.owner));
	}
	/**
	 * Pops a card off the top of the deck. If the deck is empty, reshuffles
	 * the graveyard into the deck.
	 * 
	 * @returns {Card} the card from the top of the deck.
	 */
	drawCard() {
		if (this.cards.length === 0) {
			this.cards = this.graveyard;
			this.graveyard = [];
			this.shuffle();
		}

		return this.cards.pop();
	}
	/**
	 * Adds a card to the top of the deck.
	 * 
	 * Don't use this for populating the deck at game start.
	 * @param {Card} card card to insert into the deck.
	 */
	insertCardIntoDeck(card) {
		card.setOwner(this.owner);
		this.cards.push(card);
	}
	/**
	 * Adds a given card to the graveyard.
	 * 
	 * @param {Card} card The card to add to the graveyard.
	 */
	addToGraveyard(card) {
		card.deleteNode();
		this.graveyard.push(card);
	}
	/**
	 * Shuffles the cards in the deck.
	 */
	shuffle() {
		// TODO: Implement an algorithm to shuffle the `this.cards` array.
	}
}

/**
 * Represents your hand.
 */
class Hand {
	/**
	 * @param {Element} node The div that will contain the cards in the player's hand.
	 */
	constructor(node) {
		/** @type {Element} A reference to the HTML on the DOM that cards should be appended to. */
		this.node = node;
		/** @type {Card[]} The cards that are in this hand. */
		this.cards = [];
	}
	/**
	 * Adds a given card to this hand, appending its node in the process.
	 * @param {Card} card The card to add to the hand.
	 */
	addToHand(card) {
		this.cards.push(card);
		this.node.appendChild(card.getNode());
	}
	/**
	 * Removes a given card from the hand and returns it.
	 * 
	 * @param {Card} card The card to remove.
	 * @returns {Card} the card that was removed.
	 */
	removeFromHand(card) {
		return this.cards.splice(this.cards.indexOf(card), 1)[0];
	}
}