import { describe, test, expect } from 'vitest';
import { GameMap } from '../../models/map.js';

describe('GameMap Class', () => {
  
  test('should generate the correct number of tiles for size 2', () => {
    // A hex grid of size N has 3N^2 + 3N + 1 tiles.
    // Size 2: 3(4) + 3(2) + 1 = 19 tiles.
    const map = new GameMap(2);
    expect(map.getAllTileIds().length).toBe(19);
  });

  test('center tile (0,0) should have 6 neighbors in a size 2 map', () => {
    const map = new GameMap(2);
    const centerTile = map.getTile('0,0');
    expect(centerTile?.getNeighbors().length).toBe(6);
  });

  test('corner tile should have fewer neighbors', () => {
    const map = new GameMap(2);
    const cornerTile = map.getTile('2,0'); // One of the far edges
    expect(cornerTile?.getNeighbors().length).toBeLessThan(6);
  });

  test('should correctly manage building placement', () => {
    const map = new GameMap(2);
    const mockBuilding = { type: 'FARM' } as any;
    
    map.setBuilding('0,0', mockBuilding);
    expect(map.getBuildingsCount()).toBe(1);
    expect(map.getBuilding('0,0')).toBe(mockBuilding);
    
    map.removeBuilding('0,0');
    expect(map.getBuildingsCount()).toBe(0);
  });
});