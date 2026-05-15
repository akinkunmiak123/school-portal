import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import GradingConfigPanel from './_components/GradingConfigPanel'
import SessionTermPanel from './_components/SessionTermPanel'
import PrincipalSignaturePanel from './_components/PrincipalSignaturePanel'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const school = await prisma.school.findFirst({
    where: { clerkOrgId: userId },
    include: {
      gradingConfig: { orderBy: { minScore: 'desc' } },
      sessions: {
        include: { terms: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!school) redirect('/onboarding')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure your school settings
        </p>
      </div>

      <SessionTermPanel school={school} />
      <GradingConfigPanel gradingConfig={school.gradingConfig} />
      <PrincipalSignaturePanel
        currentSignature={school.principalSignatureUrl}
        currentName={school.principalName}
      />
    </div>
  )
}
