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

            const randomTile = game.getRandomStartingTile();
            if (randomTile)
            {
                game.setPlayerCapital(socket.id, randomTile.getId());
                game.setStartingResources(socket.id);
                broadcastTilesUpdates(io, game);
                broadcastBuildingsUpdates(io, game);
                Logger.info("Player " + socket.id + " spawned on tile " + randomTile.getId());
                io.to(socket.id).emit("civilisationStart", {startTile: {x: randomTile.getCoords().x, y: randomTile.getCoords().y}})
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

        socket.on('upgrade', ( { tileKey } ) => {
            game.upgradeBuilding(socket.id, tileKey);
            broadcastTilesUpdates(io, game);
            broadcastBuildingsUpdates(io, game);
            broadcastCivilisationUpdates(io, game);
        });

        socket.on('delete', ( { tileKey } ) => {
            game.deleteBuilding(socket.id, tileKey);
            broadcastTilesUpdates(io, game);
            broadcastBuildingsUpdates(io, game);
            broadcastCivilisationUpdates(io, game);
        });

        socket.on('request_research_options', () => {
            const player = game.getPlayer(socket.id);
            if (!player) return;
            const research = player.getCivilisation().getResearch();
            
            if (research.getPendingUpgrades() > 0) {
                socket.emit('research_options', {
                    options: research.getAvailableOptions(),
                    pendingCount: research.getPendingUpgrades()
                });
            }
        });

        socket.on('select_research', ({ bonusType }) => {
            const player = game.getPlayer(socket.id);
            if (!player) return;

            const research = player.getCivilisation().getResearch();
            const success = research.applyUpgrade(bonusType);

            if (success) {
                Logger.info(`Player ${socket.id} researched ${bonusType}`);
                broadcastCivilisationUpdates(io, game);
                if (research.getPendingUpgrades() > 0) {
                    socket.emit('research_point_remaining', research.getPendingUpgrades());
                } else {
                    socket.emit('research_complete');
                }
            }
        });
    });

    game.on('resourcesUpdate', () => {
        broadcastCivilisationUpdates(io, game);
    });

    game.on('buildingsUpdate', () => {
        broadcastBuildingsUpdates(io, game);
        broadcastTilesUpdates(io, game);
    });

    game.on('ageIncrease', (socketId: string, age: number) => {
        io.to(socketId).emit('ageIncrease', age);
        io.to(socketId).emit('available_upgrade_alert'); 
        broadcastCivilisationUpdates(io, game);
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