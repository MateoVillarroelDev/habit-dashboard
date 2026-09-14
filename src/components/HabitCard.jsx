import { Flame, Pencil, Trash2 } from "lucide-react";
import HabitNameEditor from "./HabitNameEditor";
import { fmt } from "../lib/date";
import { calcStreak, calcLongestStreak } from "../lib/streaks";
import { DAY_WINDOW } from "../constants";

export default function HabitCard({
  habit,
  days,
  todayStr,
  isEditing,
  editName,
  editColor,
  editError,
  onEditNameChange,
  onEditColorChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleDay,
  onRemove,
}) {
  const streak = calcStreak(habit.completions);
  const doneToday = !!habit.completions[todayStr];
  const longest = calcLongestStreak(habit.completions);
  const last30 = days.filter((d) => habit.completions[fmt(d)]).length;
  const pct = Math.round((last30 / DAY_WINDOW) * 100);

  return (
    <div
      className="habit-card rounded-lg px-5 py-4"
      style={{ background: "#1A2019", border: "1px solid rgba(237,239,234,0.08)" }}
    >
      {isEditing ? (
        <div className="mb-3 pop">
          <HabitNameEditor
            value={editName}
            onChange={onEditNameChange}
            color={editColor}
            onColorChange={onEditColorChange}
            onSubmit={onSaveEdit}
            onCancel={onCancelEdit}
            submitLabel="Save"
            error={editError}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-block rounded-full flex-shrink-0" style={{ width: 9, height: 9, background: habit.color }} />
            <h3 className="font-display text-lg truncate" style={{ color: "#EDEFEA" }}>
              {habit.name}
            </h3>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1 font-mono text-sm" style={{ color: streak > 0 ? "#E8B961" : "#8A9285" }}>
              <Flame size={14} strokeWidth={2} />
              {streak}
            </div>
            <button
              onClick={() => onToggleDay(habit.id, todayStr)}
              className="dot-btn text-xs font-mono px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: doneToday ? habit.color : "transparent",
                border: `1px solid ${doneToday ? habit.color : "rgba(237,239,234,0.2)"}`,
                color: doneToday ? "#10140F" : "#EDEFEA",
              }}
            >
              {doneToday ? "done today" : "mark today"}
            </button>
            <button
              onClick={() => onStartEdit(habit)}
              className="dot-btn opacity-40 hover:opacity-90 transition-opacity"
              aria-label={`Edit ${habit.name}`}
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onRemove(habit.id, habit.name)}
              className="dot-btn opacity-40 hover:opacity-90 transition-opacity"
              aria-label={`Delete ${habit.name}`}
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

      <div className="relative pt-1">
        <div className="absolute left-0 right-0" style={{ top: 9, height: 1, background: "rgba(237,239,234,0.08)" }} />
        <div className="flex justify-between relative">
          {days.map((d) => {
            const ds = fmt(d);
            const done = !!habit.completions[ds];
            const isToday = ds === todayStr;
            return (
              <button
                key={ds}
                onClick={() => onToggleDay(habit.id, ds)}
                className="dot-btn rounded-full flex-shrink-0"
                title={d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                style={{
                  width: isToday ? 10 : 7,
                  height: isToday ? 10 : 7,
                  background: done ? habit.color : "#242B23",
                  border: isToday ? `1.5px solid ${done ? habit.color : "rgba(237,239,234,0.4)"}` : "none",
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
}
