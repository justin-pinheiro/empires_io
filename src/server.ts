import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GameEngine } from './game/gameEngine.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const game = new GameEngine(10);

setupSocketHandlers(io, game);

app.use(express.static('public'));

httpServer.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});