import { useState, useEffect, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import Header from "./components/Header";
import HabitCard from "./components/HabitCard";
import HabitNameEditor from "./components/HabitNameEditor";
import { useHabits } from "./hooks/useHabits";
import { validateImportedHabits } from "./lib/validation";
import { fmt, startOfDay, lastNDates } from "./lib/date";
import { PALETTE, DAY_WINDOW } from "./constants";

export default function HabitDashboard() {
  const { habits, loading, storageOk, addHabit, editHabit, toggleDay, removeHabit, updateHabits } = useHabits();

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0].hex);
  const [formError, setFormError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState(PALETTE[0].hex);
  const [editError, setEditError] = useState(null);

  const [now, setNow] = useState(new Date());
  const fileInputRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const handleAddHabit = () => {
    const result = addHabit(name, color);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setName("");
    setFormError(null);
    setColor(PALETTE[(PALETTE.findIndex((p) => p.hex === color) + 1) % PALETTE.length].hex);
    setFormOpen(false);
  };

  const handleRemove = (habitId, habitName) => {
    if (!window.confirm(`Delete "${habitName}"? This removes its entire history.`)) return;
    removeHabit(habitId);
  };

  const startEdit = (h) => {
    setEditingId(h.id);
    setEditName(h.name);
    setEditColor(h.color);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const saveEdit = () => {
    const result = editHabit(editingId, editName, editColor);
    if (!result.ok) {
      setEditError(result.error);
      return;
    }
    setEditingId(null);
    setEditError(null);
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
      let parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch {
        window.alert("Couldn't read that file — it isn't valid JSON.");
        return;
      }
      const result = validateImportedHabits(parsed);
      if (!result.ok) {
        window.alert(`Couldn't import that file: ${result.error}`);
        return;
      }
      if (habits.length > 0 && !window.confirm("Replace current habits with the imported file?")) return;
      updateHabits(result.habits);
    };
    reader.readAsText(file);
  };

  const days = lastNDates(DAY_WINDOW);
  const todayStr = fmt(startOfDay(now));
  const dateLabel = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

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
        <Header
          dateLabel={dateLabel}
          onExport={exportData}
          onImportClick={() => fileInputRef.current?.click()}
          fileInputRef={fileInputRef}
          onFileSelected={importData}
        />

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
            <div className="flex flex-col gap-3 mb-6">
              {habits.length === 0 && !formOpen && (
                <div className="rounded-lg py-14 px-6 text-center" style={{ border: "1px dashed rgba(237,239,234,0.14)" }}>
                  <p className="font-display text-xl mb-1" style={{ color: "#EDEFEA" }}>
                    Nothing planted yet
                  </p>
                  <p className="text-sm" style={{ color: "#8A9285" }}>
                    Add a habit below and start a streak.
                  </p>
                </div>
              )}

              {habits.map((h) => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  days={days}
                  todayStr={todayStr}
                  isEditing={editingId === h.id}
                  editName={editName}
                  editColor={editColor}
                  editError={editingId === h.id ? editError : null}
                  onEditNameChange={setEditName}
                  onEditColorChange={setEditColor}
                  onStartEdit={startEdit}
                  onCancelEdit={cancelEdit}
                  onSaveEdit={saveEdit}
                  onToggleDay={toggleDay}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {formOpen ? (
              <div className="rounded-lg px-5 py-4 pop" style={{ background: "#1A2019", border: "1px solid rgba(237,239,234,0.12)" }}>
                <HabitNameEditor
                  value={name}
                  onChange={setName}
                  color={color}
                  onColorChange={setColor}
                  onSubmit={handleAddHabit}
                  onCancel={() => {
                    setFormOpen(false);
                    setFormError(null);
                  }}
                  submitLabel="Add habit"
                  error={formError}
                  dotSize={20}
                />
              </div>
            ) : (
              <button
                onClick={() => setFormOpen(true)}
                className="dot-btn w-full flex items-center justify-center gap-2 rounded-lg py-3.5 text-sm"
                style={{ border: "1px solid rgba(237,239,234,0.14)", color: "#8A9285" }}
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
