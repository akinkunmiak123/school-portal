import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import AddTeacherButton from './_components/AddTeacherButton'
import EditTeacherButton from './_components/EditTeacherButton'
import DeleteTeacherButton from './_components/DeleteTeacherButton'

export default async function TeachersPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const school = await prisma.school.findFirst({
    where: { clerkOrgId: userId },
    include: {
      classes: {
        where: {
          NOT: {
            name: { in: ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'] },
          },
        },
        orderBy: { name: 'asc' },
      },
      teachers: {
        include: {
          classes: { include: { class: true } },
          signature: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!school) redirect('/onboarding')

  const assignableClasses = school.classes.filter((c) => c.name !== c.level)
  const levels = ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3']
  const classTeachers = school.teachers.filter(
    (t) => t.role === 'CLASS_TEACHER',
  )
  const yearTutors = school.teachers.filter((t) => t.role === 'YEAR_TUTOR')

  // ── Shared helpers ──────────────────────────────────────
  const isPending = (teacher: (typeof school.teachers)[0]) =>
    !!teacher.clerkUserId?.startsWith('pending_')

  const StatusBadge = ({
    teacher,
  }: {
    teacher: (typeof school.teachers)[0]
  }) =>
    isPending(teacher) ? (
      <Badge variant="secondary">Pending</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20">
        Active
      </Badge>
    )

  const PasswordCell = ({
    teacher,
  }: {
    teacher: (typeof school.teachers)[0]
  }) =>
    teacher.defaultPassword ? (
      <span className="font-mono text-xs bg-gray-100 dark:bg-white/[0.08] px-2 py-1 rounded text-gray-700 dark:text-gray-300">
        {isPending(teacher) ? teacher.defaultPassword : '••••••••'}
      </span>
    ) : (
      <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
    )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Teachers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {school.teachers.length} teacher
            {school.teachers.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <AddTeacherButton
            schoolId={school.id}
            classes={assignableClasses}
            levels={levels}
          />
        </div>
      </div>

      {school.teachers.length === 0 ? (
        <Card className="dark:bg-white/[0.04] dark:border-white/[0.06]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No teachers yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Add class teachers and year tutors
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* ── CLASS TEACHERS ─────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shrink-0" />
              Class Teachers
              <Badge variant="outline" className="text-xs ml-1">
                {classTeachers.length}
              </Badge>
            </h2>

            {classTeachers.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No class teachers yet
              </p>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {classTeachers.map((teacher) => (
                    <Card
                      key={teacher.id}
                      className="dark:bg-white/[0.04] dark:border-white/[0.06]"
                    >
                      <CardContent className="pt-4 pb-4 space-y-3">
                        {/* Name + actions */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {teacher.firstName} {teacher.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {teacher.email}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <EditTeacherButton
                              teacher={teacher}
                              classes={assignableClasses}
                              levels={levels}
                            />
                            <DeleteTeacherButton
                              teacherId={teacher.id}
                              teacherName={`${teacher.firstName} ${teacher.lastName}`}
                            />
                          </div>
                        </div>

                        {/* Assigned arms */}
                        <div className="flex flex-wrap gap-1">
                          {teacher.classes.length === 0 ? (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              No arm assigned
                            </span>
                          ) : (
                            teacher.classes.map((ct) => (
                              <Badge
                                key={ct.id}
                                variant="outline"
                                className="text-xs dark:border-white/[0.12] dark:text-gray-300"
                              >
                                {ct.class.name}
                              </Badge>
                            ))
                          )}
                        </div>

                        {/* Status + signature + password */}
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge teacher={teacher} />
                          {teacher.signature ? (
                            <Badge className="bg-green-100 text-green-700 text-xs dark:bg-green-500/10 dark:text-green-400">
                              Signature uploaded
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              No signature
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                            Password:
                          </span>
                          <PasswordCell teacher={teacher} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop table */}
                <Card className="hidden md:block dark:bg-white/[0.04] dark:border-white/[0.06]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-white/[0.06]">
                          {[
                            'Name',
                            'Email',
                            'Assigned Arms',
                            'Default Password',
                            'Status',
                            'Signature',
                            '',
                          ].map((h) => (
                            <th
                              key={h}
                              className="text-left p-4 font-medium text-gray-500 dark:text-gray-400"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {classTeachers.map((teacher) => (
                          <tr
                            key={teacher.id}
                            className="border-b border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                          >
                            <td className="p-4 font-medium text-gray-900 dark:text-white">
                              {teacher.firstName} {teacher.lastName}
                            </td>
                            <td className="p-4 text-gray-600 dark:text-gray-400 text-xs">
                              {teacher.email}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {teacher.classes.length === 0 ? (
                                  <span className="text-gray-400 dark:text-gray-500 text-xs">
                                    No arm assigned
                                  </span>
                                ) : (
                                  teacher.classes.map((ct) => (
                                    <Badge
                                      key={ct.id}
                                      variant="outline"
                                      className="text-xs dark:border-white/[0.12] dark:text-gray-300"
                                    >
                                      {ct.class.name}
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <PasswordCell teacher={teacher} />
                            </td>
                            <td className="p-4">
                              <StatusBadge teacher={teacher} />
                            </td>
                            <td className="p-4">
                              {teacher.signature ? (
                                <Badge className="bg-green-100 text-green-700 text-xs dark:bg-green-500/10 dark:text-green-400">
                                  Uploaded
                                </Badge>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  None
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                <EditTeacherButton
                                  teacher={teacher}
                                  classes={assignableClasses}
                                  levels={levels}
                                />
                                <DeleteTeacherButton
                                  teacherId={teacher.id}
                                  teacherName={`${teacher.firstName} ${teacher.lastName}`}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* ── YEAR TUTORS ────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block shrink-0" />
              Year Tutors
              <Badge variant="outline" className="text-xs ml-1">
                {yearTutors.length}
              </Badge>
            </h2>

            {yearTutors.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No year tutors yet
              </p>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {yearTutors.map((teacher) => (
                    <Card
                      key={teacher.id}
                      className="dark:bg-white/[0.04] dark:border-white/[0.06]"
                    >
                      <CardContent className="pt-4 pb-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {teacher.firstName} {teacher.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {teacher.email}
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <EditTeacherButton
                              teacher={teacher}
                              classes={assignableClasses}
                              levels={levels}
                            />
                            <DeleteTeacherButton
                              teacherId={teacher.id}
                              teacherName={`${teacher.firstName} ${teacher.lastName}`}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {teacher.tutorLevel ? (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                              {teacher.tutorLevel}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              No level assigned
                            </span>
                          )}
                          <StatusBadge teacher={teacher} />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                            Password:
                          </span>
                          <PasswordCell teacher={teacher} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop table */}
                <Card className="hidden md:block dark:bg-white/[0.04] dark:border-white/[0.06]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-white/[0.06]">
                          {[
                            'Name',
                            'Email',
                            'Level',
                            'Default Password',
                            'Status',
                            '',
                          ].map((h) => (
                            <th
                              key={h}
                              className="text-left p-4 font-medium text-gray-500 dark:text-gray-400"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {yearTutors.map((teacher) => (
                          <tr
                            key={teacher.id}
                            className="border-b border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                          >
                            <td className="p-4 font-medium text-gray-900 dark:text-white">
                              {teacher.firstName} {teacher.lastName}
                            </td>
                            <td className="p-4 text-gray-600 dark:text-gray-400 text-xs">
                              {teacher.email}
                            </td>
                            <td className="p-4">
                              {teacher.tutorLevel ? (
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                                  {teacher.tutorLevel}
                                </Badge>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  No level assigned
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <PasswordCell teacher={teacher} />
                            </td>
                            <td className="p-4">
                              <StatusBadge teacher={teacher} />
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                <EditTeacherButton
                                  teacher={teacher}
                                  classes={assignableClasses}
                                  levels={levels}
                                />
                                <DeleteTeacherButton
                                  teacherId={teacher.id}
                                  teacherName={`${teacher.firstName} ${teacher.lastName}`}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
