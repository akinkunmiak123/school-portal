import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { UserButton } from '@clerk/nextjs'
import { GraduationCap, BookOpen, Home } from 'lucide-react'
import Link from 'next/link'

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{teacher.school.name}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {teacher.firstName} {teacher.lastName}
              </p>
            </div>
          </div>

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

          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                teacher.role === 'YEAR_TUTOR'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {teacher.role === 'YEAR_TUTOR' ? 'Year Tutor' : 'Class Teacher'}
            </span>
            {/* Sign out button */}
            <form action="/api/teacher/signout" method="POST">
              <button
                type="submit"
                className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
