const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let worldMap = {};
let players = {}; // Stores { socketId: { color, hexes: [] } }
const MAP_SIZE = 50; // 100 is very large for an MVP, 50 is safer to start

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

// Axial neighbor offsets
const neighbors = [
    {q:1, r:0}, {q:1, r:-1}, {q:0, r:-1},
    {q:-1, r:0}, {q:-1, r:1}, {q:0, r:1}
];

io.on('connection', (socket) => {
    // 1. Assign Color & Random Start
    const playerColor = `hsl(${Math.random() * 360}, 70%, 50%)`;
    players[socket.id] = { color: playerColor };

    // Find random empty hex for start
    let startHex = "";
    while(true) {
        let q = Math.floor(Math.random() * (MAP_SIZE * 2)) - MAP_SIZE;
        let r = Math.floor(Math.random() * (MAP_SIZE * 2)) - MAP_SIZE;
        if(worldMap[`${q},${r}`] && worldMap[`${q},${r}`].owner === null) {
            startHex = `${q},${r}`;
            worldMap[startHex] = { owner: socket.id, type: 'village', color: playerColor };
            break;
        }
    }

    socket.emit('init', { id: socket.id, map: worldMap });
    io.emit('mapUpdate', worldMap); // Notify everyone of new village

    // 2. Handle Build Requests
    socket.on('build', (coords) => {
        const hex = worldMap[coords];
        if (!hex || hex.owner !== null) return;

        // Frontier Rule: Check if any neighbor belongs to player
        const [q, r] = coords.split(',').map(Number);
        const isAdjacent = neighbors.some(offset => {
            const nKey = `${q + offset.q},${r + offset.r}`;
            return worldMap[nKey] && worldMap[nKey].owner === socket.id;
        });

        if (isAdjacent) {
            worldMap[coords] = { owner: socket.id, type: 'building', color: playerColor };
            io.emit('mapUpdate', worldMap); 
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        console.log('User left');
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));