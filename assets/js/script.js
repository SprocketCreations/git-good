// Fetch request for POKE API data
const pokeUrl = "https://pokeapi.co/api/v2/pokemon?limit=1279"
var pokeNames = []
var pokeStats = []

// This function gets all pokemon names for stat collection
fetch(pokeUrl)
.then(function(response) {
        console.log(response);
        response.json().then(function (data) {
                for (i = 0; i < data.count; i ++) {
                        pokeNames.push(data.results[i].name)
                }
        });
})

// This functions gets all of our pokemon stats
function test() {
        for(i = 0; i < pokeNames.length; i ++) {
                var pokeName = pokeNames[i]
                var pokeNameUrl = `https://pokeapi.co/api/v2/pokemon/${pokeName}`
                fetch(pokeNameUrl)
                        .then(function(response) {
                                response.json().then(function(data) {
                                        // API data output: [{base_stat:x, stat:{name:hp}}, {base_stat:x, stat:{name:attack}}, {base_stat:x, stat:{name:defense}}, {base_stat:x, stat:{name:special-attack}}, {base_stat:x, stat:{name:special-defense}}, {base_stat:x, stat:{name:speed}}].
                                        let obj = {}
                                        // Convert API data to: {hp:x, attack:x, defense:x, special-attack:x, special-defense:x, speed:x}
                                        for (i = 0; i < data.stats.length; i++) {
                                                obj[data.stats[i].stat.name] = data.stats[i].base_stat
                                        }
                                        pokeStats.push(obj)
                                })
                        })
        }
} 
        
        // Fetch request for SUPERHERO API data
const heroUrl = "https://akabab.github.io/superhero-api/api/all.json"
var heroStats = []

// This fetch gets all our hero stats
fetch(heroUrl)
.then(function(response) {
        console.log(response);
        response.json().then(function (data) {
                for (i = 0; i < data.length; i++){
                        // Appends stat object to array. Each index as follows: {intelligence:x, strength:x, speed:x, durability:x, power:x, combat:x}
                        heroStats.push(data[i].powerstats)
                }
        });
})

// Normalize Function(health, attack, speed)