import { Link, useRouterState } from '@tanstack/react-router'
import {
  ChevronsUpDown,
  LayoutDashboard,
  LogOut,
  MonitorSmartphone,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

import { authClient } from '#/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

function getInitials(name?: string | null) {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function HeaderUser() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <Skeleton
        className="size-9 rounded-full"
        aria-label="Loading user session"
      />
    )
  }

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            aria-label="Open account menu"
            className="h-10 gap-2 rounded-full border-border bg-card pl-1.5 pr-2.5 shadow-[var(--shadow-elevated)] transition-all duration-200 hover:bg-muted"
          >
            <Avatar size="sm">
              <AvatarImage
                src={session.user.image ?? undefined}
                alt={session.user.name ?? 'User avatar'}
              />
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">
              {session.user.name ?? 'Account'}
            </span>
            <ChevronsUpDown
              className="hidden size-4 text-muted-foreground sm:block"
              aria-hidden
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="truncate text-sm font-medium text-foreground">
                {session.user.name ?? 'Signed in'}
              </p>
              {session.user.email ? (
                <p className="truncate text-xs text-muted-foreground">
                  {session.user.email}
                </p>
              ) : null}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to="/">
                <Sparkles />
                Home
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard">
                <LayoutDashboard />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/sessions">
                <MonitorSmartphone />
                Sessions
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={async () => {
              await authClient.signOut()
              toast.success('Signed out successfully')
            }}
          >
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (pathname === '/signin') {
    return null
  }

  return (
    <Button
      size="sm"
      className="btn-primary-glow rounded-full px-4 transition-all duration-200"
      asChild
    >
      <Link to="/signin">Sign in</Link>
    </Button>
  )
}
