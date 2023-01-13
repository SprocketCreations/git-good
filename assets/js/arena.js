$( function() {

	// create global lastMove object to track across different jQuery event listeners
	window.lastMove = {
		pickupIndex: 0,
		targetCard: 0,
		targetCardId: 0,
		targetCardClassname: 0,
		droppedBattletrackID: 0,
		droppedIndex: 0,
		successfullyPlaced: false
	}

	// function to track last move when a player card is clicked
	// Tracks: Player card, card ID, card class names, 3 dataset attrs: str, hp, speed, and a successfullyPlaced bool
	// successfullyPlaced updates on successful droppable drop
	const trackLastMove = (event) => {
			window.lastMove.targetCard = event.target;
			window.lastMove.targetCardId = event.target.id;
			window.lastMove.targetCardClassname = event.target.className;
			window.lastMove.successfullyPlaced = false;
	}

	// makes player-hand divs (cards) draggable, revert to their initial space if not dropped in a droppable, and snap to their
	// target droppable
	$( "#player-hand div" ).draggable({
		revert: "invalid",
		snap: true,
		start: function(event) {
			trackLastMove(event);					// calls track last move
		},
		drag: function(event) {
		},
		stop: function(event) {
		}
	});
 
	// makes all player-card boxes droppable to accept draggables
    $(".player-cards").droppable({
      classes: {
        "ui-droppable-active": "ui-state-active",
        "ui-droppable-hover": "ui-state-hover"
      },
	  // on drop, check if player-card box is full, if not, updated lastMove.successfullyPlaced global var, capture
	  // which battletrack it was dropped on, and the index that the card is in the player-card box
	  // then append a new div with the same attributes to the player-card box
	  // remove the lastMove.targetCard from the DOM
      drop: function(event, ui) { 
		
		if(this.children.length < 4){	  
			window.lastMove.successfullyPlaced = true;
			window.lastMove.droppedBattletrackID = $(event.target).parent()[0].id;
			window.lastMove.droppedIndex = this.children.length;
			$(this).append(`<div id='${window.lastMove.targetCardId}' class='${window.lastMove.targetCardClassname}' data-index='${this.children.length}'
							data-str='${window.lastMove.targetCardStr}' data-hp='${window.lastMove.targetCardHP}' data-speed='${window.lastMove.targetCardSpeed}'>
							</div>`);
			window.lastMove.targetCard.remove();
		}

		//
		if(this.children.length == 4){
			$(this).droppable("disable");
		} else {
			$(this).droppable("enable");
		}
		
      }
    });

	document.getElementById("undo-button").addEventListener("click", (event) => {
		event.preventDefault();
		if(window.lastMove.successfullyPlaced == true){
			$(`#${window.lastMove.targetCardId}`).remove();
			$("#player-hand").append(`<div id='${window.lastMove.targetCardId}' class='player-card ui-draggable ui-draggable-handle' data-str='${window.lastMove.targetCardStr}' data-hp='${window.lastMove.targetCardHP}' data-speed='${window.lastMove.targetCardSpeed}'>
									</div>`);
			$("#player-hand div").last().draggable({
				revert: "invalid",
				snap: true,
				start: function(event) {
					trackLastMove(event);
				},
				drag: function(event) {
				},
				stop: function(event) {
					console.log(window.lastMove);
				}
			});
		}
	})
})

// API FETCH & DECK DATA COLLECTION:
// initializing an empty deck that can be added to on fetch completion.
var pokeStats = []
var heroStats = []

// Fetch request for POKE API data
// This function gets all pokemon names for getPokeStats()
const pokeUrl = "https://pokeapi.co/api/v2/pokemon?limit=1279"
fetch(pokeUrl)
.then(function(response) {
        console.log(response);
        response.json().then(function (data) {
                for (i = 0; i < data.count; i ++) {
                        getPokeStats(data.results[i].name)
                };
        });
})

// Given a pokemons name, get its stats from pokeAPI & clean data to match normalize input format
function getPokeStats(pokeName) {
        var pokeNameUrl = `https://pokeapi.co/api/v2/pokemon/${pokeName}`
        fetch(pokeNameUrl)
        .then(function(response) {
                response.json().then(function(data) {
                        // API data output: [{base_stat:x, stat:{name:hp}}, {base_stat:x, stat:{name:attack}}, {base_stat:x, stat:{name:defense}}, {base_stat:x, stat:{name:special-attack}}, {base_stat:x, stat:{name:special-defense}}, {base_stat:x, stat:{name:speed}}].
                        // Convert API data to: {name:x, health:x, attack:x, defense:x, speed:x}
                        let obj = {}
                        obj["name"] = pokeName
                        obj["health"] = data.stats[0].base_stat
                        obj["attack"] = data.stats[1].base_stat + data.stats[3].base_stat
                        obj["defense"] = data.stats[2].base_stat + data.stats[4].base_stat
                        obj["speed"] = data.stats[5].base_stat
                        pokeStats.push(obj)
                        })
                })
} 

// Fetch request for SUPERHERO API data & clean data to match normalize input format
const heroUrl = "https://akabab.github.io/superhero-api/api/all.json"
fetch(heroUrl)
.then(function(response) {
        console.log(response);
        response.json().then(function (data) {
                for (i = 0; i < data.length; i++){
                        // Appends stat object to array. Each index as follows: {name:x, attack:x, defense:x, health:x, speed:x}
                        let obj = {}
                        obj["name"] = data[i].name
                        obj["health"] = data[i].powerstats.power
                        obj["attack"] = data[i].powerstats.strength + data[i].powerstats.combat
                        obj["defense"] = data[i].powerstats.durability
                        obj["speed"] = data[i].powerstats.speed
                        heroStats.push(obj)
                }
        });
})

// nomarlize() takes a data array that contains objects in the following format:
// [obj{
//     name,
//     health,
//     attack,
//     defense,
//     speed    
// }]

// pass in your data set (array of objects). returns your data as min-max distribution w/ max=1 min=0. Optional multiplier for continued balancing between API's
function normalize(data, multiplier) {
        // initialize empty arrays to store all stats for min/max finding.
        let statObj = {
                name: [],
                health: [],
                attack: [],
                defense: [],
                speed: [],
        }

        // Store stats by type in statObj:
        let statNames = ["name", "health", "attack", "defense", "speed"]
        for (i = 0; i < data.length; i++) {
                for (x = 0; x < statNames.length; x++) {
                        statObj[statNames[x]].push(data[i][statNames[x]])
                }
        }
        // minmax normalize the data with a function
        let normalizedData = minMaxNormalization(statObj, multiplier)
        // take min max normalized data and select ONLY the cards we need for the game
        let cardStats = getCardStats(normalizedData)
        return cardStats
}

// min max normalization of stat data (for a given data set...i.e. only pokemon, or only superapi). Optional multiplier for continued balancing between API's
function minMaxNormalization(data, multiplier) {
        let statsNormalized = {
                name: [],
                health: [],
                attack: [],
                defense: [],
                speed: [],
        }
        
        statsNormalized.name = data.name
        
        for (const[key, value] of Object.entries(data)) {
                if (key != "name") {
                        let min = Math.min(...data[key])
                        let max = Math.max(...data[key])
                        for (i = 0; i < data[key].length; i++) {
                                let x = data[key][i]
                                statsNormalized[key].push((x-min)/(max-min)*multiplier)
                        }
                }
        }
        
        return statsNormalized
}

// gets the normalized card stats for use in game
function getCardStats(normalizedData) {
        let cardNames = ["Bullseye", "Thor", "Spider-Man", "Green Goblin", "Black Widow", "Scarlet Witch", "Loki", "Groot", "Black Panther", "Venom", "Thanos", "Hulk", "Kingpin", "Magneto", "Luke Cage", "Amanda Waller", "Black Flash", "Flash", "Batman", "Superman", "Wonder Woman", "Lex Luthor", "Black Adam", "Darkseid", "Beast Boy", "Batgirl", "Aquaman", "Harley Quinn", "Joker", "Sinestro", "Martian Manhunter", "charizard", "pikachu", "gardevoir", "sylveon", "lucario", "gengar", "lugia", "greninja", "ditto", "garchomp", "snorlax", "heracross", "teddiursa", "porygon", "garbodor"]

        let cardStats = []

        for (i = 0; i < cardNames.length; i ++) {
                if (normalizedData["name"].indexOf(cardNames[i]) >= 0) {
                        let index = normalizedData["name"].indexOf(cardNames[i])
                        let obj = {}

                        let statNames = ["name", "health", "attack", "defense", "speed"]
                        for (x = 0; x < statNames.length; x++) {
                                obj[statNames[x]] = [normalizedData[statNames[x]][index]]
                        }
                        cardStats.push(obj)
                        deck.push(obj)
                }
        }
        return cardStats
}

//#region ENUM DEFINITIONS
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
//#endregion

//#region CLASS DEFINITIONS
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
	 * @param {HTMLElement} manaNode The HTML element on the DOM that the player's mana amount should be displayed in.
	 * @param {HTMLElement} handNode The HTML element on the DOM that is the player's hand. Cards will be appended to this element.
	 * @param {number} wins the number of times this player has won. Defaults to 0.
	 */
	constructor(cards, manaNode, handNode, wins = 0) {
		/** @type {number} The amount of mana this player has. */
		this.mana = 0;
		/** @type {HTMLElement} The HTML element to display the amount of mana this player has. */
		this.manaNode = manaNode;
		/** @type {number} The number of times this player has won the game. */
		this.wins = wins;
		/** @type {Deck} The player's deck. */
		this.deck = new Deck(cards, this);
		/** @type {Hand} The player's hand. */
		this.hand = new Hand(handNode);
		/** @type {number} The number of battlelanes the player has conquered. */
		this.conquered = 0;
		/** @type {boolean} True if the player is not spending any mana this round. */
		this.reinforcing = true;
	}
	/**
	 * @returns {boolean} true if the player has spent no mana this round.
	 */
	isReinforcing() {
		return this.reinforcing;
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
		this.reinforcing = false;
		this.mana = Math.max(0, mana);
		this.manaNode.textContent = this.mana;
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
	/**
	 * Increments this player's win counter, and stores it to local storage.
	 */
	addWin() {
		++this.wins;
		// TODO: Store player's wins to local storage.
	}
}

/**
 * Stores metadata about a location.
 */
class Location {
	/**
	 * Creates a new location.
	 * @param {string} displayName The display name of this location.
	 * @param {string} imageURL The path to the image used for the battletrack. 
	 */
	constructor(displayName, imageURL) {
		/** @type {string} The display name of this location. */
		this.displayName = displayName;
		/** @type {string} The path to the image used for the battletrack. */
		this.imageURL = imageURL;
	}
	/**
	 * @returns {string} the path to the image used for the battletrack.
	 */
	getImageURL() {
		return this.imageURL;
	}
	/**
	 * @returns {string} the display name of this location.
	 */
	getDisplayName() {
		return this.displayName;
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
	 * @param {string} art The URL to the art of the character on the card.
	 * @param {number} cost The mana cost of the card.
	 * @param {number} attack The attack power of the card.
	 * @param {number} defense The defense power of the card.
	 * @param {number} hitpoints The number of hitpoints the card has.
	 * @param {number} speed The speed of the card.
	 */
	constructor(name, art, cost, attack, defense, hitpoints, speed) {
		/** @type {string} The name of the character on this card. */
		this.name = name;
		/** @type {string} The URL to the artwork on this card. */
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
		/** @type {HTMLElement} The HTML element on the DOM that represents this card. */
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
	 * @returns {Battleline} the battleline this card is played to.
	 */
	getBattleline() {
		return this.battleline;
	}
	/**
	 * Returns a reference to the element in the DOM
	 * for this card. If one does not exist, it will
	 * create one.
	 * 
	 * @returns {HTMLElement} a reference to the html element for this card.
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
	 * @returns {Player} a reference to the player that owns this card.
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
	/**
	 * @param {number} damage The amount of damage to deal to this card.
	 */
	damage(damage) {
		this.setCurrentHitpoints(this.hitpoints - damage);
	}
	/**
	 * @param {number} hitpoints The new amount of hitpoints this card should have.
	 */
	setCurrentHitpoints(hitpoints) {
		this.currentHitpoints = Math.max(0, Math.min(this.totalHitpoints, hitpoints));
		//TODO: Walk the tree to update the card's health appearance.
		this.node;
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
	 * @param {Battletrack} battletrack The battletrack this battleline is on.
	 * @param {number} hitpoints The number of hitpoints this battleline should start with.
	 * @param {HTMLElement} hitpointsNode The HTML element to write the number of hitpoints to.
	 * @param {HTMLElement} DefenseNode The HTML element to write the defense to.
	 * @param {HTMLElement} zoneNode The HTML element that contains the cards in play.
	 */
	constructor(battletrack, hitpoints, hitpointsNode, defenseNode, zoneNode) {
		// TODO: Add an event listener
		zoneNode.addEventListener();

		/** @type {Battletrack} The battletrack this battleline is on. */
		this.battletrack = battletrack;
		/** @type {number} The number of hitpoints this side of the battletrack has. */
		this.hitpoints = hitpoints;
		/** @type {HTMLElement} The HTML element that the hitpoints will be written to. */
		this.hitpointsNode = hitpointsNode;
		/** @type {HTMLElement} The HTML element to write the defense to. */
		this.defenseNode = defenseNode;
		/** @type {Card[]} The cards in play on this side of the battletrack. */
		this.cards = [];
	}
	/**
	 * @param {number} damage The amount of damage to deal to this battleline;
	 */
	damage(damage) {
		this.setHitpoints(this.hitpoints - damage);
	}
	/**
	 * @returns {Battletrack} the battletrack this battleline is in.
	 */
	getBattletrack() {
		return this.battletrack;
	}
	/**
	 * Adds a card to this battleline.
	 * @param {Card} card The card to play to this battleline.
	 */
	playCard(card) {
		// TODO: Add code here for appending the card's node to the battleline.
		this.cards.push(card);
		// Update the defense visualization.
		this.defenseNode.textContent = this.getDefense();
	}
	/**
	 * Removes a given card from this battleline.
	 * @param {Card} card The card to remove.
	 * @returns {Card} the card removed.
	 */
	removeCard(card) {
		const removedCard = this.cards.splice(this.cards.indexOf(card), 1)[0];
		// Update the defense visualization.
		this.defenseNode.textContent = this.getDefense();

		return removedCard;
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
		this.hitpoints = Math.max(0, hitpoints);
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
	 * @param {HTMLElement} node The root node on the DOM that represents this battletrack.
	 * @param {Location} location The location data.
	 * @param {number} friendlyHitpoints The amount of hitpoints the friendly side of the battletrack should start with. Defaults to 40.
	 * @param {number} enemyHitpoints The amount of hitpoints the enemy side of the battletrack should start with. Defaults to 40.
	 */
	constructor(node, location, friendlyHitpoints = 40, enemyHitpoints = 40) {
		// TODO: Crawl the node to get the hitpoints and selection area nodes
		const friendlyHitpointsNode = null;
		const friendlyDefenseNode = null;
		const friendlyCardZoneNode = null;
		const enemyHitpointsNode = null;
		const enemyDefenseNode = null;
		const enemyCardZoneNode = null;

		/** @type {HTMLElement} A reference to the HTML on the DOM that is the root node for this battletrack. */
		this.node = node;
		/** @type {Battleline} The battleline on the player's side. */
		this.friendlyBattleline = new Battleline(this, friendlyHitpoints, friendlyHitpointsNode, friendlyDefenseNode, friendlyCardZoneNode);
		/** @type {Battleline} The battleline on the enemy's side. */
		this.enemyBattleline = new Battleline(this, enemyHitpoints, enemyHitpointsNode, enemyDefenseNode, enemyCardZoneNode);
		/** @type {Location} The location of this battletrack. */
		this.location = location;
		// TODO: Crawl the node to get the elements used to indicate location
	}
	/**
	 * @returns {Battleline} the battleline on the friendly side of the battletrack.
	 */
	getFriendlyBattleline() {
		return this.friendlyBattleline;
	}
	/**
	 * @returns {Battleline} the battleline on the enemy side of the battletrack.
	 */
	getEnemyBattleline() {
		return this.enemyBattleline;
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
	 * @returns the cards on the friendly side of the battleline.
	 */
	getFriendlyCards() {
		return this.friendlyBattleline.cards;
	}
	/**
	 * @returns the cards on the enemy side of the battleline.
	 */
	getEnemyCards() {
		return this.enemyBattleline.cards;
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
	 * @returns {Location} the location.
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

		// Shuffle the new deck.
		this.shuffle();
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
	 * @param {HTMLElement} node The div that will contain the cards in the player's hand.
	 */
	constructor(node) {
		/** @type {HTMLElement} A reference to the HTML on the DOM that cards should be appended to. */
		this.node = node;
		/** @type {Card[]} The cards that are in this hand. */
		this.cards = [];
	}
	/**
	 * Adds a given card to this hand, appending its node in the process.
	 * @param {Card} card The card to add to the hand.
	 */
	add(card) {
		this.cards.push(card);
		this.node.appendChild(card.getNode());
	}
	/**
	 * Removes a given card from the hand and returns it.
	 * 
	 * @param {Card} card The card to remove.
	 * @returns {Card} the card that was removed.
	 */
	remove(card) {
		return this.cards.splice(this.cards.indexOf(card), 1)[0];
	}
	/**
	 * Removes a random card from the hand and returns it.
	 * @param {number} maxMana The maximum amount of mana the card is allowed to have.
	 * @returns {Card} a random card removed from the hand.
	 */
	random(maxMana) {
		let card = null;
		do {
			card = this.cards[Math.random() * this.cards.length];
		} while (card.getCost() > maxMana);
		return this.remove(card);
	}
}
//#endregion

//#region GAMEPLAY FUNCTIONS
/**
 * Run on page load.
 * Calls all the functions needed to set up the game board.
 */
const gameStart = () => {
	initializeBattletracks();

	refillHand(human);
	refillHand(enemy);

	/**TODO: Present the player with two buttons:
	 * Button one is labled Start game.
	 * 	This calls startFirstRound()
	 * Button two is labled Reject hand.
	 * 	This calls rejectFirstHand()
	 */
};

/**
 * Configures the tracks.
 */
const initializeBattletracks = () => {
	/** @type {Location[]} Cloned array of the game's locations. */
	const locations = [...curatedLocations];
	for (let i = 0; i < 3; ++i) {
		/** @type {Location} the location to add to the battletrack. */
		const location = locations.splice(Math.floor(Math.random() * locations.length), 1)[0];
		/** @type {HTMLElement} the HTML node that is this battletrack. */
		const node = null;// TODO: implement.
		/** @type {Battletrack} the nth battletrack. */
		const battletrack = new Battletrack(node, location);

		battletracks.push(battletrack);
	}
};

/**
 * Builds a player object for the human player.
 * @returns {Player} the human player.
 */
const buildHumanPlayer = () => {
	/** @type {Card[]} the array of cards this player will start with in their hand. */
	const cards = getStarterDeck();

	/** @type {HTMLElement} The HTML that the player should write their mana amount to. */
	const manaNode = null; // TODO: Get the player's mana node from the DOM.

	/** @type {HTMLElement} The HTML that the player will append cards to in their hand. */
	const handNode = null; // TODO: Get the player's hand node from the DOM.

	/** @type {number} The number of times this player has won the game. */
	const wins = 0; //TODO: Get player wins from local storage.

	return new Player(cards, manaNode, handNode, wins);
};

/**
 * Builds a player object for the AI player.
 * @returns {Player} the AI player.
 */
const buildAIPlayer = () => {
	/** @type {Card[]} the array of cards this player will start with in their hand. */
	const cards = getStarterDeck();

	/** @type {HTMLElement} The HTML that the player should write their mana amount to. */
	const manaNode = null; // TODO: Get the enemy's mana node from the DOM.

	/** @type {HTMLElement} The HTML that the player will append cards to in their hand. */
	const handNode = null; // TODO: Get the enemy's hand node from the DOM.

	/** @type {number} The number of times this player has won the game. */
	const wins = 0; //TODO: Get this AI's wins from local storage.

	return new Player(cards, manaNode, handNode, wins);
};

/**
 * Constructs a new collection of cards from the currated list.
 * Will later pull from localStorage to build decks.
 * @returns {Card[]} an array of cards to be the deck.
 */
const getStarterDeck = () => {
	/** @type {Card[]} The array of cards to return. */
	const cards = [];

	//populate the array of cards:
	const heroCards = normalize(heroStats,1)
        const pokeCards = normalize(pokeStats, 1.5)
	let deckData = heroCards.concat(pokeCards)

	for (i= 0; i < deckData.length; i ++){
		const name = deckData[i]["name"][0];
		// TODO get art links for cards... Can easily be done w/ API but need to decide if that's what we want
		const art = {};
		// TODO need to decide on power curves for each stat & make mana value algorithm
		const cost = 0;
		const attack = deckData[i]["attack"][0];
		const defense = deckData[i]["defense"][0]; 
		const health = deckData[i]["health"][0];
		const speed = deckData[i]["speed"][0];

		let newCard = new Card(name, art, cost, attack, defense, health, speed);
		cards.push(newCard)
	}

	return cards;
};

/**
 * Containered code for handling the drawing of cards from the deck to be in the player's hand
 * @param {Player} player The player to refill the hand for.
 */
const refillHand = (player) => {
	/** @type {number} Number of cards in the hand. */
	const handCount = player.getHand().cards.length;
	// Until the player has five cards:
	for (let i = 0; i < cardRefreshCount - handCount; ++i) {
		/** @type {Card} The card popped off the top of the deck. */
		const card = player.getDeck().drawCard();
		// Add the card to the hand.
		player.getHand().add(card);
	}
};

/**
 * After recieving their cards, the player will be presented with two buttons.
 * The second calls this function.
 * TODO: Add a way for the player to choose which cards they want to reject.
 */
const rejectFirstHand = () => {
	/** @type {Hand} The player's hand. */
	const hand = human.getHand();
	/** @type {Deck} The player's deck. */
	const deck = human.getDeck();
	// Reject the player's first hand.
	/** @type {Card[]} The cards from the player's hand. */
	const rejectedCards = hand.cards;
	// Empty the hand.
	hand.cards = [];
	//Return the cards to the deck:
	rejectedCards.forEach(card => deck.insertCardIntoDeck(card));
	//Reshuffle the deck
	deck.shuffle();

	// Rebuild the player's hand.
	refillHand(human);

	//Start the game.
	startFirstRound();
};

/**
 * After recieving their cards, the player will be presented with two buttons.
 * The first calls this function.
 */
const startFirstRound = () => {
	// Update the game state to allow the players to play cards.
	currentGameStage = Stage.Playing;

	// Set mana for both players to 1
	human.setMana(1);
	enemy.setMana(1);

	human.reinforcing = true;
	enemy.reinforcing = true;

	// If the player won the coinflip, they go first first round.
	if (humanGoesFirst) {
		currentPlayer = human;
	}
	else {
		currentPlayer = enemy;
		AI_playcard();
	}
};

/**
 * Called when a player tries to drag a card from their hand to a battletrack.
 * @param {Card} card The card the player is trying to play.
 * @param {Battletrack} battletrack The battletrack the card is being played to.
 * @returns {boolean} true if the player was a able to play the card.
 */
const playerTryPlayCard = (card, battletrack) => {
	//If the current stage allows for playing of cards.
	if (currentGameStage === Stage.Playing &&
		// If the player is active.
		currentPlayer === human &&
		// If this card is not too expensive.
		currentPlayer.getMana() >= card.getCost()) {
		// Reduce the player's mana by the cost of the card.
		currentPlayer.setMana(currentPlayer.getMana() - card.getCost());

		// Remove the card from the player's hand.
		currentPlayer.getHand().remove(card);
		// and add it to the battletrack.
		battletrack.playFriendlyCard(card);

		// If the AI can make a move
		if (enemy.canPlayCard()) {
			currentPlayer = enemy;
			AI_playcard();
		}
		// else if the player cannot make a move
		else if (!human.canPlayCard()) {
			endPlayCardStage();
		}
	}
};

/**
 * Called when the player presses the end turn button.
 */
const playerEndTurnEarly = () => {
	// If the AI can make a move
	if (enemy.canPlayCard()) {
		currentPlayer = enemy;
		AI_playcard();
	} else {
		endPlayCardStage();
	}
};

/**
 * Ideally all the AI logic will be stuck in some AI object that
 * can use a behaviour tree and state machine to decide actions,
 * but this will work for now.
 */
const AI_playcard = () => {
	/** @type {number} The AI's mana. */
	const mana = enemy.getMana();

	/** @type {Card} A card picked at random from the hand. */
	// Pick a random card from hand that can be played
	const cardToPlay = enemy.getHand().random(mana);

	/** @type {Battletrack} A random unconquered battletrack. */
	let battletrack = null;
	// Pick a random battletrack that is not conquored
	do { battletrack = battletracks[Math.random]; } while (battletrack.isConquered());

	// Play the random card to the random battletrack.
	battletrack.playEnemyCard(cardToPlay);

	// Reduce AI mana by card cost
	enemy.setMana(mana - cardToPlay.getCost());

	// If the player can make a move.
	if (human.canPlayCard()) {
		// Set the current player to the human player
		currentPlayer = human;
	}
	// Else if the AI can make a move.
	else if (enemy.canPlayCard()) {
		// Recursively call this funciton.
		AI_playcard();
	}
	// Else if no one can make a move.
	else {
		endPlayCardStage();
	}
};

/**
 * Called after the player and the ai cannot play any more cards.
 */
const endPlayCardStage = () => {
	// Set stage to action
	currentGameStage = Stage.Action;

	// Empty cardsToAct incase there are still cards in it.
	cardsToAct.length = 0;

	battletracks.forEach(battletrack => {
		// Add all the cards from all the unconquored battletracks
		if (!battletrack.isConquered()) {
			// Add all the cards on this battletrack to cardsToAct.
			cardsToAct.push(...(battletrack.getFriendlyCards()), ...(battletrack.getEnemyCards()));
		}
	})
	// Sort cardsToAct by speed
	cardsToAct.sort((a, b) => {
		const aSpeed = a.getSpeed();
		const bSpeed = b.getSpeed();
		// A is faster.
		if (aSpeed > bSpeed) {
			return +1;
		}
		// B is faster.
		else if (bSpeed > aSpeed) {
			return -1;
		}
		// They are the same speed.
		else {
			// Player who got to go first this round gets action prority
			const aOwner = a.getOwner();
			const bOwner = b.getOwner();

			// They are owned by the same player
			if (aOwner === bOwner) {
				return 0;
			}

			const isAFirst = (humanGoesFirst && aOwner === human) || (!humanGoesFirst && aOwner !== human);

			// A's owner has priority
			if (isAFirst) {
				return +1;
			}
			// B's owner has priority
			else {
				return -1;
			}
		}
	});

	letNextCardDoAction();
};

/**
 * Called after the active card has performed its action.
 */
const letNextCardDoAction = () => {
	if (activeCards.length === 0) {
		// If there are no more cards to process, we are done.
		if (cardsToAct.length === 0) {
			endRound();
			// Return to exit this function early.
			return;
		}

		/** @returns {number} the speed of the next card on the cardsToAct stack. */
		const nextSpeed = () => cardsToAct[cardsToAct.length - 1].getSpeed();

		/** @type {number} The speed of the firsy card popped from the stack. */
		const speed = nextSpeed();

		// Pop cardsToAct and add it to the active card array
		do {
			activeCards.push(cardsToAct.pop());
		} while (cardsToAct.length > 0 && nextSpeed() === speed);
	}

	// If the card is owned by the AI
	if (activeCards[0].getOwner() === enemy) {
		AI_action();
	}
};

/**
 * Run whenever a card controlled by the AI gets to perform an action.
 */
const AI_action = () => {
	/** @type {Card} the card the AI is giving orders to. */
	const activeCard = activeCards.pop();

	/** @type {Card[]} the cards controlled by the human that the active card can attack. */
	const targets = activeCard.getBattleline().getBattletrack().getFriendlyCards();

	// Generate a random index from -1 to length-1
	const randomIndex = Math.floor(Math.random() * (targets.length + 1)) - 1;

	// Pick a random enemy card, or if the index is -1, the battleline itself.
	const target = randomIndex === -1 ? activeCard.getBattleline().getBattletrack().getFriendlyBattleline() : targets[randomIndex];

	// Order active card to attack
	if (!cardAttackAction(activeCard, target)) {
		letNextCardDoAction();
	}
};

/**
 * Called when the player orders a card to perform an attack.
 * @param {Card} card The card the player is trying to perform an action with.
 * @param {Card | Battleline} defender The card or battleline the player is trying to attack.
 */
const playerTryAttack = (card, defender) => {
	/** @type {number} Index of the card in active cards. */
	const cardIndex = activeCards.indexOf(card);
	/** @type {boolean} If the stage is action. */
	const isAction = currentGameStage === Stage.Action;
	/** @type {boolean} If the card is active. */
	const isActive = cardIndex !== -1;
	/** @type {boolean} If the defender is a card. */
	const isDefenderACard = defender instanceof Card;
	/** @type {boolean} If the battleline is in the same battletrack the card is in. */
	const isInBattletrack = isDefenderACard ? false : defender.getBattletrack() === card.getBattleline().getBattletrack();
	/** @type {boolean} If the card is in the same battletrack as the defender card. */
	const isInSameBattletrack = isDefenderACard ? defender.getBattleline().getBattletrack() === card.getBattleline().getBattletrack() : false;

	// If all the above conditions are true.
	if (isAction && isActive && (isInBattletrack || isInSameBattletrack)) {
		// Remove this card from the active cards array.
		activeCards.splice(cardIndex, 1);
		if (!cardAttackAction(card, defender)) {
			letNextCardDoAction();
		}
	}
};

/**
 * Run whenever the player or ai decides to perform an attack action.
 * @param {Card} attacker The card performing the attack action.
 * @param {Card | Battleline} defender The card or battleline being attacked.
 * @returns {boolean} true if the game ended.
 */
const cardAttackAction = (attacker, defender) => {
	/** @type {number} The attack value of the attacking card. */
	const attack = attacker.getAttack();

	/** @type {number} The defense value of the defending card/battleline. */
	const defense = defender.getDefense();

	/** @type {number} The amount of damage to deal to the defender. */
	// Calculate damage as offender's attack minus defender's defense
	const damage = Math.max(1, attack - defense);

	// Reduce the defender's health by the damage.
	defender.damage(damage);

	// If defender is a card
	if (defender instanceof Card) {
		// If the defender dies
		if (defender.getCurrentHitpoints() === 0) {
			// Kill the card. This function takes care of all the disposal.
			defender.die();
		}
	}
	// Else if the defender is the battleline
	else {
		// If the battletrack dies
		if (defender.getHitpoints() === 0) {
			/** @type {Player} the player that owns the attacking card. */
			const player = attacker.getOwner();
			// Increment the player's conquered tracks stat.
			player.conquer();
			// If the player whom defeated this battletrack has defeated two battletracks.
			if (player.conquered === 2) {
				// End the game
				endGame();
				return true;
			}
			else {
				// Destroy all cards on this battletrack
				defender.getBattletrack().conquer();
			}
		}
	}
	return false;
};

/**
 * Called at the end of every round.
 * Initializes and resets the players
 */
const endRound = () => {
	++currentRound;

	// Set mana for both players to round number
	// Refresh both players mana, awarding an extra 2 if they spent no mana last round.
	human.setMana(currentRound + human.isReinforcing() ? 2 : 0);
	enemy.setMana(currentRound + enemy.isReinforcing() ? 2 : 0);

	human.reinforcing = true;
	enemy.reinforcing = true;

	// Refresh both hands with new cards
	refillHand(human);
	refillHand(enemy);

	// Update the game state to allow the players to play cards.
	currentGameStage = Stage.Playing;

	// If the player won the coinflip, they go first on even numbered rounds
	if (humanGoesFirst && currentRound % 2 !== 0) {
		currentPlayer = human;
	}
	else {
		currentPlayer = enemy;
		AI_playcard();
	}
};

/**
 * This is called once a player has defeated two battletracks.
 */
const endGame = () => {
	// Update the game state prevent the players from doing anything.
	currentGameStage = Stage.Over;

	// If the human won.
	if (human.isWinner()) {
		// Advance player win counter
		human.addWin();
	}
	// If the enemy won.
	else if (enemy.isWinner()) {
		// Advance enemy win counter
		enemy.addWin();
	}
	// If something forced the game to end early.
	else {
		// Idk if this will every be reached.
		// The game can't tie.
	}
	// Display victory or failure screen/animation
	// TODO: add an endgame screen or page to show.
};
//#endregion

//#region GLOBAL VARIABLES
	
	//#region HTML NODES
// BATTLETRACK VARS
/** @type {HTMLElement[]} Array of all battletracks  */
const _allBattletracks = document.querySelectorAll(".battletrack");	

/** @type {HTMLElement[]} Array of battletrack enemy HP counts */
const _btEnemyHp = document.querySelectorAll(".bt-enemy-hp > span");				

/** @type {HTMLElement[]} Array of battletrack player HP counts */
const _btPlayerHp = document.querySelectorAll(".bt-player-hp > span");

/** @type {HTMLElement[]} Array of battletrack enemy Armor counts */
const _btEnemyArmor = document.querySelectorAll(".bt-enemy-armor > span");		

/** @type {HTMLElement[]} Array of battletrack player Armor counts */
const _btPlayerArmor = document.querySelectorAll(".bt-player-armor > span");

// ENEMY VARS
/** @type {HTMLElement} Container for enemy deck, hand, and mana */
const _enemyHead = document.querySelector("#enemy-head");

/** @type {HTMLElement} Top card of the enemy deck */
const _enemyDeck = document.querySelector("#enemy-top-card");	

/** @type {HTMLElement} Div that holds enemy cards */
const _enemyHand = document.querySelector("#enemy-hand");

/** @type {HTMLElement} Span containing enemy mana count "X" */
const _enemyManaCount = document.querySelector("#enemy-mana-count");	

/** @type {HTMLElement[]} Array of all 3 enemy table card divs */
const _enemyTableCards = document.querySelectorAll(".enemy-cards");

// PLAYER VARS
/** @type {HTMLElement} Container for player deck, hand, and mana */
const _playerHead = document.querySelector("#player-head");

/** @type {HTMLElement} Top card of the player deck */
const _playerDeck = document.querySelector("#player-top-card");		

/** @type {HTMLElement} Div that holds player cards */
const _playerHand = document.querySelector("#player-hand");

/** @type {HTMLElement} Span containing player mana count "X" */
const _playerManaCount = document.querySelector("#player-mana-count");

/** @type {HTMLElement[]} Array of all 3 player table card divs */
const _playerTableCards = document.querySelectorAll(".player-cards");

	// #endregion

/** @type {Location[]} array of game locations */
const curatedLocations = [
	//Example:
	new Location("Wakanda", "./assets/img/wakanda-bg.png"),
]; // TODO: create a definition of locations.

/** @type {Stage} The current state of the game. */
let currentGameStage = Stage.Initializing;

/** @type {Player} The human player. */
const human = buildHumanPlayer();

/** @type {Player} The AI player */
const enemy = buildAIPlayer();

/** @type {Player} The current player allowed to perform card plays. */
let currentPlayer = null;

/** @type {Battletrack[]} The three battletracks on the board. */
const battletracks = [];

/** @type {boolean} True if the player should go first on odd numbered rounds. */
const humanGoesFirst = Math.random() > 0.5;

/** @type {number} The number of cards to refresh the hand to at the end of every round. */
const cardRefreshCount = 5;

/** @type {number} The index of the current round. */
let currentRound = 1;

/** @type {Card[]} All the cards played on the battletracks ordered by their speed. */
const cardsToAct = [];

/** @type {Card[]} The current card waiting to perform its action. If there are multiple cards with the same speed, they will all be put into this array. */
const activeCards = [];

//#endregion

// Start the game.
gameStart();


