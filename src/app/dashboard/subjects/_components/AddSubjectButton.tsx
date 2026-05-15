'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Department = { id: string; name: string }
type Mode = 'primary' | 'jss' | 'ss-core' | 'ss-department' | 'ss-vocational' | 'ss-optional'

const COMMON_SUBJECTS = [
  'Mathematics', 'English Language', 'Physics', 'Chemistry',
  'Biology', 'Geography', 'History', 'Civic Education',
  'Economics', 'Commerce', 'Literature in English',
  'Further Mathematics', 'Agricultural Science', 'Computer Science',
  'French', 'Yoruba', 'Igbo', 'Hausa',
  'Christian Religious Studies', 'Islamic Religious Studies',
  'Physical Education', 'Basic Science', 'Basic Technology',
  'Social Studies', 'Fine Art', 'Music', 'Home Economics',
  'Technical Drawing', 'Food and Nutrition',
]

const MODE_LABELS: Record<Mode, string> = {
  primary: 'Primary Subject',
  jss: 'JSS Subject',
  'ss-core': 'Core Subject',
  'ss-department': 'Department Subject',
  'ss-vocational': 'Vocational Subject',
  'ss-optional': 'Optional Subject',
}

const MODE_TYPES: Record<Mode, string> = {
  primary: 'GENERAL',
  jss: 'GENERAL',
  'ss-core': 'CORE',
  'ss-department': 'DEPARTMENT',
  'ss-vocational': 'VOCATIONAL',
  'ss-optional': 'OPTIONAL',
}

export default function AddSubjectButton({
  mode,
  classId,
  level,
  className,
  schoolId,
  departments,
  departmentId,
  departmentName,
}: {
  mode: Mode
  classId?: string
  level?: string
  className: string
  schoolId: string
  departments: Department[]
  departmentId?: string
  departmentName?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (subjectName: string) => {
    if (!subjectName.trim()) return
    setLoading(true)
    setError('')

    try {
      const body: any = {
        name: subjectName.trim(),
        subjectType: MODE_TYPES[mode],
        schoolId,
      }

      if (mode === 'primary') {
        body.classId = classId
      } else {
        body.level = level
      }

      if (departmentId) {
        body.departmentId = departmentId
      }

      if (mode === 'ss-optional') {
        // Group optional subjects together with a consistent key
        body.optionalGroupId = `${level}-${departmentId}-optional`
      }

      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setName('')
      setOpen(false)
       toast.success(`Subject added successfully`)
      router.refresh()
    } catch (err: any) {
       toast.error('Failed to add subject')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const title = `Add ${MODE_LABELS[mode]} — ${departmentName ? `${departmentName} · ` : ''}${className}`

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {mode === 'ss-optional' && (
            <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
              <p className="text-xs text-green-700 dark:text-green-300">
                Add exactly 2 optional subjects. Admin will pick 1 per student when assigning departments.
              </p>
            </div>
          )}

          {/* Manual entry */}
          <div className="space-y-2">
            <Label>Subject Name</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Mathematics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleSubmit(name) }
                }}
              />
              <Button
                onClick={() => handleSubmit(name)}
                disabled={loading || !name.trim()}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
              </Button>
            </div>
          </div>

          {/* Quick pick */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Quick pick</Label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {COMMON_SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => handleSubmit(subject)}
                  disabled={loading}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 dark:hover:bg-blue-950 transition-colors"
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}