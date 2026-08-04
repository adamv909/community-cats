'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/home',  label: 'Rounds',  icon: '🗺️' },
  { href: '/cats',  label: 'Cats',    icon: '🐱' },
  { href: '/admin', label: 'Admin',   icon: '⚙️' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border z-50 pb-safe">
      <div className="flex">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors min-h-[60px] ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
