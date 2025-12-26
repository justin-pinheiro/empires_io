const MAP_SIZE = 10;
const BUILD_COUNTDOWN = 5
const ARMY_COUNTDOWN = 1; 
const REPAIR_COUNTDOWN = 1; 
const BARBARIAN_SPAWN_COUNTDOWN = 30;
const BARBARIAN_ATTACK_COUNTDOWN = 2;
BARBARIAN_ID = 'BARBARIAN_NPC';

setInterval(() => {
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