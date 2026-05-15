'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Save } from 'lucide-react'

type GradeRow = {
  grade: string
  minScore: number
  maxScore: number
  remark: string
}

export default function GradingConfigPanel({
  gradingConfig,
}: {
  gradingConfig: GradeRow[]
}) {
  const defaultGrades: GradeRow[] =
    gradingConfig.length > 0
      ? gradingConfig
      : [
          { grade: 'A1', minScore: 75, maxScore: 100, remark: 'Excellent' },
          { grade: 'B2', minScore: 70, maxScore: 74, remark: 'Very Good' },
          { grade: 'B3', minScore: 65, maxScore: 69, remark: 'Good' },
          { grade: 'C4', minScore: 60, maxScore: 64, remark: 'Credit' },
          { grade: 'C5', minScore: 55, maxScore: 59, remark: 'Credit' },
          { grade: 'C6', minScore: 50, maxScore: 54, remark: 'Credit' },
          { grade: 'D7', minScore: 45, maxScore: 49, remark: 'Pass' },
          { grade: 'E8', minScore: 40, maxScore: 44, remark: 'Pass' },
          { grade: 'F9', minScore: 0, maxScore: 39, remark: 'Fail' },
        ]

  const [grades, setGrades] = useState<GradeRow[]>(defaultGrades)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateGrade = (index: number, field: keyof GradeRow, value: string) => {
    setGrades((prev) =>
      prev.map((g, i) =>
        i === index
          ? {
              ...g,
              [field]:
                field === 'minScore' || field === 'maxScore'
                  ? parseFloat(value)
                  : value,
            }
          : g,
      ),
    )
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await fetch('/api/grading', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Grading Scale</CardTitle>
          <Button onClick={handleSave} disabled={loading} size="sm">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              '✓ Saved!'
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Grade
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Min Score
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Max Score
                </th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">
                  Remark
                </th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-2 px-3">
                    <Input
                      value={g.grade}
                      onChange={(e) => updateGrade(i, 'grade', e.target.value)}
                      className="w-20 h-8 text-sm font-bold"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <Input
                      type="number"
                      value={g.minScore}
                      onChange={(e) =>
                        updateGrade(i, 'minScore', e.target.value)
                      }
                      className="w-24 h-8 text-sm"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <Input
                      type="number"
                      value={g.maxScore}
                      onChange={(e) =>
                        updateGrade(i, 'maxScore', e.target.value)
                      }
                      className="w-24 h-8 text-sm"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <Input
                      value={g.remark}
                      onChange={(e) => updateGrade(i, 'remark', e.target.value)}
                      className="w-32 h-8 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
