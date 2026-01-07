import { describe, it, expect } from 'vitest';
import { Resources } from '../../models/resources.js';

describe('Resources Class', () => {
  describe('Creation', () => {
    it('should create zeroed resources', () => {
      const res = Resources.zero();
      expect(res.getFood()).toBe(0);
      expect(res.getGold()).toBe(0);
      expect(res.getScience()).toBe(0);
      expect(res.getSoldiers()).toBe(0);
      expect(res.getWorkers()).toBe(0);
    });

    it('should create from partial data using .from()', () => {
      const res = Resources.from({ gold: 100, science: 50 });
      expect(res.getFood()).toBe(0);
      expect(res.getGold()).toBe(100);
      expect(res.getScience()).toBe(50);
      expect(res.getSoldiers()).toBe(0);
      expect(res.getWorkers()).toBe(0);
    });
  });

  describe('Arithmetic', () => {
    it('should add resources correctly', () => {
      const wallet = new Resources(10, 10, 10, 10, 10);
      const gain = new Resources(5, 5, 5, 5, 5);
      wallet.add(gain);
      
      expect(wallet.getFood()).toBe(15);
      expect(wallet.getGold()).toBe(15);
      expect(wallet.getScience()).toBe(15);
      expect(wallet.getSoldiers()).toBe(15);
      expect(wallet.getWorkers()).toBe(15);
    });

    it('should subtract and clamp to zero', () => {
      const wallet = new Resources(10, 10, 10, 10, 10);
      const lost = new Resources(20, 5, 0, 0, 0);
      wallet.subtract(lost);

      expect(wallet.getFood()).toBe(0);
      expect(wallet.getGold()).toBe(5);
      expect(wallet.getScience()).toBe(10);
      expect(wallet.getSoldiers()).toBe(10);
      expect(wallet.getWorkers()).toBe(10);
    });
  });

  describe('Validation & Serialization', () => {
    it('should return true for hasEnough when exactly matching', () => {
      const wallet = new Resources(50, 50, 50, 50, 50);
      const cost = new Resources(50, 20, 10, 0, 0);
      expect(wallet.hasEnough(cost)).toBe(true);
    });

    it('should return false for hasEnough when a single resource is missing', () => {
      const wallet = new Resources(100, 100, 0, 100, 100);
      const cost = new Resources(10, 10, 1, 10, 10);
      expect(wallet.hasEnough(cost)).toBe(false);
    });

    it('should serialize and floor values', () => {
      const res = new Resources(10.9, 5.1, 0, 0.1, 0);
      expect(res.serialize()).toEqual({
        food: 10,
        gold: 5,
        science: 0,
        soldiers: 0,
        workers: 0
      });
    });
  });

  describe('Immutability', () => {
    it('should clone correctly without maintaining reference', () => {
      const original = new Resources(10, 10, 10, 10, 10);
      const copy = original.clone();
      
      copy.add(new Resources(10, 0, 0, 0, 0));
      
      expect(original.getFood()).toBe(10);
      expect(copy.getFood()).toBe(20);
    });
  });
});