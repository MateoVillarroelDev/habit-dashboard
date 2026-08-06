import React, { useState, useEffect, useCallback, useRef } from "react";
import { Leaf, Flame, Plus, X, Trash2, Loader2, Pencil, Download, Upload } from "lucide-react";

const PALETTE = [
  { name: "moss", hex: "#7FB069" },
  { name: "gold", hex: "#E8B961" },
  { name: "teal", hex: "#5FA8A0" },
  { name: "plum", hex: "#9B7EBD" },
  { name: "slate", hex: "#6B8CAE" },
  { name: "rose", hex: "#C97B84" },
];

const STORAGE_KEY = "habits";

const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const startOfDay = (d) => {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
};

const lastNDates = (n) => {
  const out = [];
  const today = startOfDay(new Date());
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
};

const calcStreak = (completions) => {
  let streak = 0;
  const cursor = startOfDay(new Date());
  if (!completions[fmt(cursor)]) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (completions[fmt(cursor)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const calcLongestStreak = (completions) => {
  const dates = Object.keys(completions).sort();
  if (dates.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const diffDays = Math.round((new Date(dates[i]) - new Date(dates[i - 1])) / 86400000);
    current = diffDays === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const DAY_WINDOW = 30;

export default function HabitDashboard() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageOk, setStorageOk] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0].hex);
  const [now, setNow] = useState(new Date());
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState(PALETTE[0].hex);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setHabits(JSON.parse(raw));
    } catch (e) {
      // key not found yet, or corrupted data — start empty
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = useCallback((next) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setStorageOk(true);
    } catch (e) {
      setStorageOk(false);
    }
  }, []);

  const updateHabits = (next) => {
    setHabits(next);
    persist(next);
  };

  const addHabit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const habit = {
      id: uid(),
      name: trimmed,
      color,
      createdAt: fmt(new Date()),
      completions: {},
    };
    updateHabits([habit, ...habits]);
    setName("");
    setColor(PALETTE[(PALETTE.findIndex((p) => p.hex === color) + 1) % PALETTE.length].hex);
    setFormOpen(false);
  };

  const toggleDay = (habitId, dateStr) => {
    const next = habits.map((h) => {
      if (h.id !== habitId) return h;
      const completions = { ...h.completions };
      if (completions[dateStr]) delete completions[dateStr];
      else completions[dateStr] = true;
      return { ...h, completions };
    });
    updateHabits(next);
  };

  const removeHabit = (habitId, habitName) => {
    if (!window.confirm(`Delete "${habitName}"? This removes its entire history.`)) return;
    updateHabits(habits.filter((h) => h.id !== habitId));
  };

  const startEdit = (h) => {
    setEditingId(h.id);
    setEditName(h.name);
    setEditColor(h.color);
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = () => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    updateHabits(
      habits.map((h) => (h.id === editingId ? { ...h, name: trimmed, color: editColor } : h))
    );
    setEditingId(null);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(habits, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habits-${fmt(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error("invalid shape");
        if (habits.length > 0 && !window.confirm("Replace current habits with the imported file?")) return;
        updateHabits(parsed);
      } catch (err) {
        window.alert("Couldn't read that file — make sure it's a habits export.");
      }
    };
    reader.readAsText(file);
  };

  const days = lastNDates(DAY_WINDOW);
  const todayStr = fmt(startOfDay(now));
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#10140F",
        color: "#EDEFEA",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
      }}
      className="px-5 py-10 sm:px-10"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }
        .dot-btn:focus-visible {
          outline: 2px solid #E8B961;
          outline-offset: 2px;
        }
        .habit-card {
          transition: border-color 160ms ease, transform 160ms ease;
        }
        .habit-card:hover {
          border-color: rgba(237,239,234,0.16);
        }
        .pop {
          animation: pop 220ms ease;
        }
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0.3; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div className="mx-auto" style={{ maxWidth: 780 }}>
        {/* Header */}
        <header className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p
              className="font-mono text-xs tracking-widest uppercase mb-2"
              style={{ color: "#8A9285" }}
            >
              {dateLabel}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl" style={{ color: "#EDEFEA" }}>
              What's growing today
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={exportData}
              className="dot-btn flex items-center gap-1.5 font-mono text-xs px-2.5 py-1.5 rounded-full"
              style={{ color: "#8A9285", border: "1px solid rgba(237,239,234,0.14)" }}
              title="Export habits as JSON"
            >
              <Download size={13} />
              export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="dot-btn flex items-center gap-1.5 font-mono text-xs px-2.5 py-1.5 rounded-full"
              style={{ color: "#8A9285", border: "1px solid rgba(237,239,234,0.14)" }}
              title="Import habits from JSON"
            >
              <Upload size={13} />
              import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={importData}
              style={{ display: "none" }}
            />
            <Leaf size={28} strokeWidth={1.5} style={{ color: "#7FB069", flexShrink: 0 }} />
          </div>
        </header>

        {!storageOk && (
          <div
            className="mb-6 px-4 py-3 text-sm rounded-md"
            style={{ background: "rgba(201,123,132,0.12)", color: "#C97B84", border: "1px solid rgba(201,123,132,0.3)" }}
          >
            Changes aren't saving right now — keep this tab open so you don't lose progress.
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-16 justify-center" style={{ color: "#8A9285" }}>
            <Loader2 size={18} className="animate-spin" />
            <span className="font-mono text-sm">loading your habits…</span>
          </div>
        ) : (
          <>
            {/* Habit list */}
            <div className="flex flex-col gap-3 mb-6">
              {habits.length === 0 && !formOpen && (
                <div
                  className="rounded-lg py-14 px-6 text-center"
                  style={{ border: "1px dashed rgba(237,239,234,0.14)" }}
                >
                  <p className="font-display text-xl mb-1" style={{ color: "#EDEFEA" }}>
                    Nothing planted yet
                  </p>
                  <p className="text-sm" style={{ color: "#8A9285" }}>
                    Add a habit below and start a streak.
                  </p>
                </div>
              )}

              {habits.map((h) => {
                const streak = calcStreak(h.completions);
                const doneToday = !!h.completions[todayStr];
                const longest = calcLongestStreak(h.completions);
                const last30 = days.filter((d) => h.completions[fmt(d)]).length;
                const pct = Math.round((last30 / DAY_WINDOW) * 100);
                const isEditing = editingId === h.id;
                return (
                  <div
                    key={h.id}
                    className="habit-card rounded-lg px-5 py-4"
                    style={{
                      background: "#1A2019",
                      border: "1px solid rgba(237,239,234,0.08)",
                    }}
                  >
                    {isEditing ? (
                      <div className="mb-3 pop">
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                          className="w-full bg-transparent outline-none font-display text-lg mb-3"
                          style={{ color: "#EDEFEA", borderBottom: "1px solid rgba(237,239,234,0.14)", paddingBottom: 8 }}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {PALETTE.map((p) => (
                              <button
                                key={p.hex}
                                onClick={() => setEditColor(p.hex)}
                                className="dot-btn rounded-full"
                                aria-label={p.name}
                                style={{
                                  width: 18,
                                  height: 18,
                                  background: p.hex,
                                  border: editColor === p.hex ? "2px solid #EDEFEA" : "2px solid transparent",
                                }}
                              />
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={cancelEdit}
                              className="dot-btn px-3 py-1.5 text-sm rounded-full"
                              style={{ color: "#8A9285" }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveEdit}
                              className="dot-btn px-4 py-1.5 text-sm rounded-full font-medium"
                              style={{ background: "#7FB069", color: "#10140F" }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="inline-block rounded-full flex-shrink-0"
                            style={{ width: 9, height: 9, background: h.color }}
                          />
                          <h3 className="font-display text-lg truncate" style={{ color: "#EDEFEA" }}>
                            {h.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center gap-1 font-mono text-sm" style={{ color: streak > 0 ? "#E8B961" : "#8A9285" }}>
                            <Flame size={14} strokeWidth={2} />
                            {streak}
                          </div>
                          <button
                            onClick={() => toggleDay(h.id, todayStr)}
                            className="dot-btn text-xs font-mono px-3 py-1.5 rounded-full transition-colors"
                            style={{
                              background: doneToday ? h.color : "transparent",
                              border: `1px solid ${doneToday ? h.color : "rgba(237,239,234,0.2)"}`,
                              color: doneToday ? "#10140F" : "#EDEFEA",
                            }}
                          >
                            {doneToday ? "done today" : "mark today"}
                          </button>
                          <button
                            onClick={() => startEdit(h)}
                            className="dot-btn opacity-40 hover:opacity-90 transition-opacity"
                            aria-label={`Edit ${h.name}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => removeHabit(h.id, h.name)}
                            className="dot-btn opacity-40 hover:opacity-90 transition-opacity"
                            aria-label={`Delete ${h.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {!isEditing && (
                      <p className="font-mono text-xs mb-3" style={{ color: "#8A9285" }}>
                        {pct}% last 30d · best streak {longest}
                      </p>
                    )}

                    {/* vine + dots */}
                    <div className="relative pt-1">
                      <div
                        className="absolute left-0 right-0"
                        style={{ top: 9, height: 1, background: "rgba(237,239,234,0.08)" }}
                      />
                      <div className="flex justify-between relative">
                        {days.map((d) => {
                          const ds = fmt(d);
                          const done = !!h.completions[ds];
                          const isToday = ds === todayStr;
                          return (
                            <button
                              key={ds}
                              onClick={() => toggleDay(h.id, ds)}
                              className="dot-btn rounded-full flex-shrink-0"
                              title={d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                              style={{
                                width: isToday ? 10 : 7,
                                height: isToday ? 10 : 7,
                                background: done ? h.color : "#242B23",
                                border: isToday
                                  ? `1.5px solid ${done ? h.color : "rgba(237,239,234,0.4)"}`
                                  : "none",
                                boxShadow: isToday && !done ? "0 0 0 2px rgba(237,239,234,0.06)" : "none",
                              }}
                              aria-label={`${d.toDateString()}${done ? ", completed" : ""}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add habit */}
            {formOpen ? (
              <div
                className="rounded-lg px-5 py-4 pop"
                style={{ background: "#1A2019", border: "1px solid rgba(237,239,234,0.12)" }}
              >
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addHabit()}
                  placeholder="Name your habit"
                  className="w-full bg-transparent outline-none font-display text-lg mb-4"
                  style={{ color: "#EDEFEA", borderBottom: "1px solid rgba(237,239,234,0.14)", paddingBottom: 8 }}
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {PALETTE.map((p) => (
                      <button
                        key={p.hex}
                        onClick={() => setColor(p.hex)}
                        className="dot-btn rounded-full"
                        aria-label={p.name}
                        style={{
                          width: 20,
                          height: 20,
                          background: p.hex,
                          border: color === p.hex ? "2px solid #EDEFEA" : "2px solid transparent",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFormOpen(false)}
                      className="dot-btn px-3 py-1.5 text-sm rounded-full"
                      style={{ color: "#8A9285" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addHabit}
                      className="dot-btn px-4 py-1.5 text-sm rounded-full font-medium"
                      style={{ background: "#7FB069", color: "#10140F" }}
                    >
                      Add habit
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setFormOpen(true)}
                className="dot-btn w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-sm"
                style={{
                  border: "1px solid rgba(237,239,234,0.14)",
                  color: "#8A9285",
                }}
              >
                <Plus size={15} />
                New habit
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
