'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GraduationCap, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type Department = { id: string; name: string }
type Subject = {
  id: string
  name: string
  departmentId: string | null
  subjectType: string
}

export default function AssignDepartmentButton({
  studentId,
  studentName,
  studentLevel,
  departments,
  allSubjects,
  currentDeptId,
  currentOptionalId,
  currentVocationalId,
}: {
  studentId: string
  studentName: string
  studentLevel: string
  departments: Department[]
  allSubjects: Subject[]
  currentDeptId?: string | null
  currentOptionalId?: string | null
  currentVocationalId?: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deptId, setDeptId] = useState(currentDeptId || '')
  const [optionalId, setOptionalId] = useState(currentOptionalId || '')
  const [vocationalId, setVocationalId] = useState(currentVocationalId || '')

  // Filter subjects for selected department and level
 const availableVocatinals = allSubjects.filter(
   (s, index, self) =>
     s.departmentId === deptId &&
     s.subjectType === 'VOCATIONAL' &&
     index === self.findIndex((t) => t.id === s.id),
 )

 const availableOptionals = allSubjects.filter(
   (s, index, self) =>
     s.departmentId === deptId &&
     s.subjectType === 'OPTIONAL' &&
     index === self.findIndex((t) => t.id === s.id),
 )

  const handleDeptChange = (val: string) => {
    setDeptId(val)
    setOptionalId('')
    setVocationalId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deptId) return setError('Please select a department')
    if (availableOptionals.length > 0 && !optionalId) {
      return setError('Please select an optional subject')
    }
    if (availableVocatinals.length > 1 && !vocationalId) {
      return setError('Please select a vocational subject')
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/students/${studentId}/department`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: deptId,
          optionalSubjectId: optionalId || null,
          vocationalSubjectId:
            availableVocatinals.length === 1
              ? availableVocatinals[0].id // auto-select if only 1
              : vocationalId || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOpen(false)
    toast.success(`department added successfully`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentDept = departments.find((d) => d.id === currentDeptId)

  const uniqueDepartments = departments.filter(
  (d, index, self) => index === self.findIndex((t) => t.id === d.id)
)



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 text-xs ${
            currentDeptId
              ? 'text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <GraduationCap className="w-3 h-3 mr-1" />
          {currentDept?.name ?? 'Assign Dept'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Department — {studentName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Student is in <strong>{studentLevel}</strong>. Their subjects will
              be based on their department selection.
            </p>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={deptId} onValueChange={handleDeptChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {uniqueDepartments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Vocational subject picker — only if multiple options */}
          {deptId && availableVocatinals.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Vocational Subject</Label>
                <Badge
                  variant="outline"
                  className="text-xs text-orange-600 border-orange-200"
                >
                  Pick 1 of {availableVocatinals.length}
                </Badge>
              </div>
              <Select value={vocationalId} onValueChange={setVocationalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vocational subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableVocatinals.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Auto-selected vocational if only 1 */}
          {deptId && availableVocatinals.length === 1 && (
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Vocational Subject</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-0.5">
                  {availableVocatinals[0].name}
                </p>
              </div>
              <Badge className="text-xs bg-orange-100 text-orange-700">
                Auto-selected
              </Badge>
            </div>
          )}

          {/* Optional subject picker */}
          {deptId && availableOptionals.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Optional Subject</Label>
                <Badge
                  variant="outline"
                  className="text-xs text-green-600 border-green-200"
                >
                  Pick 1 of {availableOptionals.length}
                </Badge>
              </div>
              <Select value={optionalId} onValueChange={setOptionalId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select optional subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableOptionals.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {deptId &&
            availableOptionals.length === 0 &&
            availableVocatinals.length === 0 && (
              <p className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                No optional or vocational subjects defined for this department
                yet. Add them in the Subjects page first.
              </p>
            )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </p>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !deptId}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Assignment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
