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
import { Plus, Loader2, Copy, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

type Class = { id: string; name: string }

export default function AddTeacherButton({
  schoolId,
  classes,
  levels,
}: {
  schoolId: string
  classes: Class[]
  levels: string[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [created, setCreated] = useState<{
    firstName: string
    lastName: string
    teacherId: string
    defaultPassword: string
    role: string
  } | null>(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'CLASS_TEACHER',
    tutorLevel: '',
  })
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([])

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
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          classIds: selectedClassIds,
          schoolId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCreated({
        firstName: data.firstName,
        lastName: data.lastName,
        teacherId: data.teacherId,
        defaultPassword: data.defaultPassword,
        role: form.role,
      })
      toast.success(`"${data.role}" added successfully`)
      router.refresh()
    } catch (err: any) {
      toast.error('Failed to add teacher')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!created) return
    navigator.clipboard.writeText(
      `Email: ${form.email}\nPassword: ${created.defaultPassword}\nRole: ${created.role === 'YEAR_TUTOR' ? 'Year Tutor' : 'Class Teacher'}`,
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setOpen(false)
    setCreated(null)
    setForm({
      firstName: '',
      lastName: '',
      email: '',
      role: 'CLASS_TEACHER',
      tutorLevel: '',
    })
    setSelectedClassIds([])
    setError('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
        else setOpen(true)
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {created ? 'Teacher Added Successfully' : 'Add New Teacher'}
          </DialogTitle>
        </DialogHeader>

        {created ? (
          <div className="space-y-4 mt-2">
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-200">
                  {created.firstName} {created.lastName} added!
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  {created.role === 'YEAR_TUTOR'
                    ? 'Year Tutor'
                    : 'Class Teacher'}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 border border-dashed border-gray-300 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Email
                </p>
                <p className="font-mono text-sm text-gray-900 dark:text-white mt-0.5">
                  {form.email}
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Default Password
                </p>
                <p className="font-mono font-bold text-gray-900 dark:text-white text-lg mt-0.5">
                  {created.defaultPassword}
                </p>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                ⚠ Share these credentials with the teacher. They use them to log
                in at /teacher-login
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleCopy}>
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Credentials
                  </>
                )}
              </Button>
              <Button className="flex-1" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  placeholder="e.g. Amaka"
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
                  placeholder="e.g. Eze"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="e.g. amaka@school.edu.ng"
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
                <Label>Assign to Arms (optional)</Label>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto border rounded-lg p-3">
                  {classes.length === 0 ? (
                    <p className="text-xs text-gray-400">No arms created yet</p>
                  ) : (
                    classes.map((cls) => (
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
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Password auto-generated. Teacher logs in at{' '}
                <strong>/teacher-login</strong>
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Teacher'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
