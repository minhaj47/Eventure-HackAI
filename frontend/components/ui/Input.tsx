import React from "react";

interface InputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  type?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
}) => (
  <div>
    <label className="block text-base font-medium text-white/90 mb-3">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-4 bg-gray-950/60 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all text-base ${
          icon ? "pl-12" : ""
        }`}
      />
    </div>
  </div>
);
