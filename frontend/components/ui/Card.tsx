import React from "react";

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, icon, children }) => (
  <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl border border-white/10 p-8 shadow-2xl hover:border-white/20 transition-all duration-300">
    <div className="flex items-center gap-3 mb-6">
      <div className="text-cyan-400">{icon}</div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
    {children}
  </div>
);
