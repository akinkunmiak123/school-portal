import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Sidebar from './_components/Sidebar'
import TopBar from './_components/TopBar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const school = await prisma.school.findFirst({
    where: { clerkOrgId: userId },
  })

  if (!school) redirect('/onboarding')

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar schoolName={school.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar schoolName={school.name} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
