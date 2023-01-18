# git-good
Class project

### About
Git-Good is a strategy lane-based card game that pulls data via fetch requests to the pokemon-API and the akabab-superhero-API. Cards data from each API is min-max normalized and scaled to match desired stat maxima for health, attack, defense, and speed. Javascript constructors were used to create instances of players, hands, battletracks/locations, and cards.

Live application: https://sprocketcreations.github.io/git-good/arena/

### Gameplay
Gameplay is executed in rounds, and rounds are split into two phases:
1. Play
2. Combat
<br /><br />
Play: During the play phase, players take turns playing cards into any battletrack. Once one player plays a card, the next player is given the option to play a card. This continues until both players are unable to, or don't want to, play any more cards this round. 
<br /><br />
Combat: During the combat phase, cards are assigned initiative based on their speed stat. Each player is then prompeted to execute a card action (currently limited to attacks) for each of their cards, in order of card initiative.
<br /><br />
After combat, the current round ends and a new round begins. Players enter each new round with an additional mana crystal, and the play phase for that round is initiated.

### Tutorial Gif

![alt-text](./assets/gif/arena.gif)

### Contributers
Andy Gaudy ([maximusDecimalusMeridius](https://github.com/maximusDecimalusMeridius)) <br />
Kailen James ([SprocketCreations](https://github.com/SprocketCreations)) <br />
Lukas MacMillen ([agtTwilight](https://github.com/agtTwilight)) <br />
