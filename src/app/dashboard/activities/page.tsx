import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Megaphone } from 'lucide-react'
import AddActivityButton from './_components/AddActivityButton'
import EditActivityButton from './_components/EditActivityButton'
import DeleteActivityButton from './_components/DeleteActivityButton'

export default async function ActivitiesAdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const school = await prisma.school.findFirst({
    where: { clerkOrgId: userId },
    include: {
      activities: { orderBy: { date: 'desc' } },
    },
  })

  if (!school) redirect('/onboarding')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            School Activities
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Post events and notices for students
          </p>
        </div>
        <AddActivityButton />
      </div>

      {school.activities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Megaphone className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              No activities posted yet
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Post school events, exam schedules, holidays etc.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {school.activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between">
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
                  {/* Edit + Delete buttons */}
                  <div className="flex gap-1 shrink-0">
                    <EditActivityButton activity={activity} />
                    <DeleteActivityButton activityId={activity.id} />
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
