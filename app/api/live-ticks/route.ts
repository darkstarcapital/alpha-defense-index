import { NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('live_ticks')
      .select('created_at,index_value')
      .order('created_at', { ascending: false })
      .limit(5000)

    if (error) throw new Error(error.message)
    return NextResponse.json(
      { ticks: (data ?? []).reverse() },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load live ticks' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
