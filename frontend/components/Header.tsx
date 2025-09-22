import React from "react";

export const Header: React.FC = () => (
  <header className="relative backdrop-blur-md bg-black/30 border-b border-white/10">
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center">
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent tracking-tight font-vt323">
            EVENTURE
          </h1>
          <p className="text-gray-300 mt-3 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed font-orbitron">
            Intelligent automation for seamless event creation, promotion &
            engagement
          </p>
        </div>
      </div>
    </div>
  </header>
);
