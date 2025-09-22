import React from "react";

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors border border-white/10 hover:border-white/30"
  >
    <div className="text-white">{icon}</div>
  </button>
);
