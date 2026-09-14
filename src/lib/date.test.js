import { describe, it, expect } from "vitest";
import { fmt, startOfDay, lastNDates } from "./date";

describe("fmt", () => {
  it("formats a date as YYYY-MM-DD, zero-padded", () => {
    expect(fmt(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(fmt(new Date(2026, 10, 21))).toBe("2026-11-21");
  });
});

describe("startOfDay", () => {
  it("zeroes out the time components", () => {
    const d = new Date(2026, 5, 15, 13, 45, 30, 500);
    const result = startOfDay(d);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it("does not mutate the input date", () => {
    const d = new Date(2026, 5, 15, 13, 45);
    startOfDay(d);
    expect(d.getHours()).toBe(13);
  });
});

describe("lastNDates", () => {
  it("returns n dates ending today, in ascending order", () => {
    const dates = lastNDates(5);
    expect(dates).toHaveLength(5);
    const today = startOfDay(new Date());
    expect(fmt(dates[4])).toBe(fmt(today));
    for (let i = 1; i < dates.length; i++) {
      const diff = Math.round((dates[i] - dates[i - 1]) / 86400000);
      expect(diff).toBe(1);
    }
  });
});
