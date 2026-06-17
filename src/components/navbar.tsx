import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { LayoutDashboard, Menu, MonitorSmartphone, Sparkles } from 'lucide-react'

import { BrandMark } from '@/components/patterns/brand-mark'
import HeaderUser from '@/integrations/better-auth/header-user'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Home', icon: Sparkles },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/sessions', label: 'Sessions', icon: MonitorSmartphone },
] as const

function NavLink({
  to,
  label,
  icon: Icon,
  onClick,
  className,
}: {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
  className?: string
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isActive =
    pathname === to || (to !== '/' && pathname.startsWith(`${to}/`))

  return (
    <Link
      to={to}
      onClick={onClick}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
      className={cn('nav-link', className)}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      {label}
    </Link>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="surface-glass sticky top-0 z-50 w-full">
      <div className="page-container flex h-16 max-w-[var(--page-max-width)] items-center justify-between gap-4 !py-0">
        <Link
          to="/"
          className="rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label="Interest home"
        >
          <BrandMark showWordmark className="hidden sm:flex" />
          <BrandMark showWordmark={false} className="sm:hidden" />
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <HeaderUser />
            <ModeToggle />
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-xs border-border bg-popover"
            >
              <SheetHeader className="text-left">
                <SheetTitle className="font-heading">Navigation</SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 px-1" aria-label="Mobile navigation">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    {...item}
                    onClick={() => setOpen(false)}
                    className="w-full"
                  />
                ))}
              </nav>

              <Separator className="my-3" />

              <div className="flex flex-col gap-3 px-1">
                <HeaderUser />
                <div className="surface-muted flex items-center justify-between px-3 py-2.5">
                  <span className="text-sm font-medium text-foreground">Theme</span>
                  <ModeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
