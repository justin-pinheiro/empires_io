const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const TICK_RATE = 5000; 
let worldMap = {};
let players = {}; 
const MAP_SIZE = 50;

function initMap() {
    for (let q = -MAP_SIZE; q <= MAP_SIZE; q++) {
        let r1 = Math.max(-MAP_SIZE, -q - MAP_SIZE);
        let r2 = Math.min(MAP_SIZE, -q + MAP_SIZE);
        for (let r = r1; r <= r2; r++) {
            worldMap[`${q},${r}`] = { owner: null, type: 'empty', color: '#333' };
        }
    }
}
initMap();

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
            if(worldMap[`${q},${r}`] && worldMap[`${q},${r}`].owner === null) {
                startHex = `${q},${r}`;
                worldMap[startHex] = { owner: socket.id, type: 'capital', color: color };
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
        if (res.population < res.tiles) {
            canBuild = false
            socket.emit('error', 'Not enough population!'); 
        }
        if (res.food < 0 || res.gold < 0 || res.stone < 0) {
            canBuild = false
            socket.emit('error', 'Not enough resources!'); 
        }

        if (canBuild) {
            worldMap[coords] = { 
                owner: socket.id, 
                type: type, 
                color: player.color 
            };
    
            io.emit('mapUpdate', worldMap);
            socket.emit('resourceUpdate', res);
        }
        else {
            player.buildings[type]--;
            return;
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));



function getPlayerResources(playerId) {
    const b = players[playerId].buildings;
    
    resources = {
        population: (b.capital * 4) + (b.house * 2),
        food: (b.capital * 1) + (b.farm * 3) - b.house,
        gold: (b.capital * 1) + (b.market * 2) - b.camp,
        stone: (b.capital * 1) + (b.mine * 2) - b.tower,
        tiles: Object.values(b).reduce((a, b) => a + b, 0)
    };

    console.log("player ", playerId, " resources : ", resources)

    return resources
}
