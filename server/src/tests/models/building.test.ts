import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Resources } from '../../models/resources';

vi.mock('../../models/buildingData.js', () => {
  // Define a specific interface for the mock structure
  interface MockLevel {
    name: string;
    baseHealth: number;
    production: Resources;
    productionRate: number;
    resourcesCapacityUpgrade: Resources;
    maxLevel: number;
  }
  
  // Use a Record type to allow indexing by any string (the BuildingType)
  const MOCK_STATS: Record<string, Record<number, MockLevel>> = {
    'FARM': {
      1: {
        name: 'Farm',
        baseHealth: 100,
        production: new Resources(10, 0, 0, 0, 0),
        productionRate: 1,
        resourcesCapacityUpgrade: new Resources(50, 0, 0, 0, 0),
        maxLevel: 2,
      },
      2: {
        name: 'Farm',
        baseHealth: 200,
        production: new Resources(20, 0, 0, 0, 0),
        productionRate: 1.5,
        resourcesCapacityUpgrade: new Resources(100, 0, 0, 0, 0),
        maxLevel: 2,
      }
    }
  };
  
  return {
    BuildingType: {
      FARM: 'FARM',
    },
    BUILDING_STATS: MOCK_STATS,
    hasNextLevel: (type: string, lvl: number) => !!MOCK_STATS[type]?.[lvl + 1]
  };
});

import { Building } from '../../models/building';
import { BuildingType } from '../../models/buildingData';

describe('Building Class', () => {
  let farm: Building;
  const OWNER = 'player_1';

  beforeEach(() => {
    farm = new Building(BuildingType.FARM as any, OWNER);
  });

  describe('Stats Registry Integration', () => {
    it('should correctly pull initial stats from BUILDING_STATS', () => {
      expect(farm.stats.name).toBe('Farm');
      expect(farm.stats.baseHealth).toBe(100);
    });

    it('should throw an error if instantiated with a type not in the registry', () => {
      expect(() => {
          new Building('NON_EXISTENT' as any, OWNER);
        }).toThrow("Configuration missing: No stats found for NON_EXISTENT at level 1");
      });
  });

  describe('Upgrading Logic', () => {
    it('should transition to level 2 stats after upgrade', () => {
      expect(farm.getLevel()).toBe(1);
      expect(farm.stats.baseHealth).toBe(100);

      farm.upgrade();

      expect(farm.getLevel()).toBe(2);
      expect(farm.stats.baseHealth).toBe(200);
    });

    it('should respect hasNextLevel and not exceed maxLevel', () => {
      farm.upgrade(); // to lvl 2
      farm.upgrade(); // should fail to lvl 3
      expect(farm.getLevel()).toBe(2);
    });
  });

  describe('Resource Production', () => {
    it('should calculate production correctly with multipliers', () => {
      // Level 1 Farm: 10 food * 1 rate * 2 multiplier = 20
      const prod = farm.calculateProduction(2);
      expect(prod.getFood()).toBe(20);
    });

    it('should update production amounts when leveled up', () => {
      farm.upgrade();
      // Level 2 Farm: 20 food * 1.5 rate * 1 multiplier = 30
      const prod = farm.calculateProduction(1);
      expect(prod.getFood()).toBe(30);
    });
  });

  describe('Health and Survival', () => {
    it('should start with health equal to baseHealth', () => {
      expect(farm.getHealth().current).toBe(100);
    });

    it('should handle damage and destruction', () => {
      farm.takeDamage(100);
      expect(farm.isDestroyed()).toBe(true);
      expect(farm.getHealth().current).toBe(0);
    });

    it('should clamp health to 0 and not go negative', () => {
      farm.takeDamage(500);
      expect(farm.getHealth().current).toBe(0);
    });
  });
});