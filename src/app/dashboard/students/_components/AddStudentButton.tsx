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

export default function AddStudentButton({
  schoolId,
  classes,
}: {
  schoolId: string
  classes: Class[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [createdStudent, setCreatedStudent] = useState<{
    firstName: string
    lastName: string
    studentId: string
    defaultPassword: string
  } | null>(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    classId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, schoolId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Show the generated credentials
      setCreatedStudent({
        firstName: data.firstName,
        lastName: data.lastName,
        studentId: data.studentId,
        defaultPassword: data.defaultPassword,
      })
      toast.success(`"${data.firstName}" added successfully`)
      router.refresh()
    } catch (err: any) {
       toast.error('Failed to add student')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!createdStudent) return
    navigator.clipboard.writeText(
      `Student ID: ${createdStudent.studentId}\nDefault Password: ${createdStudent.defaultPassword}`,
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setOpen(false)
    setCreatedStudent(null)
    setForm({ firstName: '', lastName: '', email: '', classId: '' })
    setError('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) handleClose()
        else setOpen(true)
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {createdStudent ? 'Student Added Successfully' : 'Add New Student'}
          </DialogTitle>
        </DialogHeader>

        {createdStudent ? (
          // Success screen — show credentials
          <div className="space-y-4 mt-2">
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800 dark:text-green-200">
                  {createdStudent.firstName} {createdStudent.lastName} added!
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                  Share these credentials with the student
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 border border-dashed border-gray-300 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Student ID
                  </p>
                  <p className="font-mono font-bold text-gray-900 dark:text-white text-lg mt-0.5">
                    {createdStudent.studentId}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                  Default Password
                </p>
                <p className="font-mono font-bold text-gray-900 dark:text-white text-lg mt-0.5">
                  {createdStudent.defaultPassword}
                </p>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                ⚠ Student will be required to change this password on first
                login
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
          // Add student form
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  placeholder="e.g. Chidi"
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
                  placeholder="e.g. Okafor"
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
                placeholder="e.g. chidi@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Class</Label>
              <Select
                value={form.classId}
                onValueChange={(val) => setForm({ ...form, classId: val })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Auto-generated:</strong> Student ID and default password
                will be created automatically. You'll see them after saving.
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
              <Button type="submit" disabled={loading || !form.classId}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Student'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
