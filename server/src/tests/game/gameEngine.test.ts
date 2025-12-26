import { describe, test, expect, vi, beforeEach } from 'vitest';
import { GameEngine } from '../../game/gameEngine.js';
import { GameState } from '../../game/gameState.js';
import { CommandHandler } from '../../game/commands/commandHandler.js';

describe('GameEngine', () => {
  let engine: GameEngine;
  let state: GameState;

  beforeEach(() => {
    state = new GameState(2);
    const handler = new CommandHandler();
    engine = new GameEngine(state, handler);
    vi.useFakeTimers();
  });

    test('should emit resourcesUpdate on every tick', async () => {
        const spy = vi.fn();
        engine.on('resourcesUpdate', spy);
        
        engine.start(); // This triggers Tick 0
        
        await vi.advanceTimersByTimeAsync(3000); // This triggers Ticks 1, 2, and 3
        
        // We expect 4 total calls
        expect(spy).toHaveBeenCalledTimes(4);
    });

  test('placeBuilding should trigger buildingUpdate event', () => {
    const spy = vi.fn();
    engine.on('buildingsUpdate', spy);
    
    engine.addPlayer('p1', 'Alice');
    // Using a simple mock coordinate
    engine.setPlayerCapital('p1', '0,0');
    
    expect(spy).toHaveBeenCalled();
  });
});