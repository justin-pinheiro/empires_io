import { describe, test, expect, beforeEach } from 'vitest';
import { Civilisation } from '../../models/civilisation.js';
import { Resources } from '../../models/resources.js';

describe('Civilisation Class', () => {
  let civ: Civilisation;

  beforeEach(() => {
    civ = new Civilisation('Rome');
  });

  test('should initialize with name and zero stats', () => {
    expect(civ.getName()).toBe('Rome');
    expect(civ.getResourcesCapacity().getWorkers()).toBe(0);
  });

  test('addToResources workers should not exceed capacity', () => {
    civ.updateResourcesCapacity(new Resources(0,0,0,0,0,10), 1);
    civ.addToResources(new Resources(0,0,0,0,0,15)); // Try to add more than capacity

    expect(civ.getResources().getWorkers()).toBe(10);
  });

  test('subtractFromResources workers should not drop below zero', () => {
    civ.subtractFromResources(new Resources(0,0,0,0,0,5));
    expect(civ.getResources().getWorkers()).toBe(0);
  });

  test('getResources should return a copy, not a reference', () => {
    const res = civ.getResources();
    res.add(new Resources(100, 100, 0, 0, 0, 0)); // Modify the returned object
    
    // The internal civ resources should still be 0
    expect(civ.getResources().getFood()).toBe(0);
  });
});