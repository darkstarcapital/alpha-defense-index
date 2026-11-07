import {
  BarChart3, Briefcase, Eye, Home, LineChart, Newspaper, Settings, ShieldCheck, TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Home', icon: Home, active: true }, { label: 'Index Overview', icon: LineChart },
  { label: 'Portfolio', icon: Briefcase }, { label: 'Watchlist', icon: Eye },
  { label: 'Market News', icon: Newspaper }, { label: 'Analytics', icon: BarChart3 }, { label: 'Settings', icon: Settings },
]

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  return (
    <>
      {open && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-black/60 md:hidden" />}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar transition-transform md:fixed md:top-0 md:z-40 md:h-dvh md:w-64 md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}>
        <div className="flex h-16 items-center gap-2.5 px-5">
          <TrendingUp className="size-6 shrink-0 text-primary" strokeWidth={2.75} aria-hidden="true" />
          <span className="text-lg font-semibold tracking-tight text-foreground xl:inline">AlphaTrade</span>
        </div>
        <nav aria-label="Main" className="mt-4 flex-1 px-3">
          <ul className="flex flex-col gap-1">
            {NAV.map(({ label, icon: Icon, active }) => <li key={label}><a href="#" onClick={onClose} aria-current={active ? 'page' : undefined} className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors', active ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-secondary hover:text-foreground')}><Icon className={cn('size-4 shrink-0', active && 'text-primary')} aria-hidden="true" /><span className="xl:inline">{label}</span></a></li>)}
          </ul>
        </nav>
        <div className="hidden px-3 pb-5 xl:block">
          <div className="flex items-center gap-3 px-4 py-3"><ShieldCheck className="size-6 shrink-0 text-primary" aria-hidden="true" /><p className="text-xs leading-tight text-muted-foreground">Stronger Defence<span className="block font-medium text-foreground">A Safer Tomorrow</span></p></div>
          <p className="mt-5 px-1 text-[11px] leading-relaxed text-muted-foreground">Alpha Defense Index<span className="block">Powered by <span className="font-medium text-foreground">AlphaTrade</span></span></p>
        </div>
      </aside>
    </>
  )
}
