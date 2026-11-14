"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, ShieldCheck, Landmark, Activity, ArrowUpRight, ArrowRight, Clock, CalendarDays } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/top-bar";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function HomePage() {
  const [defenseValue, setDefenseValue] = useState<number | null>(null);
  const [bankValue, setBankValue] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false); 

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
    <div className="flex min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden pb-16 md:pb-0">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full md:ml-60 relative z-10">
        <TopBar onMenu={() => setMenuOpen((open) => !open)} />
        
        <main className="flex-1 overflow-x-hidden p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            
            {/* Header Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">Terminal Overview</h1>
                <p className="text-gray-500 text-xs md:text-sm">Clarity. Intelligence. Execution.</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center bg-[#111111]/80 backdrop-blur-md border border-gray-800 rounded-lg px-3 py-2 flex-1 md:w-72 focus-within:border-gray-600 transition-colors">
                  <Search className="w-4 h-4 text-gray-500 mr-2" />
                  <input type="text" placeholder="Search anything..." className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-600 w-full" />
                </div>
                <div className="relative">
                  <Bell className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white transition-colors" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#050505]"></span>
                </div>
              </div>
            </div>

            {/* TOP ROW: Indices & Market Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-8">
              
              {/* Defense Index Card */}
              <Link href="/index/defense" className="group relative overflow-hidden bg-gradient-to-b from-[#111A15] to-[#0A0A0A] border border-green-900/30 rounded-2xl p-5 md:p-6 hover:border-green-500/60 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] transition-all duration-300">
                <div className="flex justify-between items-center mb-4 md:mb-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-500/10 rounded-md">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-300 tracking-wide">Defense Index</h3>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-green-500 transition-colors" />
                </div>
                <div className="relative z-10 mb-4 md:mb-6">
                  <p className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-md">
                    {defenseValue ? defenseValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "..."}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400 font-semibold flex items-center gap-1">▲ +1.84%</span>
                    <span className="text-gray-500">vs Prev. Close</span>
                  </div>
                </div>
                <div className="relative z-10 h-12 md:h-14 w-full">
                  <svg className="w-full h-full text-green-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="greenGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,25 L10,20 L20,22 L30,15 L40,18 L50,12 L60,15 L70,8 L80,12 L90,5 L100,8 L100,30 L0,30 Z" fill="url(#greenGrad)" />
                    <path d="M0,25 L10,20 L20,22 L30,15 L40,18 L50,12 L60,15 L70,8 L80,12 L90,5 L100,8" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              </Link>

              {/* Bank Index Card */}
              <Link href="/index/bank" className="group relative overflow-hidden bg-gradient-to-b from-[#111621] to-[#0A0A0A] border border-blue-900/30 rounded-2xl p-5 md:p-6 hover:border-blue-500/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all duration-300">
                <div className="flex justify-between items-center mb-4 md:mb-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/10 rounded-md">
                      <Landmark className="w-4 h-4 text-blue-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-300 tracking-wide">Bank Index</h3>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="relative z-10 mb-4 md:mb-6">
                  <p className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-md">
                    {bankValue ? bankValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : "..."}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400 font-semibold flex items-center gap-1">▲ +1.24%</span>
                    <span className="text-gray-500">vs Prev. Close</span>
                  </div>
                </div>
                <div className="relative z-10 h-12 md:h-14 w-full">
                  <svg className="w-full h-full text-blue-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="blueGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,25 L10,28 L20,20 L30,22 L40,15 L50,18 L60,10 L70,12 L80,8 L90,10 L100,5 L100,30 L0,30 Z" fill="url(#blueGrad)" />
                    <path d="M0,25 L10,28 L20,20 L30,22 L40,15 L50,18 L60,10 L70,12 L80,8 L90,10 L100,5" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
              </Link>

              {/* Market Status Card */}
              <div className="relative overflow-hidden bg-[#0A0A0A]/80 backdrop-blur-md border border-gray-800 rounded-2xl p-5 md:p-6 flex flex-col justify-between hover:border-gray-600 transition-colors">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-300 tracking-wide">Market Status</h3>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> LIVE
                  </span>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-800/50 pb-3">
                    <span className="text-xs font-medium text-gray-500">NIFTY 50</span>
                    <span className="text-sm font-bold tracking-tight">24,356.75 <span className="text-green-500 text-xs ml-1">+0.67%</span></span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500">SENSEX</span>
                    <span className="text-sm font-bold tracking-tight">80,214.32 <span className="text-green-500 text-xs ml-1">+0.54%</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE ROW: News & Market Pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-6 md:mb-8">
              
              {/* Latest News */}
              <div className="bg-[#0A0A0A]/80 backdrop-blur-md border border-gray-800 rounded-2xl p-5 md:p-6">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    Latest News <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  </h3>
                  <Link href="/news" className="text-xs font-medium text-gray-400 hover:text-white flex items-center gap-1 transition-colors">View All <ArrowRight className="w-3 h-3"/></Link>
                </div>
                <div className="space-y-4 md:space-y-5">
                  <div className="flex gap-3 md:gap-4 items-center group cursor-pointer">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden shrink-0 border border-gray-800">
                      <img src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" alt="News" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-2 leading-snug">Global markets rally as inflation cools</h4>
                      <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1"><Clock className="w-3 h-3"/> 09:15 AM</p>
                    </div>
                  </div>
                  <div className="flex gap-3 md:gap-4 items-center group cursor-pointer">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden shrink-0 border border-gray-800">
                      <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=150" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" alt="News" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-2 leading-snug">RBI signals steady policy stance</h4>
                      <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1"><Clock className="w-3 h-3"/> 08:47 AM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Pulse */}
              <div className="bg-[#0A0A0A]/80 backdrop-blur-md border border-gray-800 rounded-2xl p-5 md:p-6">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    Market Pulse <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  </h3>
                  <span className="text-[11px] font-medium text-gray-500 tracking-wider">LIVE</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between group">
                    <div className="w-24 md:w-28">
                      <p className="text-xs font-bold text-gray-200">HDFCBANK</p>
                      <p className="text-[10px] text-gray-500">HDFC Bank</p>
                    </div>
                    <p className="text-sm font-semibold w-20 text-right tracking-tight">1,742.30</p>
                    <p className="text-xs font-bold text-green-500 w-16 text-right">+2.14%</p>
                    <div className="w-12 md:w-16 h-8 relative">
                       <svg className="w-full h-full text-green-500/80" viewBox="0 0 50 15" preserveAspectRatio="none"><path d="M0,12 L10,8 L20,10 L30,4 L40,6 L50,1" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between group">
                    <div className="w-24 md:w-28">
                      <p className="text-xs font-bold text-gray-200">BEL</p>
                      <p className="text-[10px] text-gray-500">Bharat Electronics</p>
                    </div>
                    <p className="text-sm font-semibold w-20 text-right tracking-tight">287.65</p>
                    <p className="text-xs font-bold text-red-500 w-16 text-right">-0.95%</p>
                    <div className="w-12 md:w-16 h-8 relative">
                       <svg className="w-full h-full text-red-500/80" viewBox="0 0 50 15" preserveAspectRatio="none"><path d="M0,2 L10,5 L20,4 L30,9 L40,7 L50,12" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
                    </div>
                  </div>
                  <div className="flex items-center justify-between group">
                    <div className="w-24 md:w-28">
                      <p className="text-xs font-bold text-gray-200">ICICIBANK</p>
                      <p className="text-[10px] text-gray-500">ICICI Bank</p>
                    </div>
                    <p className="text-sm font-semibold w-20 text-right tracking-tight">1,245.60</p>
                    <p className="text-xs font-bold text-green-500 w-16 text-right">+0.83%</p>
                    <div className="w-12 md:w-16 h-8 relative">
                       <svg className="w-full h-full text-green-500/80" viewBox="0 0 50 15" preserveAspectRatio="none"><path d="M0,10 L10,12 L20,6 L30,8 L40,3 L50,5" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: Upcoming Indices */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wide uppercase">Upcoming Indices</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0A0A0A]/50 border border-gray-800/80 border-dashed rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:bg-[#111] hover:border-gray-600 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-800 transition-colors"><CalendarDays className="w-4 h-4 text-gray-400" /></div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Nifty Next 50</h4>
                      <p className="text-[11px] text-gray-500">May 27, 2025</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium tracking-tight">09:00 AM</span>
                </div>
                <div className="bg-[#0A0A0A]/50 border border-gray-800/80 border-dashed rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:bg-[#111] hover:border-gray-600 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-800 transition-colors"><CalendarDays className="w-4 h-4 text-gray-400" /></div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Bank Nifty</h4>
                      <p className="text-[11px] text-gray-500">May 28, 2025</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium tracking-tight">09:00 AM</span>
                </div>
                <div className="bg-[#0A0A0A]/50 border border-gray-800/80 border-dashed rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:bg-[#111] hover:border-gray-600 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-gray-800 transition-colors"><CalendarDays className="w-4 h-4 text-gray-400" /></div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Nifty IT</h4>
                      <p className="text-[11px] text-gray-500">May 29, 2025</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium tracking-tight">09:00 AM</span>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}