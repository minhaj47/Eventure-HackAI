import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import React from "react";

interface HeaderProps {
  onCreateEvent?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCreateEvent }) => {
  const { data: session } = useSession();

  return (
    <header className="relative backdrop-blur-md bg-black/30 border-b border-white/10">
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center relative">
        {/* Profile and Actions - Top Right */}
        {session && (
          <div className="absolute top-4 right-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img
                src={session.user?.image || ""}
                alt={session.user?.name || ""}
                className="h-8 w-8 rounded-full border border-white/20"
              />
              <button
                onClick={() => signOut()}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent tracking-tight font-vt323">
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
};
