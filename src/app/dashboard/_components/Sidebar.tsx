'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  CreditCard,
  Megaphone,
  Settings,
  School,
  X,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Classes', href: '/dashboard/classes', icon: School },
  { label: 'Students', href: '/dashboard/students', icon: GraduationCap },
  { label: 'Teachers', href: '/dashboard/teachers', icon: Users },
  { label: 'Subjects', href: '/dashboard/subjects', icon: BookOpen },
  { label: 'Results', href: '/dashboard/results', icon: ClipboardList },
  { label: 'Fee Payments', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Activities', href: '/dashboard/activities', icon: Megaphone },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar({ schoolName }: { schoolName: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const NavContent = () => (
    <>
      {/* Logo / School name */}
      <div className="p-6 border-b border-gray-200 dark:border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <School className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                SchoolPortal
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[140px]">
                {schoolName}
              </p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            className="md:hidden -mr-1 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white',
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 dark:text-gray-400',
                )}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Role badge */}
      <div className="p-4 border-t border-gray-200 dark:border-white/[0.06]">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-600/20 text-blue-800 dark:text-blue-400">
          Admin
        </span>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile hamburger trigger ── */}
      <button
        className="md:hidden fixed top-3.5 left-4 z-50 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Mobile backdrop ── */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile slide-in drawer ── */}
      <div
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col',
          'bg-white dark:bg-[#0f1117] border-r border-gray-200 dark:border-white/[0.06]',
          'transform transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <NavContent />
      </div>

      {/* ── Desktop permanent sidebar ── */}
      <div className="hidden md:flex w-64 bg-white dark:bg-[#0f1117] border-r border-gray-200 dark:border-white/[0.06] flex-col shrink-0">
        <NavContent />
      </div>
    </>
  )
}
