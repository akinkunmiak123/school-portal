import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList } from 'lucide-react'
import Link from 'next/link'

export default async function ResultsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const school = await prisma.school.findFirst({
    where: { clerkOrgId: userId },
    include: {
      sessions: {
        where: { isCurrent: true },
        include: { terms: { where: { isCurrent: true } } },
      },
    },
  })

  if (!school) redirect('/onboarding')

  const currentTerm = school.sessions[0]?.terms[0]

  // Get all arm classes (not level labels)
  const classes = await prisma.class.findMany({
    where: {
      schoolId: school.id,
      NOT: { level: { equals: null } },
      // exclude level-label classes where name === level
      AND: [
        { name: { not: 'JSS 1' } },
        { name: { not: 'JSS 2' } },
        { name: { not: 'JSS 3' } },
        { name: { not: 'SS 1' } },
        { name: { not: 'SS 2' } },
        { name: { not: 'SS 3' } },
      ],
    },
    include: { students: true },
    orderBy: { name: 'asc' },
  })

  // Also get primary classes
  const primaryClasses = await prisma.class.findMany({
    where: { schoolId: school.id, category: 'PRIMARY' },
    include: { students: true },
    orderBy: { name: 'asc' },
  })

  const allClasses = [...primaryClasses, ...classes]

  // Get subject counts per level
  const allSubjects = await prisma.subject.findMany({
    where: { schoolId: school.id },
    select: { level: true, classId: true, subjectType: true },
  })
 
 const classesWithCount = allClasses.map((cls) => {
   let subjectCount = 0
   if (cls.category === 'PRIMARY') {
     subjectCount = allSubjects.filter((s) => s.classId === cls.id).length
   } else {
     const level = cls.level?.trim() // ← trim here too
     subjectCount = allSubjects.filter((s) => s.level === level).length
   }
   return { ...cls, subjectCount }
 })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Results
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentTerm
              ? `${school.sessions[0].name} — ${currentTerm.name}`
              : 'No active term — set one in Settings'}
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="text-sm text-blue-600 hover:underline"
        >
          Configure grading →
        </Link>
      </div>

      {!currentTerm ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No active term</p>
            <p className="text-gray-400 text-sm mt-1">
              Go to Settings to set an active session and term
            </p>
          </CardContent>
        </Card>
      ) : classesWithCount.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No classes yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classesWithCount.map((cls) => (
            <Link
              key={cls.id}
              href={`/dashboard/results/${cls.id}?termId=${currentTerm.id}`}
              className="block"
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer border hover:border-blue-300">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {cls.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {cls.students.length} students · {cls.subjectCount}{' '}
                        subjects
                      </p>
                      {cls.level && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Level: {cls.level}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-blue-600 border-blue-200"
                    >
                      View →
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
