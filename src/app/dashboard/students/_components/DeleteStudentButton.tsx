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

export default function DeleteStudentButton({
  studentId,
  studentName,
}: {
  studentId: string
  studentName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await fetch(`/api/students/${studentId}`, { method: 'DELETE' })
      setOpen(false)
     
      router.refresh()
       toast.success(`Student Removed successfully`)
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
          <DialogTitle>Remove Student</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to remove <strong>{studentName}</strong>? All
          their results and payment records will also be deleted.
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
              'Remove Student'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
