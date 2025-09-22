import React from "react";

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, icon, children }) => (
  <div className="backdrop-blur-md bg-gray-950/40 rounded-xl border border-white/10 p-8 shadow-2xl hover:shadow-white/5 transition-all duration-500">
    <div className="flex flex-col items-center mb-8">
      {/* <div className="p-3 bg-gradient-to-r from-white to-cyan-400 rounded-xl shadow-lg">
        <div className="text-black">{icon}</div>
      </div> */}
      <h2 className="text-2xl font-bold font-orbitron text-white text-center">
        {title}
      </h2>
    </div>
    {children}
  </div>
);
