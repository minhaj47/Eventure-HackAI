import React from "react";

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}) => (
  <div>
    <label className="block text-base font-medium text-white/90 mb-3">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-4 bg-gray-950/60 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all resize-none text-base"
    />
  </div>
);
