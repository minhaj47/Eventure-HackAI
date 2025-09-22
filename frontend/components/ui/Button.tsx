import React from "react";
import { ButtonVariant } from "../../types";

interface ButtonProps {
  onClick?: () => void;
  loading?: boolean;
  icon?: React.ReactNode;
  label: string;
  variant?: ButtonVariant;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  loading,
  icon,
  label,
  variant = "primary",
  className = "",
}) => {
  const base =
    "flex items-center justify-center space-x-3 px-8 py-4 rounded-xl text-base font-bold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-gradient-to-r from-white to-cyan-300 hover:from-gray-100 hover:to-cyan-400 text-black shadow-2xl hover:shadow-white/25 transform hover:scale-105",
    secondary:
      "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-xl",
    outline:
      "border-2 border-white/30 hover:bg-white/10 text-white font-tomorrow hover:text-cyan-200 hover:border-cyan-300/50",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
      ) : icon ? (
        icon
      ) : null}
      <span>{label}</span>
    </button>
  );
};
