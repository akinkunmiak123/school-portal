'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Save, MessageSquare } from 'lucide-react'
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
type RemarksState = Record<string, string>

type Props = {
  cls: any
  studentSubjectMap: Record<string, any[]>
  termId: string
  resultsMap: Record<string, any>
  remarksMap: Record<string, string>
  gradingConfig: GradingConfig[]
  isLocked: boolean
  isClassTeacher: boolean
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
    const subjects = studentSubjectMap[s.id] ?? []
    subjects.forEach((sub: any) => {
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

export default function TeacherScoreTable({
  cls,
  studentSubjectMap,
  termId,
  resultsMap,
  remarksMap,
  gradingConfig,
  isLocked,
  isClassTeacher,
}: Props) {
  const [scores, setScores] = useState<ScoresState>(() =>
    initScores(cls.students, studentSubjectMap, resultsMap),
  )
  const [remarks, setRemarks] = useState<RemarksState>(() => ({
    ...remarksMap,
  }))
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [savingRemark, setSavingRemark] = useState<string | null>(null)
  const [savedRemark, setSavedRemark] = useState<Record<string, boolean>>({})

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
      await fetch('/api/teacher/results', {
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
       toast.success(`Saved Result`)
      setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 2000)
    } finally {
      setSaving(null)
    }
  }

  const saveAllForStudent = async (studentId: string) => {
        toast.success(`Saving All Result`)
    const subjects = studentSubjectMap[studentId] ?? []
    for (const subject of subjects) {
      await saveResult(studentId, subject.id)
    }
  }

  const saveRemark = async (studentId: string) => {
    setSavingRemark(studentId)
    try {
      await fetch('/api/teacher/remarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          termId,
          remark: remarks[studentId] || '',
        }),
      })
      setSavedRemark((prev) => ({ ...prev, [studentId]: true }))
       toast.success(`Remark Added`)
      setTimeout(
        () => setSavedRemark((prev) => ({ ...prev, [studentId]: false })),
        2000,
      )
    } finally {
      setSavingRemark(null)
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
                ⚠ No subjects — admin needs to assign a department to this
                student
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

            {/* Score table */}
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
                                className="h-7 text-xs text-purple-600"
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

            {/* Remarks — class teacher only */}
            {isClassTeacher && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">
                      Class Teacher's Remark
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Excellent student, keep it up!"
                        value={remarks[student.id] || ''}
                        onChange={(e) =>
                          setRemarks((prev) => ({
                            ...prev,
                            [student.id]: e.target.value,
                          }))
                        }
                        disabled={isLocked}
                        className="h-8 text-sm flex-1 disabled:opacity-50"
                      />
                      {!isLocked && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs shrink-0"
                          onClick={() => saveRemark(student.id)}
                          disabled={savingRemark === student.id}
                        >
                          {savingRemark === student.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : savedRemark[student.id] ? (
                            <span className="text-green-600">✓ Saved</span>
                          ) : (
                            'Save'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Year tutor — read-only remark display */}
            {!isClassTeacher && remarksMap[student.id] && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">
                      Class Teacher's Remark
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                      {remarksMap[student.id]}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
