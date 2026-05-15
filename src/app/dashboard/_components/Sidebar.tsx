'use client'

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

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo / School name */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500">SchoolPortal</p>
            <p className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
              {schoolName}
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Role badge */}
      <div className="p-4 border-t border-gray-200">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Admin
        </span>
      </div>
    </div>
  )
}
