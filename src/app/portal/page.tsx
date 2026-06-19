import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  BookOpen,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import UploadReceiptButton from './_components/UploadReceiptButton'
import { cookies } from 'next/headers'

export default async function PortalPage() {
  const cookieStore = await cookies()
  const studentId = cookieStore.get('student_session')?.value
  if (!studentId) redirect('/student-setup')

  const student = await prisma.student.findFirst({
    where: { id: studentId },
    include: {
      class: true,
      school: {
        include: {
          sessions: {
            where: { isCurrent: true },
            include: { terms: { where: { isCurrent: true } } },
          },
          activities: { orderBy: { date: 'desc' }, take: 5 },
        },
      },
      feePayments: {
        include: { term: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!student) redirect('/student-setup')

  const currentTerm = student.school.sessions[0]?.terms[0]
  const currentPayment = currentTerm
    ? student.feePayments.find((p) => p.termId === currentTerm.id)
    : null
  const paymentStatus = currentPayment?.status ?? 'NONE'

  const statusIcon = {
    APPROVED: <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />,
    PENDING: <Clock className="w-8 h-8 text-yellow-600 shrink-0" />,
    REJECTED: <XCircle className="w-8 h-8 text-red-600 shrink-0" />,
    NONE: <Upload className="w-8 h-8 text-gray-400 shrink-0" />,
  }[paymentStatus]

  const statusTitle = {
    APPROVED: 'Fees Confirmed — Results Unlocked',
    PENDING: 'Receipt Submitted — Awaiting Approval',
    REJECTED: 'Receipt Rejected — Please Resubmit',
    NONE: 'Submit Fee Receipt to Access Results',
  }[paymentStatus]

  const statusBody = {
    APPROVED: 'Your fee payment has been confirmed by the school.',
    PENDING: 'The admin will review and approve your receipt shortly.',
    REJECTED: 'Your receipt was rejected. Upload a new one.',
    NONE: 'Upload your school fee receipt to get access.',
  }[paymentStatus]

  const statusCardClass = {
    APPROVED:
      'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900',
    PENDING:
      'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-900',
    REJECTED: 'border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900',
    NONE: 'border-gray-200 dark:border-gray-800',
  }[paymentStatus]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome, {student.firstName}!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {student.school.sessions[0]?.name ?? 'No active session'} —{' '}
          {currentTerm?.name ?? 'No active term'}
        </p>
      </div>

      {/* Fee payment status card */}
      <Card className={statusCardClass}>
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Icon + text */}
            <div className="flex items-start gap-3">
              {statusIcon}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {statusTitle}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {statusBody}
                </p>
              </div>
            </div>
            {/* Action */}
            {(paymentStatus === 'NONE' || paymentStatus === 'REJECTED') &&
              currentTerm && (
                <div className="pl-11 sm:pl-0 shrink-0">
                  <UploadReceiptButton
                    termId={currentTerm.id}
                    existingStatus={currentPayment?.status ?? null}
                  />
                </div>
              )}
            {paymentStatus === 'APPROVED' && (
              <div className="pl-11 sm:pl-0 shrink-0">
                <Link href="/portal/results">
                  <Badge className="bg-green-600 text-white hover:bg-green-700 cursor-pointer px-4 py-2">
                    View Results →
                  </Badge>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/portal/results">
          <Card
            className={`hover:shadow-md transition-shadow cursor-pointer h-full dark:bg-white/[0.04] dark:border-white/[0.06] ${
              paymentStatus !== 'APPROVED'
                ? 'opacity-50 pointer-events-none'
                : ''
            }`}
          >
            <CardContent className="pt-5 pb-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  My Results
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  View term scores
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal/activities">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full dark:bg-white/[0.04] dark:border-white/[0.06]">
            <CardContent className="pt-5 pb-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  Activities
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  School events
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent activities */}
      {student.school.activities.length > 0 && (
        <Card className="dark:bg-white/[0.04] dark:border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">
              Recent School Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {student.school.activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/[0.04]"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 break-words">
                    {activity.content}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(activity.date).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      {student.feePayments.length > 0 && (
        <Card className="dark:bg-white/[0.04] dark:border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {student.feePayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-gray-50 dark:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {payment.term.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  className={`shrink-0 ${
                    payment.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                      : payment.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
                  }`}
                >
                  {payment.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
