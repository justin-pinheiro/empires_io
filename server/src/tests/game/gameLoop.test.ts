import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '../../game/gameLoop.js';

describe('GameLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should trigger callback with correct delta time', async () => {
    const callback = vi.fn();
    const loop = new GameLoop(callback, 1); // 1 second tick rate

    loop.start(); // first call happens here, now=0, lastTime=0, dt=0
    
    // Advance time by 1 second
    vi.advanceTimersByTime(1000); 
    
    // Now the second tick has fired.
    // call 0: dt=0
    // call 1: dt=1
    expect(callback).toHaveBeenCalledTimes(2);

    const dt = callback.mock.calls[1]![0]; // Use ! to tell TS this exists
    expect(dt).toBe(1); 
  });

  test('should stop when stop() is called', () => {
    const callback = vi.fn();
    const loop = new GameLoop(callback, 0.1);

    loop.start();
    loop.stop();
    
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});