import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap } from 'lucide-react'
import AddStudentButton from './_components/AddStudentButton'
import ImportStudentsButton from './_components/ImportStudentsButton'
import EditStudentButton from './_components/EditStudentButton'
import DeleteStudentButton from './_components/DeleteStudentButton'
import StudentsFilter from './_components/StudentsFilter'
import AssignDepartmentButton from './_components/AssignDepartmentButton'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; classId?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { name, classId } = await searchParams

  const school = await prisma.school.findFirst({
    where: { clerkOrgId: userId },
    include: {
      classes: { orderBy: { name: 'asc' } },
      departments: {
        orderBy: { name: 'asc' },
        distinct: ['id'],
      },
    },
  })

  if (!school) redirect('/onboarding')

  const assignableClasses = school.classes.filter((c) => c.name !== c.level)

  const where: any = { schoolId: school.id }
  if (classId) where.classId = classId
  if (name) {
    where.OR = [
      { firstName: { contains: name, mode: 'insensitive' } },
      { lastName: { contains: name, mode: 'insensitive' } },
      { email: { contains: name, mode: 'insensitive' } },
      { studentId: { contains: name, mode: 'insensitive' } },
    ]
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      class: true,
      departmentAssignment: {
        include: {
          department: true,
          optionalSubject: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalCount = await prisma.student.count({
    where: { schoolId: school.id },
  })

  const allSubjects = await prisma.subject.findMany({
    where: {
      schoolId: school.id,
      subjectType: { in: ['OPTIONAL', 'VOCATIONAL'] },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Students
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalCount} student{totalCount !== 1 ? 's' : ''} enrolled
            {students.length !== totalCount && (
              <span className="ml-1 text-blue-600 dark:text-blue-400">
                · showing {students.length}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <ImportStudentsButton
            schoolId={school.id}
            classes={assignableClasses}
          />
          <AddStudentButton schoolId={school.id} classes={assignableClasses} />
        </div>
      </div>

      <StudentsFilter classes={assignableClasses} />

      {students.length === 0 ? (
        <Card className="dark:bg-white/[0.04] dark:border-white/[0.06]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {totalCount === 0
                ? 'No students yet'
                : 'No students match your filter'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Mobile cards (< md) ── */}
          <div className="md:hidden space-y-3">
            {students.map((student) => {
              const isSSStudent = student.class.category === 'SS'
              return (
                <Card
                  key={student.id}
                  className="dark:bg-white/[0.04] dark:border-white/[0.06]"
                >
                  <CardContent className="pt-4 pb-4 space-y-3">
                    {/* Name + actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                          {student.studentId}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <EditStudentButton
                          student={student}
                          classes={assignableClasses}
                        />
                        <DeleteStudentButton
                          studentId={student.id}
                          studentName={`${student.firstName} ${student.lastName}`}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    {student.email && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {student.email}
                      </p>
                    )}

                    {/* Class + Status badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="dark:border-white/[0.12] dark:text-gray-300"
                      >
                        {student.class.name}
                      </Badge>
                      <Badge
                        className={
                          student.clerkUserId
                            ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20'
                            : 'dark:bg-white/[0.06] dark:text-gray-400'
                        }
                        variant={student.clerkUserId ? 'default' : 'secondary'}
                      >
                        {student.clerkUserId ? 'Active' : 'Pending'}
                      </Badge>
                    </div>

                    {/* Department (SS only) */}
                    {isSSStudent && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                          Department:
                        </span>
                        <AssignDepartmentButton
                          studentId={student.id}
                          studentName={`${student.firstName} ${student.lastName}`}
                          studentLevel={student.class.level ?? 'SS 1'}
                          departments={school.departments}
                          allSubjects={allSubjects}
                          currentDeptId={
                            student.departmentAssignment?.departmentId
                          }
                          currentOptionalId={
                            student.departmentAssignment?.optionalSubjectId
                          }
                          currentVocationalId={
                            student.departmentAssignment?.vocationalSubjectId
                          }
                        />
                      </div>
                    )}

                    {/* Default password */}
                    {student.defaultPassword && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                          Password:
                        </span>
                        <span className="font-mono text-xs bg-gray-100 dark:bg-white/[0.08] px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                          {student.clerkUserId
                            ? '••••••••'
                            : student.defaultPassword}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* ── Desktop table (md+) ── */}
          <Card className="hidden md:block dark:bg-white/[0.04] dark:border-white/[0.06]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/[0.06]">
                    <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">
                      Student ID
                    </th>
                    <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">
                      Name
                    </th>
                    <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </th>
                    <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">
                      Class
                    </th>
                    <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">
                      Department
                    </th>
                    <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">
                      Default Password
                    </th>
                    <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left p-4 font-medium text-gray-500 dark:text-gray-400" />
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const isSSStudent = student.class.category === 'SS'
                    return (
                      <tr
                        key={student.id}
                        className="border-b border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                      >
                        <td className="p-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                          {student.studentId}
                        </td>
                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-400 text-xs">
                          {student.email}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className="dark:border-white/[0.12] dark:text-gray-300"
                          >
                            {student.class.name}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {isSSStudent ? (
                            <AssignDepartmentButton
                              studentId={student.id}
                              studentName={`${student.firstName} ${student.lastName}`}
                              studentLevel={student.class.level ?? 'SS 1'}
                              departments={school.departments}
                              allSubjects={allSubjects}
                              currentDeptId={
                                student.departmentAssignment?.departmentId
                              }
                              currentOptionalId={
                                student.departmentAssignment?.optionalSubjectId
                              }
                              currentVocationalId={
                                student.departmentAssignment
                                  ?.vocationalSubjectId
                              }
                            />
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              —
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {student.defaultPassword ? (
                            <span className="font-mono text-xs bg-gray-100 dark:bg-white/[0.08] px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                              {student.clerkUserId
                                ? '••••••••'
                                : student.defaultPassword}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              —
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge
                            className={
                              student.clerkUserId
                                ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20'
                                : 'dark:bg-white/[0.06] dark:text-gray-400'
                            }
                            variant={
                              student.clerkUserId ? 'default' : 'secondary'
                            }
                          >
                            {student.clerkUserId ? 'Active' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <EditStudentButton
                              student={student}
                              classes={assignableClasses}
                            />
                            <DeleteStudentButton
                              studentId={student.id}
                              studentName={`${student.firstName} ${student.lastName}`}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
