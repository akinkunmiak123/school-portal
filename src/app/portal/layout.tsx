import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { GraduationCap } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

async function getStudentFromCookie() {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('student_session')?.value
  if (!studentId) return null

  return await prisma.student.findFirst({
    where: { id: studentId },
    include: {
      class: true,
      school: true,
    },
  })
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const student = await getStudentFromCookie()
  if (!student) redirect('/student-setup')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{student.school.name}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {student.firstName} {student.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {student.class.name}
            </span>
            <form action="/api/student/signout" method="POST">
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

      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
