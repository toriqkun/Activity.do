"use client";
import { useState } from "react";

export default function CustomDropdown({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center justify-between gap-2 min-w-[180px] border border-blue-500 rounded-md px-3 py-2 h-11 text-gray-900 bg-white cursor-pointer">
        <span>{options.find((opt) => opt.value === value)?.label || label}</span>
        <span className="text-blue-600">▾</span>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute mt-1 w-full bg-white border border-blue-500 rounded-md shadow-lg z-10 overflow-hidden">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="px-3 py-2 hover:bg-gray-200 text-gray-900 cursor-pointer"
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
