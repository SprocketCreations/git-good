// initializing an empty deck that can be added to on fetch completion. Need to call `getDeck()` to populate.
var deck = []
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

// Called when you want to populate the deck with the chosen characters
function getDeck() {
        normalize(heroStats,1)
        normalize(pokeStats, 1.5)
        return deck
}