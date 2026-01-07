import { describe, it, expect, beforeEach } from 'vitest';
import { Tile } from '../../models/tile.js';
import { TERRAIN_DATA, TerrainType } from '../../models/terrainTypeEnum.js';

describe('Tile Class', () => {
  let defaultTile: Tile;
  const mockId = 'tile-123';
  const mockCoords = { x: 1, y: 2 };

  beforeEach(() => {
    defaultTile = new Tile(
      mockId,
      mockCoords.x,
      mockCoords.y,
      TerrainType.PLAIN,
    );
  });

  describe('Initialization and getters', () => {
    it('should correctly initialize with provided values', () => {
      expect(defaultTile.getId()).toBe(mockId);
      expect(defaultTile.getCoords()).toEqual(mockCoords);
      expect(defaultTile.getTerrainType()).toBe(TerrainType.PLAIN);
    });

    it('should initialize with an empty neighbors array by default', () => {
      expect(defaultTile.getNeighbors()).toEqual([]);
    });
  });

  describe('State management', () => {
    it('should update terrain type', () => {
      defaultTile.setTerrainType(TerrainType.MOUNTAIN);
      expect(defaultTile.getTerrainType()).toBe(TerrainType.MOUNTAIN);
    });

    it('should add a unique neighbor ID', () => {
      defaultTile.addNeighbor('tile-456');
      expect(defaultTile.getNeighbors()).toContain('tile-456');
      expect(defaultTile.getNeighbors().length).toBe(1);
    });

    it('should allow adding null as a neighbor (representing map edges)', () => {
      defaultTile.addNeighbor(null);
      expect(defaultTile.getNeighbors()).toContain(null);
    });

    it('should not add duplicate neighbor IDs', () => {
      defaultTile.addNeighbor('tile-2');
      defaultTile.addNeighbor('tile-2');
      
      const neighbors = defaultTile.getNeighbors();
      const count = neighbors.filter(id => id === 'tile-2').length;
      
      expect(count).toBe(1);
    });
  });

  describe('Serialization', () => {
    it('should return a correctly formatted data object', () => {
      defaultTile.addNeighbor('tile-neighbor');
      const serialized = defaultTile.serialize();

      expect(serialized).toEqual({
        id: mockId,
        x: mockCoords.x,
        y: mockCoords.y,
        neighbors: ['tile-neighbor'],
        terrain: TERRAIN_DATA[TerrainType.PLAIN]
      });
    });
  });
});