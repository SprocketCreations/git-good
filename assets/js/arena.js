

//#region API FETCHING AND NORMALIZATION

// API FETCH & DECK DATA COLLECTION:
// initializing an empty deck that can be added to on fetch completion.
var pokeStats = []
var heroStats = []
var fetchesLeft = 1;

// Fetch request for POKE API data
pokeNames = ["charizard", "pikachu", "gardevoir", "sylveon", "lucario", "gengar", "lugia", "greninja", "ditto", "garchomp", "snorlax", "heracross", "teddiursa", "porygon", "garbodor"]
fetchesLeft += pokeNames.length
getPokeStats()
// Given a pokemons name, get its stats from pokeAPI & clean data to match normalize input format
function getPokeStats() {
	for (i = 0; i < pokeNames.length; i++) {
		let pokeName = pokeNames[i]
		var pokeNameUrl = `https://pokeapi.co/api/v2/pokemon/${pokeName}`
		fetch(pokeNameUrl)
			.then(function (response) {
				response.json().then(function (data) {
					// API data output: [{base_stat:x, stat:{name:hp}}, {base_stat:x, stat:{name:attack}}, {base_stat:x, stat:{name:defense}}, {base_stat:x, stat:{name:special-attack}}, {base_stat:x, stat:{name:special-defense}}, {base_stat:x, stat:{name:speed}}].
					// Convert API data to: {name:x, health:x, attack:x, defense:x, speed:x}
					let obj = {}
					obj["name"] = pokeName
					obj["health"] = data.stats[0].base_stat
					obj["attack"] = data.stats[1].base_stat + data.stats[3].base_stat
					obj["defense"] = data.stats[2].base_stat + data.stats[4].base_stat
					obj["speed"] = data.stats[5].base_stat
					obj["imgUrl"] = data.sprites.other["official-artwork"].front_default
					pokeStats.push(obj)
					--fetchesLeft;
					if (fetchesLeft === 0) {
						gameStart();
					}
				})
			})
	}
}

// Fetch request for SUPERHERO API data & clean data to match normalize input format
const heroUrl = "https://akabab.github.io/superhero-api/api/all.json"
fetch(heroUrl)
	.then(function (response) {
		response.json().then(function (data) {
			for (i = 0; i < data.length; i++) {
				// Appends stat object to array. Each index as follows: {name:x, attack:x, defense:x, health:x, speed:x}
				let obj = {}
				obj["name"] = data[i].name
				obj["health"] = data[i].powerstats.power
				obj["attack"] = data[i].powerstats.strength + data[i].powerstats.combat
				obj["defense"] = data[i].powerstats.durability
				obj["speed"] = data[i].powerstats.speed
				obj["imgUrl"] = data[i].images.sm
				heroStats.push(obj)
			}
			--fetchesLeft;
			if (fetchesLeft == 0) {
				gameStart();
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
function normalize(data, balanceMultiplier) {
	// initialize empty arrays to store all stats for min/max finding.
	let statObj = {
		name: [],
		health: [],
		attack: [],
		defense: [],
		speed: [],
		imgUrl: [],
	}

	// Store stats by type in statObj:
	let statNames = ["name", "health", "attack", "defense", "speed", "imgUrl"]
	for (i = 0; i < data.length; i++) {
		for (x = 0; x < statNames.length; x++) {
			statObj[statNames[x]].push(data[i][statNames[x]])
		}
	}
	// minmax normalize the data with a function
	let normalizedData = minMaxNormalization(statObj, balanceMultiplier)
	// take min max normalized data and select ONLY the cards we need for the game
	let cardStats = getCardStats(normalizedData)
	return cardStats
}

// min max normalization of stat data (for a given data set...i.e. only pokemon, or only superapi). Optional multiplier for continued balancing between API's
function minMaxNormalization(data, balanceMultiplier) {
	let statsNormalized = {
		name: [],
		health: [],
		attack: [],
		defense: [],
		speed: [],
		cost: [],
		imgUrl: [],
	}

	for(let i = 0; i < data.name.length; i++){
		console.log(data.name[i])
		data.name[i] = data.name[i].charAt(0).toUpperCase() + data.name[i].slice(1, data.name[i].length);
		console.log(data.name[i])
	}

	statsNormalized.name = data.name
	statsNormalized.imgUrl = data.imgUrl
	keysArr = ["health", "attack", "defense", "speed"]

	for (const [key, value] of Object.entries(data)) {
		if (keysArr.includes(key)) {
			let min = Math.min(...data[key])
			let max = Math.max(...data[key])
			for (i = 0; i < data[key].length; i++) {
				let x = data[key][i]
				if (key === "health") {
					statsNormalized[key].push(Math.max(1, Math.round((x - min) / (max - min) * balanceMultiplier * 20)))
				} else {
					statsNormalized[key].push(Math.max(1, Math.round((x - min) / (max - min) * balanceMultiplier * 5)))
				}
			}
		}
	}

	let statTotal = []
	for (i = 0; i < statsNormalized.name.length; i++) {
		statTotal.push(statsNormalized.attack[i] + statsNormalized.health[i] + statsNormalized.defense[i] + statsNormalized.speed[i])
	}
	let max = Math.max(...statTotal)
	let min = Math.min(...statTotal)
	for (i = 0; i < statTotal.length; i++) {
		statsNormalized["cost"].push(Math.max(1, Math.round((statTotal[i] - min) / (max - min) * 8)))
	}

	return statsNormalized
}

// gets the normalized card stats for use in game
function getCardStats(normalizedData) {
	let cardNames = ["Bullseye", "Thor", "Spider-Man", "Green Goblin", "Black Widow", "Scarlet Witch", "Loki", "Groot", "Black Panther", "Venom", "Thanos", "Hulk", "Kingpin", "Magneto", "Luke Cage", "Amanda Waller", "Black Flash", "Flash", "Batman", "Superman", "Wonder Woman", "Lex Luthor", "Black Adam", "Darkseid", "Beast Boy", "Batgirl", "Aquaman", "Harley Quinn", "Joker", "Sinestro", "Martian Manhunter", "Charizard", "Pikachu", "Gardevoir", "Sylveon", "Lucario", "Gengar", "Lugia", "Greninja", "Ditto", "Garchomp", "Snorlax", "Heracross", "Teddiursa", "Porygon", "Garbodor"]

	let cardStats = []

	for (i = 0; i < cardNames.length; i++) {
		if (normalizedData["name"].indexOf(cardNames[i]) >= 0) {
			let index = normalizedData["name"].indexOf(cardNames[i])
			let obj = {}

			let statNames = ["name", "health", "attack", "defense", "speed", "imgUrl", "cost"]
			for (x = 0; x < statNames.length; x++) {
				obj[statNames[x]] = normalizedData[statNames[x]][index]
			}
			cardStats.push(obj);
		}
	}
	return cardStats
}

let roundSpan = document.querySelector("#round")
let phaseSpan = document.querySelector("#phase")
const playerHeadHand = document.querySelector("#player-hand")
console.log(roundSpan)
console.log(phaseSpan)

//#endregion

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
		phaseSpan.textContent = "Play"
		playerHeadHand.setAttribute("style",  "box-shadow: 3px -3px 5px lightgreen, 3px 3px 5px lightgreen, -3px -3px 5px lightgreen, -3px 3px 5px lightgreen;")
		const numberOfCards = this.hand.cards.length;
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
		// Remove this card from the action pool
		{
			const activeIndex = activeCards.indexOf(this);
			const actIndex = cardsToAct.indexOf(this);
			if (activeIndex !== -1) { activeCards.splice(activeIndex, 1); }
			if (actIndex !== -1) { cardsToAct.splice(actIndex, 1); }
		}
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
		if (this.node === null) {
			// Fetch and clone the empty template
			const template = document.querySelector("#card-template");
			const fragment = template.content.cloneNode(true);


			// populate the new template with an id and stats
			let templateContainer = fragment.children[0];
			let templateTable = templateContainer.children[1].children[1];
			let templateFooter = templateContainer.children[2];
			templateContainer.children[0].setAttribute("src", this.art);
			templateContainer.children[1].children[0].textContent = this.cost;
			templateTable.children[0].children[1].textContent = this.attack;
			templateTable.children[1].children[1].textContent = this.defense;
			templateTable.children[2].children[1].textContent = this.speed;
			templateFooter.children[0].textContent = this.name;
			templateFooter.children[1].textContent = this.currentHitpoints;

			// append newTemplate to index.html
			this.node = templateContainer;
		}

		// TODO add dragable code here
		return this.node
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
	 * @returns {string} the displayable name of this card.
	 */
	getDisplayName() {
		return this.name;
	}
	/**
	 * @param {number} damage The amount of damage to deal to this card.
	 */
	damage(damage) {
		this.setCurrentHitpoints(this.currentHitpoints - damage);
	}
	/**
	 * @param {number} hitpoints The new amount of hitpoints this card should have.
	 */
	setCurrentHitpoints(hitpoints) {
		this.currentHitpoints = Math.max(0, Math.min(this.totalHitpoints, hitpoints));
		//TODO: Walk the tree to update the card's health appearance.
		let hitpointsEl = this.node.children[2].children[1];
		hitpointsEl.textContent = this.currentHitpoints;
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
		/** @type {Battletrack} The battletrack this battleline is on. */
		this.battletrack = battletrack;
		/** @type {number} The number of hitpoints this side of the battletrack has. */
		this.hitpoints = hitpoints;
		/** @type {number} The number of hitpoints this side of the battletrack started with. */
		this.originalHitpoints = this.hitpoints;
		/** @type {HTMLElement} The HTML element that the hitpoints will be written to. */
		this.hitpointsNode = hitpointsNode;
		/** @type {HTMLElement} The HTML element to write the defense to. */
		this.defenseNode = defenseNode;
		/** @type {HTMLElement} The HTML that played cards are appended to. */
		this.zoneNode = zoneNode;
		/** @type {Card[]} The cards in play on this side of the battletrack. */
		this.cards = [];

		this.hitpointsNode.children[1].textContent = this.hitpoints;
		this.hitpointsNode.children[0].style.width = `${100}%`;
		this.defenseNode.textContent = 0;
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
		console.log("Card played to battleline:", card.getDisplayName());
		/** @type {HTMLElement} The card's node on the page. */
		const cardNode = card.getNode();
		cardNode.style.transform = "";
		cardNode.style.inset = "";
		cardNode.style.top = "";
		cardNode.style.bottom = "";
		cardNode.style.left = "";
		cardNode.style.right = "";
		// Append the card to the battleline.
		this.zoneNode.appendChild(cardNode);
		// Add this card to the internal tracking.
		this.cards.push(card);
		// Update the defense visualization.
		this.defenseNode.textContent = this.getDefense();
		// Inform this card what battleline it's in.
		card.setBattleline(this);
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
		// Inform this card what battleline it's in.
		card.setBattleline(null);

		if (this.cards.length < maxCardsPerBattleline && this.getBattletrack().getFriendlyBattleline() === this) {
			$(this.zoneNode).droppable("enable");
		}

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
		this.hitpointsNode.children[1].textContent = this.hitpoints;
		this.hitpointsNode.children[0].style.width = `${Math.min(100, Math.max(0, this.hitpoints / this.originalHitpoints * 100))}%`;
	}
	/**
	 * Kills all the cards present in this battleline, sending them back to their graveyards.
	 */
	conquer() {
		const deadCards = [...this.cards];
		deadCards.forEach(card => card.die());
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
	 * @param {number} index The index of this battletrack.
	 * @param {Location} location The location data.
	 * @param {number} friendlyHitpoints The amount of hitpoints the friendly side of the battletrack should start with. Defaults to 40.
	 * @param {number} enemyHitpoints The amount of hitpoints the enemy side of the battletrack should start with. Defaults to 40.
	 */
	constructor(index, location, friendlyHitpoints = 40, enemyHitpoints = 40) {
		const friendlyHitpointsNode = _btPlayerHp[index];
		const friendlyDefenseNode = _btPlayerArmor[index];
		const friendlyCardZoneNode = _playerTableCards[index];
		const enemyHitpointsNode = _btEnemyHp[index];
		const enemyDefenseNode = _btEnemyArmor[index];
		const enemyCardZoneNode = _enemyTableCards[index];

		addDroppableToBattleline(this, friendlyCardZoneNode);

		/** @type {HTMLElement} A reference to the HTML on the DOM that is the root node for this battletrack. */
		this.node = _allBattletracks[i];
		/** @type {Battleline} The battleline on the player's side. */
		this.friendlyBattleline = new Battleline(this, friendlyHitpoints, friendlyHitpointsNode, friendlyDefenseNode, friendlyCardZoneNode);
		/** @type {Battleline} The battleline on the enemy's side. */
		this.enemyBattleline = new Battleline(this, enemyHitpoints, enemyHitpointsNode, enemyDefenseNode, enemyCardZoneNode);
		/** @type {Location} The location of this battletrack. */
		this.location = location;
		// TODO: Crawl the node to get the elements used to indicate location
		/** @type {HTMLElement} The Element that the player needs to target when attacking this battletrack. */
		this.targetableNode = _btNames[index];
	}
	/**
	 * @returns {HTMLElement} the element taht should be targeted by the player when attacking this battletrack.
	 */
	getTargetable() {
		return this.targetableNode;
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

		if (this.friendlyBattleline.cards.length >= maxCardsPerBattleline) {
			$(this.friendlyBattleline.zoneNode).droppable("disable");
		}
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
		this.friendlyBattleline.zoneNode.style.visibility = "hidden";
		$(this.friendlyBattleline.zoneNode).droppable("disable");
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
		card.deleteNode();
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
	 * Shuffles the cards in the deck by looping through (deckLength) times
	 * Taking a card from a random location in the deck and then placing it in the front or the back of the deck
	 * Current shuffle count is set to 100
	 */
	shuffle() {

		let shuffleCount = 100;

		for (let i = 0; i < shuffleCount; i++) {
			let takeOut = this.cards.splice([Math.floor(Math.random() * this.cards.length)], 1)[0];
			if (Math.floor(Math.random() * 2) == 0) {
				this.cards.unshift(takeOut);
			} else {
				this.cards.push(takeOut);
			}
		}
		console.log(this.cards);
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
		const cardNode = card.getNode();
		
		if(currentGameStage === Stage.Initializing && card.owner === human){
			const cardClone = cardNode.cloneNode(true);
			_modalPlayerHand.appendChild(cardClone);
		}
		
		this.node.appendChild(cardNode);
		

		// makes player-hand divs (cards) draggable, revert
		// to their initial space if not dropped in a droppable,
		// and snap to their target droppable
		if (card.owner === human) {
			$(cardNode).draggable({
				revert: "invalid",
				snap: true,
				start: function (event) {
					//Give the card some cool styling
					$(event.target).css('transform', 'translateY(0) scale(.75) perspective(750px) rotateX(25deg)');
					// Make a note of what card is being dragged.
					lastMove.draggedCard = card;
				},
				drag: function (event) {
				},
				stop: function (event) {
					// Stop dragging this card.
					lastMove.draggedCard = null;
					//Reset the styling:
					$(event.target).css('transform', '');
				}
			});
			card.node.classList.add("hover-grow")
		}
	}
	/**
	 * Removes a given card from the hand and returns it.
	 * 
	 * @param {Card} card The card to remove.
	 * @returns {Card} the card that was removed.
	 */
	remove(card) {
		if (card.owner === human) {
			$(card.getNode()).draggable("disable");
		}
		return this.cards.splice(this.cards.indexOf(card), 1)[0];
	}
	/**
	 * Removes a random card from the hand and returns it.
	 * @param {number} maxMana The maximum amount of mana the card is allowed to have.
	 * @returns {Card} a random card removed from the hand.
	 */
	random(maxMana) {
		/** @type {Card[]} An array of cards with a mana cost <= maxMana*/
		const playableCards = [];
		this.cards.forEach(card => {
			if (card.getCost() <= maxMana) {
				playableCards.push(card);
			};
		});
		// If there are no playable cards, someone did something wrong.
		if (playableCards.length === 0) {
			throw new Error("Hand.random() called when there were no playable cards. Please use Player.canPlayCard() to check before calling Hand.random().");
		}
		return this.remove(playableCards[Math.floor(Math.random() * playableCards.length)]);
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

	makePlayers();

	// Reset display of modal button and reject hand button inside modal
	_modalButton.style.display = "block";
	_rejectHandButton.style.display = "inline-block";

	// On click, deal 5 cards to the player
	// TODO: target modal pop-up #modal-player-hand
	_modalButton.addEventListener("click", () => {
		refillHand(human);
	})

	// When the hand is accepted, deal the enemy's cards, start the first round, hide the modal menu button
	_startButton.addEventListener("click", () => {
		refillHand(enemy);
		startFirstRound()
		_modalButton.style.display = "none";
		_endTurnButton.style.display = "block";
	})

	// When player rejects the hand, take away the option to reject the hand again, reject the first hand, start the game
	_rejectHandButton.addEventListener("click", () => {
		// _rejectHandButton.style.display = "none";
		rejectFirstHand();
	})
};

/**
 * Builds the two players as global variables.
 */
const makePlayers = () => {
	/** @type {Player} The human player. */
	window.human = buildHumanPlayer();

	/** @type {Player} The AI player */
	window.enemy = buildAIPlayer();
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
		/** @type {Battletrack} the nth battletrack. */
		const battletrack = new Battletrack(i, location);

		console.log(battletrack.location.imageURL);
		_allBattletracks[i].style.backgroundImage = `url(${location.imageURL})`;
		_btNames[i].textContent = location.displayName;
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
	const manaNode = _playerManaCount;

	/** @type {HTMLElement} The HTML that the player will append cards to in their hand. */
	const handNode = _playerHand;

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
	const manaNode = _enemyManaCount;

	/** @type {HTMLElement} The HTML that the player will append cards to in their hand. */
	const handNode = _enemyHand;

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
	const heroCards = normalize(heroStats, 1)
	const pokeCards = normalize(pokeStats, 1)
	let deckData = heroCards.concat(pokeCards)

	for (i = 0; i < deckData.length; i++) {
		const name = deckData[i]["name"];
		// TODO get art links for cards... Can easily be done w/ API but need to decide if that's what we want
		const art = deckData[i]["imgUrl"];
		// TODO need to decide on power curves for each stat & make mana value algorithm
		const cost = deckData[i]["cost"];
		const attack = deckData[i]["attack"];
		const defense = deckData[i]["defense"];
		const health = deckData[i]["health"];
		const speed = deckData[i]["speed"];

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

	// Delete all cards from the modal display
	for(let i = 0; i < _modalPlayerHand.children.length;){
		_modalPlayerHand.children[i].remove();
	}

	// Rebuild the player's hand.
	refillHand(human);
};

/**
 * After recieving their cards, the player will be presented with two buttons.
 * The first calls this function.
 */
const startFirstRound = () => {
	// Update the game state to allow the players to play cards.
	currentGameStage = Stage.Playing;
	roundSpan.textContent = 1
	let gameState = document.querySelector("#game-state")
	gameState.setAttribute("style", "display: flex;")

	// Set mana for both players to 1
	human.setMana(1);
	enemy.setMana(1);

	human.reinforcing = true;
	enemy.reinforcing = true;

	// If the player won the coinflip, they go first first round.
	if (humanGoesFirst && human.canPlayCard()) {
		currentPlayer = human;
	}
	else if (enemy.canPlayCard()) {
		currentPlayer = enemy;
		AI_playcard();
	}
	else {
		setTimeout( () => {
			endPlayCardStage();
		}, "2000")
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

		// remove hover-grow
		card.node.classList.remove("hover-grow")

		// Grow card on double click
		card.node.addEventListener("dblclick", function() {
			card.node.classList.add("grow")
			card.node.addEventListener("mouseleave", function(){
				card.node.classList.remove("grow")
			})
		})

		M.toast({
			html: `You played ${card.getDisplayName()}!`,
			classes: 'rounded positionToast'
		})
		// console.log("Human played ", card.getDisplayName());

		// If the AI can make a move
		if (enemy.canPlayCard()) {
			currentPlayer = enemy;
			AI_playcard();
		}
		// else if the player cannot make a move
		else if (!human.canPlayCard()) {
			setTimeout( () => {
				endPlayCardStage();
			}, "2000")
		}
	}
	else {
		const cardNode = card.getNode();
		const handNode = card.getOwner().getHand().node;
		if (cardNode.parentElement !== handNode) {
			hand.node.appendChild(cardNode);
		}
		cardNode.style.transform = "";
		cardNode.style.inset = "";
		cardNode.style.top = "";
		cardNode.style.bottom = "";
		cardNode.style.left = "";
		cardNode.style.right = "";
	}
};

/**
 * Called when the player presses the end turn button.
 */
const playerEndTurnEarly = () => {
	console.log("human skipped their turn.")
	// If the AI can make a move
	if (enemy.canPlayCard()) {
		currentPlayer = enemy;
		AI_playcard();
	} else {
		setTimeout( () => {
			endPlayCardStage();
		}, "2000")
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

	// Grow card on double click...ADD ROTATE 180
	cardToPlay.node.addEventListener("dblclick", function() {
		cardToPlay.node.classList.add("grow")
		cardToPlay.node.addEventListener("mouseleave", function(){
			cardToPlay.node.classList.remove("grow")
		})
	})

	/** @type {Battletrack[]} An array of all the battletracks that are no conquered and also have less than 4 cards in play. */
	const validBattletracks = [];

	battletracks.forEach(battletrack => {
		if (!(battletrack.isConquered()) && battletrack.getEnemyCards().length < maxCardsPerBattleline) {
			validBattletracks.push(battletrack);
		}
	});

	const isABattletrackTargetable = validBattletracks.length !== 0;

	//There are targetable battletracks.
	if (isABattletrackTargetable) {
		// Pick a random battletrack that is not conquored.
		/** @type {Battletrack} A random unconquered battletrack. */
		const battletrack = validBattletracks[Math.floor(Math.random() * validBattletracks.length)];

		// Play the random card to the random battletrack.
		battletrack.playEnemyCard(cardToPlay);

		// Reduce AI mana by card cost
		enemy.setMana(mana - cardToPlay.getCost());

		M.toast({
			html: `AI played ${cardToPlay.getDisplayName()}!`,
			classes: 'rounded positionToast'
		})
		// console.log("Ai played ", cardToPlay.getDisplayName());
	}

	// If the player can make a move.
	if (human.canPlayCard()) {
		// Set the current player to the human player
		currentPlayer = human;
	}
	// Else if the AI can make a move.
	else if (enemy.canPlayCard() && isABattletrackTargetable) {
		// Recursively call this function.
		AI_playcard();
	}
	// Else if no one can make a move.
	else {
		setTimeout( () => {
			endPlayCardStage();
		}, "2000")
	}
};

/**
 * Called after the player and the ai cannot play any more cards.
 */
const endPlayCardStage = () => {
	
	M.toast({
		html: `Ending PLAY step!`,
		classes: 'rounded fifties-toast'
	})
	
	// console.log("No more cards can be played. Beginning actions.");HEREHERE
	phaseSpan.textContent = "Combat"
	playerHeadHand.setAttribute("style",  "box-shadow: ''")

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
	});

	// Sort cardsToAct by speed
	cardsToAct.sort((a, b) => {
		const aSpeed = a.getSpeed();
		const bSpeed = b.getSpeed();
		// A is faster.
		if (aSpeed > bSpeed) {
			// A should be left of B
			return +1;
		}
		// B is faster.
		else if (bSpeed > aSpeed) {
			// B should be left of A
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

			const isAHuman = aOwner === human;

			// If the round is odd and the human won the coin flip
			// or
			// if the round is even and the human did not win the coin flip
			const doesHumanHavePriority = (currentRound % 2 !== 0 && humanGoesFirst) || (!humanGoesFirst && currentRound % 2 === 0);

			// Human has priority
			if(doesHumanHavePriority) {
				if(isAHuman) {
					// A should be left of B
					return +1;
				}
				else /*A is enemy*/ {
					// B should be left of A
					return -1;
				}
			}
			// AI Has priority
			else {
				if(isAHuman) {
					// B should be left of A
					return -1;
				}
				else /*A is enemy*/ {
					// A should be left of B
					return +1;
				}
			}
		}
	});
	// console.log("Current round:", currentRound);
	// console.log(humanGoesFirst ? "Human won coin flip." : "Enemy won coin flip.");
	// for(let i = cardsToAct.length - 1; i >= 0; --i) {
	// 	const card = cardsToAct[i];
	// 	console.log(`${i}:\nSpeed: ${card.getSpeed()}\nOwner: ${card.getOwner() === human ? "Human" : "Enemy"}`);
	// }
	letNextCardDoAction();
};

/**
 * Called after the active card has performed its action.
 */
const letNextCardDoAction = () => {
	if (activeCards.length === 0) {
		// If there are no more cards to process, we are done.
		if (cardsToAct.length === 0) {
			setTimeout( () => {
				endRound();
			}, "5000")
			// Return to exit this function early.
			return;
		}

		/** @returns {number} the speed of the next card on the cardsToAct stack. */
		const nextSpeed = () => cardsToAct[cardsToAct.length - 1].getSpeed();

		/** @returns {Player} the owner of the next card on the cardsToAct stack. */
		const nextOwner = () => cardsToAct[cardsToAct.length - 1].getOwner();

		/** @type {number} The speed of the first card popped from the stack. */
		const speed = nextSpeed();

		/** @type {Player} The owner of the first card popped from the stack. */
		const owner = nextOwner();

		// Pop cardsToAct and add it to the active card array
		do {
			/** @type {Card} The next card to act. */
			const nextCard = cardsToAct.pop();
			// Add it to the active cards.
			activeCards.push(nextCard);
			// Give the player the power to drag the card.
			if (nextCard.getOwner() === human) { addDraggableToNextPlayerCard(nextCard); }
		} while (cardsToAct.length > 0 && nextSpeed() === speed && nextOwner() === owner);
	}
	if (activeCards[0].owner === human) {
		// Set active human card glow
		activeCards[0].node.setAttribute("style",  "box-shadow: 3px -3px 5px lightgreen, 3px 3px 5px lightgreen, -3px -3px 5px lightgreen, -3px 3px 5px lightgreen;")

		let targetableBattleTrack = activeCards[0].getBattleline().getBattletrack().targetableNode
		let targetableCards = activeCards[0].getBattleline().getBattletrack().enemyBattleline.cards
		targetableBattleTrack.setAttribute("style",  "box-shadow: 3px -3px 5px red, 3px 3px 5px red, -3px -3px 5px red, -3px 3px 5px red;")
	
		for (i = 0; i < targetableCards.length; i++) {
			targetableCards[i].node.setAttribute("style",  "box-shadow: 3px -3px 5px red, 3px 3px 5px red, -3px -3px 5px red, -3px 3px 5px red;")
		}
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

	console.log("AI is ordering", activeCard.getDisplayName(), 'to attack', target instanceof Battleline ? "battleline" : target.getDisplayName());

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
	//console.log("The player is trying to attack:", defender, ", with attacker:", card);
	// resets the box shadow after attack action has been made
	card.node.setAttribute("style", "box-shadow: ''")
	card.getBattleline().getBattletrack().targetableNode.setAttribute("style", "box-shadow: ''")
	let targetableCards = card.getBattleline().getBattletrack().enemyBattleline.cards
	for (i = 0; i < targetableCards.length; i++) {
		targetableCards[i].node.setAttribute("style",  "box-shadow: ''")
	}
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
		// console.log(attacker.getDisplayName(), "is attacking", defender instanceof Battleline ? "battleline" : defender.getDisplayName());
	/** @type {number} The attack value of the attacking card. */
	const attack = attacker.getAttack();

	/** @type {number} The defense value of the defending card/battleline. */
	const defense = defender.getDefense();

	/** @type {number} The amount of damage to deal to the defender. */
	// Calculate damage as offender's attack minus defender's defense
	const damage = Math.max(1, attack - defense);

	// Reduce the defender's health by the damage.
	defender.damage(damage);

	M.toast({
		html: `${attacker.getDisplayName()} attacked ${defender instanceof Battleline ? "battleline" : defender.getDisplayName()} (${damage} dmg)`,
		classes: 'rounded positionToast'
	})

	// If defender is a card
	if (defender instanceof Card) {
		// If the defender dies
		if (defender.getCurrentHitpoints() === 0) {
			console.log("defender dies")
			// Kill the card. This function takes care of all the disposal.
			defender.die();
		} else if (defender.currentHitpoints < defender.totalHitpoints && defender.currentHitpoints > 1) {
			defender.node.children[2].children[1].setAttribute("style", "background-color: orange")
		} else if (defender.currentHitpoints <= 1) {
			defender.node.children[2].children[1].setAttribute("style", "background-color: red")
		}
	}
	// Else if the defender is the battleline
	else {
		// If the battletrack dies
		if (defender.getHitpoints() === 0) {
			console.log("battletrack is conquored")
			/** @type {Player} the player that owns the attacking card. */
			const player = attacker.getOwner();
			// Increment the player's conquered tracks stat.
			player.conquer();
			// Destroy all cards on this battletrack
			defender.getBattletrack().conquer();
			// If the player whom defeated this battletrack has defeated two battletracks.
			if (player.conquered === 2) {
				// End the game
				endGame();
				return true;
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
	M.toast({
		html: `Round ${currentRound} Over<br>Round ${++currentRound} Beginning`,
		classes: 'rounded fiftiesToast'
	})

	roundSpan.textContent = currentRound

	// M.toast({
	// 	html: `Round ${currentRound} Beginning`,
	// 	classes: 'rounded fiftiesToast'
	// })
	// console.log("new round beginning:", currentRound);

	// Set mana for both players to round number
	// Refresh both players mana, awarding an extra 2 if they spent no mana last round.
	human.setMana(currentRound + (human.isReinforcing() ? 2 : 0));
	enemy.setMana(currentRound + (enemy.isReinforcing() ? 2 : 0));

	console.log("human mana:", human.mana);

	human.reinforcing = true;
	enemy.reinforcing = true;

	// Refresh both hands with new cards
	refillHand(human);
	refillHand(enemy);

	// Update the game state to allow the players to play cards.
	currentGameStage = Stage.Playing;

	// If the player won the coinflip, they go first on even numbered rounds
	if (
		((humanGoesFirst && currentRound % 2 !== 0) || (!humanGoesFirst && currentRound % 2 === 0))
		&& human.canPlayCard()) {
		currentPlayer = human;
	}
	else if (enemy.canPlayCard()) {
		currentPlayer = enemy;
		AI_playcard();
	}
	else {
		setTimeout( () => {
			endPlayCardStage();
		}, "2000")
	}
};

/**
 * This is called once a player has defeated two battletracks.
 */
const endGame = () => {
	console.log("game over");
	endGameModal.open()
	// Update the game state prevent the players from doing anything and reappear start button
	currentGameStage = Stage.Over;
	_modalButton.style.display = "block";
	_endTurnButton.style.display = "none";

	// If the human won.
	if (human.isWinner()) {
		// Advance player win counter
		human.addWin();
		_endgameModalDisplay.textContent = "You win! :)";
	}
	// If the enemy won.
	else if (enemy.isWinner()) {
		// Advance enemy win counter
		enemy.addWin();
		_endgameModalDisplay.textContent = "You lose! :(";
	}
	// If something forced the game to end early.
	else {
		_endgameModalDisplay.textContent = "You've conceded :(";
	}
	// Display victory or failure screen/animation
	// TODO: add an endgame screen or page to show.

};

/**
 * Function to track last move when a player card is clicked.
 * Tracks: Player card, card ID, card class names, 3 dataset attrs: str, hp, speed, and a successfullyPlaced bool
 * successfullyPlaced updates on successful droppable drop
 */
const trackLastMove = (event) => {
	window.lastMove.targetCard = event.target;
	window.lastMove.targetCardId = event.target.id;
	window.lastMove.targetCardClassname = event.target.className;
	window.lastMove.successfullyPlaced = false;
}

/**
 * @param {Card} nextCard The next card that the player can play.
 */
const addDraggableToNextPlayerCard = nextCard => {
	/** @type {Card[]} The cards that can be attacked by the active card. */
	const enemyCards = nextCard.getBattleline().getBattletrack().getEnemyBattleline().cards;
	/** @type {HTMLElement} */
	const nextCardNode = nextCard.getNode();
	/** @type {HTMLElement} The battletrack. */
	const battletrack = nextCard.getBattleline().getBattletrack();

	let isDragging = false;
	$(nextCardNode).draggable({
		revert: true,
		start: function (event) {
			//Give the card some cool styling
			$(event.target).css('transform', 'translateY(0) scale(.75) perspective(750px) rotateX(25deg)');

			//Add the droppables
			enemyCards.forEach(enemyCard => {
				addDroppableToEnemyCard(enemyCard, nextCard);
			});

			addDroppableToBattletrack(battletrack, nextCard);
			isDragging = true;
		},
		drag: function (event) {
		},
		stop: function (event) {
			if(isDragging) {
				lastMove.draggedCard = null;

				//Reset the styling:
				$(event.target).css('transform', '');
				isDragging = false;
			}
		}
	});
	$(nextCardNode).draggable("enable");
};

/**
 * @param {Card} enemyCard The enemy card that is attackable.
 * @param {Card} cardThatWouldAttack The player card that would perform this attack.
 */
const addDroppableToEnemyCard = (enemyCard, cardThatWouldAttack) => {
	$(enemyCard.getNode()).droppable({
		tolerance: "pointer",
		// If the enemy was not killed by this attack
		drop: function (event, ui) {
			$(cardThatWouldAttack.getNode()).draggable("disable");

			// The player is ordering nextCard to attack enemyCard
			playerTryAttack(cardThatWouldAttack, enemyCard);
		},
	});
	$(enemyCard.getNode()).droppable("enable");
};

/**
 * @param {Battletrack} battletrack The battletrack card that is attackable.
 * @param {Card} cardThatWouldAttack The player card that would perform this attack.
 */
const addDroppableToBattletrack = (battletrack, cardThatWouldAttack) => {
	$(battletrack.getTargetable()).droppable({
		tolerance: "pointer",
		drop: function (event, ui) {
			// Causeing a crash sometimes
			console.log(cardThatWouldAttack);
			$(cardThatWouldAttack.getNode()).draggable("disable");

			playerTryAttack(cardThatWouldAttack, battletrack.getEnemyBattleline());
		},
	});
	$(battletrack.getTargetable()).droppable("enable");
};

/**
 * This has to be a seperate function because Javascript function definitions capture by reference, not copy.
 * @param {Battletrack} battletrack The battletrack this lane is on.
 * @param {HTMLElement} battlelineNode The Element to put the draggable on.
 */
const addDroppableToBattleline = (battletrack, battlelineNode) => {
	// Makes the zone accept draggables
	$(battlelineNode).droppable({
		classes: {
			"ui-droppable-active": "ui-state-active",
			"ui-droppable-hover": "ui-state-hover"
		},
		tolerance: "pointer",
		// on drop, check if player-card box is full, if not, updated lastMove.successfullyPlaced global var, capture
		// which battletrack it was dropped on, and the index that the card is in the player-card box
		// then append a new div with the same attributes to the player-card box
		// remove the lastMove.targetCard from the DOM
		drop: function (event, ui) {
			/** @type {Card} */
			const card = window.lastMove.draggedCard;
			if (card != null) {
				playerTryPlayCard(card, battletrack);
			}
			// if (this.children.length < 4) {
			// 	// window.lastMove.successfullyPlaced = true;
			// 	// window.lastMove.droppedBattletrackID = $(event.target).parent()[0].id;
			// 	// window.lastMove.droppedIndex = this.children.length;
			// 	// card.getOwner().getHand().remove();
			// 	// /** @type {HTMLElement} The card's node. */
			// 	// const cardNode = card.getNode();
			// 	// //Append it to the box
			// 	// $(this).append($(cardNode));
			// }

			// //
			// if (this.children.length == 4) {
			// 	$(this).droppable("disable");
			// } else {
			// 	$(this).droppable("enable");
			// }

			$(this).css('background-color', 'rgba(255, 255, 255, .2');
		},
		accept: function (draggable) {
			return currentPlayer === human;
		},
		over: function (event) {
			if ($(event.target).children.length < 4) {
				$(event.target).droppable("enable");
				$(this).css('background-color', 'rgba(255, 255, 255, .5');
			}
		},
		out: function () {
			$(this).css('background-color', 'rgba(255, 255, 255, .2')
		}
	});
};

//#endregion

//#region GLOBAL VARIABLES

// create global lastMove object to track across different jQuery event listeners
window.lastMove = {
	pickupIndex: 0,
	targetCard: 0,
	targetCardId: 0,
	targetCardClassname: 0,
	droppedBattletrackID: 0,
	droppedIndex: 0,
	successfullyPlaced: false,
	draggedCard: null,
};

//#region HTML NODES
// GAME LEVEL
/** @type {HTMLElement} The concede button.  */
const _concedeButton = document.querySelector("#concede-button");

/** @type {HTMLElement} The modal button.  */
const _modalButton = document.querySelector("#modal-button");

/** @type {HTMLElement} The start button.  */
const _startButton = document.querySelector("#start-button");

/** @type {HTMLElement} The reject hand button.  */
const _rejectHandButton = document.querySelector("#reject-hand-button");

/** @type {HTMLElement} The end turn hand button.  */
const _endTurnButton = document.querySelector("#end-turn-button");

/** @type {HTMLElement} The end game modal display.  */
const _endgameModalDisplay = document.querySelector("#modal-endgame-display");

/** @type {HTMLElement} The modal player hand.  */
const _modalPlayerHand = document.querySelector("#modal-player-hand");

// BATTLETRACK VARS
/** @type {HTMLElement[]} Array of all battletracks  */
const _allBattletracks = document.querySelectorAll(".battletrack");

/** @type {HTMLElement[]} Array of battletrack names elements. */
const _btNames = document.querySelectorAll(".location-text");

/** @type {HTMLElement[]} Array of battletrack enemy HP containers -> div = progress bar, span = count */
const _btEnemyHp = document.querySelectorAll(".bt-enemy-hp");

/** @type {HTMLElement[]} Array of battletrack player HP containers -> div = progress bar, span = count */
const _btPlayerHp = document.querySelectorAll(".bt-player-hp");

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
	new Location("Wakanda", "../assets/images/backgrounds/location-wakanda.png"),
	new Location("New York", "../assets/images/backgrounds/location-new-york.png"),
	new Location("Asgard", "../assets/images/backgrounds/location-asgard.png"),
	new Location("S.H.I.E.L.D. 2.0", "../assets/images/backgrounds/location-shield-2_0.png"),
	new Location("Dark Dimension", "../assets/images/backgrounds/location-dark-dimension.png"),
	new Location("Kingpin's Mansion", "../assets/images/backgrounds/location-kingpins-mansion.png"),
	new Location("Joker's Lair", "../assets/images/backgrounds/location-jokers-lair.png"),
	new Location("Arkham Asylum", "../assets/images/backgrounds/location-arkham-asylum.png"),
	new Location("Speed Force", "../assets/images/backgrounds/location-speed-force.png"),
	new Location("Krypton", "../assets/images/backgrounds/location-krypton.png"),
	new Location("Luthor Corp.", "../assets/images/backgrounds/location-luthor-corp.png"),
	new Location("Shooting Range", "../assets/images/backgrounds/location-shooting-range.png"),
	new Location("Poke-Arena!", "../assets/images/backgrounds/location-poke-arena.png"),
	new Location("Poke-Cave!", "../assets/images/backgrounds/location-poke-cave.png"),
	new Location("Ashe's Home", "../assets/images/backgrounds/location-ashes-home.png"),
	new Location("Poke-Infirmary!", "../assets/images/backgrounds/location-infirmary.png"),
	new Location("Poke-Beach!", "../assets/images/backgrounds/location-poke-beach.png"),
	new Location("Poke-City!", "../assets/images/backgrounds/location-poke-city.png")
];

/** @type {Stage} The current state of the game. */
let currentGameStage = Stage.Initializing;

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

/** @type {number} The maximum amount of cards that can be played to a battleline. */
const maxCardsPerBattleline = 4;

//#endregion

//#region EVENT LISTENERS

let endGameModal;
let tutorialModal;

document.addEventListener('DOMContentLoaded', function () {
	let elements = document.querySelectorAll('.modal');
	M.Modal.init(elements, {
		dismissible: false
	});

	endGameModal = M.Modal.getInstance(elements[1]);
});

document.addEventListener('DOMContentLoaded', function () {
	let element = document.querySelector('#tutorial');
	M.Modal.init(element, {
		dismissible: false,
	});

	tutorialModal = M.Modal.getInstance(element);
	tutorialModal.open()
	let count = 1
	// TODO save to localStorage and check that
});

document.addEventListener('DOMContentLoaded', function () {
	let elem = document.querySelector('#menu-button');
	M.Dropdown.init(elem, {
		hover: true
	});
});

_endTurnButton.addEventListener("click", (event) => {
	event.preventDefault();
	if (currentGameStage == Stage.Playing) {
		playerEndTurnEarly();	//skip having to play a card
	}
})

_concedeButton.addEventListener("click", endGame);
//#endregion
