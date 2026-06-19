import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { ThemeToggle } from '@/components/ThemeToggle'
import { GraduationCap, BookOpen, Home, Menu, X } from 'lucide-react'
import Link from 'next/link'
import MobileNav from './_components/MobileNav'

async function getTeacherFromCookie() {
  const cookieStore = await cookies()
  const teacherId = cookieStore.get('teacher_session')?.value
  if (!teacherId) return null

  return await prisma.teacher.findFirst({
    where: { id: teacherId },
    include: {
      school: true,
      classes: { include: { class: true } },
    },
  })
}

export default async function TeacherPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const teacher = await getTeacherFromCookie()
  if (!teacher) redirect('/teacher-login')

  const roleBadge =
    teacher.role === 'YEAR_TUTOR'
      ? { label: 'Year Tutor', className: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' }
      : { label: 'Class Teacher', className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">

          {/* Left — school + teacher name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {teacher.school.name}
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {teacher.firstName} {teacher.lastName}
              </p>
            </div>
          </div>

          {/* Centre — desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/teacher-portal"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/teacher-portal/results"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Results
            </Link>
          </nav>

          {/* Right — role badge + theme + sign out + mobile hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={`hidden sm:inline-flex text-xs px-2 py-1 rounded-full font-medium ${roleBadge.className}`}>
              {roleBadge.label}
            </span>
            <ThemeToggle />
            <form action="/api/teacher/signout" method="POST" className="hidden md:block">
              <button
                type="submit"
                className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
              >
                Sign out
              </button>
            </form>
            {/* Mobile hamburger — client component */}
            <MobileNav role={teacher.role} roleBadge={roleBadge} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}