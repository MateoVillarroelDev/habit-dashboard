import { Leaf, Download, Upload } from "lucide-react";

export default function Header({ dateLabel, onExport, onImportClick, fileInputRef, onFileSelected }) {
  return (
    <header className="mb-10 flex items-end justify-between gap-4">
      <div>
        <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: "#8A9285" }}>
          {dateLabel}
        </p>
        <h1 className="font-display text-4xl sm:text-5xl" style={{ color: "#EDEFEA" }}>
          What's growing today
        </h1>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onExport}
          className="dot-btn flex items-center gap-1.5 font-mono text-xs px-2.5 py-1.5 rounded-full"
          style={{ color: "#8A9285", border: "1px solid rgba(237,239,234,0.14)" }}
          title="Export habits as JSON"
        >
          <Download size={13} />
          export
        </button>
        <button
          onClick={onImportClick}
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
          onChange={onFileSelected}
          style={{ display: "none" }}
        />
        <Leaf size={28} strokeWidth={1.5} style={{ color: "#7FB069", flexShrink: 0 }} />
      </div>
    </header>
  );
}
