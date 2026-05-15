import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import DownloadMyReportCard from './_components/DownloadMyReportCard'

function gradeColor(grade: string) {
  if (grade?.startsWith('A')) return 'bg-green-100 text-green-700'
  if (grade?.startsWith('B')) return 'bg-blue-100 text-blue-700'
  if (grade?.startsWith('C')) return 'bg-yellow-100 text-yellow-700'
  if (grade?.startsWith('D') || grade?.startsWith('E'))
    return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

export default async function StudentResultsPage() {
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
            include: { terms: { where: { isCurrent: true } } },
          },
        },
      },
      feePayments: true,
    },
  })

  if (!student) redirect('/student-setup')

  const currentTerm = student.school.sessions[0]?.terms[0]

  const payment = currentTerm
    ? student.feePayments.find((p) => p.termId === currentTerm.id)
    : null

  const hasAccess = payment?.status === 'APPROVED'

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Results
        </h1>
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <Lock className="w-12 h-12 text-yellow-500" />
            <p className="font-semibold text-yellow-900 dark:text-yellow-200">
              Results Locked
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 text-center max-w-xs">
              Your fee payment must be approved before you can view your
              results.
              {payment?.status === 'PENDING' &&
                ' Your receipt is currently under review.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch results separately with all needed relations
  const termResults = currentTerm
    ? await prisma.result.findMany({
        where: {
          studentId: student.id,
          termId: currentTerm.id,
        },
        include: { subject: true },
        orderBy: { subject: { name: 'asc' } },
      })
    : []

  const average =
    termResults.length > 0
      ? (
          termResults.reduce((sum, r) => sum + (r.total ?? 0), 0) /
          termResults.length
        ).toFixed(1)
      : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Results
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {student.school.sessions[0]?.name} — {currentTerm?.name}
          </p>
        </div>
        {average && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Average</p>
            <p className="text-2xl font-bold text-blue-600">{average}</p>
          </div>
        )}
      </div>

      {termResults.length > 0 && currentTerm && (
        <DownloadMyReportCard
          studentId={student.id}
          termId={currentTerm.id}
          termName={currentTerm.name}
        />
      )}

      {termResults.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500">
              No results entered yet for this term
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {student.class?.name} — Score Sheet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Subject
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">
                      CA /20
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">
                      Mid /20
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">
                      Exam /60
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">
                      Total
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-gray-500">
                      Grade
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">
                      Remark
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {termResults.map((result) => (
                    <tr
                      key={result.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {result.subject.name}
                      </td>
                      <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">
                        {result.caScore ?? '—'}
                      </td>
                      <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">
                        {result.midterm ?? '—'}
                      </td>
                      <td className="py-3 px-2 text-center text-gray-600 dark:text-gray-400">
                        {result.examScore ?? '—'}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-gray-900 dark:text-white">
                        {result.total ?? '—'}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {result.grade ? (
                          <span
                            className={cn(
                              'text-xs font-bold px-2 py-1 rounded-full',
                              gradeColor(result.grade),
                            )}
                          >
                            {result.grade}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3 px-2 text-gray-500 text-sm">
                        {result.remark ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-gray-900">
                    <td
                      colSpan={4}
                      className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400"
                    >
                      Average
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-blue-600">
                      {average ?? '—'}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
