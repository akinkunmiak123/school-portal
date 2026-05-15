import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import {
  GraduationCap,
  Users,
  School,
  CreditCard,
  ClipboardList,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const school = await prisma.school.findFirst({
    where: { clerkOrgId: userId },
    include: {
      students: true,
      teachers: true,
      classes: true,
      sessions: {
        where: { isCurrent: true },
        include: {
          terms: {
            where: { isCurrent: true },
          },
        },
      },
    },
  })

  if (!school) redirect('/onboarding')

  const currentSession = school.sessions[0]
  const currentTerm = currentSession?.terms[0]

  const pendingPayments = await prisma.feePayment.count({
    where: {
      student: { schoolId: school.id },
      status: 'PENDING',
    },
  })

  const stats = [
    {
      label: 'Total Students',
      value: school.students.length,
      icon: GraduationCap,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Teachers',
      value: school.teachers.length,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Total Classes',
      value: school.classes.length,
      icon: School,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Pending Payments',
      value: pendingPayments,
      icon: CreditCard,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  const quickActions = [
    {
      label: 'Add Class',
      href: '/dashboard/classes',
      icon: School,
      color: 'bg-blue-600',
    },
    {
      label: 'Add Teacher',
      href: '/dashboard/teachers',
      icon: Users,
      color: 'bg-green-600',
    },
    {
      label: 'Import Students',
      href: '/dashboard/students',
      icon: GraduationCap,
      color: 'bg-purple-600',
    },
    {
      label: 'View Results',
      href: '/dashboard/results',
      icon: ClipboardList,
      color: 'bg-gray-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentSession?.name ?? 'No session set'} —{' '}
            {currentTerm?.name ?? 'No term set'}
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-green-700 border-green-300 bg-green-50"
        >
          ● Live
        </Badge>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pending payments alert */}
      {pendingPayments > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900">
                  {pendingPayments} fee payment{pendingPayments > 1 ? 's' : ''}{' '}
                  awaiting approval
                </p>
                <p className="text-sm text-orange-700">
                  Review and approve student fee receipts to grant result
                  access.
                </p>
              </div>
              <Link
                href="/dashboard/payments"
                className="ml-auto text-sm font-medium text-orange-700 underline"
              >
                Review now →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center"
                >
                  <div
                    className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {action.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
