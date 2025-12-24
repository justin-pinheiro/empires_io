import { Server, Socket } from 'socket.io';
import { CommandHandler } from '../game/commands/commandHandler.js';

import Logger from '../utils/logger.js';
import type { GameEngine } from '../game/gameEngine.js';

const socketsIds : string[] = [];

export const setupSocketHandlers = (io: Server, game: GameEngine) => {
    io.on('connection', (socket: Socket) => {
        Logger.info('User connected: ' + socket.id);
        broadcastMapUpdates(io, game);
        
        socket.on('join', () => { 
            Logger.info('User joined: ' + socket.id);
            socketsIds.push(socket.id)
            game.addPlayer(socket.id);
            game.setPlayerCapital(socket.id);
            broadcastMapUpdates(io, game);
        });
        
        socket.on('disconnect', () => {
            Logger.info('User disconnected: ' + socket.id);
            socketsIds.splice(socketsIds.indexOf("element"), 1);
            game.removePlayer(socket.id);
        });
        
        socket.on('build', ( { tileKey, buildingTypeKey } ) => {
            game.placeBuilding(socket.id, buildingTypeKey, tileKey);
            broadcastMapUpdates(io, game);
        });
    });
};

function broadcastMapUpdates(io: Server, game: GameEngine) {
    for (const id of socketsIds) {
        io.to(id).emit('mapUpdate', game.getVisibleTileKeysForPlayer(id));
    }
}