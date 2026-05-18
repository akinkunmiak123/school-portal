import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StudentClaimForm from './_components/StudentClaimForm'

export default async function StudentSetupPage() {
   const { userId } = await auth()
  // if (!userId) redirect('/sign-in')

  const existing = await prisma.student.findFirst({
    where: { clerkUserId: userId },
   })

  // if (existing) redirect('/portal')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, Student!
          </h1>
          <p className="text-gray-500 mt-2">
            Activate your school portal account
          </p>
        </div>
        <StudentClaimForm />
      </div>
    </div>
  )
}
