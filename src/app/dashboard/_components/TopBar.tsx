import { UserButton } from '@clerk/nextjs'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function TopBar({ schoolName }: { schoolName: string }) {
  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
      <h2 className="text-sm text-gray-500 dark:text-gray-400">
        Welcome back,{' '}
        <span className="font-semibold text-gray-900 dark:text-white">
          {schoolName}
        </span>
      </h2>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-500" />
        </Button>
        <UserButton />
      </div>
    </header>
  )
}
