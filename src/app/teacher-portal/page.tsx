import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, ClipboardList } from 'lucide-react'
import Link from 'next/link'

async function getTeacher() {
  const cookieStore = await cookies()
  const teacherId = cookieStore.get('teacher_session')?.value
  if (!teacherId) return null
  return await prisma.teacher.findFirst({
    where: { id: teacherId },
    include: {
      school: {
        include: {
          sessions: {
            where: { isCurrent: true },
            include: { terms: { where: { isCurrent: true } } },
          },
        },
      },
      classes: {
        include: {
          class: { include: { students: true } },
        },
      },
    },
  })
}

export default async function TeacherPortalPage() {
  const teacher = await getTeacher()
  if (!teacher) redirect('/teacher-login')

  const currentSession = teacher.school.sessions[0]
  const currentTerm = currentSession?.terms[0]

  let tutorClasses: any[] = []
  if (teacher.role === 'YEAR_TUTOR' && teacher.tutorLevel) {
    tutorClasses = await prisma.class.findMany({
      where: {
        schoolId: teacher.schoolId,
        level: teacher.tutorLevel.trim(),
        NOT: { name: teacher.tutorLevel.trim() },
      },
      include: { students: true },
      orderBy: { name: 'asc' },
    })
  }

  const displayClasses =
    teacher.role === 'YEAR_TUTOR'
      ? tutorClasses
      : teacher.classes.map((ct) => ct.class)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome, {teacher.firstName}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {currentSession?.name ?? 'No active session'} —{' '}
          {currentTerm?.name ?? 'No active term'}
          {teacher.role === 'YEAR_TUTOR' && teacher.tutorLevel && (
            <span className="ml-2 text-purple-600 font-medium">
              · Year Tutor: {teacher.tutorLevel}
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {teacher.role === 'YEAR_TUTOR' ? 'Level Arms' : 'My Classes'}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {displayClasses.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {displayClasses.reduce(
                    (sum, cls) => sum + (cls.students?.length ?? 0),
                    0,
                  )}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Term</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {currentTerm?.name ?? '—'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {teacher.role === 'YEAR_TUTOR'
            ? `All ${teacher.tutorLevel} Arms`
            : 'My Assigned Classes'}
        </h2>
        {displayClasses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No classes assigned yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Contact your school admin
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayClasses.map((cls: any) => (
              <Link
                key={cls.id}
                href={
                  currentTerm
                    ? `/teacher-portal/results/${cls.id}?termId=${currentTerm.id}`
                    : '#'
                }
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer border hover:border-purple-300">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {cls.name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {cls.students?.length ?? 0} students
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-purple-600 border-purple-200"
                      >
                        Enter Scores →
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
