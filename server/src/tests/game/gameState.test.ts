import { describe, test, expect, beforeEach } from 'vitest';
import { GameState } from '../../game/gameState.js';
import { BuildingType } from '../../models/buildingData.js';
import { Resources } from '../../models/resources.js';

describe('GameState integration', () => {
  let state: GameState;
  const P1 = 'player-1';

  beforeEach(() => {
    state = new GameState(2);
    state.addPlayer(P1, 'Alice', "#ffffff");
    const alice = state.getPlayer(P1)!;
    alice.getCivilisation().addToResources(new Resources(100, 100, 100, 100, 100));
  });

  test('should increase resources over time when a farm is built', () => {
    state.addBuilding(P1, BuildingType.FARM, '0,0');
    state.update(10);

    expect(state.getPlayer(P1)!.getCivilisation().getResources().getFood()).toBeGreaterThanOrEqual(104); 
    // (100 starting + 4 produced)
  });

  test('should update workers capacity when house is built', () => {
    const civ = state.getPlayer(P1)!.getCivilisation();
    const initialCap = civ.getResourcesCapacity().getWorkers();
    
    state.addBuilding(P1, BuildingType.HOUSE, '1,0');
    
    expect(civ.getResourcesCapacity().getWorkers()).toBe(initialCap + 5);
  });
});