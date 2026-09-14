import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEY } from "../constants";
import { fmt } from "../lib/date";
import { uid } from "../lib/id";
import { validateHabitName } from "../lib/validation";

export function useHabits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setHabits(JSON.parse(raw));
    } catch {
      // key not found yet, or corrupted data — start empty
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = useCallback((next) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageOk(true);
    } catch {
      setStorageOk(false);
    }
  }, []);

  const updateHabits = useCallback(
    (next) => {
      setHabits(next);
      persist(next);
    },
    [persist]
  );

  const addHabit = useCallback(
    (rawName, color) => {
      const result = validateHabitName(rawName, habits);
      if (!result.ok) return result;
      const habit = { id: uid(), name: result.name, color, createdAt: fmt(new Date()), completions: {} };
      updateHabits([habit, ...habits]);
      return { ok: true };
    },
    [habits, updateHabits]
  );

  const editHabit = useCallback(
    (id, rawName, color) => {
      const result = validateHabitName(rawName, habits, id);
      if (!result.ok) return result;
      updateHabits(habits.map((h) => (h.id === id ? { ...h, name: result.name, color } : h)));
      return { ok: true };
    },
    [habits, updateHabits]
  );

  const toggleDay = useCallback(
    (habitId, dateStr) => {
      updateHabits(
        habits.map((h) => {
          if (h.id !== habitId) return h;
          const completions = { ...h.completions };
          if (completions[dateStr]) delete completions[dateStr];
          else completions[dateStr] = true;
          return { ...h, completions };
        })
      );
    },
    [habits, updateHabits]
  );

  const removeHabit = useCallback(
    (habitId) => {
      updateHabits(habits.filter((h) => h.id !== habitId));
    },
    [habits, updateHabits]
  );

  return {
    habits,
    loading,
    storageOk,
    addHabit,
    editHabit,
    toggleDay,
    removeHabit,
    updateHabits,
  };
}
