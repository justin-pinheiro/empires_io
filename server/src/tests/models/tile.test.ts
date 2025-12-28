import { test, describe } from 'vitest';
import assert from 'node:assert/strict';
import { Tile } from '../../models/tile.js';
import { TerrainType } from '../../models/terrainTypeEnum.js';

describe('Tile Class', () => {
  
  test('should initialize with correct values', () => {
    const tile = new Tile('1-1', 1, 1, null, TerrainType.PLAIN);
    
    assert.strictEqual(tile.getId(), '1-1');
    assert.strictEqual(tile.getTerrainType(), TerrainType.PLAIN);
    assert.deepStrictEqual(tile.getCoords(), { x: 1, y: 1 });
  });

  test('should add neighbors correctly and avoid duplicates', () => {
    const tile = new Tile('1-1', 1, 1, null, TerrainType.PLAIN);
    tile.addNeighbor('1-2');
    tile.addNeighbor('1-2'); // Duplicate

    assert.strictEqual(tile.getNeighbors().length, 1);
    assert.ok(tile.getNeighbors().includes('1-2'));
  });

  test('serialize() should return full terrain metadata', () => {
    const tile = new Tile('1-1', 0, 0, null, TerrainType.WATER);
    const data = tile.serialize();

    assert.strictEqual(data.terrain.name, "Water");
    assert.strictEqual(data.terrain.color, "#3498db");
  });

  test('toJSON() should be called during JSON stringification', () => {
    const tile = new Tile('1-1', 0, 0, null, TerrainType.DESERT);
    const jsonString = JSON.stringify(tile);
    
    assert.ok(jsonString.includes('"name":"Desert"'));
  });
});