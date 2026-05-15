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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Teachers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {school.teachers.length} teacher
            {school.teachers.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <AddTeacherButton
          schoolId={school.id}
          classes={assignableClasses}
          levels={levels}
        />
      </div>

      {school.teachers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No teachers yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Add class teachers and year tutors
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Class Teachers */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              Class Teachers
              <Badge variant="outline" className="text-xs ml-1">
                {classTeachers.length}
              </Badge>
            </h2>
            {classTeachers.length === 0 ? (
              <p className="text-sm text-gray-400">No class teachers yet</p>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left p-4 font-medium text-gray-500">
                          Name
                        </th>
                        <th className="text-left p-4 font-medium text-gray-500">
                          Email
                        </th>
                        <th className="text-left p-4 font-medium text-gray-500">
                          Assigned Arms
                        </th>
                        <th className="text-left p-4 font-medium text-gray-500">
                          Default Password
                        </th>
                        <th className="text-left p-4 font-medium text-gray-500">
                          Status
                        </th>
                        <th className="text-left p-4 font-medium text-gray-500">
                          Signature
                        </th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {classTeachers.map((teacher) => (
                        <tr
                          key={teacher.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
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
                                <span className="text-gray-400 text-xs">
                                  No arm assigned
                                </span>
                              ) : (
                                teacher.classes.map((ct) => (
                                  <Badge
                                    key={ct.id}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {ct.class.name}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {teacher.defaultPassword ? (
                              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {teacher.clerkUserId?.startsWith('pending_')
                                  ? teacher.defaultPassword
                                  : '••••••••'}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge
                              className={
                                teacher.clerkUserId?.startsWith('pending_')
                                  ? ''
                                  : 'bg-green-100 text-green-700 border-green-200'
                              }
                              variant={
                                teacher.clerkUserId?.startsWith('pending_')
                                  ? 'secondary'
                                  : 'default'
                              }
                            >
                              {teacher.clerkUserId?.startsWith('pending_')
                                ? 'Pending'
                                : 'Active'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {teacher.signature ? (
                              <Badge className="bg-green-100 text-green-700 text-xs">
                                Uploaded
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">
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
            )}
          </div>

          {/* Year Tutors */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              Year Tutors
              <Badge variant="outline" className="text-xs ml-1">
                {yearTutors.length}
              </Badge>
            </h2>
            {yearTutors.length === 0 ? (
              <p className="text-sm text-gray-400">No year tutors yet</p>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left p-4 font-medium text-gray-500">
                          Name
                        </th>
                        <th className="text-left p-4 font-medium text-gray-500">
                          Email
                        </th>
                        <th className="text-left p-4 font-medium text-gray-500">
                          Level
                        </th>
                        <th className="text-left p-4 font-medium text-gray-500">
                          Default Password
                        </th>
                        <th className="text-left p-4 font-medium text-gray-500">
                          Status
                        </th>
                        <th className="p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearTutors.map((teacher) => (
                        <tr
                          key={teacher.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          <td className="p-4 font-medium text-gray-900 dark:text-white">
                            {teacher.firstName} {teacher.lastName}
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-400 text-xs">
                            {teacher.email}
                          </td>
                          <td className="p-4">
                            {teacher.tutorLevel ? (
                              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                {teacher.tutorLevel}
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">
                                No level assigned
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {teacher.defaultPassword ? (
                              <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {teacher.clerkUserId?.startsWith('pending_')
                                  ? teacher.defaultPassword
                                  : '••••••••'}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge
                              className={
                                teacher.clerkUserId?.startsWith('pending_')
                                  ? ''
                                  : 'bg-green-100 text-green-700 border-green-200'
                              }
                              variant={
                                teacher.clerkUserId?.startsWith('pending_')
                                  ? 'secondary'
                                  : 'default'
                              }
                            >
                              {teacher.clerkUserId?.startsWith('pending_')
                                ? 'Pending'
                                : 'Active'}
                            </Badge>
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}
