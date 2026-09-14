import { describe, it, expect } from "vitest";
import { validateHabitName, validateImportedHabits } from "./validation";
import { MAX_NAME_LENGTH } from "../constants";

const habit = (overrides = {}) => ({
  id: "abc123",
  name: "Read",
  color: "#7FB069",
  createdAt: "2026-01-01",
  completions: { "2026-01-01": true },
  ...overrides,
});

describe("validateHabitName", () => {
  it("rejects an empty or whitespace-only name", () => {
    expect(validateHabitName("", []).ok).toBe(false);
    expect(validateHabitName("   ", []).ok).toBe(false);
  });

  it("rejects a name longer than the max length", () => {
    const tooLong = "a".repeat(MAX_NAME_LENGTH + 1);
    const result = validateHabitName(tooLong, []);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/characters/);
  });

  it("rejects a duplicate name, case-insensitively", () => {
    const result = validateHabitName("read", [habit({ name: "Read" })]);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/already have/);
  });

  it("allows a habit to keep its own name when editing (ignoreId)", () => {
    const existing = habit({ id: "abc123", name: "Read" });
    const result = validateHabitName("Read", [existing], "abc123");
    expect(result.ok).toBe(true);
  });

  it("trims whitespace and accepts a valid name", () => {
    const result = validateHabitName("  Meditate  ", []);
    expect(result.ok).toBe(true);
    expect(result.name).toBe("Meditate");
  });
});

describe("validateImportedHabits", () => {
  it("rejects non-array input", () => {
    expect(validateImportedHabits({}).ok).toBe(false);
    expect(validateImportedHabits(null).ok).toBe(false);
  });

  it("accepts a well-formed list", () => {
    const result = validateImportedHabits([habit()]);
    expect(result.ok).toBe(true);
    expect(result.habits).toHaveLength(1);
  });

  it("rejects an entry with a missing id", () => {
    const result = validateImportedHabits([habit({ id: "" })]);
    expect(result.ok).toBe(false);
  });

  it("rejects duplicate ids across entries", () => {
    const result = validateImportedHabits([habit({ id: "x" }), habit({ id: "x", name: "Other" })]);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/duplicate id/i);
  });

  it("rejects duplicate names across entries", () => {
    const result = validateImportedHabits([habit({ id: "a" }), habit({ id: "b" })]);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/duplicate habit name/i);
  });

  it("rejects an invalid color", () => {
    const result = validateImportedHabits([habit({ color: "green" })]);
    expect(result.ok).toBe(false);
  });

  it("rejects completions with a malformed date key", () => {
    const result = validateImportedHabits([habit({ completions: { "not-a-date": true } })]);
    expect(result.ok).toBe(false);
  });

  it("falls back to today for a missing createdAt", () => {
    const result = validateImportedHabits([habit({ createdAt: undefined })]);
    expect(result.ok).toBe(true);
    expect(result.habits[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
