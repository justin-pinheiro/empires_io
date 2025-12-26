import { describe, test, expect, beforeEach } from 'vitest';
import { Building } from '../../models/building.js';
import { BuildingType } from '../../models/buildingData.js';

describe('Building Class', () => {
  let farm: Building;

  beforeEach(() => {
    // Farm has 40 base health, 0.4 production rate, 1 food production
    farm = new Building(BuildingType.FARM, 'player-1');
  });

  test('should initialize with full health from stats', () => {
    expect(farm.getHealth().current).toBe(40);
  });

  test('takeDamage should reduce health but not below zero', () => {
    farm.takeDamage(30);
    expect(farm.getHealth().current).toBe(10);
    
    farm.takeDamage(20);
    expect(farm.getHealth().current).toBe(0);
    expect(farm.isDestroyed()).toBe(true);
  });

  test('calculateYield should scale correctly with time delta', () => {
    // Production: 1 Food * 0.4 Rate * 10 seconds = 4 Food
    const yieldRes = farm.calculateYield(10);
    expect(yieldRes.getFood()).toBe(4);
    expect(yieldRes.getGold()).toBe(0);
  });

  test('repair should not exceed max health', () => {
    farm.takeDamage(10); // 30/40
    farm.repair(100);    // Try to over-repair
    expect(farm.getHealth().current).toBe(40);
  });
});