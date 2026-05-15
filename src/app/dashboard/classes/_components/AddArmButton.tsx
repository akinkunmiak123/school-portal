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

export default function AddArmButton({
  schoolId,
  level,
  category,
}: {
  schoolId: string
  level: string
  category: 'JSS' | 'SS'
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [arm, setArm] = useState('')
  const [error, setError] = useState('')

  // Auto-generate name e.g. "JSS 1" + "A" = "JSS 1A"
  const fullName = arm ? `${level}${arm.toUpperCase()}` : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          schoolId,
          category,
          level,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
          toast.success(`Arm ${fullName} created successfully`)
      setArm('')
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
        toast.error(err.message || 'Failed to create arm')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-3 h-3 mr-1" /> Add Arm
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Arm to {level}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Arm Letter</Label>
            <Input
              placeholder="e.g. A, B, C"
              value={arm}
              onChange={(e) => setArm(e.target.value)}
              maxLength={10}
              required
            />
            {fullName && (
              <p className="text-sm text-blue-600 font-medium">
                Class will be named: <strong>{fullName}</strong>
              </p>
            )}
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
            <Button type="submit" disabled={loading || !arm}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Arm'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
