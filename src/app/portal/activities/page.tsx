import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

export default async function ActivitiesPage() {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('student_session')?.value
  if (!studentId) redirect('/student-setup')

  const student = await prisma.student.findFirst({
    where: { id: studentId },
    include: {
      school: {
        include: {
          activities: { orderBy: { date: 'desc' } },
        },
      },
    },
  })
  
  if (!student) redirect('/student-setup')

  const activities = student.school.activities

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          School Activities
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {activities.length} event{activities.length !== 1 ? 's' : ''} posted
        </p>
      </div>

      {activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              No activities posted yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="pt-5 pb-5">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-xl flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-blue-600">
                      {new Date(activity.date).toLocaleDateString('en-NG', {
                        month: 'short',
                      })}
                    </span>
                    <span className="text-lg font-bold text-blue-600 leading-none">
                      {new Date(activity.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {activity.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(activity.date).toLocaleDateString('en-NG', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
