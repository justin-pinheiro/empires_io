const MAP_SIZE = 10;
const BUILD_COUNTDOWN = 5
const ARMY_COUNTDOWN = 1; 
const REPAIR_COUNTDOWN = 1; 
const BARBARIAN_SPAWN_COUNTDOWN = 30;
const BARBARIAN_ATTACK_COUNTDOWN = 2;
BARBARIAN_ID = 'BARBARIAN_NPC';





io.on('connection', (socket) => {
    socket.emit('waveCountdown', { seconds: barbarianSpawnCountDown, total: BARBARIAN_SPAWN_COUNTDOWN });

    socket.on('join', () => {
        socket.emit('resourceUpdate', getPlayerResources(socket.id));
        // Send initial ability cooldown state to the new player
        socket.emit('abilityUpdate', { buildCooldown: players[socket.id].buildCountDown || 0, total: BUILD_COUNTDOWN });
    });

    socket.on('build', (data) => {
        const { coords, type } = data;
        const player = players[socket.id];
        if (!player) return;

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