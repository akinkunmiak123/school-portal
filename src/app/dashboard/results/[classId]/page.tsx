import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ScoreEntryTable from './_components/ScoreEntryTable'
import LockButton from './_components/LockButton'
import DownloadReportCardButton from './_components/DownloadReportCardButton'

async function getStudentSubjects(student: any, cls: any, schoolId: string) {
  if (cls.category === 'PRIMARY') {
    return await prisma.subject.findMany({
      where: { classId: cls.id },
      orderBy: { name: 'asc' },
    })
  }

 const level = cls.level?.trim()
 if (!level) return []

  if (cls.category === 'JSS') {
    return await prisma.subject.findMany({
      where: { level, schoolId, subjectType: 'GENERAL' },
      orderBy: { name: 'asc' },
    })
  }

  // SS — core subjects first
  const coreSubjects = await prisma.subject.findMany({
    where: { level, schoolId, subjectType: 'CORE' },
    orderBy: { name: 'asc' },
  })

  const assignment = await prisma.studentDepartment.findFirst({
    where: { studentId: student.id },
  })

  // console.log(`Student ${student.firstName} ${student.lastName}:`, {
  //   level,
  //   assignment: assignment
  //     ? {
  //         departmentId: assignment.departmentId,
  //         vocationalSubjectId: assignment.vocationalSubjectId,
  //         optionalSubjectId: assignment.optionalSubjectId,
  //       }
  //     : null,
  // })

  if (!assignment) return coreSubjects

  const deptSubjects = await prisma.subject.findMany({
    where: {
      level,
      schoolId,
      subjectType: 'DEPARTMENT',
      departmentId: assignment.departmentId,
    },
    orderBy: { name: 'asc' },
  })

  // console.log(
  //   `Dept subjects found for level=${level} deptId=${assignment.departmentId}:`,
  //   deptSubjects.map((s) => s.name),
  // )

  const vocationalSubject = assignment.vocationalSubjectId
    ? await prisma.subject.findUnique({
        where: { id: assignment.vocationalSubjectId },
      })
    : null

  const optionalSubject = assignment.optionalSubjectId
    ? await prisma.subject.findUnique({
        where: { id: assignment.optionalSubjectId },
      })
    : null

  return [
    ...coreSubjects,
    ...deptSubjects,
    ...(vocationalSubject ? [vocationalSubject] : []),
    ...(optionalSubject ? [optionalSubject] : []),
  ]
}

export default async function ClassResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>
  searchParams: Promise<{ termId?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { classId } = await params
  const { termId } = await searchParams

  if (!termId) redirect('/dashboard/results')

  const [cls, term, gradingConfig, school] = await Promise.all([
    prisma.class.findFirst({
      where: { id: classId, school: { clerkOrgId: userId } },
      include: {
        students: { orderBy: { lastName: 'asc' } },
      },
    }),
    prisma.term.findUnique({ where: { id: termId } }),
    prisma.gradingConfig.findMany({
      where: { school: { clerkOrgId: userId } },
      orderBy: { minScore: 'desc' },
    }),
    prisma.school.findFirst({ where: { clerkOrgId: userId } }),
  ])

  if (!cls || !school) redirect('/dashboard/results')

  const studentSubjectMap: Record<string, any[]> = {}
  for (const student of cls.students) {
    studentSubjectMap[student.id] = await getStudentSubjects(
      student,
      cls,
      school.id,
    )
  }

  const allSubjectIds = new Set<string>()
  const allSubjectsMap: Record<string, any> = {}
  Object.values(studentSubjectMap).forEach((subjects) => {
    subjects.forEach((s) => {
      allSubjectIds.add(s.id)
      allSubjectsMap[s.id] = s
    })
  })
  const allSubjects = Array.from(allSubjectIds).map((id) => allSubjectsMap[id])

  const results = await prisma.result.findMany({
    where: { student: { classId }, termId },
  })

  const resultsMap: Record<string, any> = {}
  results.forEach((r) => {
    resultsMap[`${r.studentId}_${r.subjectId}`] = r
  })

  const isLocked = results.length > 0 && results.every((r) => r.isLocked)

  const avgSubjects =
    cls.students.length > 0
      ? Math.round(
          Object.values(studentSubjectMap).reduce(
            (sum, subs) => sum + subs.length,
            0,
          ) / cls.students.length,
        )
      : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/results"
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {cls.name} — Results
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {term?.name} · {cls.students.length} students · {avgSubjects}{' '}
              subjects avg
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isLocked && (
            <Badge className="bg-red-100 text-red-700 border-red-200">
              🔒 Locked
            </Badge>
          )}
          <LockButton classId={classId} termId={termId} isLocked={isLocked} />
        </div>
      </div>

      {cls.students.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">No students in this class yet</p>
          </CardContent>
        </Card>
      ) : allSubjects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">No subjects found for this class</p>
            <p className="text-gray-400 text-sm mt-2">
              {cls.category === 'SS'
                ? 'Make sure students have departments assigned and SS subjects are added'
                : cls.category === 'JSS'
                  ? 'Add GENERAL subjects for this JSS level in the Subjects page'
                  : 'Add subjects for this class in the Subjects page'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {isLocked && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Report Cards
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Download individual report cards
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cls.students.map((student) => (
                      <DownloadReportCardButton
                        key={student.id}
                        studentId={student.id}
                        studentName={`${student.firstName} ${student.lastName}`}
                        termId={termId}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <ScoreEntryTable
            cls={{ ...cls, subjects: allSubjects }}
            studentSubjectMap={studentSubjectMap}
            termId={termId}
            resultsMap={resultsMap}
            gradingConfig={gradingConfig}
            isLocked={isLocked}
          />
        </>
      )}
    </div>
  )
}
