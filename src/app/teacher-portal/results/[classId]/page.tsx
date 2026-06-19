import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getTeacherFromCookie } from '@/lib/teacherAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TeacherScoreTable from './_components/TeacherScoreTable'
import SignatureUpload from './_components/SignatureUpload'

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

  // SS
  const coreSubjects = await prisma.subject.findMany({
    where: { level, schoolId, subjectType: 'CORE' },
    orderBy: { name: 'asc' },
  })

  const assignment = await prisma.studentDepartment.findFirst({
    where: { studentId: student.id },
  })

  if (!assignment) return coreSubjects

  const [deptSubjects, vocational, optional] = await Promise.all([
    prisma.subject.findMany({
      where: {
        level,
        schoolId,
        subjectType: 'DEPARTMENT',
        departmentId: assignment.departmentId,
      },
      orderBy: { name: 'asc' },
    }),
    assignment.vocationalSubjectId
      ? prisma.subject.findUnique({
          where: { id: assignment.vocationalSubjectId },
        })
      : Promise.resolve(null),
    assignment.optionalSubjectId
      ? prisma.subject.findUnique({
          where: { id: assignment.optionalSubjectId },
        })
      : Promise.resolve(null),
  ])

  return [
    ...coreSubjects,
    ...deptSubjects,
    ...(vocational ? [vocational] : []),
    ...(optional ? [optional] : []),
  ]
}

export default async function TeacherClassResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ classId: string }>
  searchParams: Promise<{ termId?: string }>
}) {
  const teacher = await getTeacherFromCookie()
  if (!teacher) redirect('/teacher-login')

  const { classId } = await params
  const { termId } = await searchParams
  if (!termId) redirect('/teacher-portal/results')

  // Verify teacher has access to this class
  if (teacher.role === 'CLASS_TEACHER') {
    const hasAccess = teacher.classes.some((ct) => ct.class.id === classId)
    if (!hasAccess) redirect('/teacher-portal/results')
  } else if (teacher.role === 'YEAR_TUTOR') {
    const cls = await prisma.class.findFirst({
      where: { id: classId, schoolId: teacher.schoolId },
    })
    if (!cls || cls.level?.trim() !== teacher.tutorLevel?.trim()) {
      redirect('/teacher-portal/results')
    }
  }

  const [cls, term] = await Promise.all([
    prisma.class.findFirst({
      where: { id: classId },
      include: { students: { orderBy: { lastName: 'asc' } } },
    }),
    prisma.term.findUnique({ where: { id: termId } }),
  ])

  if (!cls) redirect('/teacher-portal/results')

  // Build per-student subjects
  const studentSubjectMap: Record<string, any[]> = {}
  for (const student of cls.students) {
    studentSubjectMap[student.id] = await getStudentSubjects(
      student,
      cls,
      teacher.schoolId,
    )
  }

  // Fetch existing results
  const results = await prisma.result.findMany({
    where: { student: { classId }, termId },
  })

  const resultsMap: Record<string, any> = {}
  results.forEach((r) => {
    resultsMap[`${r.studentId}_${r.subjectId}`] = r
  })

  // Fetch existing remarks
  const remarks = await prisma.studentRemark.findMany({
    where: { student: { classId }, termId },
  })

  const remarksMap: Record<string, string> = {}
  remarks.forEach((r) => {
    remarksMap[r.studentId] = r.remark
  })

  const gradingConfig = await prisma.gradingConfig.findMany({
    where: { schoolId: teacher.schoolId },
    orderBy: { minScore: 'desc' },
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
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/teacher-portal/results"
            className="text-gray-400 hover:text-gray-600 mt-1 shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {cls.name} — Results
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {term?.name} · {cls.students.length} students · {avgSubjects}{' '}
              subjects avg
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 pl-8 sm:pl-0 self-start sm:self-auto">
          {isLocked && (
            <Badge className="bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
              🔒 Locked by Admin
            </Badge>
          )}
          {teacher.role === 'CLASS_TEACHER' && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
              Can add remarks
            </Badge>
          )}
        </div>
      </div>

      {/* Signature upload for class teachers */}
      {teacher.role === 'CLASS_TEACHER' && (
        <SignatureUpload currentSignature={teacher.signature?.signatureUrl} />
      )}

      {cls.students.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">No students in this class</p>
          </CardContent>
        </Card>
      ) : (
        <TeacherScoreTable
          cls={{ ...cls, subjects: [] }}
          studentSubjectMap={studentSubjectMap}
          termId={termId}
          resultsMap={resultsMap}
          remarksMap={remarksMap}
          gradingConfig={gradingConfig}
          isLocked={isLocked}
          isClassTeacher={teacher.role === 'CLASS_TEACHER'}
        />
      )}
    </div>
  )
}
