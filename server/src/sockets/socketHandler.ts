import { Server, Socket } from 'socket.io';

import Logger from '../utils/logger.js';
import type { GameEngine } from '../game/gameEngine.js';
import { BUILDING_STATS, BuildingType } from '../models/buildingData.js';
import { TERRAIN_DATA, TerrainType } from '../models/terrainTypeEnum.js';

const socketsIds : string[] = [];

export const setupSocketHandlers = (io: Server, game: GameEngine) => {
    io.on('connection', (socket: Socket) => {
        Logger.info('User connected: ' + socket.id);
        
        socket.on('request_constants', () => {
            const buildableStatsReadable = Object.fromEntries(
                Object.entries(BUILDING_STATS).map(([key, stats]) => [
                    key,
                    {
                        ...stats,
                        buildableTerrains: stats.buildableTerrains.map(t => TerrainType[t])
                    }
                ])
            );

            socket.emit('init_constants', {
                buildingStats: buildableStatsReadable,
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
            broadcastResourcesUpdates(io, game);
        });
        
        socket.on('build', ( { tileKey, buildingTypeKey } ) => {
            game.placeBuilding(socket.id, buildingTypeKey, tileKey);
            broadcastTilesUpdates(io, game);
            broadcastBuildingsUpdates(io, game);
            broadcastResourcesUpdates(io, game);
        });

        socket.on('attack', ( { tileKey, troopCount } ) => {
            game.attackBuilding(socket.id, tileKey, troopCount);
            broadcastTilesUpdates(io, game);
            broadcastBuildingsUpdates(io, game);
            broadcastResourcesUpdates(io, game);
        });
    });

    game.on('resourcesUpdate', () => {
        broadcastResourcesUpdates(io, game);
    });

    game.on('buildingsUpdate', () => {
        broadcastBuildingsUpdates(io, game);
    });
};

function broadcastResourcesUpdates(io: Server, game: GameEngine) {
    Logger.debug(`Broadcasting resources updates for ${socketsIds.length} sockets`);
    for (const id of socketsIds) {
        const player = game.getPlayer(id);
        io.to(id).emit('resourcesUpdate', player?.getCivilisation().getResources().serialize());
    }
}

function broadcastBuildingsUpdates(io: Server, game: GameEngine) {
    Logger.debug(`Broadcasting buildings updates for ${socketsIds.length} sockets`);
    socketsIds.forEach(id => {
        io.to(id).emit('buildingsUpdate', game.getVisibleBuildingsForPlayer(id));
    });
}

function broadcastTilesUpdates(io: Server, game: GameEngine) {
    Logger.debug(`Broadcasting tiles updates for ${socketsIds.length} sockets`);
    for (const id of socketsIds) {
        const tiles = game.getVisibleTilesForPlayer(id);
        io.to(id).emit('mapUpdate', tiles);
    }
}

function broadcastPlayersUpdate(io: Server, game: GameEngine) {
    Logger.debug(`Broadcasting players updates for ${socketsIds.length} sockets`);
    for (const id of socketsIds) {
        io.to(id).emit('playersUpdate', Object.fromEntries(game.getPlayers()));
    }
}