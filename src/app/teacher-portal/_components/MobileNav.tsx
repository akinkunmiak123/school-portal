'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, X, Home, BookOpen } from 'lucide-react'

type Props = {
  role: string
  roleBadge: { label: string; className: string }
}

const navItems = [
  { label: 'Dashboard', href: '/teacher-portal', icon: Home },
  { label: 'Results', href: '/teacher-portal/results', icon: BookOpen },
]

export default function MobileNav({ role, roleBadge }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 right-0 z-50 w-64 flex flex-col
          bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800
          transform transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-800">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadge.className}`}
          >
            {roleBadge.label}
          </span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  pathname === href
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <form action="/api/teacher/signout" method="POST">
            <button
              type="submit"
              className="w-full text-sm text-left text-red-600 dark:text-red-400 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
