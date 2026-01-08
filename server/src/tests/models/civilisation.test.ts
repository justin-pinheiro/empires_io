import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Civilisation } from '../../models/civilisation.js';
import { Resources } from '../../models/resources.js';
import { getRequiredScience } from '../../models/age.js';

describe('Civilisation Class', () => {
  let civ: Civilisation;

  beforeEach(() => {
    civ = new Civilisation('Rome');
  });

  it('should initialize with correct default values', () => {
    expect(civ.getName()).toBe('Rome');
    expect(civ.getAge()).toBe(1);
  });

  describe('tryAdvanceAge()', () => {
    it('should return false and not level up if science is insufficient', () => {
      const success = civ.tryAdvanceAge();
      
      expect(success).toBe(false);
      expect(civ.getAge()).toBe(1);
    });

    it('should return true, level up, and deduct science if science is sufficient', () => {
      const cost = Resources.from( { science: getRequiredScience(2) } ); 
      console.log("cost: " + cost.getScience());

      civ.updateResourcesCapacity(cost, 1);
      civ.addToResources(cost);
      const success = civ.tryAdvanceAge();

      expect(success).toBe(true);
      expect(civ.getAge()).toBe(2);
      expect(civ.getResources().getScience()).toBe(0);
    });
  });

  describe('addToResources()', () => {
    it('should respect the capacity limits', () => {
      civ.updateResourcesCapacity(Resources.from( {food: 10} ), 1);
      civ.addToResources(Resources.from( {food: 50} ));

      expect(civ.getResources().getFood()).toBe(10);
    });
  });
});