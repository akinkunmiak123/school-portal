import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import OnboardingForm from './_components/OnboardingForm'

export default async function OnboardingPage() {
  const { userId } = await auth()

  if (!userId) redirect('/sign-in')

  // If school already exists for this admin, skip onboarding
  const existingSchool = await prisma.school.findFirst({
    where: { clerkOrgId: userId },
  })

  if (existingSchool) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to SchoolPortal
          </h1>
          <p className="text-gray-500 mt-2">
            Let's set up your school. This only takes a minute.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  )
}
