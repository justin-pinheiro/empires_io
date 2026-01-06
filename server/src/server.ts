import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { CommandHandler } from './game/commands/commandHandler.js';
import { setupSocketHandlers } from './sockets/socketHandler.js';
import { env } from './config/env.js';
import { GameEngine } from './game/gameEngine.js';
import { GameState } from './game/gameState.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const commandHandler = new CommandHandler();
const gameState = new GameState(10);

const game = new GameEngine(gameState, commandHandler);
game.start();

setupSocketHandlers(io, game);

app.use(express.static('public'));

httpServer.listen(env.PORT, env.HOST, () => {
    console.log(`Server running on ${env.HOST}:${env.PORT}`);
});