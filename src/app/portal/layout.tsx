import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { UserButton } from '@clerk/nextjs'
import { GraduationCap } from 'lucide-react'

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const student = await prisma.student.findFirst({
    where: { clerkUserId: userId },
    include: {
      class: true,
      school: true,
    },
  })

  if (!student) redirect('/student-setup')

  // Force password change if not done yet
  if (!student) redirect('/student-setup')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{student.school.name}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {student.firstName} {student.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {student.class.name}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
