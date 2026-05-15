'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2, Pencil, Loader2, Building2 } from 'lucide-react'
import { toast } from 'sonner'

type Department = { id: string; name: string }

export default function ManageDepartmentsButton({
  departments,
  schoolId,
}: {
  departments: Department[]
  schoolId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')

  const handleAdd = async () => {
    if (!newName.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewName('')
    toast.success(`Department added successfully`)
      router.refresh()
    } catch (err: any) {
        toast.error('Failed to add department')
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (id: string) => {
    setLoading(true)
    try {
      await fetch(`/api/departments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      })
      setEditId(null)
          toast.success(`Department Updated`)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Delete this department? All subjects under it will be unlinked.',
      )
    )
      return
    setLoading(true)
    try {
      await fetch(`/api/departments/${id}`, { method: 'DELETE' })
      toast.success(`Department Deleted`)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Building2 className="w-4 h-4 mr-2" />
          Manage Departments
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>SS Departments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Add new */}
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Science, Arts, Commercial"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={loading || !newName.trim()}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* List */}
          <div className="space-y-2">
            {departments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No departments yet
              </p>
            ) : (
              departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900"
                >
                  {editId === dept.id ? (
                    <>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleEdit(dept.id)}
                        disabled={loading}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {dept.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-blue-600"
                        onClick={() => {
                          setEditId(dept.id)
                          setEditName(dept.name)
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-600"
                        onClick={() => handleDelete(dept.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
