import { Server, Socket } from 'socket.io';
import { GameEngine } from '../game/gameEngine.js';

const socketsIds : string[] = [];

export const setupSocketHandlers = (io: Server, game: GameEngine) => {
    io.on('connection', (socket: Socket) => {
        socketsIds.push(socket.id);
        console.log('User connected:', socket.id);

        io.to(socket.id).emit('mapUpdate', game.getVisibleTileKeysForPlayer(socket.id));

        socket.on('join', () => { 
            game.addPlayer(socket.id);
            game.setPlayerCapital(socket.id);
            broadcastMapUpdates(io, game);
        });

        socket.on('disconnect', () => {
            game.removePlayer(socket.id);
        });

    });
};

function broadcastMapUpdates(io: Server, game: GameEngine) {
    for (const id of socketsIds) {
        io.to(id).emit('mapUpdate', game.getVisibleTileKeysForPlayer(id));
    }
}