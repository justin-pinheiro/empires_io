const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const TERRAIN_RULES = {
    farm:   ['plains', 'forest'],
    mine:   ['mountain', 'desert'],
    market: ['plains', 'desert'],
    house:  ['plains', 'forest', 'desert'],
    camp:   ['plains', 'forest', 'desert'],
    tower:  ['plains', 'forest', 'desert'],
    capital:['plains', 'forest', 'desert'] 
};

const BUILDING_HP = {
    capital: 30,
    tower: 15,
    mine: 8,
    farm: 8,
    market: 10,
    camp: 10,
    house: 4,
    empty: 0
};

const ARMY_TICK_RATE = 1000; 
const REBUILD_TICK_RATE = 3000; 

let worldMap = {};
let players = {}; 
const MAP_SIZE = 5;

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

    socket.on('join', () => {
        const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
        players[socket.id] = {
            color: color,
            army: 0,
            buildings: {
                capital: 1,
                farm: 0,
                mine: 0,
                market: 0,
                camp: 0,
                house: 0,
                tower: 0
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
    });

    socket.on('build', (data) => {
        const { coords, type } = data;
        const player = players[socket.id];
        if (!player) return;

        // 1. Basic checks (existence, adjacency, ownership)
        const hex = worldMap[coords];
        if (!hex || hex.owner !== null) return;
        
        // Frontier Rule: Check if any neighbor belongs to player
        const [q, r] = coords.split(',').map(Number);
        const isAdjacent = neighbors.some(offset => {
            const nKey = `${q + offset.q},${r + offset.r}`;
            return worldMap[nKey] && worldMap[nKey].owner === socket.id;
        });
        if (!isAdjacent) return;

        // 2. Resource Validation Logic
        // Pre-calculate what resources would look like AFTER building this
        players[socket.id].buildings[type]++;
        let res = getPlayerResources(socket.id);
        
        let canBuild = true;

        const allowedTerrains = TERRAIN_RULES[type];
        if (allowedTerrains && !allowedTerrains.includes(hex.terrain)) {
            canBuild = false;
            socket.emit('error', `${type.toUpperCase()} must be built on: ${allowedTerrains.join(', ')}`);
        }
        if (res.population < res.tiles) {
            canBuild = false
            socket.emit('error', 'Not enough population!'); 
        }
        if (res.food < 0 || res.gold < 0 || res.stone < 0) {
            canBuild = false
            socket.emit('error', 'Not enough resources!'); 
        }

        if (canBuild) {
            // Preserve existing tile properties (like terrain) when claiming
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
            socket.emit('resourceUpdate', res);
        }
        else {
            player.buildings[type]--;
            return;
        }
    });

    socket.on('attack', (coords) => {
    const attacker = players[socket.id];
    const hex = worldMap[coords];

    // Basic validations
    if (!attacker) return; // invalid player
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

    // Must have army
    if (attacker.army < 1) {
        socket.emit('error', 'No army available to attack!');
        return;
    }

    // Spend one army for the assault
    attacker.army -= 1;

    const damage = 1;

    let prevOwner = hex.owner;
    hex.hp = (typeof hex.hp === 'number' ? hex.hp : (BUILDING_HP[hex.type] || 0)) - damage;

    // If destroyed -> capture and adjust building counts
    let capturedPrevOwner = null;
    if (hex.hp <= 0) {
        const prevType = hex.type || 'empty';

        // Decrement previous owner's building count safely
        if (players[prevOwner] && players[prevOwner].buildings[prevType] > 0) {
            players[prevOwner].buildings[prevType]--;
        }

        // Capture as a small outpost (camp)
        hex.owner = socket.id;
        hex.color = attacker.color;
        hex.hp = BUILDING_HP[hex.type];
        hex.maxHp = BUILDING_HP[hex.type];

        // Increment attacker's building count
        attacker.buildings[hex.type] = (attacker.buildings[hex.type] || 0) + 1;

        capturedPrevOwner = prevOwner;

        updateAreaStats(coords);
    }

    io.emit('mapUpdate', worldMap);

    // Send resource update to attacker
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
    const b = players[playerId].buildings;
    
    resources = {
        population: (b.capital * 4) + (b.house * 2),
        food: (b.capital * 1) + (b.farm * 3) - b.house,
        gold: (b.capital * 1) + (b.market * 2) - b.camp,
        stone: (b.capital * 1) + (b.mine * 2) - b.tower,
        military: (b.capital * 1) + (b.camp * 1),
        army: players[playerId].army,
        tiles: Object.values(b).reduce((a, b) => a + b, 0),
    };
    return resources
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
    for (let id in players) {
        const player = players[id];
        const res = getPlayerResources(id);
        
        if (player.army < res.military) {
            player.army++;
            
            const updatedResources = { ...res, army: player.army };
            io.to(id).emit('resourceUpdate', updatedResources);
        }
    }
}, ARMY_TICK_RATE);

setInterval(() => {
    for (let key in worldMap) {
        const hex = worldMap[key];
        if (hex.owner && hex.hp < hex.maxHp) {
            hex.hp = Math.min(hex.maxHp, hex.hp + 1);
        }
    }
    io.emit('mapUpdate', worldMap);
}, REBUILD_TICK_RATE);