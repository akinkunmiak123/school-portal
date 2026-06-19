import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import DownloadMyReportCard from './_components/DownloadMyReportCard'

function gradeColor(grade: string) {
  if (grade?.startsWith('A'))
    return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
  if (grade?.startsWith('B'))
    return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
  if (grade?.startsWith('C'))
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400'
  if (grade?.startsWith('D') || grade?.startsWith('E'))
    return 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400'
  return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
}

export default async function StudentResultsPage() {
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
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-900">
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

  const termResults = currentTerm
    ? await prisma.result.findMany({
        where: { studentId: student.id, termId: currentTerm.id },
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Results
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {student.school.sessions[0]?.name} — {currentTerm?.name}
          </p>
        </div>
        {average && (
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {average}
            </p>
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
        <Card className="dark:bg-white/[0.04] dark:border-white/[0.06]">
          <CardContent className="py-16 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No results entered yet for this term
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Mobile cards (< md) ── */}
          <div className="md:hidden space-y-3">
            {termResults.map((result) => (
              <Card
                key={result.id}
                className="dark:bg-white/[0.04] dark:border-white/[0.06]"
              >
                <CardContent className="pt-4 pb-4">
                  {/* Subject + grade */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {result.subject.name}
                    </p>
                    {result.grade ? (
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-1 rounded-full shrink-0',
                          gradeColor(result.grade),
                        )}
                      >
                        {result.grade}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </div>

                  {/* Score breakdown */}
                  <div className="grid grid-cols-4 gap-2 text-center mb-3">
                    {[
                      { label: 'CA /20', value: result.caScore },
                      { label: 'Mid /20', value: result.midterm },
                      { label: 'Exam /60', value: result.examScore },
                      { label: 'Total', value: result.total },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-gray-50 dark:bg-white/[0.04] rounded-lg py-2"
                      >
                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                          {label}
                        </p>
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            label === 'Total'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-900 dark:text-white',
                          )}
                        >
                          {value ?? '—'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Remark */}
                  {result.remark && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      {result.remark}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Mobile average */}
            {average && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                  Term Average
                </p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {average}
                </p>
              </div>
            )}
          </div>

          {/* ── Desktop table (md+) ── */}
          <Card className="hidden md:block dark:bg-white/[0.04] dark:border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-base">
                {student.class?.name} — Score Sheet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/[0.06]">
                      {[
                        'Subject',
                        'CA /20',
                        'Mid /20',
                        'Exam /60',
                        'Total',
                        'Grade',
                        'Remark',
                      ].map((h, i) => (
                        <th
                          key={h}
                          className={cn(
                            'py-3 px-2 font-medium text-gray-500 dark:text-gray-400',
                            i === 0 || i === 6
                              ? 'text-left px-4'
                              : 'text-center',
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {termResults.map((result) => (
                      <tr
                        key={result.id}
                        className="border-b border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.02]"
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
                        <td className="py-3 px-2 text-gray-500 dark:text-gray-400 text-sm">
                          {result.remark ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 dark:bg-white/[0.04]">
                      <td
                        colSpan={4}
                        className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-400"
                      >
                        Average
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-blue-600 dark:text-blue-400">
                        {average ?? '—'}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
