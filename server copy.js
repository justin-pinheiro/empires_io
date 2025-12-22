const MAP_SIZE = 10;
const BUILD_COUNTDOWN = 5
const ARMY_COUNTDOWN = 1; 
const REPAIR_COUNTDOWN = 1; 
const BARBARIAN_SPAWN_COUNTDOWN = 30;
const BARBARIAN_ATTACK_COUNTDOWN = 2;
BARBARIAN_ID = 'BARBARIAN_NPC';






function getVisibleTilesFor(playerId) {
    const visible = {};
    const p = players[playerId];
    if (!p) return visible;

    const ownedKeys = Object.keys(worldMap).filter(k => worldMap[k] && worldMap[k].owner === playerId);
    const visibleSet = new Set();

    for (const key of ownedKeys) {
        // always see your own tile and 1 tile around it
        for (const k of keysWithinDistance(key, 1)) visibleSet.add(k);

        // if this owned tile is a tower, reveal 2 tiles around the tower
        const h = worldMap[key];
        if (h && h.type === 'tower') {
            for (const k of keysWithinDistance(key, 2)) visibleSet.add(k);
        }
    }

    for (const k of visibleSet) {
        if (worldMap[k]) visible[k] = worldMap[k];
    }
    return visible;
}


io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send initial (possibly empty) visible map — the client will send 'join' shortly to get a starting tile
    io.to(socket.id).emit('mapUpdate', getVisibleTilesFor(socket.id));
    // Send initial wave countdown so clients can display the timer immediately
    socket.emit('waveCountdown', { seconds: barbarianSpawnCountDown, total: BARBARIAN_SPAWN_COUNTDOWN });

    socket.on('join', () => {
        let startHex = "";
        while(true) {
            
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
        // Broadcast updated maps (each client will only receive visible tiles)
        broadcastMapUpdates();
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

        // Send only visible tiles to each player
        broadcastMapUpdates();
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

    // Send updated visible maps to each player
    broadcastMapUpdates();

    // Send resource update (army included) to attacker
    socket.emit('resourceUpdate', getPlayerResources(socket.id));

    // If we captured something, notify the previous owner (if connected)
    if (capturedPrevOwner && players[capturedPrevOwner]) {
        io.to(capturedPrevOwner).emit('resourceUpdate', getPlayerResources(capturedPrevOwner));
    }
});

});



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
            bonus += 20;
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
        broadcastMapUpdates();
        rebuildCountDown = REPAIR_COUNTDOWN;
    }

    for (let id in players) {
        if (players[id].buildCountDown > 0) {
            players[id].buildCountDown --;
            // Send ability update so client can show cooldown
            io.to(id).emit('abilityUpdate', { buildCooldown: players[id].buildCountDown });
        }
    }

    if (barbarianSpawnCountDown <= 0) {
        for (let id in players) {
            if (id === BARBARIAN_ID) continue;
            let spawned = 0;
            
            // Find all player tiles
            const playerTiles = Object.keys(worldMap).filter(key => worldMap[key].owner === id);
            if (playerTiles.length === 0) continue;

            toSpawn = parseInt(playerTiles.length / 5)

            while (spawned < toSpawn) {
                
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
                else break;    
            }
            console.log("to spawn = ", toSpawn, " - spawned ", spawned, " barbarians for player ", id)
        }
        broadcastMapUpdates();
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
                        target.hp -= 3; // Direct damage
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
        // Broadcast updated visible maps to each player
        broadcastMapUpdates();
        barbarianAttackCountDown = BARBARIAN_ATTACK_COUNTDOWN;
    }

    // Broadcast the remaining time until the next barbarian spawn so clients can show a countdown
    io.emit('waveCountdown', { seconds: barbarianSpawnCountDown, total: BARBARIAN_SPAWN_COUNTDOWN });
}, 1000);