// components/dashboard/top-bar.tsx
"use client";

import { Menu, Bell } from "lucide-react";

export function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="flex items-center justify-between p-4 border-b border-white/5 relative z-10 bg-[#050505]/80 backdrop-blur-md">
      
      {/* Hamburger Button */}
      <button 
        onClick={onMenu} 
        className="p-2 rounded-md hover:bg-white/10 md:hidden transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Right side icons */}
      <div className="flex items-center gap-4 ml-auto">
        <Bell size={20} className="text-slate-400" />
        <div className="h-8 w-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold">
          MS
        </div>
      </div>
    </header>
  );
}