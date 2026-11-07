import { cn } from '@/lib/utils'

function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-secondary', className)} />
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-6" role="status" aria-live="polite">
      <span className="sr-only">Loading index data…</span>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className=" p-5 md:p-6">
          <Bone className="h-8 w-72" />
          <Bone className="mt-2 h-4 w-64" />
          <div className="mt-6 flex items-center gap-4">
            <Bone className="h-14 w-64" />
            <Bone className="h-11 w-28" />
          </div>
          <div className="mt-6 grid grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i}>
                <Bone className="h-3 w-12" />
                <Bone className="mt-2 h-4 w-20" />
              </div>
            ))}
          </div>
          <Bone className="mt-6 h-56 w-full md:h-60" />
        </div>

        <div className="flex flex-col items-center  p-5">
          <Bone className="h-5 w-40 self-start" />
          <div className="mt-6 size-48 animate-pulse rounded-full border-[22px] border-secondary" />
          <div className="mt-6 flex w-full flex-col gap-3">
            {Array.from({ length: 3 }, (_, i) => (
              <Bone key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-4  p-5">
            <Bone className="size-11 rounded-full" />
            <div className="flex-1">
              <Bone className="h-3 w-24" />
              <Bone className="mt-2 h-5 w-32" />
            </div>
          </div>
        ))}
      </div>

      <div className=" p-5">
        <Bone className="h-5 w-64" />
        <div className="mt-5 flex flex-col gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Bone className="size-7 rounded-full" />
              <Bone className="h-4 w-20" />
              <Bone className="h-4 flex-1" />
              <Bone className="h-4 w-20" />
              <Bone className="h-4 w-16" />
              <Bone className="h-7 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
