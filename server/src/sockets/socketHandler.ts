import { Server, Socket } from 'socket.io';

import Logger from '../utils/logger.js';
import type { GameEngine } from '../game/gameEngine.js';
import { getSerializedBuildingsData } from '../models/buildingData.js';
import { TERRAIN_DATA } from '../models/terrainTypeEnum.js';
import { getSerializedAgesData } from '../models/age.js';

const socketsIds : string[] = [];

export const setupSocketHandlers = (io: Server, game: GameEngine) => {
    io.on('connection', (socket: Socket) => {
        Logger.info('User connected: ' + socket.id);
        
        socket.on('request_constants', () => {
            socket.emit('init_constants', {
                buildingStats: getSerializedBuildingsData(),
                agesData: getSerializedAgesData(),
                terrainData: TERRAIN_DATA,
            });
        });

        socket.on('join', () => { 
            Logger.info('User joined: ' + socket.id);
            if (!socketsIds.includes(socket.id)) {
                socketsIds.push(socket.id);
            }
            game.addPlayer(socket.id, "Name");
            broadcastPlayersUpdate(io, game);

            const randomTileId = game.getRandomStartingTile();
            if (randomTileId)
            {
                game.setPlayerCapital(socket.id, randomTileId);
                broadcastTilesUpdates(io, game);
                broadcastBuildingsUpdates(io, game);
                Logger.info("Player " + socket.id + " spawned on tile " + randomTileId);
            }
        });
        
        socket.on('disconnect', () => {
            Logger.info('User disconnected: ' + socket.id);
            const index = socketsIds.indexOf(socket.id);
            if (index !== -1) socketsIds.splice(index, 1);
            game.removePlayer(socket.id);
            broadcastPlayersUpdate(io, game);
            broadcastBuildingsUpdates(io, game);
            broadcastCivilisationUpdates(io, game);
        });
        
        socket.on('build', ( { tileKey, buildingTypeKey } ) => {
            game.placeBuilding(socket.id, buildingTypeKey, tileKey);
            broadcastTilesUpdates(io, game);
            broadcastBuildingsUpdates(io, game);
            broadcastCivilisationUpdates(io, game);
        });
        
        socket.on('attack', ( { tileKey, troopCount } ) => {
            game.attackBuilding(socket.id, tileKey, troopCount);
            broadcastTilesUpdates(io, game);
            broadcastBuildingsUpdates(io, game);
            broadcastCivilisationUpdates(io, game);
        });
    });

    game.on('resourcesUpdate', () => {
        broadcastCivilisationUpdates(io, game);
    });

    game.on('buildingsUpdate', () => {
        broadcastBuildingsUpdates(io, game);
    });
};

function broadcastCivilisationUpdates(io: Server, game: GameEngine) {
    for (const id of socketsIds) {
        const player = game.getPlayer(id);
        io.to(id).emit('civilisationUpdate', player?.getCivilisation().serialize());
    }
}

function broadcastBuildingsUpdates(io: Server, game: GameEngine) {
    socketsIds.forEach(id => {
        io.to(id).emit('buildingsUpdate', game.getVisibleBuildingsForPlayer(id));
    });
}

function broadcastTilesUpdates(io: Server, game: GameEngine) {
    for (const id of socketsIds) {
        const tiles = game.getVisibleTilesForPlayer(id);
        io.to(id).emit('mapUpdate', tiles);
    }
}

function broadcastPlayersUpdate(io: Server, game: GameEngine) {
    for (const id of socketsIds) {
        io.to(id).emit('playersUpdate', Object.fromEntries(game.getPlayers()));
    }
}