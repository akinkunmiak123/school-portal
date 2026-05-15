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

type Department = { id: string; name: string }

export default function EditSubjectButton({
  subject,
  departments,
  isSSClass,
}: {
  subject: any
  departments: Department[]
  isSSClass: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState(subject.name)
  const [subjectType, setSubjectType] = useState(subject.subjectType)
  const [departmentId, setDepartmentId] = useState(subject.departmentId || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/subjects/${subject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          subjectType,
          departmentId: isSSClass ? departmentId : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOpen(false)
     toast.success(`Subject updated successfully`)
      router.refresh()
    } catch (err: any) {
      toast.error('Failed to update subject')
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
          className="h-7 w-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Subject Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {isSSClass && (
            <>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject Type</Label>
                <Select value={subjectType} onValueChange={setSubjectType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CORE">Core Subject</SelectItem>
                    <SelectItem value="VOCATIONAL">
                      Vocational Subject
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
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
