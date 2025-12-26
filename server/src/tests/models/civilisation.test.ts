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
    expect(civ.getPopulationCapacity()).toBe(0);
  });

  test('updateWorkingPopulation should not exceed capacity', () => {
    civ.updatePopulationCapacity(10);
    civ.updateWorkingPopulation(15); // Try to add more than capacity

    expect(civ.getWorkingPopulation()).toBe(10);
  });

  test('updateWorkingPopulation should not drop below zero', () => {
    civ.updateWorkingPopulation(-5);
    expect(civ.getWorkingPopulation()).toBe(0);
  });

  test('getResources should return a copy, not a reference', () => {
    const res = civ.getResources();
    res.add(new Resources(100, 100)); // Modify the returned object
    
    // The internal civ resources should still be 0
    expect(civ.getResources().getFood()).toBe(0);
  });
});