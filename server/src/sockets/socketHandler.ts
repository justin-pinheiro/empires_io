import { Server, Socket } from 'socket.io';

import Logger from '../utils/logger.js';
import type { GameEngine } from '../game/gameEngine.js';

const socketsIds : string[] = [];

export const setupSocketHandlers = (io: Server, game: GameEngine) => {
    io.on('connection', (socket: Socket) => {
        Logger.info('User connected: ' + socket.id);
        
        socket.on('join', () => { 
            Logger.info('User joined: ' + socket.id);
            if (!socketsIds.includes(socket.id)) {
                socketsIds.push(socket.id);
            }
            game.addPlayer(socket.id);
            const tileId = game.getCapitalLocation();
            game.setPlayerCapital(socket.id, tileId);
            broadcastMapUpdates(io, game);
        });
        
        socket.on('disconnect', () => {
            Logger.info('User disconnected: ' + socket.id);
            const index = socketsIds.indexOf(socket.id);
            if (index !== -1) socketsIds.splice(index, 1);
            game.removePlayer(socket.id);
        });
        
        socket.on('build', ( { tileKey, buildingTypeKey } ) => {
            game.placeBuilding(socket.id, buildingTypeKey, tileKey);
            broadcastMapUpdates(io, game);
        });

        socket.on('attack', ( { tileKey, troopCount } ) => {
            game.attackBuilding(socket.id, tileKey, troopCount);
            broadcastMapUpdates(io, game);
        });
    });

    game.on('resourcesUpdate', () => {
        for (const id of socketsIds) {
            const player = game.getPlayer(id);
            io.to(id).emit('resourcesUpdate', player?.getCivilisation().getResources().serialize());
        }
    });

    game.on('buildingsUpdate', () => {
        socketsIds.forEach(id => {
            io.to(id).emit('buildingsUpdate', game.getVisibleBuildingsForPlayer(id));
        });
    });
};

function broadcastMapUpdates(io: Server, game: GameEngine) {
    Logger.debug(`Broadcasting map updates for ${socketsIds.length} sockets`);
    for (const id of socketsIds) {
        const tiles = game.getVisibleTilesForPlayer(id);
        io.to(id).emit('mapUpdate', tiles);
    }
}