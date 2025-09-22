import React from "react";

export const Footer: React.FC = () => (
  <footer className="relative backdrop-blur-md bg-black/30 border-t border-white/10 mt-24">
    <div className="max-w-4xl mx-auto px-6 py-12 text-center">
      <p className="text-gray-500 text-base font-light">
        © {new Date().getFullYear()} AI Event Manager • Powered by intelligent
        automation ✨
      </p>
    </div>
  </footer>
);
