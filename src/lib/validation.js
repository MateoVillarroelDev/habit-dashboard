import { fmt } from "./date";
import { MAX_NAME_LENGTH } from "../constants";

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

const isPlainObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);

export function validateHabitName(rawName, existingHabits, ignoreId = null) {
  const name = (rawName ?? "").trim();
  if (!name) return { ok: false, error: "Give your habit a name." };
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: `Keep it under ${MAX_NAME_LENGTH} characters.` };
  }
  const clash = existingHabits.some(
    (h) => h.id !== ignoreId && h.name.toLowerCase() === name.toLowerCase()
  );
  if (clash) return { ok: false, error: "You already have a habit with that name." };
  return { ok: true, name };
}

export function validateImportedHabits(parsed) {
  if (!Array.isArray(parsed)) {
    return { ok: false, error: "Expected a list of habits, got something else." };
  }

  const seenIds = new Set();
  const seenNames = new Set();
  const habits = [];

  for (let i = 0; i < parsed.length; i++) {
    const entry = parsed[i];
    const label = `Item ${i + 1}`;

    if (!isPlainObject(entry)) {
      return { ok: false, error: `${label} isn't a valid habit object.` };
    }

    const { id, name, color, createdAt, completions } = entry;

    if (typeof id !== "string" || !id) {
      return { ok: false, error: `${label} is missing a valid id.` };
    }
    if (seenIds.has(id)) {
      return { ok: false, error: `${label} has a duplicate id ("${id}").` };
    }

    if (typeof name !== "string" || !name.trim()) {
      return { ok: false, error: `${label} is missing a name.` };
    }
    const trimmedName = name.trim();
    if (trimmedName.length > MAX_NAME_LENGTH) {
      return { ok: false, error: `"${trimmedName}" is longer than ${MAX_NAME_LENGTH} characters.` };
    }
    const nameKey = trimmedName.toLowerCase();
    if (seenNames.has(nameKey)) {
      return { ok: false, error: `Duplicate habit name "${trimmedName}" in file.` };
    }

    if (typeof color !== "string" || !HEX_COLOR_RE.test(color)) {
      return { ok: false, error: `"${trimmedName}" has an invalid color value.` };
    }

    if (!isPlainObject(completions)) {
      return { ok: false, error: `"${trimmedName}" has invalid completion data.` };
    }
    for (const key of Object.keys(completions)) {
      if (!DATE_KEY_RE.test(key)) {
        return { ok: false, error: `"${trimmedName}" has an invalid date entry ("${key}").` };
      }
    }

    seenIds.add(id);
    seenNames.add(nameKey);
    habits.push({
      id,
      name: trimmedName,
      color,
      createdAt: typeof createdAt === "string" && createdAt ? createdAt : fmt(new Date()),
      completions,
    });
  }

  return { ok: true, habits };
}
