import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard } from 'lucide-react'
import PaymentActionButtons from './_components/PaymentActionButtons'

export default async function PaymentsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const school = await prisma.school.findFirst({
    where: { clerkOrgId: userId },
    include: {
      sessions: {
        where: { isCurrent: true },
        include: { terms: { where: { isCurrent: true } } },
      },
    },
  })

  if (!school) redirect('/onboarding')

  const payments = await prisma.feePayment.findMany({
    where: { student: { schoolId: school.id } },
    include: {
      student: { include: { class: true } },
      term: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const pending = payments.filter((p) => p.status === 'PENDING')
  const approved = payments.filter((p) => p.status === 'APPROVED')
  const rejected = payments.filter((p) => p.status === 'REJECTED')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Fee Payments
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve student fee receipts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: pending.length, color: 'text-yellow-600' },
          {
            label: 'Approved',
            count: approved.length,
            color: 'text-green-600',
          },
          { label: 'Rejected', count: rejected.length, color: 'text-red-600' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CreditCard className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              No payment submissions yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left p-4 font-medium text-gray-500">
                    Student
                  </th>
                  <th className="text-left p-4 font-medium text-gray-500">
                    Class
                  </th>
                  <th className="text-left p-4 font-medium text-gray-500">
                    Term
                  </th>
                  <th className="text-left p-4 font-medium text-gray-500">
                    Submitted
                  </th>
                  <th className="text-left p-4 font-medium text-gray-500">
                    Receipt
                  </th>
                  <th className="text-left p-4 font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left p-4 font-medium text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      {payment.student.firstName} {payment.student.lastName}
                      <p className="text-xs text-gray-400 font-normal">
                        {payment.student.studentId}
                      </p>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {payment.student.class.name}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-400">
                      {payment.term.name}
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View Receipt →
                      </a>
                    </td>
                    <td className="p-4">
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
                    </td>
                    <td className="p-4">
                      {payment.status === 'PENDING' && (
                        <PaymentActionButtons paymentId={payment.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
