import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users } from 'lucide-react'
import SchoolTypeSelector from './_components/SchoolTypeSelector'
import AddPrimaryClassButton from './_components/AddPrimaryClassButton'
import AddArmButton from './_components/AddArmButton'
import EditClassButton from './_components/EditClassButton'
import DeleteClassButton from './_components/DeleteClassButton'

export default async function ClassesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const school = await prisma.school.findFirst({
    where: { clerkOrgId: userId },
    include: {
      classes: {
        include: {
          students: true,
          subjects: true,
          teachers: { include: { teacher: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!school) redirect('/onboarding')

  const primaryClasses = school.classes.filter((c) => c.category === 'PRIMARY')
  const jssLevels = ['JSS 1 ', 'JSS 2 ', 'JSS 3 ']
  const ssLevels = ['SS 1 ', 'SS 2 ', 'SS 3 ']

  const getArms = (level: string) =>
    school.classes.filter((c) => c.level === level && c.name !== level)

  const showPrimary =
    school.schoolType === 'PRIMARY' || school.schoolType === 'BOTH'
  const showSecondary =
    school.schoolType === 'SECONDARY' || school.schoolType === 'BOTH'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Classes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {school.classes.filter((c) => c.name !== c.level).length} active
            classes
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <SchoolTypeSelector
            schoolId={school.id}
            currentType={school.schoolType}
          />
        </div>
      </div>

      {/* PRIMARY SECTION */}
      {showPrimary && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block shrink-0" />
              Primary Classes
            </h2>
            <AddPrimaryClassButton schoolId={school.id} />
          </div>

          {primaryClasses.length === 0 ? (
            <Card className="dark:bg-white/[0.04] dark:border-white/[0.06]">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  No primary classes yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {primaryClasses.map((cls) => (
                <ClassCard key={cls.id} cls={cls} showEdit showDelete />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECONDARY SECTION */}
      {showSecondary && (
        <div className="space-y-6">
          {/* JSS */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shrink-0" />
              Junior Secondary (JSS)
            </h2>
            {jssLevels.map((level) => {
              const arms = getArms(level)
              return (
                <div key={level} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {level}
                    </h3>
                    <AddArmButton
                      schoolId={school.id}
                      level={level}
                      category="JSS"
                    />
                  </div>
                  {arms.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 pl-2">
                      No arms yet — add JSS 1A, JSS 1B etc.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {arms.map((cls) => (
                        <ClassCard key={cls.id} cls={cls} showEdit showDelete />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* SS */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block shrink-0" />
              Senior Secondary (SS)
            </h2>
            {ssLevels.map((level) => {
              const arms = getArms(level)
              return (
                <div key={level} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {level}
                    </h3>
                    <AddArmButton
                      schoolId={school.id}
                      level={level}
                      category="SS"
                    />
                  </div>
                  {arms.length === 0 ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 pl-2">
                      No arms yet — add SS 1A, SS 1B etc.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {arms.map((cls) => (
                        <ClassCard key={cls.id} cls={cls} showEdit showDelete />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Reusable Class Card ──────────────────────────────
function ClassCard({
  cls,
  showEdit,
  showDelete,
}: {
  cls: any
  showEdit?: boolean
  showDelete?: boolean
}) {
  return (
    <Card className="hover:shadow-md transition-shadow dark:bg-white/[0.04] dark:border-white/[0.06]">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {cls.name}
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Users className="w-3 h-3 shrink-0" />
                {cls.students.length} students
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <BookOpen className="w-3 h-3 shrink-0" />
                {cls.subjects.length} subjects
              </span>
            </div>
            {cls.teachers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {cls.teachers.map((ct: any) => (
                  <Badge
                    key={ct.id}
                    variant="secondary"
                    className="text-xs dark:bg-white/[0.08] dark:text-gray-300"
                  >
                    {ct.teacher.firstName} {ct.teacher.lastName}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            {showEdit && (
              <EditClassButton classId={cls.id} currentName={cls.name} />
            )}
            {showDelete && (
              <DeleteClassButton classId={cls.id} className={cls.name} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
