'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/habits', label: 'Habits' },
  { href: '/journal', label: 'Journal' },
  { href: '/bad-habits', label: 'Quit' },
  { href: '/analytics', label: 'Stats' },
  { href: '/settings', label: 'Settings' },
]

export function Navbar() {
  const pathname = usePathname()

  async function handleSignOut() {
    await signOut(auth)
    window.location.href = '/auth'
  }

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg tracking-tight">Better</span>
          <div className="flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
          Sign out
        </Button>
      </div>
    </nav>
  )
}
