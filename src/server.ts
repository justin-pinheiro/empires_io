import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { CommandHandler } from './game/commands/commandHandler.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { env } from './config/env.js';
import { GCProfiler } from 'v8';
import { GameEngine } from './game/gameEngine.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const game = new GameEngine(10);
game.start();

setupSocketHandlers(io, game);

app.use(express.static('public'));

httpServer.listen(env.PORT, () => {
    console.log('Server running on http://localhost:3000');
});