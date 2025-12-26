// tests/GameEngine.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from '../game/gameEngine.js';
import { Building } from '../models/building.js';
import { GameState } from '../game/gameState.js';
import { CommandHandler } from '../game/commands/commandHandler.js';
import { stat } from 'node:fs';

describe('GameEngine Production System', () => {
    let state : GameState;
    const commandHandler = new CommandHandler();
    let engine: GameEngine;
    const playerId = 'player-1';

    it('should initialize a player with a civilisation and zero resources', () => {
        state = new GameState(10);
        state.addPlayer(playerId);
        engine = new GameEngine(state, commandHandler);

        const player = engine.getPlayer(playerId);
        const resources = player?.getCivilisation().getResources();

        expect(player?.getCivilisation().getPopulationCapacity()).toBe(0); 
        expect(resources?.getFood()).toBe(0); 
        expect(resources?.getGold()).toBe(0); 
        expect(resources?.getStone()).toBe(0); 
        expect(resources?.getScience()).toBe(0); 
    });

    it('should increase population when capital is set', () => {
        state = new GameState(10);
        state.addPlayer(playerId);
        engine = new GameEngine(state, commandHandler);

        const player = engine.getPlayer(playerId);
        engine.setPlayerCapital(playerId, "0,0");
        expect(player?.getCivilisation().getPopulationCapacity()).toBeGreaterThan(0);
    });

    it('should increase food when farm is set', () => {
        state = new GameState(10);
        state.addPlayer(playerId);
        state.addBuilding(playerId, "FARM", "0,1");
        engine = new GameEngine(state, commandHandler);

        for(let i = 0; i < 10; i++) { engine.update(1); }
        const player = engine.getPlayer(playerId);
        const resources = player?.getCivilisation().getResources();

        expect(resources?.getFood()).toBeGreaterThan(0);
    });
});