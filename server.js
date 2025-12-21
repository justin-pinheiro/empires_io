const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const MAP_SIZE = 10;
const BUILD_COUNTDOWN = 5
const ARMY_COUNTDOWN = 1; 
const REBUILD_COUNTDOWN = 3; 
const BARBARIAN_SPAWN_COUNTDOWN = 30;
const BARBARIAN_ATTACK_COUNTDOWN = 2;

BARBARIAN_ID = 'BARBARIAN_NPC';

const TERRAIN_RULES = {
    farm:   ['plains', 'forest'],
    mine:   ['mountain', 'desert'],
    market: ['plains', 'desert'],
    house:  ['plains', 'forest', 'desert'],
    camp:   ['plains', 'forest', 'desert'],
    tower:  ['plains', 'forest', 'desert'],
    capital:['plains', 'forest', 'desert'],
    barbarian_camp: ['plains', 'forest', 'desert', 'mountain'],
};

const BUILDING_HP = {
    capital: 90,
    tower: 45,
    mine: 30,
    farm: 18,
    market: 30,
    camp: 36,
    house: 18,
    empty: 0,
    barbarian_camp: 30
};
// Costs for constructing buildings. 'pop' is population cost, other fields consume resources.
const BUILDING_COSTS = {
    farm: { pop: 0, food: -2, gold: 0, stone: 0 },
    mine: { pop: 0, food: 0, gold: 0, stone: -1 },
    market: { pop: 0, food: 0, gold: -1, stone: 0 },
    house: { pop: -3, food: 1, gold: 0, stone: 0 }, // houses do not cost pop, only food
    camp: { pop: 0, food: 0, gold: 1, stone: 0 },
    tower: { pop: 0, food: 0, gold: 0, stone: 1 },
    capital: { pop: 0, food: 0, gold: 0, stone: 0 },
    barbarian_camp: { pop: 0, food: 0, gold: 0, stone: 0 }
};
const REWARD = {
    farm: { pop: 0, food: 2, gold: 0, stone: 0 },
    mine: { pop: 0, food: 0, gold: 0, stone: 1 },
    market: { pop: 0, food: 0, gold: 1, stone: 0 },
    house: { pop: 2, food: 0, gold: 0, stone: 0 }, // houses do not cost pop, only food
    camp: { pop: 0, food: 0, gold: 0, stone: 0 },
    tower: { pop: 0, food: 0, gold: 0, stone: 0 },
    capital: { pop: 0, food: 0, gold: 0, stone: 0 },
    barbarian_camp: { pop: 0, food: 0, gold: 0, stone: 0 }
};
let worldMap = {};
let players = {}; 
let armyCountDown = 0;
let rebuildCountDown = 0;
let barbarianSpawnCountDown = BARBARIAN_SPAWN_COUNTDOWN;
let barbarianAttackCountDown = BARBARIAN_ATTACK_COUNTDOWN;
let waveNumber = 0; // counts waves for notifications

// build cooldown for players is stored in players[id].buildCountDown (seconds)

// Initialize the Barbarian player object
players[BARBARIAN_ID] = {
    color: '#000000', // Black
    army: 999, // Infinite army for attacks
    buildings: { barbarian_camp: 0 }
};

function initMap() {
    // Define weights (higher number = more frequent)
    const weights = {
        plains: 60,   // Common
        forest: 20,   // Uncommon
        desert: 10,   // Rare
        mountain: 10, // Very Rare
        water: 5     // Very Rare
    };

    // Create a "weighted deck" to pull from
    const weightedTypes = [];
    for (let type in weights) {
        for (let i = 0; i < weights[type]; i++) {
            weightedTypes.push(type);
        }
    }

    for (let q = -MAP_SIZE; q <= MAP_SIZE; q++) {
        let r1 = Math.max(-MAP_SIZE, -q - MAP_SIZE);
        let r2 = Math.min(MAP_SIZE, -q + MAP_SIZE);
        for (let r = r1; r <= r2; r++) {
            // Pick randomly from the weighted array
            const terrain = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
            
            worldMap[`${q},${r}`] = { 
                owner: null, 
                type: 'empty', 
                terrain: terrain,
                hp: BUILDING_HP['empty'],
                maxHp: BUILDING_HP['empty']
            }; 
        }
    }
}
initMap()

const neighbors = [
    {q:1, r:0}, {q:1, r:-1}, {q:0, r:-1},
    {q:-1, r:0}, {q:-1, r:1}, {q:0, r:1}
];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.emit('mapUpdate', worldMap);
    // Send initial wave countdown so clients can display the timer immediately
    socket.emit('waveCountdown', { seconds: barbarianSpawnCountDown, total: BARBARIAN_SPAWN_COUNTDOWN });

    socket.on('join', () => {
        const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
        players[socket.id] = {
            color: color,
            army: 0,
            buildCountDown: 0,
            buildings: {
                capital: 1,
                farm: 0,
                mine: 0,
                market: 0,
                camp: 0,
                house: 0,
                tower: 0
            },
            // Stored resource state for the player (updated over time)
            resources: {
                population: 5,
                food: 1,
                gold: 1,
                stone: 1
            }
        };
        
        let startHex = "";
        while(true) {
            let q = Math.floor(Math.random() * (MAP_SIZE * 2)) - MAP_SIZE;
            let r = Math.floor(Math.random() * (MAP_SIZE * 2)) - MAP_SIZE;
            let hex = worldMap[`${q},${r}`];
            
            // Ensure hex exists, is empty, AND is not water
            const allowedTerrains = TERRAIN_RULES['capital'];
            if(hex && hex.owner === null && allowedTerrains.includes(hex.terrain)) {
                startHex = `${q},${r}`;
                worldMap[startHex] = { 
                    ...worldMap[startHex],
                    owner: socket.id, 
                    type: 'capital', 
                    color: color, 
                    hp: BUILDING_HP['capital'],
                    maxHp: BUILDING_HP['capital']
                };
                break;
            }
        }
        io.emit('mapUpdate', worldMap);
        socket.emit('resourceUpdate', getPlayerResources(socket.id));
        // Send initial ability cooldown state to the new player
        socket.emit('abilityUpdate', { buildCooldown: players[socket.id].buildCountDown || 0, total: BUILD_COUNTDOWN });
    });

    socket.on('build', (data) => {
        const { coords, type } = data;
        const player = players[socket.id];
        if (!player) return;

        // 1. Basic checks (existence, adjacency, ownership)
        const hex = worldMap[coords];
        if (!hex || hex.owner !== null || player.buildCountDown > 0) return;
        
        // Frontier Rule: Check if any neighbor belongs to player
        const [q, r] = coords.split(',').map(Number);
        const isAdjacent = neighbors.some(offset => {
            const nKey = `${q + offset.q},${r + offset.r}`;
            return worldMap[nKey] && worldMap[nKey].owner === socket.id;
        });
        if (!isAdjacent) return;

        // 2. Resource Validation Logic (now using stored resources)
        const allowedTerrains = TERRAIN_RULES[type];
        if (allowedTerrains && !allowedTerrains.includes(hex.terrain)) {
            socket.emit('error', `${type.toUpperCase()} must be built on: ${allowedTerrains.join(', ')}`);
            return;
        }
        
        tiles = Object.values(player.buildings).reduce((a, c) => a + c, 0)
        // Special survival rule: if low population and no food, force building farms only
        if (player.resources.population - tiles <= 1 && player.resources.food <= 0 && type !== 'farm') {
            socket.emit('error', 'You have 1 pop and no food — you must build a farm first.');
            return;
        }
        
        const cost = BUILDING_COSTS[type] || { pop: 1, food: 0, gold: 0, stone: 0 };
        
        // Check population
        if (player.resources.population - tiles < (cost.pop + 1 || 1)) {
            socket.emit('error', 'Not enough population! Build houses!');
            return;
        }
        
        // Check resources (houses only cost food instead of pop)
        if ((player.resources.food || 0) < (cost.food || 0)
            || (player.resources.gold || 0) < (cost.gold || 0)
            || (player.resources.stone || 0) < (cost.stone || 0)) {
            socket.emit('error', 'Not enough resources!');
            return;
        }

        // Deduct costs
        player.resources.population -= (cost.pop || 0);
        player.resources.food -= (cost.food || 0);
        player.resources.gold -= (cost.gold || 0);
        player.resources.stone -= (cost.stone || 0);

        // Apply building and set HP
        player.buildings[type] = (player.buildings[type] || 0) + 1;
        worldMap[coords] = { 
            ...worldMap[coords],
            owner: socket.id, 
            type: type, 
            color: player.color ,
            hp: BUILDING_HP[type],
            maxHp: BUILDING_HP[type]
        };

        updateAreaStats(coords);

        io.emit('mapUpdate', worldMap);
        socket.emit('resourceUpdate', getPlayerResources(socket.id));
        player.buildCountDown = BUILD_COUNTDOWN;
        io.to(socket.id).emit('abilityUpdate', { buildCooldown: player.buildCountDown });
    });

    socket.on('attack', (data) => {
    const attacker = players[socket.id];
    if (!attacker) return; // invalid player

    // Support old format (string) and new format { coords, count }
    let coords = null;
    let count = 1;
    if (typeof data === 'string') coords = data;
    else if (data && data.coords) {
        coords = data.coords;
        count = Number(data.count) || 1;
    }

    const hex = worldMap[coords];

    // Basic validations
    if (!hex || !hex.owner) return; // nothing to attack
    if (hex.owner === socket.id) return; // can't attack self

    // Must be adjacent to one of your tiles to attack
    const [q, r] = coords.split(',').map(Number);
    const canReach = neighbors.some(offset => {
        const nKey = `${q + offset.q},${r + offset.r}`;
        return worldMap[nKey] && worldMap[nKey].owner === socket.id;
    });
    if (!canReach) {
        socket.emit('error', 'Target not in reach (must be adjacent to your territory).');
        return;
    }

    // Must have enough army
    if (attacker.army < count) {
        socket.emit('error', `Not enough army to send ${count} troops!`);
        return;
    }

    // Spend the armies for the assault
    attacker.army -= count;

    const damage = count; // Each troop deals 1 damage; sending more deals proportionally more damage

    let prevOwner = hex.owner;
    hex.hp = (typeof hex.hp === 'number' ? hex.hp : (BUILDING_HP[hex.type] || 0)) - damage;

    // If destroyed -> capture and adjust building counts
    let capturedPrevOwner = null;
    if (hex.hp <= 0) {
        if (prevOwner === BARBARIAN_ID) {
            // Player defeated a Barbarian Camp -> Clear the tile
            worldMap[coords] = {
                ...worldMap[coords],
                owner: null,
                type: 'empty',
                hp: 0,
                maxHp: 0
            };
            updateAreaStats(coords);
        } 
        else {
            const prevType = hex.type || 'empty';
            const reward = REWARD[hex.type] || { pop: 0, food: 0, gold: 0, stone: 0 };

            players[prevOwner].buildings[prevType]--;
            players[prevOwner].resources.population -= reward.pop;

            // get reward
            attacker.resources.population += (reward.pop || 0);
            attacker.resources.food += (reward.food || 0);
            attacker.resources.gold += (reward.gold || 0);
            attacker.resources.stone += (reward.stone || 0);

            hex.owner = socket.id;
            hex.color = attacker.color;
            hex.hp = BUILDING_HP[hex.type];
            hex.maxHp = BUILDING_HP[hex.type];

            // Increment attacker's building count
            attacker.buildings[hex.type] = (attacker.buildings[hex.type] || 0) + 1;

            capturedPrevOwner = prevOwner;

            updateAreaStats(coords);
        }
    }

    io.emit('mapUpdate', worldMap);

    // Send resource update (army included) to attacker
    socket.emit('resourceUpdate', getPlayerResources(socket.id));

    // If we captured something, notify the previous owner (if connected)
    if (capturedPrevOwner && players[capturedPrevOwner]) {
        io.to(capturedPrevOwner).emit('resourceUpdate', getPlayerResources(capturedPrevOwner));
    }
});

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is live!`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://192.168.0.37:${PORT}`);
});
server.listen(3000, () => console.log('Server running on port 3000'));

function isMoveValid(hexKey, type) {
    const hex = worldMap[hexKey];
    if (!hex || hex.owner !== null) return false;

    const allowed = TERRAIN_RULES[type];
    if (allowed && !allowed.includes(hex.terrain)) return false;

    // Check adjacency
    const [q, r] = hexKey.split(',').map(Number);
    return neighbors.some(offset => {
        const nKey = `${q + offset.q},${r + offset.r}`;
        return worldMap[nKey] && worldMap[nKey].owner === socket.id;
    });
}

function getPlayerResources(playerId) {
    const p = players[playerId];
    if (!p) return {};

    const b = p.buildings;
    const stored = p.resources || { population: 0, food: 0, gold: 0, stone: 0 };

    const resources = {
        population: stored.population,
        food: stored.food,
        gold: stored.gold,
        stone: stored.stone,
        military: (b.capital * 5) + (b.camp * 5),
        army: p.army,
        tiles: Object.values(b).reduce((a, c) => a + c, 0),
    };
    return resources;
}

function refreshTileStats(coords) {
    const hex = worldMap[coords];
    if (!hex || !hex.owner) return;
    
    const baseHp = BUILDING_HP[hex.type] || 0;
    const bonus = getTowerBonus(coords, hex.owner);
    
    hex.maxHp = baseHp + bonus;
    hex.hp = hex.hp + bonus;
    // Keep current HP from exceeding new max
    if (hex.hp > hex.maxHp) hex.hp = hex.maxHp; 
}

function updateAreaStats(coords) {
    refreshTileStats(coords); // Update the tile itself
    const [q, r] = coords.split(',').map(Number);
    neighbors.forEach(offset => { // Update all neighbors
        refreshTileStats(`${q + offset.q},${r + offset.r}`);
    });
}

function getTowerBonus(coords, ownerId) {
    const [q, r] = coords.split(',').map(Number);
    let bonus = 0;
    neighbors.forEach(offset => {
        const nKey = `${q + offset.q},${r + offset.r}`;
        const neighbor = worldMap[nKey];
        if (neighbor && neighbor.type === 'tower' && neighbor.owner === ownerId) {
            bonus += 5;
        }
    });
    return bonus;
}

setInterval(() => {
    armyCountDown--;
    rebuildCountDown--;
    barbarianAttackCountDown--;
    barbarianSpawnCountDown--;

    if (armyCountDown <= 0)
    {
        for (let id in players) {
            const player = players[id];
            const res = getPlayerResources(id);
            
            if (player.army < res.military) {
                player.army += 1 + player.buildings.camp;
                
                const updatedResources = { ...res, army: player.army };
                io.to(id).emit('resourceUpdate', updatedResources);
            }
        }
        armyCountDown = ARMY_COUNTDOWN;
    }

    if (rebuildCountDown <= 0) {
        for (let key in worldMap) {
            const hex = worldMap[key];
            if (hex.owner && hex.hp < hex.maxHp) {
                hex.hp = Math.min(hex.maxHp, hex.hp + 1);
            }
        }
        io.emit('mapUpdate', worldMap);
        rebuildCountDown = REBUILD_COUNTDOWN;
    }

    for (let id in players) {
        if (players[id].buildCountDown > 0) {
            players[id].buildCountDown --;
            // Send ability update so client can show cooldown
            io.to(id).emit('abilityUpdate', { buildCooldown: players[id].buildCountDown });
        }
    }

    if (barbarianSpawnCountDown <= 0) {
        let spawned = 0;
        waveNumber++;
        for (let id in players) {
            if (id === BARBARIAN_ID) continue;
            
            // Find all player tiles
            const playerTiles = Object.keys(worldMap).filter(key => worldMap[key].owner === id);
            if (playerTiles.length === 0) continue;

            // Pick a random tile and try to spawn a camp in an empty neighbor
            const randomTile = playerTiles[Math.floor(Math.random() * playerTiles.length)];
            const [q, r] = randomTile.split(',').map(Number);
            
            const validNeighborKeys = neighbors
                .map(offset => `${q + offset.q},${r + offset.r}`)
                .filter(nKey => {
                    const target = worldMap[nKey];
                    return target && !target.owner && target.terrain !== 'water';
                });

            // 2. If at least one valid spot exists, pick one and spawn
            if (validNeighborKeys.length > 0) {
                const nKey = validNeighborKeys[Math.floor(Math.random() * validNeighborKeys.length)];
                const target = worldMap[nKey];

                worldMap[nKey] = {
                    ...target,
                    owner: BARBARIAN_ID,
                    type: 'barbarian_camp',
                    color: '#000000',
                    hp: BUILDING_HP['barbarian_camp'],
                    maxHp: BUILDING_HP['barbarian_camp']
                };
                updateAreaStats(nKey);
                spawned++;
            }
        }
        if (spawned > 0) {
            io.emit('waveEvent', { wave: waveNumber, spawned: spawned, message: `Barbarian wave ${waveNumber} spawned ${spawned} camp(s)` });
        }
        io.emit('mapUpdate', worldMap);
        barbarianSpawnCountDown = BARBARIAN_SPAWN_COUNTDOWN;
    }

    if (barbarianAttackCountDown <= 0) {
        const affectedPlayers = new Set();
        for (let key in worldMap) {
            const hex = worldMap[key];
            if (hex.owner === BARBARIAN_ID) {
                const [q, r] = key.split(',').map(Number);
                for (let offset of neighbors) {
                    const nKey = `${q + offset.q},${r + offset.r}`;
                    const target = worldMap[nKey];
                    
                    if (target && target.owner && target.owner !== BARBARIAN_ID) {
                        target.hp -= 1; // Direct damage
                        if (target.hp <= 0) {
                            // Barbarian captures the tile!
                            const prevOwner = target.owner;
                            if (players[prevOwner]) {
                                players[prevOwner].buildings[target.type]--;
                                affectedPlayers.add(prevOwner);
                            }
                            
                            target.owner = BARBARIAN_ID;
                            target.type = 'barbarian_camp';
                            target.color = '#000000';
                            target.hp = BUILDING_HP['barbarian_camp'];
                            updateAreaStats(nKey);
                        }
                        break; // One attack per camp per tick
                    }
                }
            }
        }
        // Notify affected players about resource changes
        for (const pid of affectedPlayers) {
            if (players[pid]) io.to(pid).emit('resourceUpdate', getPlayerResources(pid));
        }
        barbarianAttackCountDown = BARBARIAN_ATTACK_COUNTDOWN;
    }

    // Broadcast the remaining time until the next barbarian spawn so clients can show a countdown
    io.emit('waveCountdown', { seconds: barbarianSpawnCountDown, total: BARBARIAN_SPAWN_COUNTDOWN });
}, 1000);