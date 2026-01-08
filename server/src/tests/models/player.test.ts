import { describe, it, expect, vi } from 'vitest';
import { Player } from '../../models/player';
import { Civilisation } from '../../models/civilisation';

describe('Player Class', () => {
  const mockCiv = {
    getName: () => 'Roman',
  } as Civilisation;

  describe('Constructor & Validation', () => {
    it('should create a player with a valid hex color', () => {
      const player = new Player('p1', 'Alice', mockCiv, '#FF5733');
      expect(player.getColor()).toBe('#FF5733');
      expect(player.getName()).toBe('Alice');
    });

    it('should throw an error if an invalid color format is provided', () => {
      expect(() => {
        new Player('p1', 'Alice', mockCiv, 'not-a-color');
      }).toThrow('Invalid color format');
      
      expect(() => {
        new Player('p1', 'Alice', mockCiv, '#ZZZ123'); // Invalid Hex
      }).toThrow();
    });

    it('should correctly identify NPC status', () => {
      const npc = new Player('p2', 'CPU_1', mockCiv, '#000', true);
      const human = new Player('p3', 'Bob', mockCiv, '#FFF', false);

      expect(npc.getIsNPC()).toBe(true);
      expect(human.getIsNPC()).toBe(false);
    });
  });

  describe('serialize()', () => {
    it('should return a flat object representation of the player', () => {
      const player = new Player('p1', 'Alice', mockCiv, '#00FF00', false);
      const data = player.serialize();

      expect(data).toEqual({
        id: 'p1',
        name: 'Alice',
        color: '#00FF00',
        isNPC: false,
        civilisationName: 'Roman'
      });
    });
  });
});