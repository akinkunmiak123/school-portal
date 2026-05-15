import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getTeacherFromCookie } from '@/lib/teacherAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList } from 'lucide-react'
import Link from 'next/link'

export default async function TeacherResultsPage() {
  const teacher = await getTeacherFromCookie()
  if (!teacher) redirect('/teacher-login')

  const school = await prisma.school.findFirst({
    where: { id: teacher.schoolId },
    include: {
      sessions: {
        where: { isCurrent: true },
        include: { terms: { where: { isCurrent: true } } },
      },
    },
  })

  const currentTerm = school?.sessions[0]?.terms[0]

  // Get classes based on role
  let classes: any[] = []

  if (teacher.role === 'YEAR_TUTOR' && teacher.tutorLevel) {
    classes = await prisma.class.findMany({
      where: {
        schoolId: teacher.schoolId,
        level: teacher.tutorLevel.trim(),
        NOT: { name: teacher.tutorLevel.trim() },
      },
      include: { students: true },
      orderBy: { name: 'asc' },
    })
  } else {
    classes = teacher.classes.map((ct) => ({
      ...ct.class,
      students: [],
    }))
    // fetch students for each class
    for (const cls of classes) {
      const students = await prisma.student.findMany({
        where: { classId: cls.id },
      })
      cls.students = students
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Results
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentTerm
              ? `${school?.sessions[0].name} — ${currentTerm.name}`
              : 'No active term'}
          </p>
        </div>
      </div>

      {!currentTerm ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
            <p className="text-gray-500">No active term set</p>
          </CardContent>
        </Card>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
            <p className="text-gray-500">No classes assigned yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Link
              key={cls.id}
              href={`/teacher-portal/results/${cls.id}?termId=${currentTerm.id}`}
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
                        {cls.students.length} students
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
  )
}
