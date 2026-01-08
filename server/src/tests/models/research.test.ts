import { describe, expect, it } from "vitest";
import { Research } from "../../models/research";
import { ScienceBonusType } from "../../models/scienceBonus";

describe('Research Class', () => {
  it('should not allow upgrade if no pending points exist', () => {
    const res = new Research();
    const success = res.applyUpgrade(ScienceBonusType.ARMY);
    expect(success).toBe(false);
    expect(res.getLevel(ScienceBonusType.ARMY)).toBe(0);
  });

  it('should consume a point and increase level on success', () => {
    const res = new Research();
    res.addUpgradePoint();
    
    const success = res.applyUpgrade(ScienceBonusType.ARMY);
    
    expect(success).toBe(true);
    expect(res.getLevel(ScienceBonusType.ARMY)).toBe(1);
    expect(res.getPendingUpgrades()).toBe(0);
  });

  it('should return a multiplier of 1.0 for unresearched tech', () => {
    const res = new Research();
    expect(res.getMultiplier(ScienceBonusType.PRODUCTION)).toBe(1.0);
  });
});