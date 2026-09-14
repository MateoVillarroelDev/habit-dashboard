import ColorPicker from "./ColorPicker";
import { MAX_NAME_LENGTH } from "../constants";

export default function HabitNameEditor({
  value,
  onChange,
  color,
  onColorChange,
  onSubmit,
  onCancel,
  submitLabel,
  error,
  autoFocus = true,
  dotSize = 18,
}) {
  return (
    <div>
      <input
        autoFocus={autoFocus}
        value={value}
        maxLength={MAX_NAME_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder="Name your habit"
        aria-invalid={!!error}
        className="w-full bg-transparent outline-none font-display text-lg mb-2"
        style={{
          color: "#EDEFEA",
          borderBottom: `1px solid ${error ? "#C97B84" : "rgba(237,239,234,0.14)"}`,
          paddingBottom: 8,
        }}
      />
      {error && (
        <p className="text-xs mb-2" style={{ color: "#C97B84" }} role="alert">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between mt-2">
        <ColorPicker value={color} onChange={onColorChange} size={dotSize} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="dot-btn px-3 py-1.5 text-sm rounded-full"
            style={{ color: "#8A9285" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="dot-btn px-4 py-1.5 text-sm rounded-full font-medium"
            style={{ background: "#7FB069", color: "#10140F" }}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
