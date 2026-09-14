import { describe, it, expect } from "vitest";
import { calcStreak, calcLongestStreak } from "./streaks";
import { fmt } from "./date";

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmt(d);
};

describe("calcStreak", () => {
  it("is 0 with no completions", () => {
    expect(calcStreak({})).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    const completions = { [daysAgo(0)]: true, [daysAgo(1)]: true, [daysAgo(2)]: true };
    expect(calcStreak(completions)).toBe(3);
  });

  it("still counts a streak that ended yesterday (grace for today)", () => {
    const completions = { [daysAgo(1)]: true, [daysAgo(2)]: true };
    expect(calcStreak(completions)).toBe(2);
  });

  it("resets to 0 once there's a gap before yesterday", () => {
    const completions = { [daysAgo(3)]: true, [daysAgo(4)]: true };
    expect(calcStreak(completions)).toBe(0);
  });
});

describe("calcLongestStreak", () => {
  it("is 0 with no completions", () => {
    expect(calcLongestStreak({})).toBe(0);
  });

  it("finds the longest run of consecutive dates, not just the latest", () => {
    const completions = {
      "2026-01-01": true,
      "2026-01-02": true,
      "2026-01-03": true,
      "2026-01-10": true,
      "2026-01-11": true,
    };
    expect(calcLongestStreak(completions)).toBe(3);
  });

  it("treats a single completion as a streak of 1", () => {
    expect(calcLongestStreak({ "2026-01-01": true })).toBe(1);
  });
});
