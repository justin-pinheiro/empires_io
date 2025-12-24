import { Server, Socket } from 'socket.io';
import { GameEngine } from '../game/gameEngine.js';
import { Building } from '../models/building.js';

const socketsIds : string[] = [];

export const setupSocketHandlers = (io: Server, game: GameEngine) => {
    io.on('connection', (socket: Socket) => {
        socketsIds.push(socket.id);
        console.log('User connected:', socket.id);
        broadcastMapUpdates(io, game);

        socket.on('join', () => { 
            game.addPlayer(socket.id);
            game.setPlayerCapital(socket.id);
            broadcastMapUpdates(io, game);
        });
        
        socket.on('disconnect', () => {
            game.removePlayer(socket.id);
        });
        
        socket.on('build', ( { tileKey, buildingTypeKey } ) => { 
            const building = new Building(buildingTypeKey);
            game.addBuilding(socket.id, building, tileKey);
            broadcastMapUpdates(io, game);
        });

        socket.on('attack', ( { tileKey, troopsCount } ) => {
            game.attackTile(socket.id, tileKey, troopsCount);
            broadcastMapUpdates(io, game);
        });
    });
};

function broadcastMapUpdates(io: Server, game: GameEngine) {
    for (const id of socketsIds) {
        io.to(id).emit('mapUpdate', game.getVisibleTileKeysForPlayer(id));
    }
}