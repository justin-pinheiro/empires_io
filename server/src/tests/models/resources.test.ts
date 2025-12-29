import { test, describe } from 'vitest';
import assert from 'node:assert/strict';
import { Resources } from '../../models/resources.js';

describe('Resources Class', () => {
  
  test('should initialize with default zeros', () => {
    const res = new Resources();
    assert.strictEqual(res.getFood(), 0);
  });

  test('add() should sum values correctly', () => {
    const pool = new Resources(10, 10, 10, 10, 10);
    const gain = new Resources(5, 0, 5, 0, 5);
    
    pool.add(gain);

    assert.strictEqual(pool.getFood(), 15);
    assert.strictEqual(pool.getGold(), 10);
    assert.strictEqual(pool.getMaterials(), 15);
  });

  test('hasEnough() should return true only if all resources meet requirements', () => {
    const wallet = new Resources(100, 100, 100, 100, 100);
    const expensiveCost = new Resources(50, 150, 50, 50, 50);
    const affordableCost = new Resources(50, 50, 50, 50, 50);

    assert.strictEqual(wallet.hasEnough(affordableCost), true, 'Should afford cheap cost');
    assert.strictEqual(wallet.hasEnough(expensiveCost), false, 'Should not afford if one resource is lacking');
  });

  test('serialize() should return floored integers', () => {
    const res = new Resources(10.7, 5.2);
    const data = res.serialize();

    assert.strictEqual(data.food, 10);
    assert.strictEqual(data.gold, 5);
  });
});