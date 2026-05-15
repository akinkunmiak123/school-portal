import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen } from 'lucide-react'
import AddSubjectButton from './_components/AddSubjectButton'
import EditSubjectButton from './_components/EditSubjectButton'
import DeleteSubjectButton from './_components/DeleteSubjectButton'
import ManageDepartmentsButton from './_components/ManageDepartmentsButton'

export default async function SubjectsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const school = await prisma.school.findFirst({
    where: { clerkOrgId: userId },
    include: {
      departments: { orderBy: { name: 'asc' } },
      subjects: {
        include: { department: true },
        orderBy: { name: 'asc' },
      },
      classes: {
        where: { category: 'PRIMARY' },
        include: {
          subjects: { orderBy: { name: 'asc' } },
        },
        orderBy: { name: 'asc' },
      },
    },
  })

  if (!school) redirect('/onboarding')

  const showPrimary =
    school.schoolType === 'PRIMARY' || school.schoolType === 'BOTH'
  const showSecondary =
    school.schoolType === 'SECONDARY' || school.schoolType === 'BOTH'

  const jssLevels = ['JSS 1', 'JSS 2', 'JSS 3']
  const ssLevels = ['SS 1', 'SS 2', 'SS 3']

  const getSubjectsByLevel = (level: string) =>
    school.subjects.filter((s) => s.level === level)

  const getCoreSubjects = (level: string) =>
    school.subjects.filter((s) => s.level === level && s.subjectType === 'CORE')

  const getDeptSubjects = (level: string, deptId: string) =>
    school.subjects.filter(
      (s) =>
        s.level === level &&
        s.departmentId === deptId &&
        s.subjectType === 'DEPARTMENT',
    )

  const getVocationalSubjects = (level: string, deptId: string) =>
    school.subjects.filter(
      (s) =>
        s.level === level &&
        s.departmentId === deptId &&
        s.subjectType === 'VOCATIONAL',
    )

  const getOptionalSubjects = (level: string, deptId: string) =>
    school.subjects.filter(
      (s) =>
        s.level === level &&
        s.departmentId === deptId &&
        s.subjectType === 'OPTIONAL',
    )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subjects
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage subjects per level
          </p>
        </div>
        {showSecondary && (
          <ManageDepartmentsButton
            departments={school.departments}
            schoolId={school.id}
          />
        )}
      </div>

      {/* PRIMARY */}
      {showPrimary && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            Primary Subjects
          </h2>
          {school.classes.length === 0 ? (
            <p className="text-sm text-gray-400">No primary classes yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {school.classes.map((cls) => (
                <Card key={cls.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {cls.name}
                      </p>
                      <AddSubjectButton
                        mode="primary"
                        classId={cls.id}
                        className={cls.name}
                        schoolId={school.id}
                        departments={[]}
                      />
                    </div>
                    {cls.subjects.length === 0 ? (
                      <p className="text-xs text-gray-400">No subjects yet</p>
                    ) : (
                      <div className="space-y-1">
                        {cls.subjects.map((s) => (
                          <SubjectRow
                            key={s.id}
                            subject={s}
                            departments={[]}
                            mode="primary"
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* JSS */}
      {showSecondary && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
            JSS Subjects
            <Badge variant="outline" className="text-xs ml-1">
              Shared across all arms
            </Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {jssLevels.map((level) => {
              const subjects = getSubjectsByLevel(level)
              return (
                <Card key={level}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {level}
                      </p>
                      <AddSubjectButton
                        mode="jss"
                        level={level}
                        className={level}
                        schoolId={school.id}
                        departments={[]}
                      />
                    </div>
                    {subjects.length === 0 ? (
                      <p className="text-xs text-gray-400">No subjects yet</p>
                    ) : (
                      <div className="space-y-1">
                        {subjects.map((s) => (
                          <SubjectRow
                            key={s.id}
                            subject={s}
                            departments={[]}
                            mode="jss"
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* SS */}
      {showSecondary && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
            SS Subjects
            <Badge variant="outline" className="text-xs ml-1">
              Shared across all arms
            </Badge>
          </h2>

          {school.departments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 text-sm">No departments yet.</p>
                <p className="text-gray-400 text-xs mt-1">
                  Click "Manage Departments" to add Science, Arts, Commercial
                  etc.
                </p>
              </CardContent>
            </Card>
          ) : (
            ssLevels.map((level) => (
              <div key={level} className="space-y-3">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
                  {level}
                </h3>

                {/* Core subjects */}
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          Core
                        </Badge>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          Core Subjects (all students)
                        </p>
                      </div>
                      <AddSubjectButton
                        mode="ss-core"
                        level={level}
                        className={`${level} Core`}
                        schoolId={school.id}
                        departments={school.departments}
                      />
                    </div>
                    {getCoreSubjects(level).length === 0 ? (
                      <p className="text-xs text-gray-400">
                        No core subjects yet
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {getCoreSubjects(level).map((s) => (
                          <SubjectRow
                            key={s.id}
                            subject={s}
                            departments={school.departments}
                            mode="ss"
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Department subjects */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {school.departments.map((dept) => (
                    <Card
                      key={dept.id}
                      className="border-l-4 border-l-purple-400"
                    >
                      <CardContent className="pt-4 pb-4">
                        <p className="font-semibold text-gray-900 dark:text-white mb-3">
                          {dept.name}
                        </p>

                        {/* Dept subjects */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className="text-xs text-purple-600 border-purple-200"
                            >
                              Department
                            </Badge>
                            <AddSubjectButton
                              mode="ss-department"
                              level={level}
                              className={`${level} ${dept.name}`}
                              schoolId={school.id}
                              departments={school.departments}
                              departmentId={dept.id}
                              departmentName={dept.name}
                            />
                          </div>
                          {getDeptSubjects(level, dept.id).length === 0 ? (
                            <p className="text-xs text-gray-400 pl-1">
                              None yet
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {getDeptSubjects(level, dept.id).map((s) => (
                                <SubjectRow
                                  key={s.id}
                                  subject={s}
                                  departments={school.departments}
                                  mode="ss"
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Vocational */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className="text-xs text-orange-600 border-orange-200"
                            >
                              Vocational
                            </Badge>
                            <AddSubjectButton
                              mode="ss-vocational"
                              level={level}
                              className={`${level} ${dept.name} Vocational`}
                              schoolId={school.id}
                              departments={school.departments}
                              departmentId={dept.id}
                              departmentName={dept.name}
                            />
                          </div>
                          {getVocationalSubjects(level, dept.id).length ===
                          0 ? (
                            <p className="text-xs text-gray-400 pl-1">
                              None yet
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {getVocationalSubjects(level, dept.id).map(
                                (s) => (
                                  <SubjectRow
                                    key={s.id}
                                    subject={s}
                                    departments={school.departments}
                                    mode="ss"
                                  />
                                ),
                              )}
                            </div>
                          )}
                        </div>

                        {/* Optional */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className="text-xs text-green-600 border-green-200"
                            >
                              Optional (pick 1 of 2)
                            </Badge>
                            <AddSubjectButton
                              mode="ss-optional"
                              level={level}
                              className={`${level} ${dept.name} Optional`}
                              schoolId={school.id}
                              departments={school.departments}
                              departmentId={dept.id}
                              departmentName={dept.name}
                            />
                          </div>
                          {getOptionalSubjects(level, dept.id).length === 0 ? (
                            <p className="text-xs text-gray-400 pl-1">
                              None yet (add 2)
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {getOptionalSubjects(level, dept.id).map(
                                (s, i) => (
                                  <div
                                    key={s.id}
                                    className="flex items-center gap-1"
                                  >
                                    <span className="text-xs text-gray-400 w-4">
                                      {i + 1}.
                                    </span>
                                    <SubjectRow
                                      subject={s}
                                      departments={school.departments}
                                      mode="ss"
                                    />
                                  </div>
                                ),
                              )}
                              {getOptionalSubjects(level, dept.id).length <
                                2 && (
                                <p className="text-xs text-orange-500 pl-5">
                                  ⚠ Add one more optional subject
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function SubjectRow({
  subject,
  departments,
  mode,
}: {
  subject: any
  departments: any[]
  mode: 'primary' | 'jss' | 'ss'
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-gray-900 group">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
          {subject.name}
        </span>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <EditSubjectButton
          subject={subject}
          departments={departments}
          isSSClass={mode === 'ss'}
        />
        <DeleteSubjectButton
          subjectId={subject.id}
          subjectName={subject.name}
        />
      </div>
    </div>
  )
}
