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

export default function AddPrimaryClassButton({
  schoolId,
}: {
  schoolId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, schoolId, category: 'PRIMARY' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
        toast.success(`Class "${name}" created`)
      setName('')
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Class
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Primary Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Class Name</Label>
            <Input
              placeholder="e.g. Primary 1, Nursery 2, KG 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
                  Creating...
                </>
              ) : (
                'Create Class'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
