"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, ShieldCheck, Landmark, Activity, ArrowUpRight, ArrowRight, Clock, CalendarDays } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";

export default function HomePage() {
  const [defenseValue, setDefenseValue] = useState<number | null>(null);
  const [bankValue, setBankValue] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false); // Mobile menu state

  useEffect(() => {
    async function fetchValues() {
      try {
        const resDef = await fetch('/api/index-data');
        const dataDef = await resDef.json();
        if (dataDef && dataDef.indexValue) setDefenseValue(dataDef.indexValue);

        const resBank = await fetch('/api/index-data?index=bank');
        const dataBank = await resBank.json();
        if (dataBank && dataBank.indexValue) setBankValue(dataBank.indexValue);
      } catch (err) {
        console.error("Failed to fetch values", err);
      }
    }
    fetchValues();
  }, []);

  return (
    // Wrapped in the main app layout
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      
      {/* 
        On mobile: takes full width. 
        On desktop (md): margin-left to account for sidebar width 
      */}
      <div className="flex flex-col flex-1 w-full md:ml-64">
        <TopBar onMenu={() => setMenuOpen((open) => !open)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            
            {/* Header section (mobile responsive) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-800/50 pb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Terminal Overview</h1>
                <p className="text-gray-400 text-xs">Clarity. Intelligence. Execution.</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center bg-[#111111] border border-gray-800 rounded-lg px-3 py-1.5 flex-1 md:w-64">
                  <Search className="w-4 h-4 text-gray-500 mr-2" />
                  <input type="text" placeholder="Search anything..." className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-500 w-full" />
                </div>
                <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* TOP ROW: Indices & Market Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              
              {/* Defense Card */}
              <Link href="/index/defense" className="group relative overflow-hidden bg-[#0A0A0A] border border-gray-800 rounded-xl p-5 hover:border-green-500/50 transition-all">
                <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    <h3 className="text-sm font-medium text-gray-300">Defense Index</h3>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-green-500" />
                </div>
                <div className="relative z-10">
                  <p className="text-3xl font-bold text-white mb-2">
                    {defenseValue ? defenseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "..."}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400 font-medium flex items-center gap-1">▲ +1.84%</span>
                    <span className="text-gray-500">vs Prev. Close</span>
                  </div>
                </div>
                <svg className="w-full h-12 mt-4 text-green-500/80 relative z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,18 L10,15 L20,16 L30,10 L40,12 L50,8 L60,10 L70,5 L80,8 L90,2 L100,4" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </Link>

              {/* Bank Card */}
              <Link href="/index/bank" className="group relative overflow-hidden bg-[#0A0A0A] border border-gray-800 rounded-xl p-5 hover:border-blue-500/50 transition-all">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-medium text-gray-300">Bank Index</h3>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-blue-500" />
                </div>
                <div className="relative z-10">
                  <p className="text-3xl font-bold text-white mb-2">
                    {bankValue ? bankValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "..."}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400 font-medium flex items-center gap-1">▲ +1.24%</span>
                    <span className="text-gray-500">vs Prev. Close</span>
                  </div>
                </div>
                <svg className="w-full h-12 mt-4 text-blue-500/80 relative z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,15 L10,18 L20,12 L30,14 L40,8 L50,10 L60,5 L70,7 L80,3 L90,6 L100,2" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </Link>

              {/* Market Status */}
              <div className="relative overflow-hidden bg-[#0A0A0A] border border-gray-800 rounded-xl p-5 flex flex-col justify-between">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-300">Market Status</h3>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-green-400 bg-green-500/10 px-2 py-1 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> LIVE
                  </span>
                </div>
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Nifty 50</span>
                    <span className="text-sm font-semibold">24,356.75 <span className="text-green-500 text-xs ml-1">+0.67%</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Sensex</span>
                    <span className="text-sm font-semibold">80,214.32 <span className="text-green-500 text-xs ml-1">+0.54%</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE ROW: News & Market Pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* ... (Keep the News and Market Pulse code exactly the same as before) ... */}
              <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4 border-b border-gray-800/50 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-200">Latest News</h3>
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  </div>
                  <Link href="/news" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">View All <ArrowRight className="w-3 h-3"/></Link>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3 items-center group cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=100" className="w-12 h-12 rounded object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="News" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors line-clamp-1">Global markets rally as inflation cools</h4>
                      <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/> 09:15 AM</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center group cursor-pointer">
                    <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=100" className="w-12 h-12 rounded object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="News" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors line-clamp-1">RBI signals steady policy stance</h4>
                      <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/> 08:47 AM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4 border-b border-gray-800/50 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-200">Market Pulse</h3>
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  </div>
                  <span className="text-xs text-gray-500">Live</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-24">
                      <p className="text-xs font-bold text-gray-200">HDFCBANK</p>
                      <p className="text-[10px] text-gray-500">HDFC Bank</p>
                    </div>
                    <p className="text-sm font-semibold w-20 text-right">1,742.30</p>
                    <p className="text-xs font-bold text-green-500 w-16 text-right">+2.14%</p>
                    <svg className="w-12 h-6 text-green-500" viewBox="0 0 50 10"><path d="M0,8 L10,6 L20,9 L30,4 L40,5 L50,1" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="w-24">
                      <p className="text-xs font-bold text-gray-200">BEL</p>
                      <p className="text-[10px] text-gray-500">Bharat Electronics</p>
                    </div>
                    <p className="text-sm font-semibold w-20 text-right">287.65</p>
                    <p className="text-xs font-bold text-red-500 w-16 text-right">-0.95%</p>
                    <svg className="w-12 h-6 text-red-500" viewBox="0 0 50 10"><path d="M0,2 L10,4 L20,3 L30,7 L40,6 L50,9" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: Upcoming */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0A0A0A]/50 border border-gray-800 border-dashed rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800/50 rounded-lg"><CalendarDays className="w-4 h-4 text-gray-400" /></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">Nifty Next 50</h4>
                    <p className="text-[10px] text-gray-500">May 27, 2025</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">09:00 AM</span>
              </div>
              <div className="bg-[#0A0A0A]/50 border border-gray-800 border-dashed rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800/50 rounded-lg"><CalendarDays className="w-4 h-4 text-gray-400" /></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">Bank Nifty</h4>
                    <p className="text-[10px] text-gray-500">May 28, 2025</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">09:00 AM</span>
              </div>
              <div className="bg-[#0A0A0A]/50 border border-gray-800 border-dashed rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800/50 rounded-lg"><CalendarDays className="w-4 h-4 text-gray-400" /></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">Nifty IT</h4>
                    <p className="text-[10px] text-gray-500">May 29, 2025</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">09:00 AM</span>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}