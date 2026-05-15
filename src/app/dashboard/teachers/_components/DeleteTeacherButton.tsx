'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function DeleteTeacherButton({
  teacherId,
  teacherName,
}: {
  teacherId: string
  teacherName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/teachers/${teacherId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      setOpen(false)
    toast.success(`Deleted successfully`)
      router.refresh()
    } catch (err) {
      toast.error('Failed to delete teacher')
      console.error(err)
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
          className="text-red-400 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Teacher</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Are you sure you want to remove <strong>{teacherName}</strong>? They
          will lose access to their classes and results.
        </p>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              'Remove Teacher'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
