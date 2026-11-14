"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3, Briefcase, Eye, Home, Newspaper, Settings, ShieldCheck, TrendingUp, Landmark
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Home', icon: Home, href: '/' }, 
  { label: 'Defense Index', icon: ShieldCheck, href: '/index/defense' },
  { label: 'Bank Index', icon: Landmark, href: '/index/bank' },
  { label: 'Market News', icon: Newspaper, href: '/news' }, 
  { label: 'Portfolio', icon: Briefcase, href: '#' }, 
  { label: 'Watchlist', icon: Eye, href: '#' },
  { label: 'Analytics', icon: BarChart3, href: '#' }, 
  { label: 'Settings', icon: Settings, href: '#' },
]

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop (Optional, mostly handled by BottomNav now, but kept for safety) */}
      {open && (
        <button 
          type="button" 
          aria-label="Close navigation" 
          onClick={onClose} 
          className="fixed inset-0 z-30 bg-black/60 md:hidden" 
        />
      )}
      
      {/* Sidebar Container */}
      <aside className={cn(
        'hidden md:flex fixed inset-y-0 left-0 z-40 w-60 flex-col bg-[#0A0A0A] border-r border-gray-800 transition-transform md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        
        {/* Logo Area */}
        <div className="flex h-16 items-center gap-2.5 px-5 border-b border-gray-800/50">
          <TrendingUp className="size-6 shrink-0 text-green-500" strokeWidth={2.75} aria-hidden="true" />
          <span className="text-lg font-bold tracking-tight text-white">Northman</span>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Main" className="mt-4 flex-1 px-3">
          <ul className="flex flex-col gap-1">
            {NAV.map(({ label, icon: Icon, href }) => {
              const isActive = pathname === href;
              
              return (
                <li key={label}>
                  <Link 
                    href={href} 
                    onClick={onClose} 
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200', 
                      isActive 
                        ? 'bg-green-500/10 font-medium text-green-500' 
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    )}
                  >
                    <Icon className={cn('size-4 shrink-0', isActive && 'text-green-500')} aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Widget */}
        <div className="hidden px-3 pb-5 xl:block mt-auto">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#111111] border border-gray-800 rounded-xl hover:border-gray-700 transition-colors cursor-pointer">
            <ShieldCheck className="size-6 shrink-0 text-green-500" aria-hidden="true" />
            <p className="text-xs leading-tight text-gray-400">
              Stronger Defence<span className="block font-medium text-white mt-0.5">A Safer Tomorrow</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}