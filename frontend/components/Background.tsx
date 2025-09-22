import React from "react";

export const Background: React.FC = () => (
  <>
    {/* Floating Particles */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-20 left-10 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
      <div className="absolute top-1/3 right-20 w-3 h-3 bg-cyan-500/30 rounded-full animate-pulse"></div>
      <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
      <div className="absolute top-40 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-[float_4s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-40 right-1/4 w-1 h-1 bg-cyan-400/30 rounded-full animate-[float_6s_ease-in-out_infinite]"></div>
    </div>

    {/* Animated Gradient Background */}
    <div className="absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-gray-900"></div>
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-white/5 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-cyan-500/10 rounded-full blur-3xl animate-[pulse_10s_ease-in-out_infinite]"></div>
    </div>
  </>
);
