/**
 * Comments are organized like code.
 * any text prefixed with * is an enum
 * any comment starting with one / represents calling pseudo-code elsewhere in this file
 * any text prefixed with _ is a custom type, defined below
 */

// Enum Definitions
/* *** Game Stage *** */
	// Initializing
	// Playing
	// Action
	// Waiting
	// Over

/* *** Card Type *** */
	// Pokemon
	// Superhero

// Object Definitions
/* ___ Player ___ */
	// wins : number
	// mana : number
	// deck : deck
	// hand : hand

/* ___ Battletrack ___ */
	// enemy_health : number
	// friendly_health : number
	// friendly cards : array
	// enemy cards : array
	// getter for defense : number
	// location
	// dom node

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

// Function Definitions
/**
 * Run on page load.
 * Calls all the functions needed to set up the game board.
 */
/* === On game start === */
	// Define game state as global *Initializing
	// Define the player as a global _player object
	// Define the enemy as a global _player object
	// Define battletracks as a global _battletrack array
	// Determin turn order at random, 50 - 50 for each player
	// Winner of the coin flip will go on odd numbered rounds
	// Loser will go on even numbered rounds
	// /Initialize the tracks
	// /Initialize the decks

/**
 * Configures the tracks.
 */
/* === Initialize the tracks === */
	// Define an array of 18 locations
	//START// For 3 battletracks:
		// Create a _battletrack by
		// Adding a random location
		// If that location is already used by one of the other _battletracks, try again
		// Link the _battletrack to its dom node
		// Add this battletrack to the global array of battletracks
	//END//

/**
 * Constructs the decks at random.
 * Will later pull from localStorage to build decks.
 */
/* === Initialize the Decks === */
	//START// Do the following for the player and the AI
		// Define the API ids as an array
		// Get the ids of the curated 45 cards
		// Fetch the data for those 45 and store it in a _card in the player's _deck
		// /Build the starter hand
	//END//

/**
 * Containered code for handling the drawing of cards from the deck to be in the player's hand
 */
/* === Build the starter hand (do for both player and ai) === */
	// Shuffle the _deck via some algorithm stolen from online
	//START// Do the following 5 times
		// /Draw card
	//END//

/**
 * Handles creating a card.
 */
/* === Draw card === */
	// Pop the top _card from the _deck and add it to the _hand
	// /Build card dom node
	// Link the DOM node to the _card
	// Append the _card dom node to the _hand dom node

/**
 * Creates a dom node for a card
 */
/* === Build card dom node === */
	// Clone the card template
	// Fill in the stats on the fragment
	// Set the background art on the fragment
	// Return the fragment

/**
 * After recieving their cards, the player will be presented with two buttons.
 * The second calls this function.
 */
/* === Reject first hand === */	
	// Put the hand cards back into the deck and destroy their DOM reps
	// /Build the starter hand

/**
 * After recieving their cards, the player will be presented with two buttons.
 * The first calls this function.
 */
/* === Start first round === */
	// Define current player as a reference to the enemy player
	// Define current round as a global number starting at 1
	// Set game stage to *Playing
	// Set mana for both players to 1
	// If the player won the coin flip, and the round number is odd
	// Set current player to player
	// else
	// /AI play card

/**
 * Called when a player tries to drag a card from their hand to a battletrack.
 */
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

/**
 * Called when the player presses the end turn button.
 */
/* === End turn early === */
	//START// If the AI can make a move
		// Set current player to the enemy
		// /AI play card
	//END//
	//START// else
		// /End play card stage
	//END//

/**
 * Function to play a card from a hand to a battleline
 */
/* === Play card === */
	// Removes a given _card from the given _hand
	// Adds the given _card to the given _battletrack
	// Appends the given _card node to the given _battletrack node

/**
 * Ideally all the AI logic will be stuck in some AI object that
 * can use a behaviour tree and state machine to decide actions,
 * but this will work for now.
 */
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

/**
 * Called after the player and the ai cannot play any more cards.
 */
/* === End play card stage === */
	// Set stage to *action
	// Define "cards to act" as a global array
	// Add all the _cards from all the unconquored _battletracks to "cards to act"
	// Sort "cards to act" by speed
	// /Let next card action

/**
 * Called after the active card has performed its action.
 */
/* === Let next card action === */
	// If "cards to act" is empty
		// /End round
	//START// else
		// Pop "cards to act" and set it to the active card
		// If the card is owned by the AI
		// /AI card action
	//END//

/**
 * Run whenever a card controlled by the AI gets to perform an action.
 */
/* === AI card action === */
	// Pick a random enemy card
	// Order active card to /Attack
	// /Let next card action

/**
 * Called when the player orders a card to perform an attack.
 */
/* === Player card attack === */
	// If the stage is *action
	// If this card is the active card
	// If the target card is in the same _battletrack as this card
	// /Attack
	// /Let next card action

/**
 * Run whenever the player or ai decides to perform an attack action
 */
/* === Attack === */
	// caluclate damage as offender's attack minus defender's defense
	//START// if defender is a _card
		// reduce defender's health by damage minus defenders defense to minumum of 1
		//START// If defender dies
			// Remove defender from battletrack
			// destroy card DOM node
		//END//
	//END//
	//START// else if the defender is the battletrack
		// reduce the battletrack's health by damage minus battletrack defense
		//START// If the battletrack dies
			// If the player whom defeated this battletrack has already defeated a battletrack
			// /End game
			// else
			// Destroy all cards on this battletrack
		//END//
	//END//

/**
 * Called at the end of every round.
 * Initializes and resets the players
 */
/* === End round === */
	// Set mana for both _players to round number
	//START// For each player, until they have 5 cards
		// /Draw card
	//END//

/**
 * This is called once a player has defeated two battletracks.
 */
/* === End game === */
	// Set stage to *Over
	// If player won
	// Advance player win counter
	// elseif ai won
	// Advance enemy win counter
	// Display victory or failure screen/animation