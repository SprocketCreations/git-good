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
		/** @type {number} The number of battlelanes the player has conquered. */
		this.conquered = 0;
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
	 * Increases the tracking of how many battlelanes this player has conquered.
	 */
	conquer() {
		++this.conquered;
	}
	/**
	 * @returns {boolean} true if this player has conquered two battletracks.
	 */
	isWinner() {
		return this.conquered > 1;
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
		/** @type {Battleline} The battleline this card is currently played to. */
		this.battleline = null;
	}
	/**
	 * Kills this card, sending it back to the graveyard.
	 */
	die() {
		this.battleline.removeCard(this);
		this.deleteNode();
		this.owner.getDeck().addToGraveyard(this);
	}
	/**
	 * @param {Battleline} battleline The battline this card is now a part of.
	 */
	setBattleline(battleline) {
		this.battleline = battleline;
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
	 * Adds a card to this battleline.
	 * @param {Card} card The card to play to this battleline.
	 */
	playCard(card) {
		// TODO: Add code here for appending the card's node to the battleline.
		this.cards.push(card);
	}
	/**
	 * Removes a given card from this battleline.
	 * @param {Card} card The card to remove.
	 * @returns {Card} the card removed.
	 */
	removeCard(card) {
		return this.cards.splice(this.cards.indexOf(card), 1)[0];
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
	conquer() {
		this.cards.forEach(card => card.die());
		this.cards = [];
	}
	/**
	 * Defense is a function of the number of cards played on this battleline.
	 * @returns {number} the defense of this battleline.
	 */
	getDefense() {
		return this.cards.length;
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
	 * @param {Card} card The card to play to the friendly side of the battletrack.
	 */
	playFriendlyCard(card) {
		this.friendlyBattleline.playCard(card);
	}
	/**
	 * @param {Card} card The card to play to the enemy side of the battletrack.
	 */
	playEnemyCard(card) {
		this.enemyBattleline.playCard(card);
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
	 * @returns {number} the defense that the friendly side of the track has.
	 */
	getFriendlyDefense() {
		return this.friendlyBattleline.getDefense();
	}
	/**
	 * @returns {number} the defense that the enemy side of the track has.
	 */
	getEnemyDefense() {
		return this.enemyBattleline.getDefense();
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
	isConquered() {
		return this.friendlyBattleline.getHitpoints() === 0 || this.enemyBattleline.getHitpoints() === 0;
	}
	/**
	 * Destroys every card present, returning them to their graveyards.
	 */
	conquer() {
		this.friendlyBattleline.conquer();
		this.enemyBattleline.conquer();
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

/**
 * Comments are organized like code.
 * any text prefixed with * is an enum
 * any comment starting with one / represents calling pseudo-code elsewhere in this file
 * any text prefixed with _ is a custom type, defined below
 */

// Function Definitions
/**
 * Run on page load.
 * Calls all the functions needed to set up the game board.
 */
const gameStart = () => {
	// Define game state as global *Initializing
	// Define the player as a global _player object
	// Define the enemy as a global _player object
	// Define battletracks as a global _battletrack array
	// Determin turn order at random, 50 - 50 for each player
	// Winner of the coin flip will go on odd numbered rounds
	// Loser will go on even numbered rounds
	// /Initialize the tracks
	// /Initialize the decks
};

/**
 * Configures the tracks.
 */
const initializeBattletracks = () => {
	// Define an array of 18 locations
	//START// For 3 battletracks:
		// Create a _battletrack by
		// Adding a random location
		// If that location is already used by one of the other _battletracks, try again
		// Link the _battletrack to its dom node
		// Add this battletrack to the global array of battletracks
	//END//
};

/**
 * Constructs the decks at random.
 * Will later pull from localStorage to build decks.
 */
const initializeDecks = () => {
/* === Initialize the Decks === */
	//START// Do the following for the player and the AI
		// Define the API ids as an array
		// Get the ids of the curated 45 cards
		// Fetch the data for those 45 and store it in a _card in the player's _deck
		// /Build the starter hand
	//END//
};

/**
 * Containered code for handling the drawing of cards from the deck to be in the player's hand
 */
const buildStarterHand = () =>{
/* === Build the starter hand (do for both player and ai) === */
	// Shuffle the _deck via some algorithm stolen from online
	//START// Do the following 5 times
		// /Draw card
	//END//
};

/**
 * Handles creating a card.
 */
const drawCard = () => {
/* === Draw card === */
	//START// If deck is empty
		// Move all cards from graveyard to deck
		// Shuffle deck
	//END//
	// Pop the top _card from the _deck and add it to the _hand
	// /Build card dom node
	// Link the DOM node to the _card
	// Append the _card dom node to the _hand dom node
};

/**
 * After recieving their cards, the player will be presented with two buttons.
 * The second calls this function.
 */
const rejectFirstHand = () => {
/* === Reject first hand === */	
	// Put the hand cards back into the deck and destroy their DOM reps
	// /Build the starter hand
};

/**
 * After recieving their cards, the player will be presented with two buttons.
 * The first calls this function.
 */
const startFirstRound = () => {
/* === Start first round === */
	// Define current player as a reference to the enemy player
	// Define current round as a global number starting at 1
	// Set game stage to *Playing
	// Set mana for both players to 1
	// If the player won the coin flip, and the round number is odd
	// Set current player to player
	// else
	// /AI play card
};

/**
 * Called when a player tries to drag a card from their hand to a battletrack.
 */
const playerTryPlayCard = () => {
/* === Player play card === */
	// If the stage is *playing
	// If the player is the current player
	//START// If player mana >= card cost
		// Player mana minus card cost
		// /Play card
		//START// If the AI can make a move
			// Set current player to the ai
			// /AI play card
		//END//
		//START// else if the player cannot make a move
			// /End play card stage
		//END//
	//END//
};

/**
 * Called when the player presses the end turn button.
 */
const playerEndTurnEarly = () => {
/* === End turn early === */
	//START// If the AI can make a move
		// Set current player to the enemy
		// /AI play card
	//END//
	//START// else
		// /End play card stage
	//END//
};

/**
 * Function to play a card from a hand to a battleline
 */
const playCard = () => {
/* === Play card === */
	// Removes a given _card from the given _hand
	// Adds the given _card to the given _battletrack
	// Appends the given _card node to the given _battletrack node
};

/**
 * Ideally all the AI logic will be stuck in some AI object that
 * can use a behaviour tree and state machine to decide actions,
 * but this will work for now.
 */
const AI_playcard = () => {
/* === AI play card === */
	// Pick a random _card from _hand that can be played
	// Pick a random battletrack that is not conquored
	// /Play card
	// Reduce AI mana by card cost
	//START// If the player can make a move
		// Set the current player to the human player
	//END//
	//START// else if the AI cannot make a move
		// /End play card stage
	//END//
};

/**
 * Called after the player and the ai cannot play any more cards.
 */
const endPlayCardStage = () => {
/* === End play card stage === */
	// Set stage to *action
	// Define "cards to act" as a global array
	// Add all the _cards from all the unconquored _battletracks to "cards to act"
	// Sort "cards to act" by speed
	// /Let next card action
};

/**
 * Called after the active card has performed its action.
 */
const letNextCardDoAction = () => {
/* === Let next card action === */
	// If "cards to act" is empty
		// /End round
	//START// else
		// Pop "cards to act" and set it to the active card
		// If the card is owned by the AI
		// /AI card action
	//END//
};

/**
 * Run whenever a card controlled by the AI gets to perform an action.
 */
const AI_action = () => {
/* === AI card action === */
	// Pick a random enemy card
	// Order active card to /Attack
	// /Let next card action
};

/**
 * Called when the player orders a card to perform an attack.
 */
const playerTryAttack = () => {
/* === Player card attack === */
	// If the stage is *action
	// If this card is the active card
	// If the target card is in the same _battletrack as this card
	// /Attack
	// /Let next card action
};

/**
 * Run whenever the player or ai decides to perform an attack action
 */
const cardAttackAction = () => {
/* === Attack === */
	// caluclate damage as offender's attack minus defender's defense
	//START// if defender is a _card
		// reduce defender's health by damage minus defenders defense to minumum of 1
		//START// If defender dies
			// Remove defender from battletrack
			// Add defender to owner's graveyard
			// destroy card DOM node
		//END//
	//END//
	//START// else if the defender is the battletrack
		// reduce the battletrack's health by damage minus battletrack defense
		//START// If the battletrack dies
			// If the player whom defeated this battletrack has already defeated a battletrack
			// /End game
			//START// else
				// Destroy all cards on this battletrack
				// Add all cards on this battletrack to their owner's graveyards
			//END//
		//END//
	//END//
};

/**
 * Called at the end of every round.
 * Initializes and resets the players
 */
const endRound = () => {
/* === End round === */
	// Set mana for both _players to round number
	//START// For each player, until they have 5 cards
		// /Draw card
	//END//
};

/**
 * This is called once a player has defeated two battletracks.
 */
const endGame = () => {
/* === End game === */
	// Set stage to *Over
	// If player won
	// Advance player win counter
	// elseif ai won
	// Advance enemy win counter
	// Display victory or failure screen/animation
};