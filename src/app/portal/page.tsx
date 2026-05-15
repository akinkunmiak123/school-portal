import { auth } from '@clerk/nextjs/server'
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

export default async function PortalPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const student = await prisma.student.findFirst({
    where: { clerkUserId: userId },
    include: {
      class: true,
      school: {
        include: {
          sessions: {
            where: { isCurrent: true },
            include: {
              terms: { where: { isCurrent: true } },
            },
          },
          activities: {
            orderBy: { date: 'desc' },
            take: 5,
          },
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

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome, {student.firstName}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {student.school.sessions[0]?.name ?? 'No active session'} —{' '}
          {currentTerm?.name ?? 'No active term'}
        </p>
      </div>

      {/* Fee payment status card */}
      <Card
        className={
          paymentStatus === 'APPROVED'
            ? 'border-green-200 bg-green-50 dark:bg-green-950'
            : paymentStatus === 'PENDING'
              ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950'
              : paymentStatus === 'REJECTED'
                ? 'border-red-200 bg-red-50 dark:bg-red-950'
                : 'border-gray-200'
        }
      >
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {paymentStatus === 'APPROVED' && (
                <CheckCircle className="w-8 h-8 text-green-600" />
              )}
              {paymentStatus === 'PENDING' && (
                <Clock className="w-8 h-8 text-yellow-600" />
              )}
              {paymentStatus === 'REJECTED' && (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
              {paymentStatus === 'NONE' && (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {paymentStatus === 'APPROVED' &&
                    'Fees Confirmed — Results Unlocked'}
                  {paymentStatus === 'PENDING' &&
                    'Receipt Submitted — Awaiting Approval'}
                  {paymentStatus === 'REJECTED' &&
                    'Receipt Rejected — Please Resubmit'}
                  {paymentStatus === 'NONE' &&
                    'Submit Fee Receipt to Access Results'}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {paymentStatus === 'APPROVED' &&
                    'Your fee payment has been confirmed by the school.'}
                  {paymentStatus === 'PENDING' &&
                    'The admin will review and approve your receipt shortly.'}
                  {paymentStatus === 'REJECTED' &&
                    'Your receipt was rejected. Upload a new one.'}
                  {paymentStatus === 'NONE' &&
                    'Upload your school fee receipt to get access.'}
                </p>
              </div>
            </div>
            {(paymentStatus === 'NONE' || paymentStatus === 'REJECTED') &&
              currentTerm && <UploadReceiptButton termId={currentTerm.id} />}
            {paymentStatus === 'APPROVED' && (
              <Link href="/portal/results">
                <Badge className="bg-green-600 text-white hover:bg-green-700 cursor-pointer px-4 py-2">
                  View Results →
                </Badge>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/portal/results">
          <Card
            className={`hover:shadow-md transition-shadow cursor-pointer ${paymentStatus !== 'APPROVED' ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <CardContent className="pt-6 pb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  My Results
                </p>
                <p className="text-xs text-gray-500">View term scores</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/portal/activities">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6 pb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  Activities
                </p>
                <p className="text-xs text-gray-500">School events</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent activities */}
      {student.school.activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Recent School Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {student.school.activities.map((activity) => (
              <div
                key={activity.id}
                className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activity.content}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {student.feePayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-900"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.term.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  className={
                    payment.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700'
                      : payment.status === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }
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
