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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Class = { id: string; name: string }

export default function EditTeacherButton({
  teacher,
  classes,
  levels,
}: {
  teacher: any
  classes: Class[]
  levels: string[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: teacher.firstName,
    lastName: teacher.lastName,
    email: teacher.email,
    role: teacher.role,
    tutorLevel: teacher.tutorLevel || '',
  })
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(
    teacher.classes?.map((ct: any) => ct.class.id) ?? [],
  )

  const toggleClass = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/teachers/${teacher.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          classIds: form.role === 'CLASS_TEACHER' ? selectedClassIds : [],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOpen(false)
    toast.success(`"${data.role}" updated successfully`)
      router.refresh()
    } catch (err: any) {
       toast.error('Failed to update teacher')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={form.role}
              onValueChange={(val) => setForm({ ...form, role: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLASS_TEACHER">Class Teacher</SelectItem>
                <SelectItem value="YEAR_TUTOR">Year Tutor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.role === 'YEAR_TUTOR' ? (
            <div className="space-y-2">
              <Label>Assigned Level</Label>
              <Select
                value={form.tutorLevel}
                onValueChange={(val) => setForm({ ...form, tutorLevel: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Assigned Arms</Label>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto border rounded-lg p-3">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => toggleClass(cls.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      selectedClassIds.includes(cls.id)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {cls.name}
                  </button>
                ))}
              </div>
              {selectedClassIds.length > 0 && (
                <p className="text-xs text-gray-500">
                  {selectedClassIds.length} arm
                  {selectedClassIds.length !== 1 ? 's' : ''} selected.{' '}
                  <button
                    type="button"
                    onClick={() => setSelectedClassIds([])}
                    className="text-red-500 hover:underline"
                  >
                    Revoke all
                  </button>
                </p>
              )}
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
