import { RefreshCw, WifiOff } from 'lucide-react'

type Props = { message: string | null; onRetry: () => void }

export function DashboardError({ message, onRetry }: Props) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div role="alert" className="flex max-w-md flex-col items-center px-8 py-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-negative/10 text-negative">
          <WifiOff className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-lg font-semibold">Unable to load index data</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {"We couldn't reach the Alpha Defense Index data feed. It will retry automatically every 60 seconds."}
        </p>
        {message && (
          <p className="mt-4 w-full rounded-md bg-secondary px-3 py-2 font-mono text-xs break-words text-muted-foreground">
            {message}
          </p>
        )}
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    </div>
  )
}
