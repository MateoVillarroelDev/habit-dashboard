import { PALETTE } from "../constants";

export default function ColorPicker({ value, onChange, size = 18 }) {
  return (
    <div className="flex gap-2">
      {PALETTE.map((p) => (
        <button
          key={p.hex}
          type="button"
          onClick={() => onChange(p.hex)}
          className="dot-btn rounded-full"
          aria-label={p.name}
          aria-pressed={value === p.hex}
          style={{
            width: size,
            height: size,
            background: p.hex,
            border: value === p.hex ? "2px solid #EDEFEA" : "2px solid transparent",
          }}
        />
      ))}
    </div>
  );
}
