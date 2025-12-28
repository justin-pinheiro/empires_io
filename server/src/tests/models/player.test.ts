import { describe, test, expect } from 'vitest';
import { Player } from '../../models/player.js';
import { Civilisation } from '../../models/civilisation.js';

describe('Player Class', () => {
  const mockCiv = new Civilisation('Rome');

  test('should create a player with correct properties', () => {
    const player = new Player('p1', 'Alice', mockCiv, '#FF0000', false);
    
    expect(player.getId()).toBe('p1');
    expect(player.getName()).toBe('Alice');
    expect(player.getCivilisation().getName()).toBe('Rome');
  });

  test('should throw error on invalid hex color', () => {
    expect(() => {
      new Player('p1', 'Alice', mockCiv, 'red', false);
    }).toThrow('Invalid color format');
  });

  test('serialize() should include nested civilisation data', () => {
    const player = new Player('p1', 'Alice', mockCiv, '#00FF00', true);
    const data = player.serialize();

    expect(data.civilisationName).toBe('Rome');
    expect(data.isNPC).toBe(true);
  });
});