import { describe, it, expect } from 'vitest';
import { getRequiredScience, getNextAge, getSerializedAgesData } from '../../models/age';
import { AGE_BASE_SCIENCE_COST } from '../../config/constants';

describe('Age Logic', () => {
  describe('getRequiredScience()', () => {
    it('should return base cost for Age 1', () => {
      expect(getRequiredScience(1)).toBe(AGE_BASE_SCIENCE_COST);
    });

    it('should double the cost for each subsequent age', () => {
      expect(getRequiredScience(2)).toBe(AGE_BASE_SCIENCE_COST*2);
      expect(getRequiredScience(3)).toBe(AGE_BASE_SCIENCE_COST*4);
      expect(getRequiredScience(4)).toBe(AGE_BASE_SCIENCE_COST*8);
    });

    it('should calculate high-level costs correctly (Age 10)', () => {
      expect(getRequiredScience(10)).toBe(AGE_BASE_SCIENCE_COST*512);
    });
  });

  describe('getNextAge()', () => {
    it('should return the next age number for valid transitions', () => {
      expect(getNextAge(1)).toBe(2);
      expect(getNextAge(9)).toBe(10);
    });

    it('should return null when attempting to progress past MAX age', () => {
      expect(getNextAge(10)).toBe(null);
    });
  });

  describe('getSerializedAgesData()', () => {
    it('should generate an array of all 10 ages', () => {
      const data = getSerializedAgesData();
      
      expect(data).toHaveLength(10);
      expect(data[0]).toEqual({ ageNumber: 1, requiredScience: AGE_BASE_SCIENCE_COST });
      expect(data[9]).toEqual({ ageNumber: 10, requiredScience: AGE_BASE_SCIENCE_COST*512 });
    });
  });
});