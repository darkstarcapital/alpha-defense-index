'use client'

import { useState } from 'react'
import { Dashboard } from '@/components/dashboard/dashboard'
import { Sidebar } from '@/components/dashboard/sidebar'
import { TopBar } from '@/components/dashboard/top-bar'

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-64">
        <TopBar onMenu={() => setMenuOpen((open) => !open)} menuOpen={menuOpen} />
        <main className="mx-auto w-full max-w-[1600px] flex-1 overflow-x-hidden overflow-y-auto p-2 md:p-6"><Dashboard /></main>
      </div>
    </div>
  )
}
