const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const { Map } = require('./src/models/map');

PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

map = Map(10);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is live!`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://192.168.0.37:${PORT}`);
});
server.listen(3000, () => console.log('Server running on port 3000'));