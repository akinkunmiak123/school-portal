'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type GradingConfig = {
  grade: string
  minScore: number
  maxScore: number
  remark: string
}

type ScoreEntry = { ca: string; mid: string; exam: string }
type ScoresState = Record<string, Record<string, ScoreEntry>>

type Props = {
  cls: any
  studentSubjectMap: Record<string, any[]>
  termId: string
  resultsMap: Record<string, any>
  gradingConfig: GradingConfig[]
  isLocked: boolean
}

function getGrade(total: number, config: GradingConfig[]) {
  const found = config.find((g) => total >= g.minScore && total <= g.maxScore)
  return found ? found.grade : 'F9'
}

function gradeColor(grade: string) {
  if (grade.startsWith('A')) return 'bg-green-100 text-green-700'
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700'
  if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-700'
  if (grade.startsWith('D') || grade.startsWith('E'))
    return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

function subjectTypeBadge(type: string) {
  switch (type) {
    case 'CORE':
      return (
        <Badge className="text-xs bg-blue-100 text-blue-700 ml-1">Core</Badge>
      )
    case 'DEPARTMENT':
      return (
        <Badge className="text-xs bg-purple-100 text-purple-700 ml-1">
          Dept
        </Badge>
      )
    case 'VOCATIONAL':
      return (
        <Badge className="text-xs bg-orange-100 text-orange-700 ml-1">
          Voc
        </Badge>
      )
    case 'OPTIONAL':
      return (
        <Badge className="text-xs bg-green-100 text-green-700 ml-1">Opt</Badge>
      )
    default:
      return null
  }
}

function initScores(
  students: any[],
  studentSubjectMap: Record<string, any[]>,
  resultsMap: Record<string, any>,
): ScoresState {
  const init: ScoresState = {}
  students.forEach((s) => {
    init[s.id] = {}
    const studentSubjects = studentSubjectMap[s.id] ?? []
    studentSubjects.forEach((sub: any) => {
      const existing = resultsMap[`${s.id}_${sub.id}`]
      init[s.id][sub.id] = {
        ca: existing?.caScore?.toString() ?? '',
        mid: existing?.midterm?.toString() ?? '',
        exam: existing?.examScore?.toString() ?? '',
      }
    })
  })
  return init
}

export default function ScoreEntryTable({
  cls,
  studentSubjectMap,
  termId,
  resultsMap,
  gradingConfig,
  isLocked,
}: Props) {
  const [scores, setScores] = useState<ScoresState>(() =>
    initScores(cls.students, studentSubjectMap, resultsMap),
  )

  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const updateScore = (
    studentId: string,
    subjectId: string,
    field: 'ca' | 'mid' | 'exam',
    value: string,
  ) => {
    const max = field === 'exam' ? 60 : 20
    const num = parseFloat(value)
    if (value !== '' && (isNaN(num) || num < 0 || num > max)) return
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: { ...prev[studentId][subjectId], [field]: value },
      },
    }))
  }

  const saveResult = async (studentId: string, subjectId: string) => {
    const key = `${studentId}_${subjectId}`
    setSaving(key)
    try {
      const s = scores[studentId]?.[subjectId]
      if (!s) return
      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          subjectId,
          termId,
          caScore: parseFloat(s.ca) || 0,
          midterm: parseFloat(s.mid) || 0,
          examScore: parseFloat(s.exam) || 0,
        }),
      })
      setSaved((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000)
      toast.success(`Saved successfully`)
    } finally {
      setSaving(null)
    }
  }

  const saveAllForStudent = async (studentId: string) => {
    const studentSubjects = studentSubjectMap[studentId] ?? []
    for (const subject of studentSubjects) {
      await saveResult(studentId, subject.id)
    }
  }

  return (
    <div className="space-y-6">
      {cls.students.map((student: any) => {
        const studentSubjects = studentSubjectMap[student.id] ?? []

        if (studentSubjects.length === 0) {
          return (
            <div
              key={student.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                {student.lastName}, {student.firstName}
              </p>
              <p className="text-xs text-orange-500 mt-1">
                ⚠ No subjects — assign a department to this student first
              </p>
            </div>
          )
        }

        return (
          <div
            key={student.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            {/* Student header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {student.lastName}, {student.firstName}
                </p>
                <p className="text-xs text-gray-500">
                  {student.studentId} · {studentSubjects.length} subjects
                </p>
              </div>
              {!isLocked && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => saveAllForStudent(student.id)}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Save All
                </Button>
              )}
            </div>

            {/* Subjects table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-4 py-2 font-medium text-gray-500 w-48">
                      Subject
                    </th>
                    <th className="text-center px-2 py-2 font-medium text-gray-500 w-24">
                      CA <span className="text-xs font-normal">/20</span>
                    </th>
                    <th className="text-center px-2 py-2 font-medium text-gray-500 w-24">
                      Midterm <span className="text-xs font-normal">/20</span>
                    </th>
                    <th className="text-center px-2 py-2 font-medium text-gray-500 w-24">
                      Exam <span className="text-xs font-normal">/60</span>
                    </th>
                    <th className="text-center px-2 py-2 font-medium text-gray-500 w-20">
                      Total
                    </th>
                    <th className="text-center px-2 py-2 font-medium text-gray-500 w-20">
                      Grade
                    </th>
                    {!isLocked && <th className="w-20"></th>}
                  </tr>
                </thead>
                <tbody>
                  {studentSubjects.map((subject: any) => {
                    const key = `${student.id}_${subject.id}`
                    const s = scores[student.id]?.[subject.id] ?? {
                      ca: '',
                      mid: '',
                      exam: '',
                    }
                    const ca = parseFloat(s.ca) || 0
                    const mid = parseFloat(s.mid) || 0
                    const exam = parseFloat(s.exam) || 0
                    const total = ca + mid + exam
                    const grade =
                      s.ca || s.mid || s.exam
                        ? getGrade(total, gradingConfig)
                        : '—'
                    const isSaving = saving === key
                    const wasSaved = saved[key]

                    return (
                      <tr
                        key={subject.id}
                        className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                          <span>{subject.name}</span>
                          {subjectTypeBadge(subject.subjectType)}
                        </td>
                        {(['ca', 'mid', 'exam'] as const).map((field) => (
                          <td key={field} className="px-2 py-2">
                            <Input
                              type="number"
                              min={0}
                              max={field === 'exam' ? 60 : 20}
                              value={s[field]}
                              onChange={(e) =>
                                updateScore(
                                  student.id,
                                  subject.id,
                                  field,
                                  e.target.value,
                                )
                              }
                              disabled={isLocked}
                              className="w-full text-center h-8 text-sm disabled:opacity-50"
                              placeholder="0"
                            />
                          </td>
                        ))}
                        <td className="px-2 py-2 text-center font-semibold text-gray-900 dark:text-white">
                          {s.ca || s.mid || s.exam ? total : '—'}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {grade !== '—' ? (
                            <span
                              className={cn(
                                'text-xs font-bold px-2 py-1 rounded-full',
                                gradeColor(grade),
                              )}
                            >
                              {grade}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        {!isLocked && (
                          <td className="px-2 py-2 text-center">
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" />
                            ) : wasSaved ? (
                              <span className="text-xs text-green-600 font-medium">
                                ✓ Saved
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-blue-600"
                                onClick={() =>
                                  saveResult(student.id, subject.id)
                                }
                              >
                                Save
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td className="px-4 py-2 font-semibold text-gray-600 dark:text-gray-400 text-sm">
                      Average
                    </td>
                    <td colSpan={3}></td>
                    <td className="px-2 py-2 text-center font-bold text-gray-900 dark:text-white">
                      {(() => {
                        const totals = studentSubjects
                          .map((sub: any) => {
                            const sc = scores[student.id]?.[sub.id]
                            return sc && (sc.ca || sc.mid || sc.exam)
                              ? (parseFloat(sc.ca) || 0) +
                                  (parseFloat(sc.mid) || 0) +
                                  (parseFloat(sc.exam) || 0)
                              : null
                          })
                          .filter((t): t is number => t !== null)
                        return totals.length
                          ? (
                              totals.reduce((a, b) => a + b, 0) / totals.length
                            ).toFixed(1)
                          : '—'
                      })()}
                    </td>
                    <td></td>
                    {!isLocked && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
