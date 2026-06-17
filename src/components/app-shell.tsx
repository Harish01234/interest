import { Navbar } from '@/components/navbar'
import { cn } from '@/lib/utils'

type AppShellProps = {
  children: React.ReactNode
  className?: string
  mainClassName?: string
  centered?: boolean
  withGlow?: boolean
}

export function AppShell({
  children,
  className,
  mainClassName,
  centered = false,
  withGlow = false,
}: AppShellProps) {
  return (
    <div className={cn('relative min-h-svh overflow-x-hidden bg-background', className)}>
      {withGlow ? (
        <div aria-hidden className="page-glow">
          <div className="absolute -bottom-24 left-8 size-64 rounded-full bg-chart-5/15 blur-3xl dark:bg-chart-5/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_0%,var(--background)_72%)]" />
        </div>
      ) : null}

      <Navbar />

      <main
        className={cn(
          'page-container relative max-w-[var(--page-max-width)]',
          centered &&
            'flex min-h-[calc(100svh-4rem)] items-center justify-center !py-10 sm:!py-16',
          mainClassName,
        )}
      >
        {children}
      </main>
    </div>
  )
}
