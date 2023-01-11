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
	// Over

/* *** Card Type *** */
	// Pokemon
	// Superhero

// Object Definitions
/* ___ Player ___ */
	// mana : number
	// deck : deck
	// hand : hand

/* ___ Battletrack ___ */
	// defeated : boolean
	// enemy_health : number
	// friendly_health : number
	// friendly cards : array
	// enemy cards : array
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
	// Define the game's stage as a global *game stage enum
	// Determin turn order at random, 50 - 50 for each player
	// /Initialize the tracks
	// /Initialize the decks

/**
 * Configures the tracks.
 */
/* === Initialize the tracks === */
	// Define an array of 18 locations
	// Create 3 _battletracks
	//START// For each track:
		// Add a random location
		// If that location is already used by one of the other tracks, try again
		// Link the _battletrack to its dom node
	//END//

/**
 * Constructs the decks at random.
 * Will later pull from localStorage to build decks.
 */
/* === Initialize the Decks === */
	//START// Do the following for the player and the AI
		// Define the API ids as an array
		// Pick a random 40 to be in the _deck
		// Fetch the data for those 40 and store it in a _card in the player's _deck
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
	// Attach the _card dom node to the _hand dom node

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
	// Define current round as a global number starting at 1
	// /Start next round

/**
 * Called at the start of every round.
 * Initializes and resets the palyers
 */
/* === Start next round === */
	// Set mana for both _players to round number
	//START// For each player, until they have 5 cards
		// /Draw card
	//END//
	// Set current battltrack to 0
	// /Advance battletrack

/**
 * Called when the battletrack has been resolved, or a new round is starting
 */
/* === Advance battletrack === */
	// Set current battletrack to current battletrack + 1
	// if current battletrack is greater than 3
		// /Start next round
	//START// else
		//START// If current battletrack is defeated
			// Recursion baby
			// /Advance battletrack
		//END//
		//START// else
			// Change focused battletrack to current battletrack
			// Set current stage to *playing
			// If the AI got turn priority
			// /AI play card
			// else
			// Set player turn
		//END//
	//END//

/**
 * Called when a player tries to drag a card from their hand to a battletrack.
 */
/* === Play card === */
	// If the stage is *playing
	// If it is the player's turn
	// If this is the active battletrack
	// Removes a given _card from the _hand, and adds it to the _battletrack
	//START// If the AI can make a move
		// Ends the player's turn
		// /AI play card
	//END//
	//START// else if the player cannot make a move
		// /End play card stage
	//END//

/**
 * Called when the player presses the end turn button.
 */
/* === End turn early === */
	//START// If the AI can make a move
		// Ends the player's turn
		// /AI play card
	//END//
	//START// else
		// /End play card stage
	//END//

/**
 * Ideally all the AI logic will be stuck in some AI object that
 * can use a behaviour tree and state machine to decide actions,
 * but this will work for now.
 */
/* === AI play card === */
	// Pick a random _card from _hand that can be played
	// /Play card
	//START// If the player can make a move
		// Ends the ai's turn
	//END//
	//START// else if the AI cannot make a move
		// /End play card stage
	//END//

/**
 * Called after the player and the ai cannot play any more cards.
 */
/* === End play card stage === */
	// Set stage to *action
	// Define cards to act as a global array
	// Add all the _cards from the active _battletrack to cards to act
	// Sort by speed
	// /Let next card action

/**
 * Called after the active card has performed its action.
 */
/* === Let next card action === */
	// If there are no more cards to perform actions
		// /Advance battletrack
	//START// else
		// Pop the fastest card and set it to the active card
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
	// If the battletrack is active
	// If this card is the active card
	// /Attack
	// /Let next card action


/**
 * Run whenever the player or ai decides to perform an attack action
 */
/* === Attack === */
	// caluclate damage as offender's attack minus defender's defense
	//START// if defender is a _card
		// reduce defender's health by damage
		//START// If defender dies
			// Remove defender from battletrack
			// Add _card back to owner's deck at a random position
			// Play death animation
			// Set timeout to destroy card DOM node after animation is done
		//END//
	//END//
	//START// else if the defender is the battletrack
		// reduce the battletrack's health by damage
		//START// If the battletrack dies
			// If this is the second battletrack defeated
			// /End game
			// else
			// /Advance battletrack
		//END//
	//END//

/**
 * This is called once a player has defeated two battletracks.
 */
/* === End game === */
	// Set stage to *Over
	// Display victory or failure screen/animation