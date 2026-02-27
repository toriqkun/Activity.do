"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomDropdown({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || label;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger button */}
      <button 
        type="button" 
        onClick={() => setOpen(!open)} 
        className="flex items-center justify-between gap-2 w-full border border-blue-200 hover:border-blue-500 rounded-xl px-4 py-2 h-11 text-sm font-bold text-gray-700 bg-white transition-all shadow-sm cursor-pointer active:scale-[0.98]"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown size={16} className={`text-blue-600 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-2xl z-30 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 font-medium ${opt.value === value ? "text-blue-600 bg-blue-50/50" : "text-gray-700"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
